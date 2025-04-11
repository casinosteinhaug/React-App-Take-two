import { OpenAIDriver } from './openai-driver';
import { ClaudeDriver } from './claude-driver';
import { GeminiDriver } from './gemini-driver';
import { LLMDriver } from './types';

/**
 * LLM Driver Factory
 * Handles creation and access to all LLM drivers
 */
export class LLMDriverFactory {
  private static instance: LLMDriverFactory;
  private drivers: Record<string, LLMDriver> = {};

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): LLMDriverFactory {
    if (!LLMDriverFactory.instance) {
      LLMDriverFactory.instance = new LLMDriverFactory();
    }
    return LLMDriverFactory.instance;
  }

  /**
   * Initialize all available drivers
   * Will silently skip drivers that fail to initialize due to missing API keys
   */
  public initializeDrivers(): void {
    try {
      this.drivers['openai'] = new OpenAIDriver();
      console.log('Initialized OpenAI driver');
    } catch (error) {
      console.warn('Failed to initialize OpenAI driver:', (error as Error).message);
    }

    try {
      this.drivers['claude'] = new ClaudeDriver();
      console.log('Initialized Claude driver');
    } catch (error) {
      console.warn('Failed to initialize Claude driver:', error.message);
    }

    try {
      this.drivers['gemini'] = new GeminiDriver();
      console.log('Initialized Gemini driver');
    } catch (error) {
      console.warn('Failed to initialize Gemini driver:', error.message);
    }
  }

  /**
   * Get all successfully initialized drivers
   */
  public getAvailableDrivers(): LLMDriver[] {
    return Object.values(this.drivers);
  }

  /**
   * Get driver by name
   * @param name Driver name ('openai', 'claude', 'gemini')
   */
  public getDriver(name: string): LLMDriver | null {
    return this.drivers[name.toLowerCase()] || null;
  }
}

// Export individual driver classes and types
export * from './types';
export * from './openai-driver';
export * from './claude-driver';
export * from './gemini-driver';