import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { auth } from "@/app/lib/auth";
import sleepRouter from '@/app/lib/sleep';
import insightsRouter from "@/app/lib/insight"
import apiDefinition from '@/app/lib/openapi-spec'
import { swaggerUI } from '@hono/swagger-ui';

export type HonoEnv =  {
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null
    }
}

const app = new Hono<HonoEnv>().basePath('/api')

app.use('*', logger());
app.use(
    "*",
    cors({
        origin: "http://localhost:3000", // replace with your origin
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);
app.use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
 
    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }
 
    c.set("user", session.user);
    c.set("session", session.session);
    return next();
});

app.on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

app.route('/sleep', sleepRouter);
app.route('/insights', insightsRouter);

app.get("/swagger", swaggerUI({url: "/api/doc"}))

app.get("/doc", (c) => c.json(apiDefinition));

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)