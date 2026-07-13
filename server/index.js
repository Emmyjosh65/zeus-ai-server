// ============================================================
// ZEUS AI — Express Server & Routes
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const express = require('express');
const router = express.Router();
const config = require('./config');

// ===== MIDDLEWARE =====
router.use((req, res, next) => {
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  req.startTime = Date.now();
  next();
});

// ===== AUTH MIDDLEWARE =====
function adminAuth(req, res, next) {
  const code = req.headers['x-admin-code'] || req.query.code;
  if (code === config.ADMIN_CODE) {
    req.isAdmin = true;
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Admin code required.' });
}

// ===== ROUTES =====

// Get server status
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    version: config.VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    admin: !!req.isAdmin
  });
});

// Chat endpoint (proxy to AI backend)
router.post('/chat', async (req, res) => {
  try {
    const { message, history, model } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const aiEngine = require('../ai-backend/ai-engine');
    const reply = await aiEngine.generateResponse(message, history || [], model);
    
    res.json({
      success: true,
      reply: reply,
      model: model || 'default',
      requestId: req.requestId,
      processingTime: Date.now() - req.startTime + 'ms'
    });
  } catch (err) {
    console.error('[CHAT ERROR]', err.message);
    res.status(500).json({ error: 'AI processing failed', message: err.message });
  }
});

// Vision analysis endpoint
router.post('/vision', async (req, res) => {
  try {
    const { image, prompt } = req.body;
    if (!image) return res.status(400).json({ error: 'Image data required' });

    const aiEngine = require('../ai-backend/ai-engine');
    const analysis = await aiEngine.analyzeImage(image, prompt || 'Describe this image in detail');
    
    res.json({
      success: true,
      analysis: analysis,
      requestId: req.requestId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
router.get('/admin/stats', adminAuth, (req, res) => {
  res.json({
    users: global.ZEUS_users || 0,
    totalMessages: global.ZEUS_totalMessages || 0,
    premiumUsers: global.ZEUS_premiumUsers || 0,
    uptime: process.uptime()
  });
});

router.post('/admin/generate-code', adminAuth, (req, res) => {
  const crypto = require('crypto');
  const code = 'ZEUS-PREM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  res.json({ success: true, code });
});

module.exports = router;
