import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt"

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>()

blogRouter.use('/*', async (c, next) => {
	const token = c.req.header("authorization") || "";
	const user = await verify(token, c.env.JWT_SECRET)

	if(user) {
        
        c.set("userId", user.id);
        await next();
    } else {
        c.status(403); 
        return c.json({
            message: "You are unable to log in"
        })
    }
}) 

// blogRouter.get('/:id', (c) => {
// 	const id = c.req.param('id')
// 	console.log(id);
// 	return c.text('get blog route')
// })

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
        data: {
            authorId: userId, 
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

// I think need to add pagination (BKL)
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany();

    return c.json({
        posts
    })
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.findFirst({
            where: {
                id: id
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
