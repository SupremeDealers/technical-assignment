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
  boardId: Joi.string().required(),
  name: Joi.string().required().min(2).max(30),
});