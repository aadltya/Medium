import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt"

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>()

blogRouter.use('/*', async (c, next) => {
	const jwt = c.req.header("authorization") || "";
	const response = await verify(jwt, c.env.JWT_SECRET)

	if(response.id) {
		next()
	} else {
		c.status(403)
		return c.json({ error: "Unauthorized User" })
	}
})

// blogRouter.get('/:id', (c) => {
// 	const id = c.req.param('id')
// 	console.log(id);
// 	return c.text('get blog route')
// })

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
        data: {
            authorId: "1", 
            title: body.title,
            content: body.content,
        }
    })

	return c.json({
        id: post.id
    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,
        }
    })

	return c.json({
        id: post.id
    })
})

blogRouter.get('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.findFirst({
            where: {
                id: body.id
            }
        })
    
        return c.json({
            id: post
        })
    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        })
    }
})

