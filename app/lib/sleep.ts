import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { Param, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


type HonoEnv = {
  Variables: {
    CurrentUser: User;
  };
};

const sleepRouter = new Hono<HonoEnv>();

sleepRouter.use("*", async (c, next) => {
  const user = await db.user.findFirst();
  if (!user) {
    return c.json(
      { error: "No user found in the database. Please create a user first." },
      404
    );
  }
  c.set("CurrentUser", user);

  await next();
});


const sleepRouterReceivingJson = z.object({
  userId: z.string().uuid(),
  bedtime: z.string().datetime(),
  wakeUpTime: z.string().datetime(),
  qualityRating: z.number().int().min(1).max(10),
  comments: z.string().optional(),
  durationHours: z.number().optional(),
});

const sleepRouterReceivingJsonDB = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  bedtime: z.date(),
  wakeUpTime: z.date(),
  qualityRating: z.number().int().min(1).max(10),
  comments: z.string().nullable().optional(),
  durationHours: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const sleepRouterEnteryID = z.string().uuid();

const SleepEntryArraySchema = z.array(sleepRouterReceivingJsonDB);

const updateSpecificFieldSchema = z.object({
  bedtime: z.string().datetime().optional(),
  wakeUpTime: z.string().datetime().optional(),
  qualityRating: z.number().int().min(1).max(10).optional(),
  comments: z.string().nullable().optional(),
  durationHours: z.number().optional(),
}).partial();

type CreateSleepEntryInput = z.infer<typeof sleepRouterReceivingJson>;
type ReceiveDBSleepEntryArray = z.infer<typeof SleepEntryArraySchema>;
type ParamsId = z.infer<typeof sleepRouterEnteryID>;
type SingleSleepRouteEntry = z.infer<typeof sleepRouterReceivingJsonDB>;
type UpdatingType = z.infer<typeof updateSpecificFieldSchema>;


sleepRouter.post(
  "/",
  zValidator("json", sleepRouterReceivingJson),
  async (c) => {
    const CurrentUserID = c.get("CurrentUser").id;
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
          comments: validatedBody.comments,
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

sleepRouter.get("/", async (c) => {
  const CurrentUserID = c.get("CurrentUser").id;
  try {
    const rawSleepEntries: unknown = await db.sleepEntry.findMany({
      where: {
        userId: CurrentUserID,
      },
    });
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
});

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

      return c.json({ message: "Validated data", body: validatedSingleEntry });
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

  const validatedBody = c.req.valid('json') as UpdatingType;

  if (Object.keys(validatedBody).length === 0) {
    return c.json({ message: "No fields provided for update." }, 400);
  }

  try {
    const dataToUpdate: Record<string, any> = { ...validatedBody }; //this is constructued becuase to have some flexiablelty and construct any type of object string:any

    if (validatedBody.bedtime) {
      dataToUpdate.bedtime = new Date(validatedBody.bedtime);
    }
    if (validatedBody.wakeUpTime) {
      dataToUpdate.wakeUpTime = new Date(validatedBody.wakeUpTime);
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
        userId: c.get("CurrentUser").id
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

//-------------------------------------made a commit for finishing the put-----------------------------------------

sleepRouter.delete("/:id", async(c) => {
  let validatedId: ParamsId

  try {
    validatedId = sleepRouterEnteryID.parse(c.req.param("id"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid sleep entry ID format", details: error.errors }, 400);
    }
    return c.json({ error: "An unexpected error occurred while validating ID" }, 500);
  }

  try {
    const deleteItem = await db.sleepEntry.delete({
    where:{
      id: validatedId
    }
  })
  console.log(deleteItem)
  return c.json({message: "successfully deleted item"})
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return c.json({ error: "Sleep entry not found or you don't have permission to update it." }, 404);
      }
      return c.json({ error: `Database error during update: ${error.message}` }, 500);
    }
  return c.json({message: "internal error", error: `An expected Error occured  ${error instanceof Error ? error.message : "Unknown error"}`}, 500) 
  }

  


})


export default sleepRouter;
