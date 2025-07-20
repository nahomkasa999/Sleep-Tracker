import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { z } from "zod";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { subDays, startOfDay } from 'date-fns';
import { HonoEnv } from "../api/[...routes]/route";
import { getCorrelationInsight } from "./gemini"; // Removed getOverviewInsight import
import { checkError, FindCorrelationFactor, CorrelationDataPoint } from "./utllity";


const insightsRouter = new Hono<HonoEnv>();

insightsRouter.use('*', async (c, next) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('user', user as User);
    await next();
});

//---------for the react query purpose------------------//

export interface SleepSummaryDay {
  date: string;
  qualityRating: number;
}

export interface WellbeingSummary {
  averageSleepDurationHours: number;
  bestSleepDays: SleepSummaryDay[];
  worstSleepDays: SleepSummaryDay[];
  averageDayRating: number;
}

export interface SleepInsightsResponse {
  message: string;
  summary: WellbeingSummary;
}

export interface GetSleepInsightsParams {
  period?: 'week' | 'month' | 'all'; 
  startDate?: string;               
  endDate?: string;                
}

//------------The type of Data we are getting from DB----------//
// This schema now represents the combined SleepEntry data from the DB
const SleepEntryReceivingSchemaDB = z.object({
    id: z.string(), // Added id for consistency, though not strictly used in charts data prep
    userId: z.string().nullable().optional(), // Added userId for consistency
    bedtime: z.date(),
    wakeUpTime: z.date(),
    qualityRating: z.number().int().min(1).max(10),
    createdAt: z.date(),
    entryDate: z.date(), // Added from WellbeingEntry
    dayRating: z.number().min(1).max(10).int(), // Added from WellbeingEntry
    mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).nullable().optional(), // Added from WellbeingEntry
    sleepcomments: z.string().nullable().optional(), // Corrected field name
    daycomments: z.string().nullable().optional(), // Added from WellbeingEntry
    durationHours: z.number().nullable().optional(), // Ensure durationHours is included in the schema
    updatedAt: z.date(), // Added updatedAt for consistency
})

const SleepEntryReceivingSchemaDBArray = z.array(SleepEntryReceivingSchemaDB)

export type SleepEntryReceivingSchemaDBType = z.infer<typeof SleepEntryReceivingSchemaDBArray>


insightsRouter.get("/correlation", async(c) => {

    try {
        const CurrentUserID = c.get("user")!.id;

        // Now fetching all relevant data from SleepEntry only
        const sleepEntries = await db.sleepEntry.findMany({
            where: { userId: CurrentUserID },
            select: {
                id: true, // Include id
                userId: true, // Include userId
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
                entryDate: true, // Include for correlation
                dayRating: true, // Include for correlation
                mood: true,
                sleepcomments: true,
                daycomments: true,
                durationHours: true, // Include durationHours here
                updatedAt: true, // Include updatedAt
            }
        });

        const validatedSleepEntriesBody: SleepEntryReceivingSchemaDBType = SleepEntryReceivingSchemaDBArray.parse(sleepEntries)

     
        const response = FindCorrelationFactor(validatedSleepEntriesBody);

        return c.json({message:"success", response}, 200)
    } catch (error){
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
})

//------------Schema for Summary Query Parameters----------//
const SummaryQueryParamsSchema = z.object({
    period: z.enum(['week', 'month', 'all']).optional(), 
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),  
}).refine(data => {
    
    if ((data.startDate && !data.endDate) || (!data.startDate && data.endDate)) {
        return false;
    }

    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: "Both startDate and endDate must be provided if either is used, and startDate must be before or equal to endDate.",
    path: ["startDate", "endDate"],
});

//------------Schema for Summary Response----------//
const SummaryResponseSchema = z.object({
    averageSleepDurationHours: z.number().nullable(),
    bestSleepDays: z.array(z.object({ 
        date: z.string(),
        qualityRating: z.number()
    })),
    worstSleepDays: z.array(z.object({ 
        date: z.string(),
        qualityRating: z.number()
    })),
    averageDayRating: z.number().nullable(), // Renamed
});

//------------GET /insights/summary Route----------//
insightsRouter.get("/summary", async(c) => {
    try {
        const CurrentUserID = c.get("user")!.id;
        const queryParams = c.req.query();

        if(!queryParams){
          return c.json({message: "no query is found"}, 404)
        }
       
        const validatedQueryParams = SummaryQueryParamsSchema.safeParse(queryParams);

        if (!validatedQueryParams.success) {
            return c.json({ error: validatedQueryParams.error.errors }, 400);
        }

        const { period, startDate, endDate } = validatedQueryParams.data;

        let filterStartDate: Date | undefined;
        let filterEndDate: Date | undefined;

        if (period) {
            const now = new Date();
            if (period === 'week') {
                filterStartDate = startOfDay(subDays(now, 7)); 
            } else if (period === 'month') {
                filterStartDate = startOfDay(subDays(now, 30)); 
            }
            filterEndDate = now;
        } else if (startDate && endDate) {
            filterStartDate = new Date(startDate);
            filterEndDate = new Date(endDate);
        }

        // Fetching all relevant data from SleepEntry
        const sleepEntriesQuery: any = {
            where: { userId: CurrentUserID },
            select: {
                id: true, // Include id
                userId: true, // Include userId
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
                entryDate: true, // Include entryDate for filtering and day rating calculation
                dayRating: true, // Include dayRating for average calculation
                durationHours: true, // Include durationHours here
                mood: true, // Include mood for consistency
                sleepcomments: true, // Include sleepcomments for consistency
                daycomments: true, // Include daycomments for consistency
                updatedAt: true, // Include updatedAt
            }
        };

        if (filterStartDate && filterEndDate) {
            sleepEntriesQuery.where.entryDate = { // Filter by entryDate for consistency
                gte: filterStartDate,
                lte: filterEndDate,
            };
        }
        
        const combinedEntries = await db.sleepEntry.findMany(sleepEntriesQuery);
        const validatedCombinedEntries: SleepEntryReceivingSchemaDBType = SleepEntryReceivingSchemaDBArray.parse(combinedEntries);

        let totalSleepDurationMs = 0;
        let bestSleepQuality = 0;
        let worstSleepQuality = 11; 
        const bestSleepDays: { date: string; qualityRating: number }[] = [];
        const worstSleepDays: { date: string; qualityRating: number }[] = [];
        let totalDayRating = 0;
        let countDayRatings = 0;

        if (validatedCombinedEntries.length > 0) {
            validatedCombinedEntries.forEach(entry => {
                // Use durationHours if available, otherwise calculate
                let durationMs = (entry.durationHours !== null && entry.durationHours !== undefined)
                    ? entry.durationHours * 60 * 60 * 1000 // Convert hours to milliseconds
                    : entry.wakeUpTime.getTime() - entry.bedtime.getTime();
             
                if (durationMs < 0) {
                    durationMs += 24 * 60 * 60 * 1000;
                }
                totalSleepDurationMs += durationMs;

                if (entry.qualityRating > bestSleepQuality) {
                    bestSleepQuality = entry.qualityRating;
                    bestSleepDays.splice(0, bestSleepDays.length);
                    bestSleepDays.push({ date: entry.entryDate.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                } else if (entry.qualityRating === bestSleepQuality) {
                    bestSleepDays.push({ date: entry.entryDate.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                }

                if (entry.qualityRating < worstSleepQuality) {
                    worstSleepQuality = entry.qualityRating;
                    worstSleepDays.splice(0, worstSleepDays.length); 
                    worstSleepDays.push({ date: entry.entryDate.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                } else if (entry.qualityRating === worstSleepQuality) {
                    worstSleepDays.push({ date: entry.entryDate.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                }

                if (entry.dayRating !== null && entry.dayRating !== undefined) {
                    totalDayRating += entry.dayRating;
                    countDayRatings++;
                }
            });
        }

        const averageSleepDurationHours = validatedCombinedEntries.length > 0
            ? (totalSleepDurationMs / validatedCombinedEntries.length) / (1000 * 60 * 60)
            : null;
        
        const averageDayRating = countDayRatings > 0
            ? totalDayRating / countDayRatings
            : null;

        const summaryResponse = {
            averageSleepDurationHours: averageSleepDurationHours,
            bestSleepDays: bestSleepDays,
            worstSleepDays: worstSleepDays,
            averageDayRating: averageDayRating, // Renamed
        };

        const validatedSummaryResponse = SummaryResponseSchema.safeParse(summaryResponse);

        if (!validatedSummaryResponse.success) {
            console.error("Internal data validation error for summary response:", validatedSummaryResponse.error);
            return c.json({ error: "Failed to generate summary due to internal data inconsistency." }, 500);
        }

        return c.json({ message: "success", summary: validatedSummaryResponse.data }, 200);

    } catch (error) {
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
});

const AIQueryParamsSchema = z.object({
    period: z.enum(['weekly', 'monthly', 'all']).optional(),
});

insightsRouter.get("/AI/correlation", async (c) => {
    try {
        const CurrentUserID = c.get("user")!.id;
        const { period } = AIQueryParamsSchema.parse(c.req.query());

        let startDate: Date | undefined;
        if (period === 'weekly') {
            startDate = subDays(new Date(), 7);
        } else if (period === 'monthly') {
            startDate = subDays(new Date(), 30);
        }

        // Fetching combined sleep and wellbeing data
        const sleepEntries = await db.sleepEntry.findMany({
            where: { 
                userId: CurrentUserID,
                entryDate: startDate ? { gte: startDate } : undefined // Filter by entryDate
            },
            select: {
                id: true, // Include id
                userId: true, // Include userId
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
                entryDate: true,
                dayRating: true,
                mood: true,
                sleepcomments: true,
                daycomments: true,
                durationHours: true, // Include durationHours here
                updatedAt: true, // Include updatedAt
            }
        });

        // getCorrelationInsight now only needs the combined sleep entries
        const insight = await getCorrelationInsight(sleepEntries);
        return c.json({ insight }, 200);

    } catch (error) {
        return c.json({ ...checkError(error) }, checkError(error).statusCode as ContentfulStatusCode);
    }
});

// Removed /AI/overview route

// New: Define Mood enum for mapping
enum Mood {
  Happy = "Happy",
  Stressed = "Stressed",
  Neutral = "Neutral",
  Sad = "Sad",
  Excited = "Excited",
  Tired = "Tired",
}

const moodToValue = {
    'Happy': 5,
    'Excited': 4,
    'Neutral': 3,
    'Tired': 2,
    'Stressed': 2,
    'Sad': 1,
};

// New: Zod schemas for chart data items
const MoodChartDataItemSchema = z.object({
    date: z.string(),
    moodValue: z.number(),
    mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).nullable().optional(),
});

const SleepChartDataItemSchema = z.object({
    date: z.string(),
    sleepDuration: z.number(),
});

// New: Main ChartsDataResponse schema
export const ChartsDataResponseSchema = z.object({
    moodChartData: z.array(MoodChartDataItemSchema),
    sleepDurationChartData: z.array(SleepChartDataItemSchema),
    correlationChartData: z.array(z.object({ // This matches CorrelationDataPoint from utllity
        sleepDuration: z.number(),
        dayRating: z.number(),
        date: z.string(),
    })),
    aiCorrelationInsight: z.string(),
});

export type ChartsDataResponse = z.infer<typeof ChartsDataResponseSchema>;


// New: GET /insights/chartsdata route
insightsRouter.get("/chartsdata", async (c) => {
    try {
        const CurrentUserID = c.get("user")!.id;
        const queryParams = c.req.query();

        const validatedQueryParams = SummaryQueryParamsSchema.safeParse(queryParams);

        if (!validatedQueryParams.success) {
            return c.json({ error: validatedQueryParams.error.errors }, 400);
        }

        const { period, startDate, endDate } = validatedQueryParams.data;

        let filterStartDate: Date | undefined;
        let filterEndDate: Date | undefined;

        if (period) {
            const now = new Date();
            if (period === 'week') {
                filterStartDate = startOfDay(subDays(now, 7)); 
            } else if (period === 'month') {
                filterStartDate = startOfDay(subDays(now, 30)); 
            }
            filterEndDate = now;
        } else if (startDate && endDate) {
            filterStartDate = new Date(startDate);
            filterEndDate = new Date(endDate);
        }

        const sleepEntriesQuery: any = {
            where: { userId: CurrentUserID },
            select: {
                id: true,
                userId: true, 
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
                entryDate: true,
                dayRating: true,
                mood: true,
                sleepcomments: true,
                daycomments: true,
                durationHours: true, 
                updatedAt: true, 
            }
        };

        if (filterStartDate && filterEndDate) {
            sleepEntriesQuery.where.entryDate = {
                gte: filterStartDate,
                lte: filterEndDate,
            };
        }
        
        const combinedEntries = await db.sleepEntry.findMany(sleepEntriesQuery);
        const validatedCombinedEntries: SleepEntryReceivingSchemaDBType = SleepEntryReceivingSchemaDBArray.parse(combinedEntries);

       
        const moodChartData = [...validatedCombinedEntries]
            .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
            .map(entry => ({
                date: new Date(entry.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                moodValue: moodToValue[entry.mood as keyof typeof moodToValue || Mood.Neutral] || 0,
                mood: entry.mood, 
            }));

        const sleepDurationChartData = [...validatedCombinedEntries]
            .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
            .map(entry => {
              
                const actualSleepDuration = (entry.durationHours !== null && entry.durationHours !== undefined)
                    ? entry.durationHours
                    : parseFloat(((entry.wakeUpTime.getTime() - entry.bedtime.getTime()) / (1000 * 60 * 60)).toFixed(2));
                
                
                let finalDuration = actualSleepDuration;
                if (finalDuration < 0 && (entry.wakeUpTime.getDate() === entry.bedtime.getDate())) {
                
                    if (entry.durationHours === null || entry.durationHours === undefined) {
                       
                        let msDiff = entry.wakeUpTime.getTime() - entry.bedtime.getTime();
                        if (msDiff < 0) {
                            msDiff += 24 * 60 * 60 * 1000; // Assume it crossed midnight
                        }
                        finalDuration = parseFloat((msDiff / (1000 * 60 * 60)).toFixed(2));
                    }
                }
                
                return {
                    date: new Date(entry.entryDate).toLocaleDateString('en-US', { weekday: 'short'}),
                    sleepDuration: finalDuration,
                };
            });

       
        const correlationResult = FindCorrelationFactor(validatedCombinedEntries);
        const correlationChartData = correlationResult.dataPoints;

        // Get AI insights
        const aiCorrelationInsight = await getCorrelationInsight(validatedCombinedEntries);
       
        const chartsDataResponse: ChartsDataResponse = {
            moodChartData,
            sleepDurationChartData,
            correlationChartData,
            aiCorrelationInsight,
        };

        const validatedChartsDataResponse = ChartsDataResponseSchema.safeParse(chartsDataResponse);

        if (!validatedChartsDataResponse.success) {
            console.error("Internal data validation error for charts data response:", validatedChartsDataResponse.error);
            return c.json({ error: "Failed to generate charts data due to internal data inconsistency." }, 500);
        }

        return c.json(validatedChartsDataResponse.data, 200);

    } catch (error) {
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
});


export default insightsRouter;
