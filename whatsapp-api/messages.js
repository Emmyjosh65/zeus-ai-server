// ============================================================
// ZEUS AI — WhatsApp Message Templates & Handlers
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const config = require('./config');

// ===== WELCOME MESSAGE =====
function getWelcomeMessage(userName) {
  return `⚡ *Welcome to ZEUS AI!* ⚡

Hey ${userName || 'there'}! I'm ZEUS — your intelligent AI companion.

👑 *Commands:*
• *help* — Show this menu
• *about* — About ZEUS
• *premium* — Premium info
• *owner* — Contact creator
• *chat <message>* — Talk to AI
• *image <prompt>* — Generate image prompt

Created by ZEUS (Godwin Emmanuel Victory)
📞 +234 906 676 0078`;
}

// ===== OWNER INFO =====
function getOwnerMessage() {
  const o = config.OWNER;
  return `👑 *ZEUS (Godwin Emmanuel Victory)*

👤 *Name:* ${o.realName}
📞 *Phone:* ${o.phone}
🎓 *School:* ${o.school}
🎓 *University:* ${o.university}
💍 *Status:* ${o.relationship}
🚀 *Role:* ${o.title}

⚡ *ZEUS AI Premium:* ₦8,000
🏦 *Opay:* ${config.PREMIUM_ACCOUNT} (${config.PREMIUM_NAME})
💬 *WhatsApp:* wa.me/${o.phone.replace(/[^0-9]/g, '')}

*"The future of intelligence is here."*`;
}

// ===== PREMIUM INFO =====
function getPremiumMessage() {
  return `👑 *ZEUS AI PREMIUM*

💰 *Price:* ₦8,000 (One-time)
🏦 *Payment:* Opay ${config.PREMIUM_ACCOUNT}
👤 *Name:* ${config.PREMIUM_NAME}

✅ *Premium Features:*
• 🚀 Faster AI responses
• 🎨 Image prompt generator
• 📊 Priority support
• 🏆 Exclusive tools

📤 *After payment:* Send screenshot to wa.me/${config.OWNER.phone.replace(/[^0-9]/g, '')}
You'll receive your unique premium code!`;
}

// ===== HELP MESSAGE =====
function getHelpMessage() {
  return `⚡ *ZEUS AI Commands*

💬 *chat <message>* — Talk to AI
👤 *about* — About ZEUS
👑 *premium* — Premium info
📞 *owner* — Contact creator
🆘 *help* — This menu
🧹 *clear* — Clear session

*Examples:*
• "chat Teach me Python"
• "chat Who is ZEUS?"
• "chat Premium details"

📞 Support: +234 906 676 0078`;
}

// ===== PROCESS INCOMING MESSAGE =====
async function processIncomingMessage(messageObj) {
  const from = messageObj.from;
  const text = (messageObj.text?.body || '').trim().toLowerCase();
  const userName = messageObj.profile?.name || 'User';
  
  // Command routing
  if (text === 'help' || text === 'menu') {
    return { to: from, message: getHelpMessage() };
  }
  
  if (text === 'about' || text === 'who is zeus' || text === 'owner') {
    return { to: from, message: getOwnerMessage() };
  }
  
  if (text === 'premium' || text === 'premium info' || text === 'price') {
    return { to: from, message: getPremiumMessage() };
  }
  
  if (text === 'hi' || text === 'hello' || text === 'hey') {
    return { to: from, message: getWelcomeMessage(userName) };
  }
  
  if (text.startsWith('chat ')) {
    const query = text.substring(5);
    const aiEngine = require('../ai-backend/ai-engine');
    const reply = await aiEngine.generateResponse(query);
    return { to: from, message: reply.substring(0, 1024) };
  }
  
  // Default: AI response
  const aiEngine = require('../ai-backend/ai-engine');
  const reply = await aiEngine.generateResponse(text);
  return { to: from, message: reply.substring(0, 1024) };
}

module.exports = {
  getWelcomeMessage,
  getOwnerMessage,
  getPremiumMessage,
  getHelpMessage,
  processIncomingMessage
};
