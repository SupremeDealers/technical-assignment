import z from "zod";

export const signupSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
    name: z.string()
})

export const loginSchema = z.object({
    email: z.string(),
    password: z.string()
})
//board schema
export const createBoardSchema = z.object({
    name: z.string().min(1).max(100)
})

export const updateBoardSchema = z.object({
    name: z.string().min(1).max(100).optional()
})

//column schema 
export const createColumnSchema = z.object({
    name: z.string().min(1).max(100),
    position: z.number().int().min(0).optional()
})

export const updateColumnSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    position: z.number().int().min(0).optional()
})

//task schema 
export const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    position: z.number().int().min(0).optional()
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).optional().nullable(),
    position: z.number().int().min(0).optional(),
    columnId: z.string().uuid().optional() // For moving tasks
})


export const taskQuerySchema = z.object({
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
    sort: z.enum(['createdAt', 'priority', 'updatedAt']).optional().default('createdAt')
})

// Comment schemas
export const createCommentSchema = z.object({
    content: z.string().min(1).max(1000)
})