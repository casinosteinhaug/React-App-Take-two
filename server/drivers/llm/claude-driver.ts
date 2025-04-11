import Anthropic from '@anthropic-ai/sdk';
import { LLMDriver, LLMRequest, LLMResponse } from './types';

/**
 * Claude (Anthropic) API Driver Implementation
 */
export class ClaudeDriver implements LLMDriver {
  private client: Anthropic;
  name = 'Claude (Anthropic)';

  constructor() {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      // Send a simple prompt to verify the connection works
      await this.client.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Hello, this is a test.' }]
      });
      return true;
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }

  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    try {
      const messages = [];
      
      // Add message history if provided
      if (request.messageHistory?.length) {
        messages.push(...request.messageHistory.map(msg => {
          if (msg.imageBase64) {
            return {
              role: msg.role,
              content: [
                {
                  type: 'text',
                  text: msg.content
                },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: msg.imageBase64
                  }
                }
              ]
            };
          } else {
            return {
              role: msg.role,
              content: msg.content
            };
          }
        }));
      }
      
      // Create the current message content
      let content: any;
      
      if (request.imageBase64) {
        // If image is included, format as multi-part content
        content = [
          {
            type: 'text',
            text: request.prompt
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: request.imageBase64
            }
          }
        ];
      } else {
        // Text-only prompt
        content = request.prompt;
      }
      
      // Add the current user message
      messages.push({ role: 'user', content: content });
      
      // Send request to Claude
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await this.client.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        messages: messages as MessageParam[]
      });
      
      // Process and return the response
      return {
        text: (response.content[0] as any).text,
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return {
        text: '',
        error: `Claude API error: ${error.message || 'Unknown error'}`
      };
    }
  }
}