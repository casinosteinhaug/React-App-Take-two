import fs from 'fs-extra';
import path from 'path';

/**
 * Test utilities for LLM drivers
 */

// Create test-images directory if it doesn't exist
const testImagesDir = path.join(process.cwd(), 'tests', 'test-images');
fs.ensureDirSync(testImagesDir);

// Creates or loads a test image
export function getTestImageBase64(): string {
  const imagePath = path.join(testImagesDir, 'test-image.jpg');

  // Create a simple test image if it doesn't exist
  // This is just a placeholder - in a real application you'd have actual test images
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

  // Load and return the existing test image
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

// Test prompt as specified by the user
export const TEST_PROMPT = 'Hva er to damer med to flotte bein?';