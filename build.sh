#!/bin/sh
echo "Building Hyperyun Commander..."
webpack --output-path ./build && cp -r ./src/{img,css,fonts} ./build/ && cp ./src/*.js ./build/
