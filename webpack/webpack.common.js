const htmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');
const fs = require('fs');
const { default: chalk } = require('chalk');

console.log(
  chalk.magenta(
    ''.padEnd(5, '>') + '  Building templates from source folder: ./src/pages/'
  )
);
console.log('\n');
console.time('Building Pages');

/**
 * Builds html file names with 1 level deap nested folders
 *
 * @returns Object
 */
const buildPagesHtmlFileNames = function () {
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

/**
 * Extract a file name given a path i.e. pages/home = home or pages/home-page = home
 * @param {String} fileName file path
 * @returns {String}  an single string of a pages folder name or a entry identifier
 */
const extractFileName = function (fileName) {
  let file;
  if (fileName.includes('/')) {
    const path = fileName.split('/');
    file = path[fileName.split('/').length - 1];

    if (file.includes('-')) {
      file = file.split('-')[0];
    }
  } else {
    file = fileName;
  }

  return file;
};

//holds htmlPages file name array
const htmlPageNames = buildPagesHtmlFileNames();

/**
 * Auto-generates Html pages to merge with the plugins (Uses: htmlWebpackPlugin)
 */
const multipleHtmlPlugins = htmlPageNames.map(name => {
  let chunkName = extractFileName(name);

  console.log(
    chalk.white(' > ') +
      chalk.bgBlack.gray(
        `[Loading ${chunkName.toUpperCase()} template...] : `
      ) +
      chalk.underline.blue(
        path.join(process.cwd(), 'src', 'pages', `${name}.html`)
      )
  );

  return new htmlWebpackPlugin({
    template: `./src/pages/${name}.html`, // relative path to the HTML files
    filename: `pages/${name}.html`, // output HTML files
    inject: true,
    chunks: ['main', chunkName], // respective JS files
  });
});

//console logs
console.log(
  chalk.bgCyanBright.black(' [ Success! ] ') +
    chalk.green(' - Html templates lodead successfully 😊!')
);
console.log('\n');

/**
 * Autogenerate entries.
 */
const pagesRootDir = path.join(process.cwd(), 'src', 'pages');
const pagesEntries = htmlPageNames.reduce((currEntries, fileName) => {
  const filePath = path.join(pagesRootDir, `${fileName}.js`);

  if (fs.existsSync(filePath)) {
    const file = extractFileName(fileName);
    //show feedback on the console
    console.log(
      chalk.white(' > ') +
        chalk.bgBlack.gray(`[ Loading ${file.toUpperCase()} entry] : `) +
        chalk.underline.blue(filePath)
    );

    currEntries = { ...currEntries, [file]: filePath };
  }
  return currEntries;
}, {});

//console logs
console.log(
  chalk.bgCyanBright.black('[ Success! ] ') +
    chalk.green(' - Entry paths loaded successfully 😊!')
);
console.log('\n');
console.log(
  chalk.bgGreen.black('[ Success! ] ') +
    chalk.green(' All pages built successfully  😊!')
);
console.timeEnd('Building Pages');
console.log('\n');

//Webpack Modules
module.exports = {
  entry: {
    main: './src/index.js',
    vendor: './src/App/scripts/vendor/vendor.js',
    ...pagesEntries,
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
    ...multipleHtmlPlugins,
  ],
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
