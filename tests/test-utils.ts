
import fs from 'fs-extra';
import path from 'path';
import { LLMDriverFactory } from '../server/drivers/llm';

// Test prompt as specified by the user
export const TEST_PROMPT = 'Hva er to damer med to flotte bein?';

// Creates or loads a test image
export function getTestImageBase64(): string {
  const testImagesDir = path.join(process.cwd(), 'tests', 'test-images');
  fs.ensureDirSync(testImagesDir);
  const imagePath = path.join(testImagesDir, 'test-image.jpg');

  if (!fs.existsSync(imagePath)) {
    const svgImage = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="50" y="100" font-family="Arial" font-size="16" fill="black">Test Image</text>
        <circle cx="100" cy="130" r="30" fill="#ff6b6b"/>
        <circle cx="160" cy="130" r="30" fill="#ff6b6b"/>
      </svg>
    `;
    const svgBuffer = Buffer.from(svgImage);
    fs.writeFileSync(imagePath, svgBuffer);
    return svgBuffer.toString('base64');
  }

  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Format and print response for test output
export function formatTestResult(driverName: string, response: any): void {
  console.log('\n============================================');
  console.log(`TEST RESULTS FOR ${driverName.toUpperCase()}`);
  console.log('============================================');
  
  if (response.error) {
    console.log('❌ TEST FAILED');
    console.log('Error:', response.error);
  } else {
    console.log('✅ TEST PASSED');
    console.log('Response from LLM:');
    console.log('---------------- START OF RESPONSE ----------------');
    console.log(response.text);
    console.log('----------------- END OF RESPONSE -----------------');
  }
}

async function runTests() {
  const factory = LLMDriverFactory.getInstance();
  factory.initializeDrivers();
  const drivers = factory.getAvailableDrivers();
  
  console.log('\nStarting LLM Driver Tests...\n');
  
  for (const driver of drivers) {
    console.log(`Testing ${driver.name}...`);
    
    try {
      const isConnected = await driver.testConnection();
      if (!isConnected) {
        throw new Error('Connection test failed');
      }
      
      const textResponse = await driver.sendMessage({
        prompt: TEST_PROMPT
      });
      
      formatTestResult(`${driver.name} - Text Query`, textResponse);
      
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

if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
