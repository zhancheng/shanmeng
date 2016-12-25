// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
    build: {
        env: require('./prod.env'),
        assetsRoot: path.resolve(__dirname, '../output'),
        assetsSubDirectory: 'static',
        assetsPublicPath: '',
        productionSourceMap: false,
        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        // 多页面应用基础路径 js 和 html 都在这个路径下寻找
        commonChunks: ['vendor', 'main'],
        viewPath: './src/page/',
        mainPath: 'assets/js/layout.js'
    },
    dev: {
        env: require('./dev.env'),
        port: 8080,
        assetsSubDirectory: 'static',
        assetsPublicPath: '',
        proxyTable: {},
        // 多页面应用基础路径 js 和 html 都在这个路径下寻找
        commonChunks: ['vendor', 'main'],
        // CSS Sourcemaps off by default because relative paths are "buggy"
        // with this option, according to the CSS-Loader README
        // (https://github.com/webpack/css-loader#sourcemaps)
        // In our experience, they generally work as expected,
        // just be aware of this issue when enabling this option.
        cssSourceMap: false,
        viewPath: './src/page/',
        mainPath: 'components/main.vue'
    }
}
