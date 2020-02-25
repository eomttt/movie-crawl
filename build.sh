#! /bin/bash

echo "Start for build"

rmPreviousZip="rm -rf build.zip"
buildProd="npm prune --production"
makeZip="zip -r build.zip ./*"
buildDev="npm install"

$rmPreviousZip
$buildProd
$makeZip
$buildDev

exit
