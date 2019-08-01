'use strict';
const path = require('path');





// dev 环境下的配置
let devSetting = {
  // Paths
  assetsSubDirectory: 'static',
  assetsPublicPath: '/',
  outConfigPath:'./',
  // 这里配置代理，但是只能用于dev模式
  // proxyTable: {                                         // 配置代理，解决跨域
  //   '/api0': {
  //     target: 'http://hlinin.com:6080',                 // 需要代理的域名
  //     changeOrigin: true,
  //     pathRewrite: {
  //       '^/api0': ''                                    // 这里理解成用‘/api’代替target里面的地址，后面组件中我们掉接口时直接用api代替 比如我要调用'http://192.168.56.105:8080/idcs-web/add'，直接写‘/api/add’即可
  //     }
  //   }
  // },
  // proxyTable:proxyTable_obj,                            // 动态配置代理

  // Various Dev Server settings
  openPage:'adminScheme.html',
  host: '192.168.1.108',                                   // 运行dev环境的 主机ip
  port: 8001,                                              // 运行dev环境的 端口号
  getDataType: 2,                                          // 0: 访问本地json假数据； 1: 代理模式访问远程服务获取数据；2: 直接访问远程服务获取数据；
  autoOpenBrowser: true,
  errorOverlay: true,
  notifyOnErrors: true,
  poll: false,                                             // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
  useEslint: false,                                        // 是否启用Eslint验证
  showEslintErrorsInOverlay: false,

  /**
   * Source Maps
   */
  devtool: 'cheap-module-eval-source-map',
  cacheBusting: true,
  cssSourceMap: false
};


// ================== start 动态配置代理(devSetting.getDataType == 1时为使用代理请求远程服务获取数据)
if(devSetting.getDataType == 1) {
  const config = require('../static/js/config.js');       // 获取所有的域名(拿到的是最原始的config.js 而不是经过setDevHost()解析后的)
  let host_arr = [];
  for (var key in config) {
    //非mock环境下，自动配置代理
    if (key.indexOf("_HOST") >= 0) {
      host_arr.push({
        "url": config[key],
        "key": key,
        "proxyTableKey": '"/api'+host_arr.length+'"'
      })
    }
  }

  let proxyTable_obj = {};
  host_arr.forEach((i,idx) => {
    const key = '/api'+idx;
    let pathRewrite = {};
    pathRewrite['^'+key] = '';
    proxyTable_obj[key] = {
      target: i.url,                                    // 需要代理的域名
      changeOrigin: true,
      pathRewrite: pathRewrite
    }
  });
  // console.log(proxyTable_obj)
  devSetting.proxyTable = proxyTable_obj;
}
// ================== end 动态配置代理




module.exports = {
  // 【pages】，默认为pages，修改这里的配置的同时，也要同时重命名/src/views的这个文件夹名称
  // 对应webpack.dev.conf.js 多页面配置的文件夹名称
  // moduleName:'pages',
  dev: devSetting,

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    /**
     * Source Maps
     */
    productionSourceMap: false,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  }
};
