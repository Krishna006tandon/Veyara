import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  role: Joi.string().valid('CUSTOMER', 'STORE_OWNER', 'DELIVERY_PARTNER').default('CUSTOMER')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2),
  lastName: Joi.string().min(2),
  avatar: Joi.string().uri()
});

// Address validation schemas
export const addressSchema = Joi.object({
  type: Joi.string().valid('home', 'work', 'other').required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().pattern(/^\d{6}$/).required(),
  country: Joi.string().default('India'),
  latitude: Joi.number(),
  longitude: Joi.number(),
  isDefault: Joi.boolean().default(false)
});

// Store validation schemas
export const storeSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().pattern(/^\d{6}$/).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  deliveryRadiusKm: Joi.number().min(1).max(20).default(5),
  avgDeliveryTimeMinutes: Joi.number().min(5).max(60).default(10),
  logo: Joi.string().uri(),
  coverImage: Joi.string().uri(),
  operatingHours: Joi.object()
});

// Product validation schemas
export const productSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string(),
  category: Joi.string().valid('SHIRTS', 'PANTS', 'DRESSES', 'JACKETS', 'ACCESSORIES', 'SHOES', 'UNDERWEAR', 'SPORTSWEAR').required(),
  brand: Joi.string(),
  price: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  sizes: Joi.array().items(Joi.string()).min(1).required(),
  colors: Joi.array().items(Joi.string()).min(1).required(),
  materials: Joi.array().items(Joi.string()),
  careInstructions: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  stock: Joi.number().min(0).default(0),
  isFeatured: Joi.boolean().default(false)
});

// Order validation schemas
export const createOrderSchema = Joi.object({
  storeId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      size: Joi.string().required(),
      color: Joi.string().required()
    })
  ).min(1).required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().pattern(/^\d{6}$/).required(),
    coordinates: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    })
  }).required(),
  deliveryInstructions: Joi.string(),
  customerNotes: Joi.string()
});

// Payment validation schemas
export const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  method: Joi.string().valid('razorpay', 'cod').required()
});

export const verifyPaymentSchema = Joi.object({
  paymentId: Joi.string().required(),
  orderId: Joi.string().required(),
  signature: Joi.string().required()
});

// Delivery validation schemas
export const acceptDeliverySchema = Joi.object({
  orderId: Joi.string().required(),
  estimatedTime: Joi.number().min(5).max(60).required()
});

export const updateLocationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  timestamp: Joi.date().default(Date.now)
});

export const completeDeliverySchema = Joi.object({
  orderId: Joi.string().required(),
  deliveryOtp: Joi.string().required(),
  actualTime: Joi.number().min(1)
});
