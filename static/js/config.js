/* 配置项
 *接口IP必须以XXX_HOST命名,后缀必须为_HOST,
 *其他自定义配置参数避免以上的命名冲突
 */
var config = {
  "baseUrl_HOST": "http://192.168.91.168:10002/tsms-rest",                        // 远程服务所在路径（接口部署路径）
  "ubms_HOST": "http://192.168.91.121:8080/ubms-server",                          // ubms
  
  "serverPush_URL": "http://192.168.91.130:6201/serverpush.js",                   // websocket serverPush
  "mapServer_URL": "http://192.168.91.130:8080",                                  // 地图服务
  "map_Config": "tqgl",                                                           // 地图配置文件

  "sign_URL" : "http://51.110.233.51:8088/sms-server",                            // 信号控制页面地址
  "video_URL" : "http://192.168.91.136:8080/videoms-server",                      // 视频服务地址
  "webServer_URL": "http://192.168.56.54:8001",                                   // 网站部署服务所在路径（页面所在路径，和下面的静态图片地址前面的路径是一样的）
  "image_URL" : "http://192.168.56.54:8001/static/images",                        // 静态图片地址

  "systemName" : "特勤管理系统",                                                    // 系统名称
  "nearestPointDistance_limit" : 100,                                             // 途径点到映射点距离（default：超出100m时提示途径点偏离线路）
  "bufferDistance": 200,                                                          // 设备缓冲距离控制（default：缓冲200m内的设备）
  
  
  "token": '3135a7ff-c635-483d-acb7-1d36d8301691'                                 // 测试用token
};












































/*
 *兼容性写法
 *同时满足script标签直接引入
 *和ES6语法下直接require引入（动态配置代理的时候用的到）
*/
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  //es6环境下 支持require config.js的用法
  module.exports = config;
}
else {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return config;
    });
  }
  else {
    //es5环境下：直接<script src>引入config.js时作为一个全局变量使用
    window.config = config;
  }
}
