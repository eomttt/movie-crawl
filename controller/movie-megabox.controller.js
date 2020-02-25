// const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');

const MEGA_HOST_URL = 'https://www.megabox.co.kr';
const MEGA_GET_BY_REGION = 'https://www.megabox.co.kr/theater/list';

const GANGWON_INDEX = 6;
const MOCK_THEATER_INFO = {
    title: '속초',
    link: '/theater/time?brchNo=2171'
};

const getRegions = async () => {
    try {
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
          });
        const page = await browser.newPage();
        await page.goto(MEGA_GET_BY_REGION);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.body-wrap > .container > #contents > .inner-wrap > .theater-box > .theater-place > ul > li > .sel-city'));
            return elements.map((element) => {
                return element.innerText;
            });
        });
        console.log('Regions', regions)
        return regions;
    } catch (error) {
        console.log('Get regions error MEGA', error);
    } finally {
        browser.close();
    }
};

const getTheatersByRegions = async (regionIndex = GANGWON_INDEX) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(MEGA_GET_BY_REGION);
        await page.waitFor(1000);
        // Click region
        await page.click(`.body-wrap > .container > #contents > .inner-wrap > .theater-box > .theater-place > ul > li:nth-child(${regionIndex + 1})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.body-wrap > .container > #contents > .inner-wrap > .theater-box > .theater-place > ul > .on > .theater-list > ul > li > a'));
            return elements.map((element) => {
                const hrefLink = element.getAttribute('href');
                const linkArr = hrefLink.split('?');
                return {
                    title: element.innerText,
                    link: `${linkArr[0]}/time?${linkArr[1]}`
                };
            });
        });

        return theatersInfo;
    } catch (error) {
        console.log('Get theater by region error MEGA', error);
    } finally {
        browser.close();
    }
};

const getTimeTable = async (link = MOCK_THEATER_INFO.link) => {
    console.log('GET TIME TABLE MEGA', link);
    const browser = await puppeteer.launch({
        headless: false,
        // headless: true,
        // networkIdleTimeout: 5000,
        // args: [
        //     '--no-sandbox',
        //     '--disable-setuid-sandbox'
        // ]
    });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0)

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        console.log('AAAAAA');
        await page.goto(`${MEGA_HOST_URL}${link}`, {
            waitUntil: 'domcontentloaded'
        });

        await page.waitFor(1000);
        console.log('BBBBB');
        const movieItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.body-wrap > #schdlContainer > #contents > .inner-wrap > .tab-cont-wrap > #tab02 > .reserve > .theater-list'));
            return items.map((item) => {
                const title = item.querySelector('.theater-tit > p:nth-child(2)').innerText;
                const timeTables = Array.from(item.querySelectorAll('.theater-type-box'));
                const timeInfo = timeTables.map((timeTable) => {
                    const wholeSeats = timeTable.querySelector('.theater-type > .chair').innerText;
                    const timesAndSeats = Array.from(timeTable.querySelectorAll('.theater-time > .theater-time-box > .time-list-table > tbody > tr > td'));
                    return timesAndSeats.map((timeAndSeat) => {
                        const timeEle = timeAndSeat.querySelector('.td-ab > .txt-center > a > .time');
                        const seatsEle = timeAndSeat.querySelector('.td-ab > .txt-center > a > .chair');
                        return {
                            time: timeEle ? timeEle.innerText : '',
                            seats: seatsEle ? seatsEle.innerText : '',
                            wholeSeats
                        };
                    });
                });

                return {
                    title,
                    timeInfo
                };
            });
        });
        console.log("CCCC", movieItems);

        return movieItems.map((movieItem) => {
            return {
                title: movieItem.title,
                timeInfo: movieItem.timeInfo.reduce((acc, cur) => {
                    return [...acc, ...cur];
                }, [])
            };
        });
    } catch (error) {
        console.log('Get theater timetable error MEGA', error);
    } finally {
        browser.close();
    }
};

const getBoxOffice = () => {

};

module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
module.exports.getTimeTable = getTimeTable;
module.exports.getBoxOffice = getBoxOffice;
