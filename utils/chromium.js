const chromium = require('chrome-aws-lambda');

const launchChromium = async () => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  return { browser, page };
}

module.exports.launchChromium = launchChromium;