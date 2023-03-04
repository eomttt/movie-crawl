import {handler} from './index.js';

(async () => {
  const result = await handler({
    queryStringParameters: {
      "request": "timetable",
      "theater": "cgv",
      "theaterLink": "/theaters/?areacode=01&theaterCode=0304"
    },
  });
  console.log("Result", result);
})();
