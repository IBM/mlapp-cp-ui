const path = require("path");
module.exports = {
  publicPath: '/',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /env-config.*env-config\.js$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'env-config.js'
              },
            }
          ]
        }
      ]
    }
  },
  // devServer: {
  //   open: process.platform === 'darwin',
  //   host: '0.0.0.0',
  //   port: 8080,
  //   https: true
  // }
}