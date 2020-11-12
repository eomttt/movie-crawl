// const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const fetch = require("node-fetch");

const MEGA_HOST_URL = 'https://www.megabox.co.kr';
const MEGA_GET_BY_REGION = 'https://www.megabox.co.kr/theater/list';

const GANGWON_INDEX = 6;
const MOCK_THEATER_INFO = {
    title: '속초',
    link: '/theater/time?brchNo=2171'
};

const getRegions = async () => {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    try {
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
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const page = await browser.newPage();

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

// const getImageUrl = async (link) => {
//     const browser = await chromium.puppeteer.launch({
//         args: [...chromium.args],
//         defaultViewport: chromium.defaultViewport,
//         executablePath: await chromium.executablePath,
//         headless: chromium.headless,
//     });
//     const MEGA_BOX_IMAGE_URL = `https://www.megabox.co.kr${link}`;
//     const page = await browser.newPage();;
//     console.log('link : ', `${MEGA_BOX_IMAGE_URL}`);
//     try {
//         await page.goto(`${MEGA_BOX_IMAGE_URL}`, {
//             waitUntil: 'load',
//             // Remove the timeout
//             timeout: 0
//         });
//         await page.waitFor(1000);
//         const imageUrl = await page.evaluate(() => {
//             return document.querySelector('#schdlContainer > #contents > .movie-detail-page > .movie-detail-cont > .poster > .wrap > img').getAttribute('src');
//         });
//         console.log('imageUrl : ', imageUrl);
//         return imageUrl;

//     } catch (error) {
//         console.log('Get image URL error MEGA', error);
//     } finally {
//         browser.close();
//     }
// }

const getImageUrl = async (imageNumber) => {
	const response = await fetch(`https://www.megabox.co.kr/on/oh/oha/Movie/selectOneLnList.do?currentPage=1&movieNo=${imageNumber}`);
    const res = await response.json().then(
        data => {
            if (!!data && !!data.list && !!data.list[0] && !!data.list[0].movieFilePath) {
                const imagesvrUrl = data.imgSvrUrl;
                const movieFilePath = !!data.list[0].movieFilePath ? data.list[0].movieFilePath : '';
                console.log(`${imagesvrUrl}${movieFilePath}`);
                return `${imagesvrUrl}${movieFilePath}`;
            }
    });
}

const getTimeTable = async (link = MOCK_THEATER_INFO.link) => {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const page = await browser.newPage();;
    try {
        console.log(`${MEGA_HOST_URL}${link}`);
        await page.goto(`${MEGA_HOST_URL}${link}`, {
            waitUntil: 'load',
            // Remove the timeout
            timeout: 0
        });
        await page.waitFor(1000);

        const movieItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.reserve > .theater-list'));
            return items.map((item) => {
                const imageNumber = item.querySelector('.theater-tit > p:nth-child(2) > a').getAttribute('href').split('=')[1];
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
                    timeInfo,
                    imageNumber
                };
            });
        });
        return movieItems.map((movieItem) => {
            let final = '';
            getImageUrl(movieItem.imageNumber).then(x=>{
                if (!!x) {
                    final = x;
                }
            })
            return {
                title: movieItem.title,
                timeInfo: movieItem.timeInfo.reduce((acc, cur) => {
                    return [...acc, ...cur];
                }, []),
                imageUrl: final
            };
        })
        
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
