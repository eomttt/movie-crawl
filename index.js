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

const getTimeTalbe = async (type, theaterLink) => {
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
      if (request === 'region') {
        response = await getRegion(theater);
      } else if (request === 'theaters') {
        const { regionIndex } = queryStringParameters;
        response = await getTheatersByRegion(theater, Number(regionIndex));
      } else if (reqeust === 'timetable') {
        const { theaterLink } = queryStringParameters;
        response = await getTimeTalbe(theater, theaterLink);
      } else if (request === 'box-office') {
        response = await getBoxOffice(theater);
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
  response = await getRegion('cgv');
  console.log('AAA', response);
};

// _test();

module.exports.getRegion = getRegion;
module.exports.getTheatersByRegion = getTheatersByRegion;
module.exports.getTimeTalbe = getTimeTalbe;
module.exports.getBoxOffice = getBoxOffice;

exports.handler = handler;