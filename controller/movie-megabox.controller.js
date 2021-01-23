const fetch = require("node-fetch");
const { launchChromium } = require('../utils/chromium');

const MEGA_HOST_URL = 'https://www.megabox.co.kr';
const MEGA_GET_BY_REGION = 'https://www.megabox.co.kr/theater/list';

const GANGWON_INDEX = 6;
const MOCK_THEATER_INFO = {
    title: '속초',
    link: '/theater/time?brchNo=2171'
};

const getRegions = async () => {
    const { browser, page }  = await launchChromium();

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
    const { browser, page }  = await launchChromium();

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

const getImage = async (imageNumber) => {
	const response = await fetch(`https://www.megabox.co.kr/on/oh/oha/Movie/selectOneLnList.do?currentPage=1&movieNo=${imageNumber}`);
    const data = await response.json();
    // TODO: Node 14 부터 optional chaining 적용 됨.
    // Lambda 는 12 까지만 지원함 ㅠㅠ 고로 못씀...
    // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Optional_chaining

    if (data) {
        const { imgSvrUrl, list } = data;
        if (list && list[0] && list[0].movieFilePath) {
            let path = list[0].movieFilePath;
            list.some((item) => {
                if (item.movieFilePath) {
                    path = item.movieFilePath;
                    return true;
                }
                return false;
            })
            return `${imgSvrUrl}${path}`;
        }
    }
    return '';
}

const getTimeTable = async (link = MOCK_THEATER_INFO.link) => {
    const { browser, page }  = await launchChromium();

    try {
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
        let timeTableData = [];
        for (movieItem of movieItems) {
            const item = {
                title: movieItem.title,
                timeInfo: movieItem.timeInfo.reduce((acc, cur) => {
                    return [...acc, ...cur];
                }, []),
                image: await getImage(movieItem.imageNumber)
            }
            timeTableData.push(item);
        }
        return timeTableData;
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
