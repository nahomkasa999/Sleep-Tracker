import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { describeRoute, openAPISpecs } from "hono-openapi";


import sleepRouter from '@/app/lib/sleep';
import wellBeingRouter from '@/app/lib/wellbeing';
import insightsRouter from "@/app/lib/insight"
import apiDefinition from '@/app/lib/openapi-spec'
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono().basePath('/api')
app.use('*', logger());
app.use('*', cors());


//app.route('/auth', authRouter);
app.route('/sleep', sleepRouter);
app.route('/wellbeing', wellBeingRouter);
app.route('/insights', insightsRouter);

app.get("/swagger", swaggerUI({url: "/api/doc"}))

app.get("/doc", (c) => c.json(apiDefinition));

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)