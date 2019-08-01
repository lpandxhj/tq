require('@assets/css/reset.css');
require('@assets/css/icon.css');
require('@assets/css/page.css');
import Vue from 'vue';
Vue.config.productionTip = false;

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);


import Http from '@tools/http';
var apiName = require('./api')
Vue.prototype.$http = Http;
Vue.prototype.$api = apiName.api;


// 全局组件注册
import NoData from '@components/NoData';       // 暂无数据
Vue.component('no-data', NoData);
import Confirm from '@components/Confirm';     // 操作二次确认
Vue.component('confirm', Confirm);


//全局方法(多页跳转等)
import Global from './global'
Vue.use(Global);


/**
 * 只有dev环境才会调用, 根据config/index.js/环境变量dev配置的参数(dev.getDataType)决定采用何种方式获取数据
 * 0: 访问本地json假数据； 1: 代理模式访问远程服务获取数据；2: 直接访问远程服务获取数据；
 * 默认（2）：直接访问远程服务获取数据
 * @param process.env.getDataType {Number} :
 * @param process.env.HOST_ENV {String} :
 */
if(process.env.NODE_ENV == 'development') init.setDevHost(process.env.getDataType, process.env.HOST_ENV);







