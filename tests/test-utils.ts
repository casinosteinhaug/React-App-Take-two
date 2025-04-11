
import fs from 'fs-extra';
import path from 'path';
import { LLMDriverFactory } from '../server/drivers/llm';

export const TEST_PROMPT = 'Hva er to damer med to flotte bein?';

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

export function formatTestResult(driverName: string, response: any): void {
  console.log('\n============================================');
  console.log(`TEST RESULTS FOR ${driverName.toUpperCase()}`);
  console.log('============================================');
  
  if (response.error) {
    console.log('❌ TEST FAILED');
    console.log('Error:', response.error);
  } else {
    console.log('✅ TEST PASSED');
    if (response.text) {
      console.log('Response from LLM:');
      console.log('---------------- START OF RESPONSE ----------------');
      console.log(response.text);
      console.log('----------------- END OF RESPONSE -----------------');
    }
  }
}

async function runTests() {
  console.log('\n🔄 Starting LLM Driver Tests...\n');
  
  const factory = LLMDriverFactory.getInstance();
  factory.initializeDrivers();
  const drivers = factory.getAvailableDrivers();
  
  console.log(`📋 Found ${drivers.length} drivers to test\n`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const driver of drivers) {
    console.log(`\n🔍 Testing driver: ${driver.name}`);
    
    try {
      console.log('\n1️⃣ Testing Connection...');
      const isConnected = await driver.testConnection();
      totalTests++;
      
      if (isConnected) {
        console.log('✅ Connection test passed');
        passedTests++;
      } else {
        console.log('❌ Connection test failed');
        continue;
      }
      
      console.log('\n2️⃣ Testing Text Query...');
      const textResponse = await driver.sendMessage({
        prompt: TEST_PROMPT
      });
      totalTests++;
      
      if (textResponse && textResponse.text) {
        console.log('✅ Text query test passed');
        formatTestResult(`${driver.name} - Text Query`, textResponse);
        passedTests++;
      } else {
        console.log('❌ Text query test failed');
        formatTestResult(`${driver.name} - Text Query`, { error: 'No response received' });
      }
      
      console.log('\n3️⃣ Testing Image+Text Query...');
      const imageResponse = await driver.sendMessage({
        prompt: TEST_PROMPT,
        imageBase64: getTestImageBase64()
      });
      totalTests++;
      
      if (imageResponse && imageResponse.text) {
        console.log('✅ Image+Text query test passed');
        formatTestResult(`${driver.name} - Image+Text Query`, imageResponse);
        passedTests++;
      } else {
        console.log('❌ Image+Text query test failed');
        formatTestResult(`${driver.name} - Image+Text Query`, { error: 'No response received' });
      }
      
    } catch (error) {
      console.log(`❌ Tests failed for ${driver.name}`);
      formatTestResult(driver.name, { error: error.message });
    }
  }
  
  console.log('\n============================================');
  console.log('📊 FINAL TEST SUMMARY');
  console.log('============================================');
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Tests Passed: ${passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  console.log('============================================\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
