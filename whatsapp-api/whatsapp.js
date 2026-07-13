// ============================================================
// ZEUS AI — WhatsApp API Integration
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const express = require('express');
const router = express.Router();
const axios = require('axios');
const messages = require('./messages');
const config = require('./config');
const aiEngine = require('../ai-backend/ai-engine');

// ===== WHATSAPP API CONFIG =====
const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${config.WHATSAPP_PHONE_ID || 'PHONE_NUMBER_ID'}/messages`;
const WHATSAPP_TOKEN = config.WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN;

// ===== SEND TEXT MESSAGE =====
async function sendMessage(to, text) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { preview_url: true, body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('[WHATSAPP SEND ERROR]', error.response?.data || error.message);
    throw error;
  }
}

// ===== SEND TEMPLATE MESSAGE =====
async function sendTemplate(to, templateName, components) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: components || []
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('[WHATSAPP TEMPLATE ERROR]', error.response?.data || error.message);
    throw error;
  }
}

// ===== SEND IMAGE MESSAGE =====
async function sendImage(to, imageUrl, caption) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'image',
        image: { link: imageUrl, caption: caption || '' }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('[WHATSAPP IMAGE ERROR]', error.response?.data || error.message);
    throw error;
  }
}

// ===== SEND BUTTONS =====
async function sendButtons(to, text, buttons) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: text },
          action: {
            buttons: buttons.map((b, i) => ({
              type: 'reply',
              reply: { id: b.id || `btn_${i}`, title: b.title }
            }))
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('[WHATSAPP BUTTONS ERROR]', error.response?.data || error.message);
    throw error;
  }
}

// ===== ROUTES =====

// Send message endpoint
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Recipient (to) and message are required' });
    }
    const result = await sendMessage(to, message);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Broadcast message
router.post('/broadcast', async (req, res) => {
  try {
    const { recipients, message } = req.body;
    if (!recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({ error: 'Recipients array and message required' });
    }
    const results = [];
    for (const to of recipients) {
      try {
        const result = await sendMessage(to, message);
        results.push({ to, success: true });
      } catch (err) {
        results.push({ to, success: false, error: err.message });
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI-powered WhatsApp reply
router.post('/ai-reply', async (req, res) => {
  try {
    const { to, userMessage } = req.body;
    if (!to || !userMessage) {
      return res.status(400).json({ error: 'Recipient and message required' });
    }
    
    const aiReply = await aiEngine.generateResponse(userMessage, [
      { role: 'system', content: 'You are ZEUS AI on WhatsApp. Respond concisely.' }
    ]);
    
    await sendMessage(to, aiReply.substring(0, 1024));
    res.json({ success: true, reply: aiReply.substring(0, 1024) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
