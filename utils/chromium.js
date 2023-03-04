import chromium from "chrome-aws-lambda";

export const launchChromium = async () => {
  const browser = await chromium.puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  return { browser, page };
};
