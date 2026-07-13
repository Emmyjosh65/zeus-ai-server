// ============================================================
// ZEUS AI — Server Configuration
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERSION: '6.0.0',
  
  // Security
  ADMIN_CODE: process.env.ADMIN_CODE || '1090',
  JWT_SECRET: process.env.JWT_SECRET || 'zeus-ai-secret-key-2026',
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || [
    'https://emmyjosh65.github.io',
    'https://zeus-ai-7uat.onrender.com',
    'http://localhost:3000',
    'http://localhost:5500'
  ],
  
  // OpenRouter AI
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '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',
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
  SITE_URL: process.env.SITE_URL || 'https://emmyjosh65.github.io/ZEUS-AI/',
  
  // WhatsApp
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'zeus_verify_2026',
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET || '',
  
  // Owner
  OWNER: {
    name: 'ZEUS',
    realName: 'Godwin Emmanuel Victory',
    phone: '+234 906 676 0078',
    school: 'ISGS Secondary School',
    university: 'Olabisi Onabanjo University (OOU)',
    relationship: 'Single',
    title: 'Founder & Creator of ZEUS AI'
  },
  
  // Premium
  PREMIUM_PRICE: '₦8,000',
  PREMIUM_ACCOUNT: '9066760078',
  PREMIUM_BANK: 'Opay',
  PREMIUM_NAME: 'Christana Godwin Okon'
};

module.exports = config;
