import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "@hono/zod-openapi";

import { HonoEnv } from "../api/[...routes]/route";

const sleepRouter = new Hono<HonoEnv>();

sleepRouter.use('*', async (c, next) => {
  const user = c.get('user');
  console.log(user);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', user as User);
  await next();
});

const sleepRouterReceivingJson = z.object({
  bedtime: z.string().datetime(),
  wakeUpTime: z.string().datetime(),
  qualityRating: z.number().int().min(1).max(10),
  sleepcomments: z.string().optional(),
  durationHours: z.number().optional(),
  entryDate: z.string().datetime(),
  dayRating: z.number().int().min(1).max(10),
  mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).optional(),
  daycomments: z.string().optional(),
});

const sleepRouterReceivingJsonDB = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  bedtime: z.date(),
  wakeUpTime: z.date(),
  qualityRating: z.number().int().min(1).max(10),
  sleepcomments: z.string().nullable().optional(),
  durationHours: z.number().nullable().optional(),
  entryDate: z.date(),
  dayRating: z.number().int().min(1).max(10),
  mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).nullable().optional(),
  daycomments: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const sleepRouterEnteryID = z.string().uuid();

const SleepEntryArraySchema = z.array(sleepRouterReceivingJsonDB);

const updateSpecificFieldSchema = z.object({
  bedtime: z.string().datetime().optional(),
  wakeUpTime: z.string().datetime().optional(),
  qualityRating: z.number().int().min(1).max(10).optional(),
  sleepcomments: z.string().nullable().optional(),
  durationHours: z.number().optional(),
  entryDate: z.string().datetime().optional(),
  dayRating: z.number().int().min(1).max(10).optional(),
  mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).nullable().optional(),
  daycomments: z.string().nullable().optional(),
}).partial();

export type CreateSleepEntryInput = z.infer<typeof sleepRouterReceivingJson>;
export type ReceiveDBSleepEntryArray = z.infer<typeof SleepEntryArraySchema>;
export type ParamsId = z.infer<typeof sleepRouterEnteryID>;
export type SingleSleepRouteEntry = z.infer<typeof sleepRouterReceivingJsonDB>;
export type UpdatingSleepType = z.infer<typeof updateSpecificFieldSchema>;

sleepRouter.get(
  "/",
  async (c) => {
    const CurrentUserID = c.get("user")!.id;
    try {
      const rawSleepEntries: unknown = await db.sleepEntry.findMany({
        where: {
          userId: CurrentUserID,
        },
      });
      console.log(rawSleepEntries)
      const validatedSleepEntries: ReceiveDBSleepEntryArray =
        SleepEntryArraySchema.parse(rawSleepEntries);
      return c.json(
        {
          message: "Successfully retrieved sleep entries",
          data: validatedSleepEntries,
        },
        200
      );
    } catch (error) {
      console.error("Error getting user sleep entries:", error);
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: "Data validation failed for retrieved sleep entries",
            details: error.errors,
          },
          500
        );
      }
      if (error instanceof PrismaClientKnownRequestError) {
        return c.json({ error: `Database error: ${error.message}` }, 500);
      }
      return c.json(
        {
          error: `An unexpected error occurred: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        500
      );
    }
  }
);

sleepRouter.post(
  "/",
  zValidator("json", sleepRouterReceivingJson),
  async (c) => {
    const CurrentUserID = c.get("user")!.id;
    const validatedBody = c.req.valid("json");

    let actualDurationHours = validatedBody.durationHours;

    if (actualDurationHours === undefined || actualDurationHours === null) {
      const sleepStart = new Date(validatedBody.bedtime);
      const sleepEnd = new Date(validatedBody.wakeUpTime);
      let durationMs = sleepEnd.getTime() - sleepStart.getTime();

      if (durationMs < 0) {
        durationMs += 24 * 60 * 60 * 1000;
      }
      actualDurationHours = parseFloat(
        (durationMs / (1000 * 60 * 60)).toFixed(2)
      );
    }

    try {
      await db.sleepEntry.create({
        data: {
          userId: CurrentUserID,
          bedtime: new Date(validatedBody.bedtime),
          wakeUpTime: new Date(validatedBody.wakeUpTime),
          durationHours: actualDurationHours,
          qualityRating: validatedBody.qualityRating,
          sleepcomments: validatedBody.sleepcomments, // Updated field name
          entryDate: new Date(validatedBody.entryDate),
          dayRating: validatedBody.dayRating,
          mood: validatedBody.mood,
          daycomments: validatedBody.daycomments,
        },
      });
      return c.json({ message: "Successfully added to the database" }, 201);
    } catch (error) {
      console.error("Error creating sleep entry:", error);
      if (error instanceof PrismaClientKnownRequestError) {
        return c.json({ error: `Database error: ${error.message}` }, 500);
      }
      return c.json(
        {
          error: `An unexpected error occurred: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        500
      );
    }
  }
);

sleepRouter.get("/:id", async (c) => {
  try {
    const validatedId: ParamsId = sleepRouterEnteryID.parse(c.req.param("id"));

    const GetSingleSleepRoute = await db.sleepEntry.findFirst({
      where: {
        id: validatedId,
      },
    });

    console.log("Data from DB:", GetSingleSleepRoute);

    if (GetSingleSleepRoute === null) {
      return c.json({ message: "Sleep entry not found" }, 404);
    }

    try {
      const validatedSingleEntry: SingleSleepRouteEntry =
        sleepRouterReceivingJsonDB.parse(GetSingleSleepRoute);

      return c.json({ message: "Validated data", data: validatedSingleEntry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation failed for DB entry:", error.errors);
        return c.json(
          { message: "Data integrity error: DB entry does not match schema", details: error.errors },
          500
        );
      }
      console.error("Unexpected error during DB entry parsing:", error);
      return c.json({ message: "An unexpected error occurred during processing" }, 500);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { message: "Invalid ID format in URL", details: error.errors },
        400
      );
    }
    console.error("Error in GET /:id route:", error);
    return c.json({ message: "An unexpected server error occurred" }, 500);
  }
});

sleepRouter.put("/:id", zValidator('json', updateSpecificFieldSchema), async (c) => {
  let validatedId: ParamsId;
  try {
    validatedId = sleepRouterEnteryID.parse(c.req.param("id"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid sleep entry ID format", details: error.errors }, 400);
    }
    return c.json({ error: "An unexpected error occurred while validating ID" }, 500);
  }

  const validatedBody = c.req.valid('json') as UpdatingSleepType;

  if (Object.keys(validatedBody).length === 0) {
    return c.json({ message: "No fields provided for update." }, 400);
  }

  try {
    const dataToUpdate: Record<string, any> = { ...validatedBody };

    if (validatedBody.bedtime) {
      dataToUpdate.bedtime = new Date(validatedBody.bedtime);
    }
    if (validatedBody.wakeUpTime) {
      dataToUpdate.wakeUpTime = new Date(validatedBody.wakeUpTime);
    }
    if (validatedBody.entryDate) {
      dataToUpdate.entryDate = new Date(validatedBody.entryDate);
    }

    if (
        (validatedBody.bedtime !== undefined && validatedBody.wakeUpTime !== undefined) &&
        (dataToUpdate.durationHours === undefined || dataToUpdate.durationHours === null)
    ) {
      const sleepStart = dataToUpdate.bedtime;
      const sleepEnd = dataToUpdate.wakeUpTime;
      let durationMs = sleepEnd.getTime() - sleepStart.getTime();

      if (durationMs < 0) {
        durationMs += 24 * 60 * 60 * 1000;
      }
      dataToUpdate.durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
    } else if (validatedBody.durationHours !== undefined) {
        dataToUpdate.durationHours = validatedBody.durationHours;
    }

    const updatedSleepEntry = await db.sleepEntry.update({
      where: {
        id: validatedId,
        userId: c.get("user")!.id
      },
      data: dataToUpdate,
    });

    return c.json({ message: "Sleep entry updated successfully", data: updatedSleepEntry }, 200);

  } catch (error) {
    console.error("Error updating sleep entry:", error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return c.json({ error: "Sleep entry not found or you don't have permission to update it." }, 404);
      }
      return c.json({ error: `Database error during update: ${error.message}` }, 500);
    }
    return c.json({ error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}` }, 500);
  }
});

sleepRouter.delete("/:id", async(c) => {
  let validatedId: ParamsId;

  try {
    validatedId = sleepRouterEnteryID.parse(c.req.param("id"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid sleep entry ID format", details: error.errors }, 400);
    }
    return c.json({ error: "An unexpected error occurred while validating ID" }, 500);
  }

  try {
    const deletedItem = await db.sleepEntry.delete({
    where:{
      id: validatedId,
      userId: c.get("user")!.id
    }
  });
  return c.json({message: "successfully deleted item", data: deletedItem}, 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return c.json({ error: "Sleep entry not found or you don't have permission to delete it." }, 404);
      }
      return c.json({ error: `Database error during delete: ${error.message}` }, 500);
    }
  return c.json({message: "internal error", error: `An expected Error occured  ${error instanceof Error ? error.message : "Unknown error"}`}, 500);
  }
});

export default sleepRouter;