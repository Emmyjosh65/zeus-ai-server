// ============================================================
// ZEUS AI — WhatsApp Configuration
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

require('dotenv').config();

const config = {
  // WhatsApp Cloud API
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'zeus_verify_2026',
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET || '',
  WHATSAPP_API_VERSION: 'v21.0',
  GRAPH_API_URL: 'https://graph.facebook.com',
  
  // Owner Information
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
  PREMIUM_NAME: 'Christana Godwin Okon',
  
  // Admin
  ADMIN_CODE: process.env.ADMIN_CODE || '1090'
};

module.exports = config;
