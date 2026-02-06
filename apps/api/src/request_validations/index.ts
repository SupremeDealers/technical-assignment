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


// Admin Controller related validations
export const createBoardSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
});

export const createColumnSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
});

export const updateColumnSchema = Joi.object({
  name: Joi.string().required().min(2).max(30),
});

// Comment Controller related validations
export const createCommentSchema = Joi.object({
  content: Joi.string().required().min(1).trim().messages({
    'string.min': 'Content can not be empty',
  }),
});

//Task controller related validation
export const createTaskSchema = Joi.object({
  title: Joi.string().required().min(1),
  description: Joi.string().optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});


export const updateTaskSchema = Joi.object({
  title: Joi.string().optional().min(1),
  description: Joi.string().optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  columnId: Joi.string().optional(), 
});

export const taskQuerySchema = Joi.object({
  search: Joi.string().optional().allow(null, '').trim(),
  page: Joi.number().integer().min(1).empty(Joi.valid(null, '')).default(1),
  limit: Joi.number().integer().min(1).max(100).empty(Joi.valid(null, '')).default(20),
  sort: Joi.string().valid('createdAt', 'priority').empty(Joi.valid(null, '')).default('createdAt'),
});