
import { z } from 'zod';

const toInt = (v: unknown) => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

export const listTasksQuerySchema = z
  .object({
    search: z.string().optional().default(''),
    page: z.preprocess(toInt, z.number().int().min(1).default(1)),
    limit: z.preprocess(toInt, z.number().int().min(1).max(100).default(20)),
    sort: z.enum(['order', 'createdAt', 'priority']).default('order'),
  })
  .strip();

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const updateTaskSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    columnId: z.number().optional(),
    order: z.number().optional(),
  })
  .strip();

export const createColumnSchema = z
  .object({
    title: z.string().min(1),
    order: z.number().int().min(0).optional(),
  })
  .strip();

export const updateColumnSchema = z
  .object({
    title: z.string().min(1).optional(),
    order: z.number().int().min(0).optional(),
  })
  .strip();