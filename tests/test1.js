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

async function runTest() {
  const driver = await remote(wdOpts);

try{
    await driver.pause(3000);

    const emailInput = await driver.$("//android.widget.EditText[@hint='Email']");
    await emailInput.waitForExist({ timeout: 20000 });
    await emailInput.setValue("endeerutlu@gmail.com");

    const passwordInput = await driver.$("//android.widget.EditText[@hint='Password']");
    await passwordInput.waitForExist({ timeout: 20000 });
    await passwordInput.setValue("Sifre");

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

    // Fill name
    const nameInput = await driver.$("//android.widget.EditText[@text='Enter your name']");
    await nameInput.setValue("Ender");

    // Fill surname
    const surnameInput = await driver.$("//android.widget.EditText[@text='Enter your surname']");
    await surnameInput.setValue("Utlu");

    // Open date picker
    const birthDateField = await driver.$("//*[contains(@text, 'Select birth date')]");
    await birthDateField.click();
    await driver.pause(1000);

    // Select birth date (01/08/2002)
    // You may need to adjust these depending on your DatePicker style
    /*await driver.touchPerform([{ action: 'tap', options: { x: 500, y: 900 } }]); // set date
    await driver.pause(500);*/
    const okButton2 = await driver.$("//*[contains(@text, 'OK') or contains(@text, 'Tamam')]");
    await okButton2.click();

     // Select education level: Bachelor's
    const bachelorOption = await driver.$("//*[contains(@text, 'Bachelor Degree')]");
    await bachelorOption.click();

    // Fill city
    const cityInput = await driver.$("//android.widget.EditText[@text='Enter your city']");
    await cityInput.setValue("Ankara");

    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 500, y: 1600 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 500, x: 500, y: 400 },
        { type: 'pointerUp', button: 0 },
      ],
    }]);

    await driver.pause(1000); // Allow scroll to settle

    // Select gender: Male
    const maleOption = await driver.$("//*[contains(@text, 'male')]");
    await maleOption.click();

    // Select chatGPT
    const chatGPTCheck = await driver.$("//*[contains(@text, 'chatGPT')]");
    await chatGPTCheck.click();

    // Fill chatGPT description
    const chatGPTDesc = await driver.$("//android.widget.EditText[@text='Describe chatGPT defects']");
    await chatGPTDesc.setValue("Lack of creativity");

    // Select bard
    const bardCheck = await driver.$("//*[contains(@text, 'bard')]");
    await bardCheck.click();

    // Fill bard description
    const bardDesc = await driver.$("//android.widget.EditText[@text='Describe bard defects']");
    await bardDesc.setValue("Inconsistent performance");

    const useCaseInput = await driver.$("//android.widget.EditText[contains(@text, 'Describe how AI')]");
    await useCaseInput.setValue("Can be used as a better search engine");

    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 500, y: 1200 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 500, x: 500, y: 400 },
        { type: 'pointerUp', button: 0 },
      ],
    }]);

    await driver.pause(1000); // Allow scroll to settle

    const sendSurveyButton = await driver.$('~send_survey_button');

    if (await sendSurveyButton.isDisplayed() && await sendSurveyButton.isEnabled()) {
          await sendSurveyButton.click();
          console.log("Login button clicked.");
    } else {
      throw new Error("Login button not clickable");
    }

    const responsePopup = await driver.$("//*[contains(@text, 'submit') or contains(@text, 'Tamam')]");
    await responsePopup.waitForDisplayed({ timeout: 10000 });

    const alertText = await responsePopup.getText();

    let result = "";
    if (alertText.includes("Survey submitted successfully")) {
        result = "✅ Test successful!";
    } else {
        result = "❌ Test failed!";
    }

    const okButton4 = await driver.$("//*[contains(@text, 'OK') or contains(@text, 'Tamam')]");
    await okButton4.waitForDisplayed({ timeout: 5000 });
    await okButton4.click();

    console.log(result);

}   catch (error) {
     console.error('Test failed:', error.message);
     throw error;
   } finally {
     await driver.pause(1000);
     await driver.deleteSession();
   }

 }

 runTest().catch(console.error);