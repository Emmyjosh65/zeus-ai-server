// ============================================================
// ZEUS AI — Webhook Signature Verification
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const crypto = require('crypto');

// ===== VERIFY WHATSAPP WEBHOOK SIGNATURE =====
function verifyWhatsAppSignature(req, appSecret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !appSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}

// ===== VERIFY GITHUB WEBHOOK =====
function verifyGitHubSignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}

// ===== GENERATE VERIFICATION TOKEN =====
function generateVerifyToken(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  verifyWhatsAppSignature,
  verifyGitHubSignature,
  generateVerifyToken
};
