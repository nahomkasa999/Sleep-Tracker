import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkError, FindCorrelationFactor } from "./utllity";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { subDays, startOfDay } from 'date-fns';
import { HonoEnv } from "../api/[...routes]/route";
import { getCorrelationInsight, getOverviewInsight } from "./gemini";


const insightsRouter = new Hono<HonoEnv>();

insightsRouter.use('*', async (c, next) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('user', user as User);
    await next();
});

//---------fro the react query purpose------------------//

export interface SleepSummaryDay {
  date: string;
  qualityRating: number;
}

export interface WellbeingSummary {
  averageSleepDurationHours: number;
  bestSleepDays: SleepSummaryDay[];
  worstSleepDays: SleepSummaryDay[];
  averageWellbeingRating: number;
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
const SleepEntryReceivingSchemaDB = z.object({
    bedtime: z.date(),
    wakeUpTime: z.date(),
    qualityRating: z.number().int().min(1).max(10),
    createdAt: z.date(),
})

const WellbeingEntryReceivingSchemaDB = z.object({
     entryDate: z.date(),
     dayRating: z.number().min(1).max(10).int(),
     createdAt: z.date(),

})

const SleepEntryReceivingSchemaDBArray = z.array(SleepEntryReceivingSchemaDB)
const WellbeingEntryReceivingSchemaDBArray = z.array(WellbeingEntryReceivingSchemaDB)

export type SleepEntryReceivingSchemaDBType = z.infer<typeof SleepEntryReceivingSchemaDBArray>
export type WellbeingEntryReceivingSchemaDBType = z.infer<typeof WellbeingEntryReceivingSchemaDBArray>


insightsRouter.get("/correlation", async(c) => {

    try {
        const CurrentUserID = c.get("user")!.id;

        const sleepEntries = await db.sleepEntry.findMany({
            where: { userId: CurrentUserID },
            select: {
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
                id: false
            }
        });

        const validatedSleepEntriesBody: SleepEntryReceivingSchemaDBType = SleepEntryReceivingSchemaDBArray.parse(sleepEntries)

        const wellbeingEntries = await db.wellbeingEntry.findMany({
            where: { userId: CurrentUserID },
            orderBy: { entryDate: 'asc' },
            select: {
                entryDate: true,
                dayRating: true,
                createdAt: true,
                id: false,
            }
        });

        const validatedWellbeingEntriesBody: WellbeingEntryReceivingSchemaDBType = WellbeingEntryReceivingSchemaDBArray.parse(wellbeingEntries)

        const response = FindCorrelationFactor(validatedSleepEntriesBody, validatedWellbeingEntriesBody)

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
    averageWellbeingRating: z.number().nullable(),
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

        const sleepEntriesQuery: any = {
            where: { userId: CurrentUserID },
            select: {
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
            }
        };

        if (filterStartDate && filterEndDate) {
            sleepEntriesQuery.where.createdAt = {
                gte: filterStartDate,
                lte: filterEndDate,
            };
        }
        
        const sleepEntries = await db.sleepEntry.findMany(sleepEntriesQuery);
        const validatedSleepEntries: SleepEntryReceivingSchemaDBType = SleepEntryReceivingSchemaDBArray.parse(sleepEntries);

        const wellbeingEntriesQuery: any = {
            where: { userId: CurrentUserID },
            orderBy: { entryDate: 'asc' },
            select: {
                entryDate: true,
                dayRating: true,
                createdAt: true,
            }
        };
        if (filterStartDate && filterEndDate) {
            wellbeingEntriesQuery.where.entryDate = { // Filter by entryDate for wellbeing
                gte: filterStartDate,
                lte: filterEndDate,
            };
        }
        const wellbeingEntries = await db.wellbeingEntry.findMany(wellbeingEntriesQuery);
        const validatedWellbeingEntries: WellbeingEntryReceivingSchemaDBType = WellbeingEntryReceivingSchemaDBArray.parse(wellbeingEntries);

        let totalSleepDurationMs = 0;
        let bestSleepQuality = 0;
        let worstSleepQuality = 11; 
        const bestSleepDays: { date: string; qualityRating: number }[] = [];
        const worstSleepDays: { date: string; qualityRating: number }[] = [];

        if (validatedSleepEntries.length > 0) {
            validatedSleepEntries.forEach(entry => {
                let duration = entry.wakeUpTime.getTime() - entry.bedtime.getTime();
             
                  if (duration < 0) {
                       duration += 24 * 60 * 60 * 1000;
                   }
                totalSleepDurationMs += duration;

                
                if (entry.qualityRating > bestSleepQuality) {
                    bestSleepQuality = entry.qualityRating;
                    bestSleepDays.splice(0, bestSleepDays.length);
                    bestSleepDays.push({ date: entry.createdAt.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                } else if (entry.qualityRating === bestSleepQuality) {
                    bestSleepDays.push({ date: entry.createdAt.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                }

            
                if (entry.qualityRating < worstSleepQuality) {
                    worstSleepQuality = entry.qualityRating;
                    worstSleepDays.splice(0, worstSleepDays.length); 
                    worstSleepDays.push({ date: entry.createdAt.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                } else if (entry.qualityRating === worstSleepQuality) {
                    worstSleepDays.push({ date: entry.createdAt.toISOString().split('T')[0], qualityRating: entry.qualityRating });
                }
            });
        }

        const averageSleepDurationHours = validatedSleepEntries.length > 0
            ? (totalSleepDurationMs / validatedSleepEntries.length) / (1000 * 60 * 60)
            : null;
        
        let totalWellbeingRating = 0;
        if (validatedWellbeingEntries.length > 0) {
            validatedWellbeingEntries.forEach(entry => {
                totalWellbeingRating += entry.dayRating;
            });
        }

        const averageWellbeingRating = validatedWellbeingEntries.length > 0
            ? totalWellbeingRating / validatedWellbeingEntries.length
            : null;

        const summaryResponse = {
            averageSleepDurationHours: averageSleepDurationHours,
            bestSleepDays: bestSleepDays,
            worstSleepDays: worstSleepDays,
            averageWellbeingRating: averageWellbeingRating,
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

        const sleepEntries = await db.sleepEntry.findMany({
            where: { 
                userId: CurrentUserID,
                createdAt: startDate ? { gte: startDate } : undefined
            },
            select: {
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
            }
        });

        const wellbeingEntries = await db.wellbeingEntry.findMany({
            where: { 
                userId: CurrentUserID,
                entryDate: startDate ? { gte: startDate } : undefined
            },
            select: {
                entryDate: true,
                dayRating: true,
                createdAt: true,
            }
        });

        const insight = await getCorrelationInsight(sleepEntries, wellbeingEntries);
        return c.json({ insight });

    } catch (error) {
        return c.json({ ...checkError(error) }, checkError(error).statusCode as ContentfulStatusCode);
    }
});

insightsRouter.get("/AI/overview", async (c) => {
    try {
        const CurrentUserID = c.get("user")!.id;
        const { period } = AIQueryParamsSchema.parse(c.req.query());

        let startDate: Date | undefined;
        if (period === 'weekly') {
            startDate = subDays(new Date(), 7);
        } else if (period === 'monthly') {
            startDate = subDays(new Date(), 30);
        }

        const sleepEntries = await db.sleepEntry.findMany({
            where: { 
                userId: CurrentUserID,
                createdAt: startDate ? { gte: startDate } : undefined
            },
            select: {
                bedtime: true,
                wakeUpTime: true,
                qualityRating: true,
                createdAt: true,
            }
        });

        const wellbeingEntries = await db.wellbeingEntry.findMany({
            where: { 
                userId: CurrentUserID,
                entryDate: startDate ? { gte: startDate } : undefined
            },
            select: {
                entryDate: true,
                dayRating: true,
                createdAt: true,
            }
        });

        const insight = await getOverviewInsight(sleepEntries, wellbeingEntries);
        return c.json({ insight });

    } catch (error) {
        return c.json({ ...checkError(error) }, checkError(error).statusCode as ContentfulStatusCode);
    }
});



export default insightsRouter;
