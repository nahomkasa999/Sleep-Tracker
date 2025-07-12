import { Hono } from 'hono';

const sleepRouter = new Hono();

sleepRouter.post('/', async (c) => {
 
  const body = await c.req.json();

  return c.json({ message: 'Sleep entry created', data: body }, 201);// our ver first Working API Post with HONO
});

sleepRouter.get('/', async (c) => {
  return c.json({ message: 'Sleep entries fetched', data: [] });
});

sleepRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  return c.json({ message: `Sleep entry ${id} updated` });
});

sleepRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  return c.json({ message: `Sleep entry ${id} deleted` });
});

export default sleepRouter;