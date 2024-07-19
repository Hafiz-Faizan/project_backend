const puppeteer = require('puppeteer-core');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const generateTraffic = async ({ url, keyword, stayTime, numBots }) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--proxy-server=p.webshare.io:80'],
            executablePath: CHROME_PATH,
        });

        const searchKeywordOnGoogle = async (page, keyword, url) => {
            try {
                await page.authenticate({ username: 'iqginjvo-rotate', password: 'a2rgiep0kllk' }); // Replace with your actual credentials

                const googleUrl = 'http://httpbin.org/ip';
                await page.goto(googleUrl, { waitUntil: 'networkidle2', timeout: 60000 });
                await page.screenshot({ path: `screenshot_${Date.now()}_google.png` });

            } catch (err) {
                console.error(`Error during Google search: ${err.message}`);
                throw err;
            }
        };

        const bots = [];
        for (let i = 0; i < numBots; i++) {
            bots.push(new Promise(async (resolve) => {
                const page = await browser.newPage();
                try {
                    await searchKeywordOnGoogle(page, keyword, url);
                } catch (err) {
                    console.error(`Error in bot ${i + 1}: ${err.message}`);
                } finally {
                    await page.close();
                    resolve();
                }
            }));
        }

        await Promise.all(bots);
    } catch (err) {
        console.error(`Error generating traffic inside Puppeteer: ${err.message}`);
        throw err;
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { generateTraffic };

const sampleData = {
    url: 'https://www.pmtrainingschool.com/',  // Replace with your target URL
    keyword: 'DASSM',  // Replace with your search keyword
    stayTime: 30000,             // Time bots stay on the page in milliseconds
    numBots: 1                   // Number of bots you want to simulate
};

// Run the function
generateTraffic(sampleData)
    .then(() => {
        console.log('Traffic generation completed successfully.');
    })
    .catch((err) => {
        console.error('Error generating traffic:', err);
    });
