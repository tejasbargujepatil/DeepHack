const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  context: Joi.string().valid('register', 'login', 'reset_password').required()
});

const productSchema = Joi.object({
  name:         Joi.string().min(3).required(),
  description:  Joi.string().required(),
  price:        Joi.number().min(0).required(),
  comparePrice: Joi.number().min(0).allow(null),
  discount:     Joi.number().min(0).max(100).allow(null),
  stock:        Joi.number().integer().min(0).required(),
  sku:          Joi.string().required(),
  brand:        Joi.string().allow('', null),
  categoryId:   Joi.string().required(),
  specs:        Joi.object().optional(),
  tags:         Joi.array().items(Joi.string()).optional(),
  images:       Joi.array().items(Joi.string().uri()).optional(), // ← image URLs
  isActive:     Joi.boolean().default(true),
  isFeatured:   Joi.boolean().default(false),
});

const orderSchema = Joi.object({
  addressId: Joi.string().required(),
  notes: Joi.string().allow('', null),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  productSchema,
  orderSchema
};
