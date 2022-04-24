import cgvController from "./controller/movie-cgv.controller.js";
import lotteController from "./controller/movie-lotte.controller.js";
import megaController from "./controller/movie-megabox.controller.js";

const MOVIE_TYPE = {
  MEGA: "megaBox",
  CGV: "cgv",
  LOTTE: "lotte",
};

const CONTROLLER = {
  [MOVIE_TYPE.MEGA]: megaController,
  [MOVIE_TYPE.CGV]: cgvController,
  [MOVIE_TYPE.LOTTE]: lotteController,
};

const getRegion = async (type) => {
  const result = await CONTROLLER[type].getRegions();

  return result;
};

const getTheatersByRegion = async (type, regionIndex) => {
  const result = await CONTROLLER[type].getTheatersByRegions(regionIndex);

  return result;
};

const getTimeTable = async (type, theaterLink) => {
  const result = await CONTROLLER[type].getTimeTable(theaterLink);

  return result;
};

const getBoxOffice = async () => {
  const result = await CONTROLLER[MOVIE_TYPE.CGV].getBoxOffice();

  return result;
};

export const handler = async (event) => {
  let response = "";

  const { queryStringParameters } = event;

  try {
    if (queryStringParameters) {
      const { request, theater } = queryStringParameters;
      switch (request) {
        case "region": {
          response = await getRegion(theater);
          break;
        }
        case "theaters": {
          const { regionIndex } = queryStringParameters;
          response = await getTheatersByRegion(theater, Number(regionIndex));
          break;
        }
        case "timetable": {
          const { theaterLink } = queryStringParameters;
          console.log(theaterLink);
          response = await getTimeTable(theater, theaterLink);
          break;
        }
        case "box-office": {
          const { theaterLink } = queryStringParameters;
          response = await getBoxOffice(theater);
          break;
        }
        default: {
          console.log("Please input correct request", request);
          response = "Please input correct request";
          break;
        }
      }
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.log("Error" + error);
  }
};

const _test = async () => {
  const result = await handler({
    queryStringParameters: {
      request: "timetable",
      theater: "lotte",
      theaterLink: "광명(광명사거리)",
    },
  });
  console.log("Result", result);
};

// _test();
