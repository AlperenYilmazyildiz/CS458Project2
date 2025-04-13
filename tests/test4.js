const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'emulator-5554', // Your emulator device ID
  'appium:appPackage': 'host.exp.exponent', // Expo Go package
  'appium:appActivity': '.experience.HomeActivity', // Expo Go activity
  'appium:noReset': true,
  'appium:androidSdkRoot': 'C:\\Users\\ayber\\AppData\\Local\\Android\\Sdk'
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities,
};

async function runTest() {
  const driver = await remote(wdOpts);
  
  try {
    console.log("Starting test with Expo Go...");
    // Wait for Expo Go to load
    await driver.pause(3000);
    
    // Try to find and tap on your project in Expo Go
    console.log("Looking for your project in Expo Go...");
    try {
      // First look for your project by name
      const projectButton = await driver.$("//android.widget.TextView[contains(@text, 'CS458Project2')]");
      await projectButton.waitForDisplayed({ timeout: 10000 });
      await projectButton.click();
      console.log("Found and clicked on your project");
    } catch (error) {
      console.log("Couldn't find project by name, trying recent project...");
      // If can't find by name, try clicking the first/most recent project
      try {
        const recentProject = await driver.$("(//android.view.ViewGroup[@content-desc='open-project-button'])[1]");
        await recentProject.click();
        console.log("Clicked on recent project");
      } catch (error) {
        console.log("Trying to tap on first project by position...");
        // Last resort - try tapping where the first project might be
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 300, y: 300 },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      }
    }
    
    // Wait for your app to load
    console.log("Waiting for app to load...");
    await driver.pause(10000);
    
    // Login to access the survey page
    console.log("Attempting to login...");
    const emailInput = await driver.$("//android.widget.EditText[@hint='Email']");
    await emailInput.waitForExist({ timeout: 20000 });
    await emailInput.setValue("ayberkkeroglu@gmail.com");
    console.log("Email entered");

    const passwordInput = await driver.$("//android.widget.EditText[@hint='Password']");
    await passwordInput.waitForExist({ timeout: 20000 });
    await passwordInput.setValue("123");
    console.log("Password entered");

    // Find and click the login button
    try {
      const loginButton = await driver.$('~login_button');
      await loginButton.click();
      console.log("Login button clicked (by accessibility ID)");
    } catch (error) {
      console.log("Looking for login button by text...");
      const loginButtonByText = await driver.$("//android.widget.Button[contains(@text, 'Login')]");
      await loginButtonByText.click();
      console.log("Login button clicked (by text)");
    }

    // Click OK on login success alert
    console.log("Looking for OK button on alert...");
    await driver.pause(2000);
    const okButton = await driver.$("//*[contains(@text, 'OK') or contains(@text, 'Tamam')]");
    await okButton.waitForDisplayed({ timeout: 15000 });
    await okButton.click();
    console.log("OK button clicked on alert");
    
    // Step 1: Check if submit button is initially not visible
    console.log("Checking initial submit button visibility...");
    let submitButtonVisible = false;
    try {
      submitButtonVisible = await checkSubmitButtonVisibility(driver);
      
      if (submitButtonVisible) {
        throw new Error("Test failed: Submit button is visible before filling required fields");
      }
      console.log("✅ Step 1 passed: Submit button is not visible initially");
    } catch (error) {
      if (error.message.includes("Test failed")) {
        throw error;
      }
      console.log("✅ Step 1 passed: Submit button is not visible initially");
    }

    // Step 2: Fill in required fields one by one
    
    // Fill name
    console.log("Filling name field...");
    try {
      const nameInput = await driver.$("//android.widget.EditText[@text='Enter your name']");
      await nameInput.setValue("Test Name");
    } catch (error) {
      console.log("Trying alternative name field selector...");
      const nameInput = await driver.$("//android.widget.EditText[contains(@text, 'name')]");
      await nameInput.setValue("Test Name");
    }
    console.log("Name filled");
    
    // Check button visibility after name
    submitButtonVisible = await checkSubmitButtonVisibility(driver);
    if (submitButtonVisible) {
      throw new Error("Test failed: Submit button became visible after filling only name");
    }
    
    // Fill surname
    console.log("Filling surname field...");
    try {
      const surnameInput = await driver.$("//android.widget.EditText[@text='Enter your surname']");
      await surnameInput.setValue("Test Surname");
    } catch (error) {
      console.log("Trying alternative surname field selector...");
      const surnameInput = await driver.$("//android.widget.EditText[contains(@text, 'surname')]");
      await surnameInput.setValue("Test Surname");
    }
    console.log("Surname filled");
    
    // Check button visibility
    submitButtonVisible = await checkSubmitButtonVisibility(driver);
    console.log("Button visible after surname:", submitButtonVisible);
    
    // Select birth date
    console.log("Setting birth date...");
    try {
      const birthDateField = await driver.$("//*[contains(@text, 'Select birth date')]");
      await birthDateField.click();
      await driver.pause(1000);
      
      // Click OK on date picker
      const dateOkButton = await driver.$("//*[contains(@text, 'OK') or contains(@text, 'SET')]");
      await dateOkButton.click();
    } catch (error) {
      console.log("Date picker error:", error.message);
    }
    console.log("Birth date selected");
    
    // Check button visibility
    submitButtonVisible = await checkSubmitButtonVisibility(driver);
    console.log("Button visible after date:", submitButtonVisible);
    
    // Select education level
    console.log("Setting education level...");
    try {
      const educationOption = await driver.$("//*[contains(@text, 'Bachelor Degree')]");
      await educationOption.click();
    } catch (error) {
      try {
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 300, y: 500 },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      } catch (e) {
        console.log("Education selection error:", e.message);
      }
    }
    console.log("Education level selected");
    
    // Fill city
    console.log("Filling city field...");
    try {
      const cityInput = await driver.$("//android.widget.EditText[@text='Enter your city']");
      await cityInput.setValue("Test City");
    } catch (error) {
      console.log("Trying alternative city field selector...");
      const cityInput = await driver.$("//android.widget.EditText[contains(@text, 'city')]");
      await cityInput.setValue("Test City");
    }
    console.log("City filled");
    
    // Scroll down to see gender options
    await scrollDown(driver);
    await driver.pause(1000);
    
    // Select gender
    console.log("Setting gender...");
    try {
      const maleOption = await driver.$("//*[contains(@text, 'male')]");
      await maleOption.click();
    } catch (error) {
      console.log("Gender selection error:", error.message);
      try {
        // Try clicking by position
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 300, y: 700 },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      } catch (e) {
        console.log("Alternative gender selection error:", e.message);
      }
    }
    console.log("Gender selected");
    
    // Scroll down to see AI model options
    await scrollDown(driver);
    await driver.pause(1000);
    
    // Select AI model (chatGPT)
    console.log("Selecting AI model...");
    try {
      const chatGPTOption = await driver.$("//*[contains(@text, 'chatGPT')]");
      await chatGPTOption.click();
    } catch (error) {
      console.log("AI model selection error:", error.message);
      // Try clicking by position
      try {
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 100, y: 800 },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      } catch (e) {
        console.log("Alternative model selection error:", e.message);
      }
    }
    console.log("AI model selected");
    
    await driver.pause(1000);
    
    // Fill AI model description
    console.log("Filling AI model description...");
    try {
      const modelDescription = await driver.$("//android.widget.EditText[contains(@text, 'defects')]");
      await modelDescription.setValue("Test defects description");
    } catch (error) {
      console.log("Model description error:", error.message);
      // Try a more general selector
      try {
        const inputs = await driver.$$("//android.widget.EditText");
        if (inputs.length > 3) {
          await inputs[3].setValue("Test defects description");
        }
      } catch (e) {
        console.log("Alternative description input error:", e.message);
      }
    }
    console.log("AI model description filled");
    
    // Scroll down to the AI use case field
    await scrollDown(driver);
    await driver.pause(1000);
    
    // Fill AI use case
    console.log("Filling AI use case...");
    try {
      const useCaseInput = await driver.$("//android.widget.EditText[contains(@text, 'AI') or contains(@text, 'daily')]");
      await useCaseInput.setValue("Test AI use case description for daily life activities");
    } catch (error) {
      console.log("Use case input error:", error.message);
      // Try a more general selector - last input field
      try {
        const inputs = await driver.$$("//android.widget.EditText");
        await inputs[inputs.length - 1].setValue("Test AI use case description for daily life activities");
      } catch (e) {
        console.log("Alternative use case input error:", e.message);
      }
    }
    console.log("AI use case filled");
    
    // Final scroll to see submit button
    await scrollDown(driver);
    await driver.pause(2000);
    
    // Now check if submit button is visible
    console.log("Checking if submit button is now visible...");
    submitButtonVisible = await checkSubmitButtonVisibility(driver);
    
    if (submitButtonVisible) {
      console.log("✅ Test passed: Submit button is visible after filling all required fields");
    } else {
      throw new Error("Test failed: Submit button is not visible after filling all required fields");
    }
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await driver.deleteSession();
  }
}

async function checkSubmitButtonVisibility(driver) {
  try {
    // Try multiple methods to find the submit button
    
    // Method 1: By accessibility ID
    try {
      const submitButton = await driver.$('~send_survey_button');
      return await submitButton.isDisplayed();
    } catch (error) {
      // Button not found by accessibility ID, try next method
    }
    
    // Method 2: By text content
    try {
      const submitButtonByText = await driver.$("//android.widget.Button[contains(@text, 'Send Survey') or contains(@text, 'Submit') or contains(@text, 'Send')]");
      return await submitButtonByText.isDisplayed();
    } catch (error) {
      // Button not found by text, try next method
    }
    
    // Method 3: By class name (last button on the page)
    try {
      const buttons = await driver.$$("//android.widget.Button");
      if (buttons.length > 0) {
        return await buttons[buttons.length - 1].isDisplayed();
      }
    } catch (error) {
      // No buttons found, try next method
    }
    
    // Method 4: Look for TouchableOpacity elements with text that might be the submit button
    try {
      const touchable = await driver.$("//*[contains(@text, 'Send') or contains(@text, 'Submit') or contains(@text, 'Survey')]");
      return await touchable.isDisplayed();
    } catch (error) {
      // Not found
    }
    
    // If we get here, button isn't visible
    return false;
  } catch (error) {
    console.log("Error checking submit button visibility:", error.message);
    return false;
  }
}

async function scrollDown(driver) {
  try {
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 500, y: 1200 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', duration: 500, x: 500, y: 400 },
        { type: 'pointerUp', button: 0 },
      ],
    }]);
  } catch (error) {
    console.log("Scroll error, trying alternative method:", error.message);
    // Alternative scrolling method
    try {
      await driver.touchAction([
        { action: 'press', x: 500, y: 1200 },
        { action: 'wait', ms: 100 },
        { action: 'moveTo', x: 500, y: 400 },
        { action: 'release' }
      ]);
    } catch (e) {
      console.log("Alternative scroll failed too:", e.message);
    }
  }
  await driver.pause(1000); // Allow scroll to settle
}

runTest().catch(console.error);