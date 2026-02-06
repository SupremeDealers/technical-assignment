import Joi from 'joi';

//auth Controller related validations
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  name: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin').default('user')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

//Task Controller based validations
export const createTaskSchema = Joi.object({
  columnId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  columnId: Joi.string().optional(), // Used when moving task between columns
});

export const taskQuerySchema = Joi.object({
  columnId: Joi.string().optional(),
  search: Joi.string().optional().allow(''),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});

//Comment controller based validations
export const createCommentSchema = Joi.object({
  content: Joi.string().required(),
});