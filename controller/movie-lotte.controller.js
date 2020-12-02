// const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');

const LOTTE_HOST_URL = 'https://www.lottecinema.co.kr/NLCHS';

const GANGWON_INDEX = 7;
const MOCK_THEATER_INFO = {
    title: '동해',
    link: 'https://www.lottecinema.co.kr/NLCHS/Cinema/Detail?divisionCode=1&detailDivisionCode=6&cinemaID=7002'
};

const NAVER_LINK = 'https://search.naver.com/search.naver?';

const getRegions = async () => {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const page = await browser.newPage();

    try {
        await page.goto(LOTTE_HOST_URL);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#header_section > #nav > ul > li:nth-child(3) > div > ul > li > a'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        return regions.splice(1, regions.length);
    } catch (error) {
        console.log('Get regions error Lotte', error);
    } finally {
        browser.close();
    }
};

const getTheatersByRegions = async (regionIndex = GANGWON_INDEX) => {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const page = await browser.newPage();

    try {
        await page.goto(LOTTE_HOST_URL);
        await page.waitFor(1000);
        // Click region
        await page.click('#header_section > #nav > ul > li:nth-child(3)');
        await page.waitFor(1000);
        await page.click(`#header_section > #nav > ul > li:nth-child(3) > div > ul > li:nth-child(${regionIndex + 2})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#nav > ul > li:nth-child(3) > div > ul > .ov > div > ul > li > a'));
            return elements.map((element) => {
                return {
                    title: element.innerText,
                    link: element.getAttribute('href')
                };
            });
        });
        return theatersInfo;
    } catch (error) {
        console.log('Get theater by region error Lotte', error);
    } finally {
        browser.close();
    }
};

const getTimeTable = async (theaterName = MOCK_THEATER_INFO.title) => {
    return getTimeTableByNaver(theaterName);
    // const browser = await chromium.puppeteer.launch({
    //   args: [...chromium.args, '--proxy-server=https=175.213.132.56:8080'],
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath,
    //   headless: chromium.headless,
    // });;
    // const page = await browser.newPage();

    // try {
    //     console.log("AAAAA", link);
    //     await page.goto(link, {
    //         waitUntil: 'load',
    //         // Remove the timeout
    //         timeout: 0
    //     });
    //     console.log("BBBBB");
    //     await page.waitFor(2000);

    //     const movieItems = await page.evaluate(() => {
    //         const items = Array.from(document.querySelectorAll('#contents > .tab_wrap > .active > .tab_con > .mCustomScrollbar > #mCSB_1 > #mCSB_1_container > .time_select_wrap'));
    //         return items.map((item) => {
    //             const title = item.querySelector('.list_tit > p').innerText;
    //             const timeTables = Array.from(item.querySelectorAll('.list_time > li'));
    //             const timeInfo = timeTables.map((timeTable) => {
    //                 return {
    //                     time: timeTable.querySelector('a > dl > .time > strong').innerText,
    //                     seats: timeTable.querySelector('a > dl > .seat > strong').innerText,
    //                     wholeSeats: timeTable.querySelector('a > dl > .seat').innerText.split('/')[1]
    //                 };
    //             });
    //             return {
    //                 title,
    //                 timeInfo
    //             };
    //         });
    //     });

    //     return movieItems;
    // } catch (error) {
    //     console.log('Get theater timetable error LOTTE', error);
    // } finally {
    //     browser.close();
    // }
};

const getTimeTableByNaver = async (theaterName) => {
    const browser = await chromium.puppeteer.launch({
        args: [...chromium.args],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });;
    const page = await browser.newPage();

    try {
        await page.goto(`${NAVER_LINK}query=${encodeURI(`롯데시네마+${theaterName}`)}`, {
            waitUntil: 'load',
            // Remove the timeout
            timeout: 0
        });
        await page.waitFor(1000);

        const movieItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.list_tbl_box > .list_tbl > ._wrap_time_table > tr'));
            return items.map((item) => {
                const title = item.querySelector('th > a').innerText;
                const imageHref = item.querySelector('th > a').getAttribute('href');
                const imageNumber = imageHref.split('=')[1];
                
                const timeTables = Array.from(item.querySelectorAll('td > div > .time_info > a'));
                const timeInfo = timeTables.map((timeTable) => {
                    return {
                        time: timeTable.innerText,
                    };
                });
                return {
                    title,
                    imageUrl: `https://movie.naver.com/movie/bi/mi/photoViewPopup.nhn?movieCode=${imageNumber}`,
                    timeInfo
                };
            });
        });
        return movieItems;
    } catch (error) {
        console.log('Get theater timetable error LOTTE', error);
    } finally {
        browser.close();
    }
};

const getBoxOffice = () => {
};

module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
module.exports.getTimeTable = getTimeTable;
module.exports.getTimeTableByNaver = getTimeTableByNaver;
module.exports.getBoxOffice = getBoxOffice;
