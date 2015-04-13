#!/bin/sh
echo "Building Hyperyun Commander..."
webpack --output-path ./build && cp -r ./src/fonts ./build/ && cp -r ./src/css ./build/ && cp -r ./src/img ./build/ && cp ./src/*.js ./build/
