const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'com.anonymous.CS458Project2', 
  'appium:appActivity': '.MainActivity', 
  'appium:app': './android/app/build/outputs/apk/debug/app-debug.apk',
  'appium:noReset': false,
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
    await driver.pause(5000); 

    const emailInput = await driver.$("//android.widget.EditText[@hint='Email']");
    await emailInput.waitForExist({ timeout: 20000 });
    await emailInput.setValue("ahmetalpyy@gmail.com");

    const passwordInput = await driver.$("//android.widget.EditText[@hint='Password']");
    await passwordInput.waitForExist({ timeout: 20000 });
    await passwordInput.setValue("12345");

    const loginButton = await driver.$('~login_button');
    if (await loginButton.isDisplayed() && await loginButton.isEnabled()) {
          await loginButton.click();
          console.log("Login button clicked.");
    } else {
      throw new Error("Login button not clickable");
    }

    const okButton1 = await driver.$("//*[contains(@text, 'OK') or contains(@text, 'Tamam')]");
    await okButton1.waitForDisplayed({ timeout: 5000 });
    await okButton1.click();

    const dummyText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod nisl eget aliquam ultricies. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 12345678901234567890";
    const useCaseInput = await driver.$('android=new UiSelector().resourceId("ai-use-case-input")');
    await useCaseInput.setValue(dummyText);
    
    const inputValue = await useCaseInput.getText();
    if (inputValue.length > 300) {
      throw new Error(`Test failed: Input allowed ${inputValue.length} chars (max 300)`);
    }
    
    console.log('✅ Test passed: Input correctly limited to 300 chars');
  } finally {
    await driver.deleteSession();
  }
}

runTest().catch(console.error);