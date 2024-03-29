import { launchChromium } from "../utils/chromium.js";

const CGV_HOST_URL = "http://www.cgv.co.kr";
const CGV_GET_BY_REGION = "http://www.cgv.co.kr/theaters/";
const CGV_BOX_OFFICES_URL = "http://www.cgv.co.kr/movies/";

const GANGWON_INDEX = 3;
const MOCK_THEATER_INFO = {
  title: "CGV강릉",
  link: "/theaters/?areacode=12&theaterCode=0139&date=20200202",
};
const CGV_GET_MOVIE_IMAGE = "http://img.cgv.co.kr/Movie/Thumbnail/Poster/";

const getRegions = async () => {
  const { browser, page } = await launchChromium();

  try {
    await page.goto(CGV_GET_BY_REGION);
    await page.waitForTimeout(1000);
    const regions = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          "#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > li > a"
        )
      );
      return elements.map((element) => {
        return element.innerText;
      });
    });

    return regions;
  } catch (error) {
    console.log("Get regions error", error);
  } finally {
    browser.close();
  }
};

const getTheatersByRegions = async (regionIndex = GANGWON_INDEX) => {
  const { browser, page } = await launchChromium();

  try {
    await page.goto(CGV_GET_BY_REGION);
    await page.waitForTimeout(1000);
    // Click region
    await page.click(
      `#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > li:nth-child(${
        regionIndex + 1
      })`
    );
    await page.waitForTimeout(1000);

    const theatersInfo = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          "#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > .on > .area > ul > li > a"
        )
      );
      return elements.map((element) => {
        return {
          title: element.getAttribute("title"),
          link: element.getAttribute("href"),
        };
      });
    });

    return theatersInfo;
  } catch (error) {
    console.log("Get theater by region error", error);
  } finally {
    browser.close();
  }
};

/**
 * @depreacted CGV에서 iframe url 로 따로 접근을 허용해주지 않아서 불필요해짐
 */
// const getTimeTableUrl = async (link = MOCK_THEATER_INFO.link) => {
//   const { browser, page } = await launchChromium();

//   try {
//     await page.goto(`${CGV_HOST_URL}${link}`);
//     await page.waitForTimeout(1000);
//     const iframeUrl = await page.evaluate(() => {
//       const iframe = document.querySelector(
//         "#cgvwrap > #contaniner > #contents > .wrap-theater > .cols-content > .col-detail > iframe"
//       );
//       return iframe.getAttribute("src");
//     });

//     console.log("###iframeUrl", iframeUrl)

//     return iframeUrl;
//   } catch (error) {
//     console.log("Get time table url error", error);
//   } finally {
//     browser.close();
//   }
// };

async function renderPageToHtml(page) {
  const iframes = await page.$$("iframe");
  for (const iframe of iframes) {
    const frame = await iframe.contentFrame();
    if (!frame) continue;
    const context = await frame.executionContext();
    const res = await context.evaluate(() => {
      const el = document.querySelector("*");
      return el?.outerHTML ?? '';
    });
    if (res) {
      await iframe.evaluate((a, res) => {
        a.innerHTML = res;
      }, res);
    }
  }

  return await page.evaluate(() => new XMLSerializer().serializeToString(document));
}

const getTimeTable = async (link = MOCK_THEATER_INFO.link) => {
  const { browser, page } = await launchChromium();

  try {
    await page.goto(`${CGV_HOST_URL}${link}`, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });
    await page.waitForTimeout(1000);

    const htmlString = await renderPageToHtml(page);
    const replacedHtmlString = htmlString.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/iframe/g, 'div');

    await page.setContent(replacedHtmlString);
    await page.waitForTimeout(1000);
    const movieItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.sect-showtimes > ul > li > .col-times'));
      return items.map((item) => {
        const title = item.querySelector(".info-movie > a > strong").innerText;
        console.log('item.querySelector(".info-movie > a > strong")', item.querySelector(".info-movie > a > strong"))
        const timeTables = Array.from(item.querySelectorAll(".type-hall"));
  
        const timeInfo = timeTables.map((timeTable) => {
          const wholeSeats = timeTable.querySelector(
            ".info-hall > ul > li:nth-child(3)"
          ).innerText;
          const timesAndSeats = Array.from(
            timeTable.querySelectorAll(".info-timetable > ul > li > a")
          );
          return timesAndSeats.map((timeAndSeat) => {
            return {
              time: timeAndSeat.querySelector("em").innerText,
              seats: timeAndSeat.querySelector("span").innerText,
              wholeSeats,
            };
          });
        });
  
        const imageHref = item
          .querySelector(".info-movie > a")
          .getAttribute("href");
        const imageNumber = imageHref.split("=")[1];
        return {
          title,
          timeInfo,
          imageNumber,
        };
      });
    })

    // const dom = new JSDOM(replacedHtmlString);


    return movieItems.map((movieItem) => {
      const imageNumber = movieItem.imageNumber.split("");
      return {
        title: movieItem.title,
        timeInfo: movieItem.timeInfo.reduce((acc, cur) => {
          return [...acc, ...cur];
        }, []),
        image: `${CGV_GET_MOVIE_IMAGE}0000${imageNumber[0]}${imageNumber[1]}/${movieItem.imageNumber}/${movieItem.imageNumber}_1000.jpg`,
      };
    });
  } catch (error) {
    console.log("Get time table error", error);
  } finally {
    browser.close();
  }
};

const getBoxOffice = async () => {
  const { browser, page } = await launchChromium();

  try {
    await page.goto(CGV_BOX_OFFICES_URL);
    await page.waitForTimeout(1000);

    const boxOffices = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          "#cgvwrap > #contaniner > #contents > .wrap-movie-chart > .sect-movie-chart > ol > li"
        )
      );
      return elements.map((element) => {
        return {
          image:
            element.querySelector(".box-image > a > .thumb-image > img") &&
            element
              .querySelector(".box-image > a > .thumb-image > img")
              .getAttribute("src"),
          title:
            element.querySelector(".box-contents > a > .title") &&
            element.querySelector(".box-contents > a > .title").innerText,
        };
      });
    });

    return boxOffices.filter((movieData) => {
      return movieData.image && movieData.title;
    });
  } catch (error) {
    console.log("Get theater by region error", error);
  } finally {
    browser.close();
  }
};

export default {
  getRegions,
  getTheatersByRegions,
  getTimeTable,
  getBoxOffice,
};
