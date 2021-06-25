const htmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');
const fs = require('fs');

const constructHtmlPageName = function () {
  const pagesPath = path.join(process.cwd(), 'src', 'pages');

  const filesInPagesDir = fs.readdirSync(pagesPath);

  const pagesDirs = filesInPagesDir.filter(file => !file.includes('.'));

  const getHtmlFilesInADir = function (filesInPagesDir, pageDir) {
    return filesInPagesDir
      .filter(file => file.includes('.html'))
      .map(htmlFile =>
        pageDir
          ? `${pageDir}/${htmlFile.split('.')[0]}`
          : htmlFile.split('.')[0]
      );
  };

  let getHtmlFilesInSubDir = [];

  const htmlFilesInThePagesDir = getHtmlFilesInADir(filesInPagesDir);

  if (pagesDirs.length > 0) {
    let htmlFilesInADir = [];
    //check if they are valid dir
    for (const pageDir of pagesDirs) {
      let currentPageDir = path.join(pagesPath, pageDir);
      if (fs.existsSync(currentPageDir)) {
        //get the html files in the path
        const getDirFiles = fs.readdirSync(currentPageDir);

        htmlFilesInADir.push(getHtmlFilesInADir(getDirFiles, pageDir));
      }
    }

    getHtmlFilesInSubDir = htmlFilesInADir.flat();
  }

  return [...getHtmlFilesInSubDir, ...htmlFilesInThePagesDir];
};

const htmlPageNames = constructHtmlPageName();

console.log(htmlPageNames);

const multipleHtmlPlugins = htmlPageNames.map(name => {
  let chunkName;

  if (name.includes('/')) {
    const path = name.split('/');
    chunkName = path[name.split('/').length - 1];

    if (chunkName.includes('-')) {
      chunkName = chunkName.split('-')[0];
    }
  } else {
    chunkName = name;
  }

  console.log(chunkName);
  return new htmlWebpackPlugin({
    template: `./src/pages/${name}.html`, // relative path to the HTML files
    filename: `pages/${name}.html`, // output HTML files
    inject: true,
    chunks: ['main', chunkName], // respective JS files
  });
});

module.exports = {
  entry: {
    main: './src/index.js',
    defaul: './src/pages/deafault-page/deafault-page.js',
    home: './src/pages/home-page/home-page.js',
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
