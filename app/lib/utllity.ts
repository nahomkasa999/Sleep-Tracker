import { z } from 'zod';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface StructuredError {
  statusCode: number;
  message: string;
  details?: any;
  errorType?: 'ZodError' | 'PrismaError' | 'UnknownError';
}

function checkError(error: unknown): StructuredError {
  console.error("An error occurred:", error);

  if (error instanceof z.ZodError) {
    return {
      statusCode: 400,
      message: "Data validation failed",
      details: error.errors,
      errorType: 'ZodError',
    };
  }
  if (error instanceof PrismaClientKnownRequestError) {
    return {
      statusCode: 500,
      message: `Database error: ${error.message}`,
      errorType: 'PrismaError',
    };
  }

  return {
    statusCode: 500,
    message: `An unexpected error occurred: ${
      error instanceof Error ? error.message : "Unknown error"
    }`,
    errorType: 'UnknownError',
  };
}

const correlationDataPointSchema = z.object({
  sleepDuration: z.number(),
  dayRating: z.number(),
  date: z.string(),
});

const correlationResponseSchema = z.object({
  correlationCoefficient: z.number(),
  dataPoints: z.array(correlationDataPointSchema),
});

type CorrelationResponse = z.infer<typeof correlationResponseSchema>;
type CorrelationDataPoint = z.infer<typeof correlationDataPointSchema>;

function calculatePearsonCorrelation(data: CorrelationDataPoint[]): { correlationCoefficient: number; dataPoints: CorrelationDataPoint[] } {
  const filteredData = data.filter(d =>
    typeof d.sleepDuration === 'number' &&
    typeof d.dayRating === 'number' &&
    !isNaN(d.sleepDuration) &&
    !isNaN(d.dayRating)
  );

  const n = filteredData.length;

  if (n < 2) {
    return { correlationCoefficient: 0, dataPoints: [] };
  }

  const x = filteredData.map(d => d.sleepDuration);
  const y = filteredData.map(d => d.dayRating);

  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let sumOfProductsOfDifferences = 0;
  let sumOfSquaredDifferencesX = 0;
  let sumOfSquaredDifferencesY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;

    sumOfProductsOfDifferences += diffX * diffY;
    sumOfSquaredDifferencesX += diffX * diffX;
    sumOfSquaredDifferencesY += diffY * diffY;
  }

  const stdDevX_denominator = Math.sqrt(sumOfSquaredDifferencesX);
  const stdDevY_denominator = Math.sqrt(sumOfSquaredDifferencesY);

  if (stdDevX_denominator === 0 || stdDevY_denominator === 0) {
    return { correlationCoefficient: 0, dataPoints: filteredData };
  }

  const correlationCoefficient = sumOfProductsOfDifferences / (stdDevX_denominator * stdDevY_denominator);

  return {
    correlationCoefficient: parseFloat(correlationCoefficient.toFixed(4)),
    dataPoints: filteredData
  };
}

function FindCorrelationFactor(
    sleepEntries: { bedtime: Date; wakeUpTime: Date; qualityRating: number; createdAt: Date; }[],
    wellbeingEntries: { entryDate: Date; dayRating: number; createdAt: Date; }[]
): CorrelationResponse {
    const dailyData = new Map<string, { sleepDuration?: number; dayRating?: number }>();

    sleepEntries.forEach((entry) => {
        const bedtime = entry.bedtime;
        const wakeUpTime = entry.wakeUpTime;

        let durationMs = wakeUpTime.getTime() - bedtime.getTime();

        if (durationMs < 0) {
            durationMs += 24 * 60 * 60 * 1000;
        }
        const sleepDurationHours = durationMs / (1000 * 60 * 60);

        const dateKey = wakeUpTime.toISOString().split('T')[0];

        dailyData.set(dateKey, {
            ...(dailyData.get(dateKey) || {}),
            sleepDuration: parseFloat(sleepDurationHours.toFixed(2))
        });
    });

    wellbeingEntries.forEach((entry) => {
        const dateKey = entry.entryDate.toISOString().split('T')[0];
        dailyData.set(dateKey, {
            ...(dailyData.get(dateKey) || {}),
            dayRating: entry.dayRating
        });
    });

    const correlationInputData: CorrelationDataPoint[] = [];
    for (const [date, data] of dailyData.entries()) {
        if (data.sleepDuration !== undefined && data.dayRating !== undefined) {
            correlationInputData.push({
                sleepDuration: data.sleepDuration,
                dayRating: data.dayRating,
                date: date
            });
        }
    }

    const { correlationCoefficient, dataPoints } = calculatePearsonCorrelation(correlationInputData);

    const responseBody: CorrelationResponse = correlationResponseSchema.parse({
        correlationCoefficient,
        dataPoints,
    });

    return responseBody;
}

export { checkError, FindCorrelationFactor };
