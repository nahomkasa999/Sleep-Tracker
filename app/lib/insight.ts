import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {checkError, FindCorrelationFactor } from "./utllity";
import { ContentfulStatusCode } from "hono/utils/http-status"; //this is interesting
import { error } from "console";

type HonoEnv = {
  Variables: {
    CurrentUser: User;
  };
};

const insightsRouter = new Hono<HonoEnv>();

insightsRouter.use("*", async (c, next) => {
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

type SleepEntryReceivingSchemaDBType = z.infer<typeof SleepEntryReceivingSchemaDBArray>
type WellbeingEntryReceivingSchemaDBType = z.infer<typeof WellbeingEntryReceivingSchemaDBArray>



insightsRouter.get("/correlation", async(c) => {

    try {
        const CurrentUserID = c.get("CurrentUser").id;

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



export default insightsRouter