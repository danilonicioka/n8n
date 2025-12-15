const { Builder, By, until, Key } = require('selenium-webdriver');
const fs = require('fs');

// --- Configuration Constants ---
const INITIAL_URL = 'https://zeus.tjpa.jus.br/';
// Using By.css for Puppeteer's CSS selectors
const LOGIN_BUTTON_SELECTOR = By.css('#root > div:nth-child(1) > div.withScreencast > div > div > section.stMain.st-emotion-cache-bm2z3a.eht7o1d1 > div.stMainBlockContainer.block-container.st-emotion-cache-mtjnbi.eht7o1d4 > div > div > div > div:nth-child(2) > div > button');
const SCROLL_CONTAINER_SELECTOR = By.css('#root > div:nth-child(1) > div.withScreencast > div > div > section.stMain.st-emotion-cache-bm2z3a.eht7o1d1');
// SUCCESS_SELECTOR and VLL_ERROR_SELECTOR are not directly used in the new Selenium logic, but kept for context
// const SUCCESS_SELECTOR = By.css('#tabs-bui2-tabpanel-0 > div > div > div > div:nth-child(10) > div > div > div > div');
// const VLL_ERROR_SELECTOR = By.css('#tabs-bui2-tabpanel-0 > div > div > div > div:nth-child(6) > div > div > div > div');
const PROCESSING_TIMEOUT_MS = 300000; // 5 minutes in ms
const SUCCESS_MESSAGE = "Você acabou de economizar";
const USERNAME = 'username';
const PASSWORD = 'passoword';
const USERNAME_SELECTOR = By.css('#username');
const PASSWORD_SELECTOR = By.css('#password');
const CONFIRM_LOGIN_BUTTON_SELECTOR = By.css('#kc-login');
const VIDEO_PATH = "/tmp/zeus/videos/0cb3c98a17ce4ea399d6c512f2938524.cd3c7d78cbea4de6a96a5c796a0773eb.zeusteste.mp4";
const FILE_UPLOAD_SELECTOR = By.css("#tabs-bui2-tabpanel-0 > div > div > div > div:nth-child(2) > div > div > section > input[type=file]");

// Helper function for delays (equivalent to your Puppeteer delay)
const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Custom Screenshot Functions (Adapted for Selenium) ---

/**
 * Attempts to find the success message text and takes a full-page screenshot.
 * The complex DOM-traversal and clipping logic from Puppeteer is simplified.
 * @param {WebDriver} driver The Selenium WebDriver instance.
 */
async function findTextScreenshot(driver) {
    console.log('1. Waiting for success message on page...');
    
    // Selenium equivalent of page.waitForFunction(body.innerText.includes(message))
    await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(normalize-space(.), "${SUCCESS_MESSAGE}")]`)), 
        PROCESSING_TIMEOUT_MS, 
        `Timeout waiting for success message: "${SUCCESS_MESSAGE}"`
    );

    console.log('2. Text found. Taking screenshot...');
    
    // Instead of complex cropping, we take a full screenshot (or viewport screenshot)
    const screenshotBase64 = await driver.takeScreenshot();

    // In a real scenario, you'd save the image to a file system, but
    // for this translation, we structure the return as requested.
    // NOTE: Selenium doesn't have a direct 'clip' option like Puppeteer.
    
    // Simplified return structure reflecting SUCCESS status
    return [
        {
            json: {
                status: 'success',
                image_type: 'full_page', // Changed from 'cropped'
                message_found: SUCCESS_MESSAGE
            },
            binary: {
                data: {
                    data: screenshotBase64,
                    mimeType: 'image/png'
                }
            }
        }
    ];
}

/**
 * Takes a debug screenshot of the whole page.
 * The complex sliced-screenshot logic from Puppeteer is removed.
 * @param {WebDriver} driver The Selenium WebDriver instance.
 */
async function takeDebugScreenshot(driver) {
    await delay(PROCESSING_TIMEOUT_MS);
    console.log('Taking debug screenshot due to timeout/error...');

    // Take a full-page screenshot
    const screenshotBase64 = await driver.takeScreenshot();

    // Simplified return structure reflecting SLICE_CAPTURED status
    return [
        {
            json: {
                status: 'debug_captured', // Adjusted status
                image_type: 'full_page_debug'
            },
            binary: {
                data: {
                    data: screenshotBase64,
                    mimeType: 'image/png'
                }
            }
        }
    ];
}

// --- Main Execution Logic ---

async function runScript() {
    let driver;
    try {
        // Initialize the WebDriver (e.g., for Chrome)
        driver = await new Builder().forBrowser('chrome').build();
        
        // 1. Navigate to the initial URL (equivalent to $page.goto)
        await driver.get(INITIAL_URL);

        // 2. Wait for the login button
        console.log('1. Waiting for initial login button...');
        const loginButton = await driver.wait(
            until.elementLocated(LOGIN_BUTTON_SELECTOR), 
            5000, 
            'Timeout waiting for initial login button.'
        );

        // 3. Click the login button and wait for navigation
        console.log('2. Clicking login button and waiting for navigation...');
        // In Puppeteer, you use Promise.all to wait for both click and navigation.
        // In Selenium, you typically click, and then wait for an element on the next page.
        await loginButton.click();
        
        // Wait for the login form fields to appear on the new page
        await driver.wait(until.elementLocated(USERNAME_SELECTOR), 10000, 'Timeout waiting for login form.');
        await driver.wait(until.elementLocated(PASSWORD_SELECTOR), 5000);
        await driver.wait(until.elementLocated(CONFIRM_LOGIN_BUTTON_SELECTOR), 5000);

        // 4. Type the credentials
        console.log('3. Entering credentials...');
        await driver.findElement(USERNAME_SELECTOR).sendKeys(USERNAME);
        await driver.findElement(PASSWORD_SELECTOR).sendKeys(PASSWORD);

        // 5. Click the login button and wait for the redirect
        console.log('4. Clicking login confirmation and waiting for dashboard...');
        await driver.findElement(CONFIRM_LOGIN_BUTTON_SELECTOR).click();
        
        // Wait for a critical element on the dashboard page to be present
        const fileElement = await driver.wait(
            until.elementLocated(FILE_UPLOAD_SELECTOR), 
            30000, // Increased timeout for dashboard load
            'Timeout waiting for file upload element on dashboard.'
        );
        
        // 6. Upload the file
        console.log('5. Uploading file...');
        // In Selenium, file upload is done by sending the absolute path to the <input type="file"> element.
        // Puppeteer's 'element.uploadFile' is equivalent to Selenium's 'element.sendKeys(path)'
        await fileElement.sendKeys(VIDEO_PATH);

        // 7. Wait for the success message or timeout/error
        console.log('6. Waiting for processing to complete...');
        
        try {
            const result = await findTextScreenshot(driver);
            console.log('SUCCESS: Script finished successfully.');
            return result;
        } catch (error) {
            console.error('ERROR: Success message not found within timeout. Capturing debug screenshot.');
            return await takeDebugScreenshot(driver);
        }

    } catch (e) {
        console.error('CRITICAL ERROR in main script execution:', e.message);
        // Attempt a debug screenshot on critical failure
        if (driver) {
             return await takeDebugScreenshot(driver);
        }
        return [{ json: { status: 'critical_failure', error: e.message } }];
    } finally {
        // Ensure the browser is closed, even on error
        if (driver) {
            await driver.quit();
        }
    }
}

// Execute the main function
runScript().then(result => {
    console.log('Final Result Structure:', JSON.stringify(result, null, 2));
}).catch(err => {
    console.error('Unhandled script error:', err);
});