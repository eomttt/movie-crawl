import {handler} from './index.js';

(async () => {
  const result = await handler({
    queryStringParameters: {
      request: "timetable",
      theater: "cgv",
      theaterLink: "/theaters/?theaterCode=0304&date=20230304",
    },
  });
  console.log("Result", result);
})();
