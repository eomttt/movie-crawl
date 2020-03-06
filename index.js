const cgvController = require('./controller/movie-cgv.controller');
const megaController = require('./controller/movie-megabox.controller');
const lotteController = require('./controller/movie-lotte.controller');

const MOVIE_TYPE = {
    MEGA: 'megaBox',
    CGV: 'cgv',
    LOTTE: 'lotte'
};

const CONTROLLER = {
    [MOVIE_TYPE.MEGA]: megaController,
    [MOVIE_TYPE.CGV]: cgvController,
    [MOVIE_TYPE.LOTTE]: lotteController
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

const handler = async (event) => {
  let response = '';
  
  const { queryStringParameters } = event;

  try {
    if (queryStringParameters) {
      const { request, theater } = queryStringParameters;
      switch(request) {
        case 'region': {
          response = await getRegion(theater);
          break;
        }
        case 'theaters': {
          const { regionIndex } = queryStringParameters;
          response = await getTheatersByRegion(theater, Number(regionIndex));
          break;
        }
        case 'timetable': {
          const { theaterLink } = queryStringParameters;
          response = await getTimeTable(theater, theaterLink);
          break;
        }
        case 'box-office': {
          response = await getBoxOffice(theater); 
          break;
        }
        default: {
          console.log('Please input correct request', request);
          response = 'Please input correct request';
          break;
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.log('Error' + error);
  }
};

const _test = async () => {
  const result = await handler({
    queryStringParameters: {
      request: 'timetable',
      theater: 'lotte',
      theaterLink: '가양'
    }
  });
  console.log('AAA', result);
};

// _test();

exports.handler = handler;