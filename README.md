# movie-crawl

## Installation
> npm install --frozen-lockfile

## Test
- Open index.js
- Find `_test()`
- Delete command out 
  > // _test() => _test()
- > npm start
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
- [theaterLink는 이부분 참조](https://github.com/eomttt/movie-king/tree/develop/src/lib/datum/theaters)

## Movie crawling for use in AWS Lambda

- Using build script `./build.sh` -> `build.zip`
- After build upload build file to AWS Lambda
