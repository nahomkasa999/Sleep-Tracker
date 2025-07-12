import { Hono } from "hono";
import { User } from "@/lib/generated/prisma";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { error } from "console";


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

  await next()
});

const sleepRouterReceivingJson = z.object({
  userId: z.string().uuid(),
  bedtime: z.string().datetime(),
  wakeUpTime: z.string().datetime(),
  qualityRating: z.number().int().min(1).max(10),
  comments: z.string().optional(),
  durationHours: z.number().optional(),

});

sleepRouter.post("/", zValidator('json', sleepRouterReceivingJson), async (c) => { //first successfull post to the db
  const CurrentUserID = c.get("CurrentUser").id
  const bodyReceived = await c.req.json(); //parsing it to json

  //check the currentuser with the authenticated user
  const {bedtime, wakeUpTime, durationHours, qualityRating,comments} = bodyReceived
  const sleepEntry = await db.sleepEntry.create({
    data : {
      userId: CurrentUserID,
      bedtime: new Date(bedtime),
      wakeUpTime: new Date(wakeUpTime),
      durationHours: durationHours,
      qualityRating: qualityRating,
      comments: comments

    }
  }).then((data) => {
    return c.json({message: "successfully added to the database",}, 200)
  }).catch((error) => {
    return c.json({Error: `${error.message ||  "UnknownError"} `})
  })

  return c.json(200);
});

export default sleepRouter;







































// import { Hono } from 'hono';
// import { PrismaClient, User } from '@/lib/generated/prisma';
// import { zValidator } from '@hono/zod-validator';
// import { z } from 'zod';

// const prisma = new PrismaClient();


// type Variables = {
//   user: User;
// };

// const sleepRouter = new Hono<{ Variables: Variables }>();

// // Middleware to get user (replace with your actual auth logic)
// sleepRouter.use('*', async (c, next) => {
//   // In a real app, you'd get the user from a session or token
//   // For now, we'll hardcode a user for demonstration purposes
//   const user = await prisma.user.findFirst();
//   if (!user) {
//     return c.json({ error: 'No user found in the database. Please create a user first.' }, 404);
//   }
//   c.set('user', user);
//   await next();
// });

// const sleepSchema = z.object({
//   bedtime: z.string().datetime(),
//   wakeUpTime: z.string().datetime(),
//   qualityRating: z.number().int().min(1).max(10),
//   comments: z.string().optional(),
// });

// // Create a sleep entry
// sleepRouter.post('/', zValidator('json', sleepSchema), async (c) => {
//   const user = c.get('user');
//   const { bedtime, wakeUpTime, qualityRating, comments } = c.req.valid('json');

//   const bedtimeDate = new Date(bedtime);
//   const wakeUpTimeDate = new Date(wakeUpTime);
//   const durationMs = wakeUpTimeDate.getTime() - bedtimeDate.getTime();
//   const durationHours = durationMs / (1000 * 60 * 60);

//   try {
//     const newSleepEntry = await prisma.sleepEntry.create({
//       data: {
//         userId: user.id,
//         bedtime: bedtimeDate,
//         wakeUpTime: wakeUpTimeDate,
//         durationHours,
//         qualityRating,
//         comments,
//       },
//     });
//     return c.json(newSleepEntry, 201);
//   } catch (error) {
//     return c.json({ error: 'Failed to create sleep entry' }, 500);
//   }
// });

// // Get all sleep entries for the user
// sleepRouter.get('/', async (c) => {
//   const user = c.get('user');
//   try {
//     const sleepEntries = await prisma.sleepEntry.findMany({
//       where: { userId: user.id },
//       orderBy: { bedtime: 'desc' },
//     });
//     return c.json(sleepEntries);
//   } catch (error) {
//     return c.json({ error: 'Failed to retrieve sleep entries' }, 500);
//   }
// });

// // Get a single sleep entry
// sleepRouter.get('/:id', async (c) => {
//   const user = c.get('user');
//   const { id } = c.req.param();
//   try {
//     const sleepEntry = await prisma.sleepEntry.findFirst({
//       where: { id, userId: user.id },
//     });
//     if (!sleepEntry) {
//       return c.json({ error: 'Sleep entry not found' }, 404);
//     }
//     return c.json(sleepEntry);
//   } catch (error) {
//     return c.json({ error: 'Failed to retrieve sleep entry' }, 500);
//   }
// });

// const updateSleepSchema = sleepSchema.partial();

// // Update a sleep entry
// sleepRouter.put('/:id', zValidator('json', updateSleepSchema), async (c) => {
//   const user = c.get('user');
//   const { id } = c.req.param();
//   const data = c.req.valid('json');

//   try {
//     const updatedSleepEntry = await prisma.sleepEntry.update({
//       where: { id, userId: user.id },
//       data,
//     });
//     return c.json(updatedSleepEntry);
//   } catch (error) {
//     return c.json({ error: 'Failed to update sleep entry' }, 500);
//   }
// });

// // Delete a sleep entry
// sleepRouter.delete('/:id', async (c) => {
//   const user = c.get('user');
//   const { id } = c.req.param();
//   try {
//     await prisma.sleepEntry.delete({
//       where: { id, userId: user.id },
//     });
//     return c.json({ message: 'Sleep entry deleted successfully' });
//   } catch (error) {
//     return c.json({ error: 'Failed to delete sleep entry' }, 500);
//   }
// });

// export default sleepRouter;
