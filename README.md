# movie-crawl

## Installation

> npm install --frozen-lockfile

## Test

- > npm test
- Change `request, theater, theaterLink` in `_test` function and play!

### TimeTable test 인 경우

```js
{
  request: 'timetable',
  theater: 'megaBox' | 'cgv' | 'lotte',
  theaterLink: ''
  // ex: megabox: /theater/time?brchNo=1372(강남)
  // ex: cgv: /theaters/?theaterCode=0056(강남)
  // ex: lotte: '영화관 이름' (Naver 검색을 사용하기 때문)
}
```

- [theaterLink는 이부분 참조](https://github.com/eomttt/movie-king/tree/master/src/lib/datum/theaters)

## Movie crawling for use in AWS Lambda

- Deploy when merge in master by serverless
