var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:3030',
    'webpack/hot/dev-server',
    './src/main'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/src/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.woff$/,   loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf$/,    loader: "file-loader" },
      { test: /\.eot$/,    loader: "file-loader" },
      { test: /\.svg$/,    loader: "file-loader" },
      { test: /\.jsx$/, loaders: ['react-hot', 'jsx-loader'] },
      { test: /\.png$/, loader: "url-loader?mimetype=image/png" }
    ]
  }
};
