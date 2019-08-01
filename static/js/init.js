/* 注意
* 【1】该js必须在config.js后引入，否则config变量为not defined,
* 【2】setDevHost（）方法在src/assets/js/lib.js中调用并传参（在每个入口js中引入亦可，多页需要在每个入口js中分别引入
*     在lib.js中引入则仅需要引入一次，因为lib.js每个入口文件都会调用），
*     必须在dev环境运行起来之前调用，运行完成就调不到环境变量了
*/

function Init(){}

Init.prototype = {
  setDevHost: function (getDataTYpe, host) {
    /**
     * 【设置dev下请求数据的方式（请求本地json假数据、代理访问接口、直接远程访问接口）】
     * @param getDataTYpe {Number} :   获取数据方式(0: 使用本地json数据渲染;  1:使用代理访问远程服务;   2: 直接访问远程服务)
     * @param host {String} :          域名(eg:'http://hlinin.com:6080')
     **/
    this.HOST = [];                                               // 获取所有的域名
    for (var key in config) {                                     // config 为 html中引入的<script src='./config.js'.../>的外部配置全局变量config
      if (key.indexOf("_HOST") >= 0) {
        this.HOST.push({
          key: key,
          url: config[key],
          proxyTableKey: '/api'+this.HOST.length                  // 用作dev环境下代理的域名别名，(config/index.js/proxyTableKey_arr)
        });
      }
    };
    
    //不同的模式下 分别设置域名指向
    if (getDataTYpe == 0) {
      for(var i in this.HOST){
        config[this.HOST[i].key] = "http://"+host;                // 具体看build/webpack.dev.conf.js/express相关
      }
    }else if(getDataTYpe == 1){
      for(var i in this.HOST){
        config[this.HOST[i].key] = this.HOST[i].proxyTableKey;    // 代理到本地的关键字，如‘/api’，具体看config/index.js/proxyTable相关
      }
    }
  },
  
  addMapJs :function (path){
    /**
     * 【快速引入地图服务】
     * @param path(String) :    map.js路径
     **/
    
    var str = '<script type="text/javascript" src=' + path + '><\/script>';
    document.write(str)                                           // docuemnt.write这种方式尽量避免，map.js用其他方式加载不够快，只能先用着了
  },
  
  addScript: function (path){
    /**
     * 【在head里动态插入script】
     * @param path(String) :    需要动态加载的js src路径
     **/
    var tag = document.createElement('script');
    tag.src = path;
    var script0 = document.getElementsByTagName('script')[0];
    script0.parentNode.appendChild(tag);
  }
}

window.init = new Init();

