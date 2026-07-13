// ============================================================
// ZEUS AI — Webhook Route Registration
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const express = require('express');
const router = express.Router();
const webhookHandler = require('./webhook-handler');

// Health check for webhook system
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    webhooks: ['whatsapp', 'github', 'custom'],
    supported: true
  });
});

// Register all webhook routes
router.use('/', webhookHandler);

// Webhook test endpoint
router.post('/test', (req, res) => {
  const payload = req.body;
  
  console.log('[WEBHOOK TEST]', {
    headers: req.headers,
    body: payload
  });
  
  res.json({
    success: true,
    message: 'Webhook received and processed',
    echo: payload,
    timestamp: new Date().toISOString()
  });
});

// Webhook logs (admin only)
router.get('/logs', (req, res) => {
  res.json({
    message: 'Webhook event logs',
    // In production, fetch from database
    recentEvents: []
  });
});

module.exports = router;
