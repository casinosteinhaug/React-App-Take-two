/**
 * LLM API Driver Interface
 * Common interface for all LLM API drivers
 */

export interface LLMRequest {
  prompt: string;
  imageBase64?: string;  // Optional base64-encoded image
  messageHistory?: LLMMessage[];  // Optional message history for context
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageBase64?: string;  // Optional image attachment for the message
}

export interface LLMResponse {
  text: string;
  imageUrls?: string[];  // Some models may return images
  error?: string;  // Error message if something went wrong
}

export interface LLMDriver {
  name: string;
  /**
   * Send a message to the LLM API
   * @param request The request containing prompt and optional image
   * @returns Response from the LLM
   */
  sendMessage(request: LLMRequest): Promise<LLMResponse>;
  
  /**
   * Test if the driver is properly configured
   * @returns True if the driver is ready to use
   */
  testConnection(): Promise<boolean>;
}