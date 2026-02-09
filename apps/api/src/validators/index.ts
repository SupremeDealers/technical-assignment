import { z } from "zod";

export const CreateUserDtoSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
  });

export const LoginUserDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  columns: z
    .array(
      z.object({
        name: z.string().min(1, "Column name is required"),
        position: z
          .number()
          .int()
          .min(0, "Position must be a non-negative integer"),
      }),
    )
    .min(1, "At least one column is required"),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  columns: z
    .array(
      z.object({
        column_id: z.string().uuid().optional(),
        name: z.string().min(1, "Column name is required"),
        position: z
          .number()
          .int()
          .min(0, "Position must be a non-negative integer"),
      }),
    )
    .optional(),
});

export const createColumnSchema = z.object({
  name: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be at most 50 characters"),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export const createTaskSchema = z.object({
  name: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  column_id: z.string().uuid(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content must be at most 1000 characters"),
});

export const moveTaskSchema = z.object({
  to_column_id: z.string().uuid(),
  new_order: z.number().int().min(0),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
export type LoginUserDto = z.infer<typeof LoginUserDtoSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
