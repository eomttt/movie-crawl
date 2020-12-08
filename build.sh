#! /bin/bash

echo "Start for build"

rmPreviousZip="rm -rf build.zip"
buildProd="yarn prune --production"
makeZip="zip -r build.zip ./*"
buildDev="yarn install"

$rmPreviousZip
$buildProd
$makeZip
$buildDev

exit
