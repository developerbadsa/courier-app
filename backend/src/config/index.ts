import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  currency: {
    default: process.env.DEFAULT_CURRENCY || 'USD',
    symbol: process.env.CURRENCY_SYMBOL || '$',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/shohnaat_logistics?schema=public',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://redis:6379',
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_shohnaat',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_shohnaat',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
  },
  notifications: {
    whatsapp: {
      apiKey: process.env.WHATSAPP_API_KEY || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    },
    sms: {
      apiKey: process.env.SMS_API_KEY || '',
      senderId: process.env.SMS_SENDER_ID || 'SHOHNAAT',
    },
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '2525', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'Shohnaat Logistics <no-reply@shohnaat.com>',
    },
  },
};
