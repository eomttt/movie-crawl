const fetch = require("node-fetch");
const { launchChromium } = require('../utils/chromium');

const LOTTE_HOST_URL = 'https://www.lottecinema.co.kr/NLCHS';

const GANGWON_INDEX = 7;
const MOCK_THEATER_INFO = {
    title: '동해',
    link: 'https://www.lottecinema.co.kr/NLCHS/Cinema/Detail?divisionCode=1&detailDivisionCode=6&cinemaID=7002'
};

const NAVER_LINK = 'https://search.naver.com/search.naver?';

const getRegions = async () => {
    const { browser, page } = await launchChromium();

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
    const { browser, page }  = await launchChromium();

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
};

const getImage = async (imageUrl) => {
    const { browser, page }  = await launchChromium();

    try {
        await page.goto(imageUrl);
        await page.waitFor(1000);

        const images = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('div > a > img'));
            return elements.map((element) => {
                return {
                    image: element.getAttribute('src')
                }
            })
        });
        return images[0].image
    } catch (error) {
        console.log('Get lotter error', error);
    } finally {
        browser.close();
    }
}

const getTimeTableByNaver = async (theaterName) => {
    const { browser, page }  = await launchChromium();

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
        let timeTableData = [];
        for (movieItem of movieItems) {
            const item = {
                title: movieItem.title,
                timeInfo: movieItem.timeInfo,
                image: await getImage(movieItem.imageUrl)
            }
            timeTableData.push(item);
        }
        return timeTableData;
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
