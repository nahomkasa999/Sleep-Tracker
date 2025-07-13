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

export default checkError;

//usage

// wellBeingRouter.get("/", async(c) => {
//     try {
//         // ... your route logic ...
//         // const result = await db.wellbeingEntry.findMany(...);
//         // return c.json({ data: result }, 200);
//         return c.json({ message: "Example success" }, 200);
//     } catch (error) {
//         const structuredError = checkError(error);
//         return c.json(
//             { error: structuredError.message, details: structuredError.details },
//             structuredError.statusCode
//         );
//     }
// });