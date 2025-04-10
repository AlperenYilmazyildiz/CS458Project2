const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'com.anonymous.CS458Project2',
  'appium:appActivity': '.MainActivity',
  'appium:app': './android/app/build/outputs/apk/debug/app-debug.apk',
  'appium:noReset': false
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities,
};

const AI_MODELS = ['chatGPT', 'bard', 'claude', 'copilot', 'deepSeek'];

async function runTest() {
  const driver = await remote(wdOpts);
  
  try {
    // Wait for app to load
    await driver.pause(3000);

    // Navigate to Survey page (assuming we're starting from Login)
    const loginInput = await driver.$('//*[contains(@text, "Login")]');
    await loginInput.click();
    await driver.pause(1000);

    // First, select all AI models
    for (const model of AI_MODELS) {
      console.log(`Selecting AI model: ${model}`);
      const modelCheckbox = await driver.$(`//*[contains(@text, "${model}")]/preceding-sibling::*[1]`);
      await modelCheckbox.click();
      await driver.pause(1000);
    }

    // Enter text for each model
    const modelTexts = {};
    for (const model of AI_MODELS) {
      console.log(`Entering text for: ${model}`);
      
      // Find the text area for the model
      const modelTextArea = await driver.$(`//*[contains(@text, "${model}")]/following-sibling::*[contains(@class, "TextInput")]`);
      if (!modelTextArea) {
        throw new Error(`Text area not found for ${model}`);
      }

      // Enter combined pros and cons text
      const testText = `Pros of ${model}: Fast response time, accurate answers\nCons of ${model}: Sometimes gives incorrect information`;
      await modelTextArea.setValue(testText);
      modelTexts[model] = testText;
      await driver.pause(1000);
    }

    // Verify text persistence by checking each model's text area again
    for (const model of AI_MODELS) {
      console.log(`Verifying text persistence for: ${model}`);
      
      const modelTextArea = await driver.$(`//*[contains(@text, "${model}")]/following-sibling::*[contains(@class, "TextInput")]`);
      const currentText = await modelTextArea.getText();
      
      if (currentText !== modelTexts[model]) {
        throw new Error(`Text persistence verification failed for ${model}. Expected: ${modelTexts[model]}, Got: ${currentText}`);
      }
    }

    // Test text persistence when unchecking and rechecking a model
    const testModel = AI_MODELS[0]; // Using first model for this test
    console.log(`Testing text persistence when unchecking and rechecking: ${testModel}`);
    
    // Uncheck the model
    const modelCheckbox = await driver.$(`//*[contains(@text, "${testModel}")]/preceding-sibling::*[1]`);
    await modelCheckbox.click();
    await driver.pause(1000);
    
    // Recheck the model
    await modelCheckbox.click();
    await driver.pause(1000);
    
    // Verify text is still there
    const modelTextArea = await driver.$(`//*[contains(@text, "${testModel}")]/following-sibling::*[contains(@class, "TextInput")]`);
    const currentText = await modelTextArea.getText();
    
    if (currentText !== modelTexts[testModel]) {
      throw new Error(`Text persistence verification failed after unchecking/rechecking ${testModel}`);
    }

    console.log('All tests passed: Text persists in each model\'s text area until survey submission');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    throw error;
  } finally {
    await driver.pause(1000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error); 