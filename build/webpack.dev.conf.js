'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');



// ================== start 静态模拟接口配置(还有下面devServer里的before钩子函数也是)
//在mock环境下配置express
let glob = require('glob');
const express = require('express')
const app = express()
let apiRoutes = express.Router()
const api = require('../src/assets/js/api.js');  //获取所有的api的入口
const apiName = api.apiName;                     //获取所有已按请求类型(get、post、put)分完组的api对象{'get':['1_GET','2_GET'],'post':['11_POST'],'put':['3_PUT'],...}
/**
 * 【查找mock下所有的json文件】
 *  mock下存放的json支持嵌套结构为：mock/1.json, mock/a/1.json, mock/a/b/1.json, mock/a/b/c/1.json（abcd等为随意取的文件夹名，此名不做要求，随意取，已做*通配处理）；
 *  以上嵌套若还不满足，可在glob.sync('./mock{/*...}中追加路径通配符匹配条件
 *  正则匹配试了没生效 ('./mock{.*\/*}.json'),最后用了普通的通配符来匹配
 **/
let entryJS = {};
entryJS = glob.sync('./mock{/*,/*/*,/*/*/*,/*/*/*/*}.json').reduce(function (prev, curr) {
  prev[curr.slice(7)] = '.' + curr;
  return prev;
}, {});

// 合并所有的json文件到一个json中
let jsonData = {};
for (let i in entryJS) {
   let start = i.lastIndexOf("\/");
   let end = i.lastIndexOf(".");
   let key = i.substring(start+1,end); //获取json文件的fileName
   let data = {};
  data[key] = require(entryJS[i]);           //读取对应的json文件,读到的内容（内容为每个接口返回的具体数据）存到对应的key（key为json文件的fileName）里
  jsonData = Object.assign(jsonData,data);   //把所有读到的json文件内容拼成一个json，便于在路由before的钩子里遍历用
}
app.use('/', apiRoutes);
// ================== end 静态模拟接口配置(还有下面devServer里的before钩子函数也是)






const HOST = process.env.HOST || config.dev.host;
const PORT = process.env.PORT && Number(process.env.PORT) || config.dev.port
const localhost = HOST + ":" + PORT;

var MyProcess = require('../config/dev.env');
MyProcess.HOST_ENV = JSON.stringify(localhost); // 把本地ip和端口赋值给环境变量
MyProcess.getDataType = config.dev.getDataType; // 设置ajax数据访问方式（default：2 直接访问远程服务接口。 0：使用本地json数据模拟；1：通过代理访问远程服务接口； 2：直接访问远程服务接口）

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,
  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST,

    port: PORT,
    open: config.dev.autoOpenBrowser,
    openPage: config.dev.openPage,          //启动时的默认页，不指定默认根目录,例如  http://192.168.56.54:8001/
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },

    //mock数据的路由钩子配置，返回值为mock里对应的json文件返回值
    before(app) {
      for(let type in apiName){
        for (let i in apiName[type]) {
          app[type](apiName[type][i].url, function (req, res) {
            res.json(jsonData[apiName[type][i].key]);
          });
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': MyProcess
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    new ProgressBarPlugin({
      format: chalk.cyanBright.bold('项目进化') + ' :bar ' + chalk.greenBright.bold(':percent') + ' (:elapsed seconds)',
      width: 30,
      complete: '▆',
      incomplete: '  ',
      clear: false
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static/js/config.js'),
        to: config.dev.outConfigPath,
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../static/js/init.js'),
        to: config.dev.assetsSubDirectory+'/js',
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../static/images/'),
        to: config.dev.assetsSubDirectory+'/images',
        ignore: ['.*']
      }
    ])
  ].concat(utils.htmlPlugin())
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port
      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`进化完成，请访问: http://${devWebpackConfig.devServer.host}:${port}/${devWebpackConfig.devServer.openPage || ''}`]
        },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback()
          : undefined
      }))
      resolve(devWebpackConfig)
    }
  })
})



