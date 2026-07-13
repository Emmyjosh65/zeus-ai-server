// ============================================================
// ZEUS AI — AI Engine (OpenRouter Integration)
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const axios = require('axios');
const config = require('../server/config');
const prompts = require('./prompts');

class AIEngine {
  constructor() {
    this.apiKey = config.OPENROUTER_API_KEY;
    this.apiUrl = config.OPENROUTER_URL;
    this.model = config.OPENROUTER_MODEL;
    this.siteUrl = config.SITE_URL;
    this.maxRetries = 3;
    this.cache = new Map();
    this.cacheTTL = 60000; // 1 minute
  }

  // ===== GENERATE RESPONSE =====
  async generateResponse(message, history = [], modelOverride = null) {
    const model = modelOverride || this.model;
    
    // System prompt
    const systemPrompt = prompts.getSystemPrompt();
    
    // Build messages
    const messages = [{ role: 'system', content: systemPrompt }];
    
    if (history && history.length > 0) {
      // Add recent history (last 10 messages)
      const recentHistory = history.slice(-10);
      recentHistory.forEach(msg => {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }
    
    messages.push({ role: 'user', content: message });
    
    // Check cache for identical requests
    const cacheKey = this._getCacheKey(messages, model);
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;
    
    // Make API call with retries
    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: model,
            messages: messages,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.3
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': this.siteUrl,
              'X-Title': 'ZEUS AI'
            },
            timeout: 30000
          }
        );
        
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
          throw new Error('Invalid API response structure');
        }
        
        const reply = response.data.choices[0].message?.content || '';
        
        if (!reply) {
          throw new Error('Empty response from AI');
        }
        
        // Cache the response
        this._setCache(cacheKey, reply);
        
        return reply;
        
      } catch (error) {
        lastError = error;
        console.error(`[AI ATTEMPT ${attempt}/${this.maxRetries}]`, error.message);
        
        if (attempt < this.maxRetries) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    // Fallback response
    console.error('[AI FALLBACK] All API attempts failed:', lastError?.message);
    return this._getFallbackResponse(message);
  }

  // ===== ANALYZE IMAGE (Vision) =====
  async analyzeImage(base64Image, prompt) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt || 'Describe this image in detail.' },
                { type: 'image_url', image_url: { url: base64Image } }
              ]
            }
          ],
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.siteUrl
          },
          timeout: 30000
        }
      );
      
      return response.data.choices?.[0]?.message?.content || 'Analysis unavailable.';
      
    } catch (error) {
      console.error('[VISION ERROR]', error.message);
      throw error;
    }
  }

  // ===== STREAM RESPONSE =====
  async streamResponse(message, history = [], onChunk) {
    try {
      const messages = [
        { role: 'system', content: prompts.getSystemPrompt() },
        ...(history || []).slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.siteUrl
          },
          responseType: 'stream',
          timeout: 60000
        }
      );
      
      let fullResponse = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.choices?.[0]?.delta?.content) {
              const content = data.choices[0].delta.content;
              fullResponse += content;
              if (onChunk) onChunk(content);
            }
          } catch (e) {
            // Skip incomplete chunks
          }
        }
      });
      
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(fullResponse));
        response.data.on('error', reject);
      });
      
    } catch (error) {
      console.error('[STREAM ERROR]', error.message);
      throw error;
    }
  }

  // ===== PRIVATE HELPERS =====
  _getCacheKey(messages, model) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return `${model}:${lastMsg.substring(0, 100)}`;
  }

  _getFromCache(key) {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.time < this.cacheTTL) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, time: Date.now() });
    // Clean old entries
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  _getFallbackResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('who is zeus') || lower.includes('owner') || lower.includes('godwin')) {
      return prompts.getOwnerBio();
    }
    if (lower.includes('premium') || lower.includes('price') || lower.includes('payment')) {
      return prompts.getPremiumInfo();
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Hello! I'm ZEUS AI. I can help you with coding, learning, gaming, and more. What would you like to explore today? ⚡";
    }
    
    return "I'm here to help! Ask me anything about coding, learning, gaming, technology, or just have a conversation. I'm ZEUS AI — built by Godwin Emmanuel Victory. ⚡";
  }
}

// Singleton export
const aiEngine = new AIEngine();
module.exports = aiEngine;
