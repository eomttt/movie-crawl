# movie-crawl

## Installation
> yarn install --frozen-lockfile

## Test
- Open index.js
- Find `_test()`
- Delete command out 
  > // _test() => _test()
- > yarn start
- Change `request, theater, theaterLink` in `_test` function and play!

## Movie crawling for use in AWS Lambda

- Using build script `./build.sh` -> `build.zip`
- After build upload build file to AWS Lambda
