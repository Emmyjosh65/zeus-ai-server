// ============================================================
// ZEUS AI — Webhook Handler (Express Router)
// For WhatsApp, GitHub, and custom webhook integrations
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const config = require('../whatsapp-api/config');
const messages = require('../whatsapp-api/messages');
const aiEngine = require('../ai-backend/ai-engine');

// ===== WEBHOOK VERIFICATION (WhatsApp) =====
// WhatsApp sends a GET request to verify the webhook
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[WEBHOOK VERIFY]', { mode, token });

  if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WEBHOOK] Verified successfully');
    return res.status(200).send(challenge);
  }

  console.error('[WEBHOOK] Verification failed');
  return res.sendStatus(403);
});

// ===== WHATSAPP INCOMING MESSAGES =====
// WhatsApp sends POST requests with incoming messages
router.post('/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    
    // Always respond 200 quickly to prevent retries
    res.status(200).send('OK');

    // Check for WhatsApp webhook payload
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      
      for (const entry of entries) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field === 'messages') {
            const value = change.value;
            const messages = value.messages || [];
            
            for (const msg of messages) {
              if (msg.type === 'text') {
                // Process the incoming message
                const response = await messages.processIncomingMessage({
                  from: msg.from,
                  text: msg.text,
                  profile: value.contacts?.[0]?.profile || {}
                });
                
                // Send reply via WhatsApp API
                if (response) {
                  const whatsappAPI = require('../whatsapp-api/whatsapp');
                  await whatsappAPI.sendMessage(response.to, response.message);
                }
              }
              
              if (msg.type === 'interactive') {
                // Handle button replies
                const buttonReply = msg.interactive?.button_reply;
                if (buttonReply) {
                  const response = await messages.processIncomingMessage({
                    from: msg.from,
                    text: { body: buttonReply.title },
                    profile: value.contacts?.[0]?.profile || {}
                  });
                  
                  if (response) {
                    const whatsappAPI = require('../whatsapp-api/whatsapp');
                    await whatsappAPI.sendMessage(response.to, response.message);
                  }
                }
              }
              
              if (msg.type === 'image') {
                // Handle image messages
                const whatsappAPI = require('../whatsapp-api/whatsapp');
                await whatsappAPI.sendMessage(
                  msg.from,
                  "Thanks for the image! I'm analyzing it now... 🔍"
                );
                
                // AI analysis would go here
                const analysis = await aiEngine.analyzeImage(
                  msg.image?.id 
                    ? `https://graph.facebook.com/v21.0/${config.WHATSAPP_PHONE_ID}/media/${msg.image.id}`
                    : '',
                  'Analyze this image'
                );
                
                if (analysis) {
                  await whatsappAPI.sendMessage(msg.from, analysis.substring(0, 1024));
                }
              }
            }
          }
          
          // Handle message status updates
          if (change.field === 'message_template_status_update') {
            console.log('[TEMPLATE STATUS]', change.value);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('[WEBHOOK PROCESSING ERROR]', error.message);
  }
});

// ===== GITHUB WEBHOOK =====
router.post('/github', (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  
  console.log('[GITHUB WEBHOOK]', { event, action: payload?.action });
  
  // Handle push events
  if (event === 'push') {
    const branch = payload.ref?.replace('refs/heads/', '');
    const commits = payload.commits?.length || 0;
    console.log(`[GITHUB] Push to ${branch}: ${commits} commits`);
  }
  
  // Handle pull requests
  if (event === 'pull_request') {
    const action = payload.action;
    const prTitle = payload.pull_request?.title;
    console.log(`[GITHUB] PR ${action}: ${prTitle}`);
  }
  
  res.status(200).send('OK');
});

// ===== CUSTOM WEBHOOK =====
router.post('/custom', (req, res) => {
  const payload = req.body;
  const source = req.headers['x-webhook-source'] || 'unknown';
  
  console.log('[CUSTOM WEBHOOK]', { source, payload });
  
  // Process custom webhook
  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString(),
    source
  });
});

// ===== GENERIC ENDPOINT =====
router.post('/:type', (req, res) => {
  const type = req.params.type;
  const payload = req.body;
  
  console.log(`[WEBHOOK] Generic: ${type}`, payload);
  
  res.status(200).json({
    received: true,
    type,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
