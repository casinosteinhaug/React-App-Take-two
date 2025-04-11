
import { LLMDriverFactory } from '../server/drivers/llm';
import { formatTestResult, getTestImageBase64, TEST_PROMPT } from './test-utils';

async function runTests() {
  const factory = LLMDriverFactory.getInstance();
  factory.initializeDrivers();
  const drivers = factory.getAvailableDrivers();
  
  console.log('\nStarting LLM Driver Tests...\n');
  
  // Test each available driver
  for (const driver of drivers) {
    console.log(`Testing ${driver.name}...`);
    
    try {
      // Test connection
      const isConnected = await driver.testConnection();
      if (!isConnected) {
        throw new Error('Connection test failed');
      }
      
      // Test text-only query
      const textResponse = await driver.sendMessage({
        prompt: TEST_PROMPT
      });
      
      formatTestResult(`${driver.name} - Text Query`, textResponse);
      
      // Test image+text query
      const imageResponse = await driver.sendMessage({
        prompt: TEST_PROMPT,
        imageBase64: getTestImageBase64()
      });
      
      formatTestResult(`${driver.name} - Image+Text Query`, imageResponse);
      
    } catch (error) {
      formatTestResult(driver.name, { error: error.message });
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
