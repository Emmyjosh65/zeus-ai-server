// ============================================================
// ZEUS AI — OpenRouter API Direct Integration
// Created by ZEUS (Godwin Emmanuel Victory)
// ============================================================

const axios = require('axios');

class OpenRouterAPI {
  constructor(apiKey, siteUrl) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.siteUrl = siteUrl || 'https://emmyjosh65.github.io/ZEUS-AI/';
  }

  // ===== LIST AVAILABLE MODELS =====
  async listModels() {
    try {
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('[OPENROUTER MODELS ERROR]', error.message);
      return [];
    }
  }

  // ===== CHECK API KEY VALIDITY =====
  async checkKey() {
    try {
      const models = await this.listModels();
      return { valid: Array.isArray(models), models: models.length };
    } catch {
      return { valid: false, models: 0 };
    }
  }

  // ===== GENERATE WITH SPECIFIC MODEL =====
  async generate(messages, options = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: options.model || 'openai/gpt-3.5-turbo',
          messages: messages,
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          frequency_penalty: options.freqPenalty || 0,
          presence_penalty: options.presPenalty || 0,
          stop: options.stop || null
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.siteUrl,
            'X-Title': 'ZEUS AI'
          },
          timeout: options.timeout || 30000
        }
      );
      
      return {
        success: true,
        content: response.data.choices?.[0]?.message?.content || '',
        model: response.data.model,
        usage: response.data.usage
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status
      };
    }
  }

  // ===== STREAM GENERATION =====
  async stream(messages, onToken, options = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: options.model || 'openai/gpt-3.5-turbo',
          messages: messages,
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
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
      
      let fullContent = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          try {
            const data = JSON.parse(line.substring(6));
            const content = data.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              if (onToken) onToken(content);
            }
          } catch (e) { /* skip */ }
        }
      });
      
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(fullContent));
        response.data.on('error', reject);
      });
      
    } catch (error) {
      console.error('[OPENROUTER STREAM ERROR]', error.message);
      throw error;
    }
  }
}

module.exports = OpenRouterAPI;
