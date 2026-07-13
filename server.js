// ============================================================
// ZEUS AI — Render Web Service (ROOT LEVEL)
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');

// Import sub-modules (now from same-level folders)
const serverRoutes = require('./server/index');
const whatsappAPI = require('./whatsapp-api/whatsapp');
const aiBackend = require('./ai-backend/ai-engine');
const webhookHandler = require('./webhook/webhook-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Code']
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(bodyParser.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(bodyParser.urlencoded({ extended: true }));

// ===== RATE LIMITING =====
const { RateLimiterMemory } = require('rate-limit-flexible');
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests. Slow down.' });
  }
});

// ===== ROUTES =====
app.get('/health', (req, res) => {
  res.json({
    status: '✅ ZEUS AI Server Running',
    version: '6.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    creator: 'ZEUS (Godwin Emmanuel Victory)',
    contact: '+234 906 676 0078'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '⚡ ZEUS AI Server is running!',
    docs: '/health',
    api: '/api',
    webhook: '/webhook'
  });
});

// Mount all route modules
app.use('/api', serverRoutes);
app.use('/api/whatsapp', whatsappAPI);
app.use('/api/ai', aiBackend);
app.use('/webhook', webhookHandler);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'ZEUS AI — Use /api for endpoints'
  });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('[ZEUS ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===== START SERVER =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════╗
║           ⚡ ZEUS AI SERVER v6.0            ║
║  Created by ZEUS (Godwin Emmanuel Victory)   ║
║  📞 +234 906 676 0078                       ║
╠══════════════════════════════════════════════╣
║  Server: http://0.0.0.0:${PORT}                       ║
║  Health: http://0.0.0.0:${PORT}/health                ║
║  Mode:   ${(process.env.NODE_ENV || 'development').padEnd(30)} ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
