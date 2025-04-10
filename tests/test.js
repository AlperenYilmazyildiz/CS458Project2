const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'com.anonymous.CS458Project2', // Replace with your app's package name
  'appium:appActivity': '.MainActivity', // Replace with your app's main activity 'appium:autoGrantPermissions': true,
  'appium:noReset': true,
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities,
};

async function runTest() {
  const driver = await remote(wdOpts);
  
  try {
    // Wait for app to load
    await driver.pause(3000);
    
    // Find the useCaseOfAI text input
    const useCaseInput = await driver.$('//*[contains(@text, "Beneficial AI Use Cases")]/following-sibling::*[1]');
    
    // Generate a long text (301 characters)
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
      + 'Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, '
      + 'quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, '
      + 'nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, '
      + 'nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc '
      + 'eu nisl. This text is exactly 301 characters long.';
    
    // Enter text that exceeds the limit
    await useCaseInput.setValue(longText);
    
    // Get the actual value in the input
    const inputValue = await useCaseInput.getText();
    
    // Verify the length doesn't exceed 300 characters
    if (inputValue.length > 300) {
      throw new Error(`Input exceeds 300 characters (actual: ${inputValue.length})`);
    }
    
    console.log('Test passed: Input is limited to 300 characters');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    throw error;
  } finally {
    await driver.pause(1000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);