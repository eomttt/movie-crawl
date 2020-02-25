const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');

const CGV_HOST_URL = 'http://www.cgv.co.kr';
const CGV_GET_BY_REGION = 'http://www.cgv.co.kr/theaters/';
const CGV_BOX_OFFICES_URL = 'http://www.cgv.co.kr/movies/';

const GANGWON_INDEX = 3;
const MOCK_THEATER_INFO = {
    title: 'CGV강릉',
    link: '/theaters/?areacode=12&theaterCode=0139&date=20200202'
};

const getRegions = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(CGV_GET_BY_REGION);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > li > a'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        return regions;
    } catch (error) {
        console.log('Get regions error', error);
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
        await page.goto(CGV_GET_BY_REGION);
        await page.waitFor(1000);
        // Click region
        await page.click(`#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > li:nth-child(${regionIndex + 1})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > .on > .area > ul > li > a'));
            return elements.map((element) => {
                return {
                    title: element.getAttribute('title'),
                    link: element.getAttribute('href')
                };
            });
        });

        return theatersInfo;
    } catch (error) {
        console.log('Get theater by region error', error);
    } finally {
        browser.close();
    }
};

const getTimeTableUrl = async (link = MOCK_THEATER_INFO.link) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(`${CGV_HOST_URL}${link}`);
        await page.waitFor(1000);
        const iframeUrl = await page.evaluate(() => {
            const iframe = document.querySelector('#cgvwrap > #contaniner > #contents > .wrap-theater > .cols-content > .col-detail > iframe');
            return iframe.getAttribute('src');
        });

        return iframeUrl;
    } catch (error) {
        console.log('Get time table url error', error);
    } finally {
        browser.close();
    }
};

const getTimeTable = async (link = MOCK_THEATER_INFO.link) => {
    const timeTableUrl = await getTimeTableUrl(link);

    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    try {
        await page.goto(`${CGV_HOST_URL}${timeTableUrl}`);
        await page.waitFor(1000);

        const movieItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.showtimes-wrap > .sect-showtimes > ul > li > .col-times'));
            return items.map((item) => {
                const title = item.querySelector('.info-movie > a > strong').innerText;
                const timeTables = Array.from(item.querySelectorAll('.type-hall'));
                const timeInfo = timeTables.map((timeTable) => {
                    const wholeSeats = timeTable.querySelector('.info-hall > ul > li:nth-child(3)').innerText;
                    const timesAndSeats = Array.from(timeTable.querySelectorAll('.info-timetable > ul > li > a'));
                    return timesAndSeats.map((timeAndSeat) => {
                        return {
                            time: timeAndSeat.querySelector('em').innerText,
                            seats: timeAndSeat.querySelector('span').innerText,
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

        return movieItems.map((movieItem) => {
            return {
                title: movieItem.title,
                timeInfo: movieItem.timeInfo.reduce((acc, cur) => {
                    return [...acc, ...cur];
                }, [])
            };
        });
    } catch (error) {
        console.log('Get time table error', error);
    } finally {
        browser.close();
    }
};

const getBoxOffice = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(CGV_BOX_OFFICES_URL);
        await page.waitFor(1000);

        const boxOffices = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .wrap-movie-chart > .sect-movie-chart > ol > li'));
            return elements.map((element) => {
                return {
                    image: element.querySelector('.box-image > a > .thumb-image > img') && element.querySelector('.box-image > a > .thumb-image > img').getAttribute('src'),
                    title: element.querySelector('.box-contents > a > .title') && element.querySelector('.box-contents > a > .title').innerText
                };
            });
        });

        return boxOffices.filter((movieData) => {
            return movieData.image && movieData.title;
        });
    } catch (error) {
        console.log('Get theater by region error', error);
    } finally {
        browser.close();
    }
};

module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
module.exports.getTimeTableUrl = getTimeTableUrl;
module.exports.getTimeTable = getTimeTable;
module.exports.getBoxOffice = getBoxOffice;
