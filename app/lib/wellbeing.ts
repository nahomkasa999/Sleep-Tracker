import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { checkError } from "./utllity";
import { ContentfulStatusCode } from "hono/utils/http-status"; //this is interesting
import { HonoEnv } from "../api/[...routes]/route";

const wellBeingRouter = new Hono<HonoEnv>();

wellBeingRouter.use('*', async (c, next) => {
  const user = c.get('user');
  console.log(user)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', user as User);
  await next();
});

enum Mood {
  Happy = "Happy",
  Stressed = "Stressed",
  Neutral = "Neutral",
  Sad = "Sad",
  Excited = "Excited",
  Tired = "Tired",
}

//-------------for Get Request (from DB)-----------------//
const wellBeingAcceptingThings = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  entryDate: z.date(), 
  dayRating: z.number().min(1).max(10).int(),
  mood: z.nativeEnum(Mood).nullable(), 
  comments: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const WellBeingReceivedfromDBinArray = z.array(wellBeingAcceptingThings);
export type wellBeingReceingSchemaDB = z.infer<typeof WellBeingReceivedfromDBinArray>;

//-----------------for Get requires with ID----------------------//
const valideParameter = z.string().uuid();
export type validparametertype = z.infer<typeof valideParameter>;

export type singleWellBeingReceingSchemaDB = z.infer<typeof wellBeingAcceptingThings>;

//----------------for post("/") - for the commign schema from frontend -----------------//
const wellBeingInputSchema = z.object({
  entryDate: z.string().datetime(),
  dayRating: z.number().int().min(1).max(10),
  mood: z.nativeEnum(Mood).nullable().optional(), 
  comments: z.string().nullable().optional(),
});

export type TypeOfDataFromFrontEnd = z.infer<typeof wellBeingInputSchema>;

//---------------for put(/:id) --------------------------------------//
const wellBeingInputSchemaforPut = z.object({
  entryDate: z.string().datetime().optional(),
  dayRating: z.number().int().min(1).max(10).optional(),
  mood: z.nativeEnum(Mood).nullable().optional(), 
  comments: z.string().nullable().optional(),
});

export type wellbeingPutType = z.infer<typeof wellBeingInputSchemaforPut>

wellBeingRouter.get("/", async (c) => {
  const CurrentUserID = c.get("user")!.id;
  try {
    const AllWellBeingDatas = await db.wellbeingEntry.findMany({
      where: {
        userId: CurrentUserID,
      },
    });

    const validatedBody: wellBeingReceingSchemaDB =
      WellBeingReceivedfromDBinArray.parse(AllWellBeingDatas);

    return c.json(
      { message: "successfully fetched wellbeingdata", data: validatedBody },
      200
    );
  } catch (error) {
  return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
  }
});

wellBeingRouter.get("/:id", async (c) => {
  let validatedId: validparametertype;

  try {
    validatedId = valideParameter.parse(c.req.param("id"));
  } catch (error) {
    return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
  }

  try {
    const singleWellBeingReceingdata = await db.wellbeingEntry.findFirst({
        where:{
            id: validatedId,
        },
    });

    if (singleWellBeingReceingdata === null) {
        return c.json({ message: "Wellbeing entry not found" }, 404);
    }

    const singlevalidatedBody: singleWellBeingReceingSchemaDB = wellBeingAcceptingThings.parse(singleWellBeingReceingdata);

    return c.json({
        message: "successfully fetched",
        data: singlevalidatedBody
    }, 200); // Added 200 status code

  } catch (error) {
     return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
  }
});



wellBeingRouter.post("/", zValidator("json", wellBeingInputSchema), async(c) => {

    try {
        const CurrentUserID = c.get("user")!.id;
        const validatedBody: TypeOfDataFromFrontEnd = c.req.valid('json');

        const newWellbeingEntry = await db.wellbeingEntry.create({
            data: {
                userId: CurrentUserID, 
                entryDate: new Date(validatedBody.entryDate), 
                dayRating: validatedBody.dayRating,
                mood: validatedBody.mood, 
                comments: validatedBody.comments,
            }
        });

        return c.json({ message: "Wellbeing entry created successfully", data: newWellbeingEntry }, 201); // 201 Created

    } catch (error) {
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
});

wellBeingRouter.put("/:id", zValidator("json", wellBeingInputSchemaforPut), async(c) => {
    let validatedId: validparametertype 
    try {
       validatedId = valideParameter.parse(c.req.param("id"))
    
    } catch (error) {
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }

    try {

        const validatedBody: wellbeingPutType = wellBeingInputSchemaforPut.parse(c.req.valid("json"))
        const updateWellbeingData = await db.wellbeingEntry.update({
            where:{
                id: validatedId,
            },
            data: {
                ...validatedBody
            }
        })

        return c.json({message: "successfully updated", data: updateWellbeingData}, 200)
    } catch (error) {
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
})

wellBeingRouter.delete("/:id", async(c) => {
        let validatedId: validparametertype 
    try {
       validatedId = valideParameter.parse(c.req.param("id"))
    
    } catch (error) {
        return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
    try {
        const deletedItem =  await db.wellbeingEntry.delete({
            where:{
                id: validatedId,
            }
        })

        return c.json({message: "successfully deleted", data: deletedItem}, 200)
    } catch (error) {
         return c.json( { ...checkError(error)}, checkError(error).statusCode as ContentfulStatusCode);
    }
})

export default wellBeingRouter;


