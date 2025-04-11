import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { LLMDriver, LLMRequest, LLMResponse, LLMMessage } from './types';

/**
 * Gemini (Google) API Driver Implementation
 */
export class GeminiDriver implements LLMDriver {
  private client: GoogleGenerativeAI;
  name = 'Gemini (Google)';

  constructor() {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  async testConnection(): Promise<boolean> {
    try {
      // Create a text-only model
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      // Send a simple prompt to verify the connection works
      await model.generateContent('Hello, this is a test.');
      return true;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  private convertToGeminiHistory(messageHistory: LLMMessage[]) {
    return messageHistory.map(msg => {
      if (msg.imageBase64) {
        return {
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [
            { text: msg.content },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: msg.imageBase64
              }
            }
          ]
        };
      } else {
        return {
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        };
      }
    });
  }

  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    try {
      // Create a model that can process both text and images
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
          }
        ]
      });
      
      // Create a chat session if we have message history
      if (request.messageHistory?.length) {
        const chat = model.startChat({
          history: this.convertToGeminiHistory(request.messageHistory),
        });
        
        // Send the current message with or without image
        const parts = [{ text: request.prompt }];
        
        if (request.imageBase64) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: request.imageBase64
            }
          });
        }
        
        const result = await chat.sendMessage(parts);
        const response = await result.response;
        
        return {
          text: response.text(),
        };
      } else {
        // For initial message without history
        const parts = [{ text: request.prompt }];
        
        if (request.imageBase64) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: request.imageBase64
            }
          });
        }
        
        const result = await model.generateContent(parts);
        const response = await result.response;
        
        return {
          text: response.text(),
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        text: '',
        error: `Gemini API error: ${error.message || 'Unknown error'}`
      };
    }
  }
}