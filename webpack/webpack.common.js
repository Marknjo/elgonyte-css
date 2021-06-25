const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

let htmlPageNames = ['helpers/typography'];
let multipleHtmlPlugins = htmlPageNames.map(name => {
  let chunkName;

  if (name.includes('/')) {
    const path = name.split('/');

    chunkName = path[name.split('/').length - 1];
  } else {
    chunkName = name;
  }

  return new htmlWebpackPlugin({
    template: `./src/App/pages/${name}.html`, // relative path to the HTML files
    filename: `pages/${name}.html`, // output HTML files
    inject: true,
    chunks: ['main', chunkName], // respective JS files
  });
});

module.exports = {
  entry: {
    main: './src/index.js',
    vendor: './src/App/scripts/vendor/vendor.js',
  },

  plugins: [
    new DashboardPlugin(),
    new htmlWebpackPlugin({
      template: './src/index.html',
      inject: true,
      chunks: ['main'],
      scriptLoading: 'defer',
      filename: 'index.html',
    }),
    // new htmlWebpackPlugin({
    //   template: './src/App/pages/helpers/typography.html',
    //   inject: true,
    //   chunks: ['main', 'typography'],
    //   scriptLoading: 'defer',
    //   filename: 'pages/helpers/typography.html',
    // }),
    ...multipleHtmlPlugins,
  ], //.concat(),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.(?:ico|svg|png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assests/images/[name].[hash].[ext]',
        },
      },
      {
        test: /\.(mp4|webm)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assests/videos/[name].[hash].[ext]',
        },
      },
      {
        // Apply rule for fonts files
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assests/fonts/[name].[hash].[ext]',
        },
      },
    ],
  },
};
