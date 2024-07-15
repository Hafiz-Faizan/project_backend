const puppeteer = require('puppeteer-core');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const generateTraffic = async ({ url, keyword, stayTime, numBots }) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: CHROME_PATH,
        });

        const searchKeywordOnGoogle = async (page, keyword, url) => {
            try {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
                await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 0 });

                let found = false;
                let rank = 1;
                for (let i = 0; i < 5; i++) { // Search through the first 5 pages
                    const links = await page.$$eval('div.g a', as => as.map(a => a.href));
                    for (const link of links) {
                        if (link.includes(url)) {
                            console.log(`URL ${url} found at rank #${rank} for keyword "${keyword}".`);
                            await page.goto(link, { waitUntil: 'networkidle2', timeout: 0 });
                            await page.evaluate((stayTime) => {
                                return new Promise(resolve => setTimeout(resolve, stayTime));
                            }, stayTime); // Stay on the page for the specified time
                            found = true;
                            break;
                        }
                        rank++;
                    }
                    if (found) break;
                    const nextButton = await page.$('a#pnnext');
                    if (nextButton) {
                        await nextButton.click();
                        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
                    } else {
                        break;
                    }
                }

                if (!found) {
                    console.log(`URL ${url} not found in the first 5 pages of Google search results for keyword "${keyword}".`);
                }
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
