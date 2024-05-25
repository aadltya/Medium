import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt'
import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
		JWT_SECRET: string
	}
}>();

app.route('api/v1/user', userRouter);
app.route('api/v1/blog', blogRouter);

app.use('/api/v1/blog/*', async (c, next) => {
	const jwt = c.req.header("authorization") || "";
	const response = await verify(jwt, c.env.JWT_SECRET)

	if(response.id) {
		next()
	} else {
		c.status(403)
		return c.json({ error: "Unauthorized User" })
	}
})

export default app;