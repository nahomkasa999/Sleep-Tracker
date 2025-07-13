import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

import sleepRouter from '@/app/lib/wellbeing';
import wellBeingRouter from '@/app/lib/wellbeing';

const app = new Hono().basePath('/api')
app.use('*', logger());
app.use('*', cors());


//app.route('/auth', authRouter);
app.route('/sleep', sleepRouter);
app.route('/wellbeing', wellBeingRouter);
// app.route('/insights', insightsRouter);

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)