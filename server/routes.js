// ============================================================
// ZEUS AI — Additional Express Routes
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const express = require('express');
const router = express.Router();
const config = require('./config');

// Users endpoint
router.get('/users', (req, res) => {
  res.json({
    message: 'ZEUS AI User System',
    registered: global.ZEUS_registeredUsers || 0,
    online: 1
  });
});

// Register user
router.post('/users/register', (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  // In production, store in database
  res.json({
    success: true,
    user: { username, displayName: displayName || username }
  });
});

// Login user
router.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Credentials required' });
  }
  res.json({
    success: true,
    token: 'zeus-token-' + Date.now(),
    user: { username, displayName: username }
  });
});

// Premium validation
router.post('/premium/validate', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  
  const validCodes = global.ZEUS_premiumCodes || ['ZEUS-PREM-TEST'];
  const isValid = validCodes.includes(code.toUpperCase());
  
  res.json({
    success: isValid,
    premium: isValid,
    message: isValid ? '✅ Premium validated' : '❌ Invalid code'
  });
});

// Owner info
router.get('/owner', (req, res) => {
  res.json({
    success: true,
    owner: config.OWNER
  });
});

module.exports = router;
