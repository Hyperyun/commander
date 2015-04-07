var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var comments = [{author: 'Pete Hunt', text: 'Hey there!'}];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true
}).listen(3030, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3030');

});
