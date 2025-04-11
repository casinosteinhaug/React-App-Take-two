import OpenAI from 'openai';
import { LLMDriver, LLMRequest, LLMResponse } from './types';

/**
 * OpenAI API Driver Implementation
 */
export class OpenAIDriver implements LLMDriver {
  private client: OpenAI;
  name = 'OpenAI (ChatGPT)';

  constructor() {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      // Send a simple prompt to verify the connection works
      await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello, this is a test.' }],
        max_tokens: 5
      });
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    try {
      const messages = [];
      
      // Add message history if provided
      if (request.messageHistory?.length) {
        messages.push(...request.messageHistory.map(msg => ({
          role: msg.role,
          content: msg.imageBase64 
            ? [
                { type: 'text', text: msg.content },
                { 
                  type: 'image_url', 
                  image_url: {
                    url: `data:image/jpeg;base64,${msg.imageBase64}`
                  }
                }
              ]
            : msg.content
        })));
      }
      
      // Create the current message content
      let content: any;
      
      if (request.imageBase64) {
        // If image is included, format as multi-part content
        content = [
          { type: 'text', text: request.prompt },
          { 
            type: 'image_url', 
            image_url: { 
              url: `data:image/jpeg;base64,${request.imageBase64}`
            } 
          }
        ];
      } else {
        // Text-only prompt
        content = request.prompt;
      }
      
      // Add the current user message
      messages.push({ role: 'user', content: content });
      
      // Send request to OpenAI
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000
      });
      
      // Process and return the response
      return {
        text: response.choices[0].message.content || 'No response text received',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        text: '',
        error: `OpenAI API error: ${error.message || 'Unknown error'}`
      };
    }
  }
}