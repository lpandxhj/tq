>【使用步骤】
``` bash
# 安装依赖
npm install

# 调试环境 serve with hot reload at localhost:8888
npm run dev

# 生产环境 build for production with minification
npm run build

```


>【基本配置】
1. 修改访问域名：`config/index.js/host`修改 (default：192.168.56.54,这是我的，你是访问不到的，改成你自己的骚年~)。
2. 修改访问端口：`config/index.js/port`修改 (default：8888, 这个改不改随你)。
3. 修改启动页面：`config/index.js/openPage`修改 (default 根目录，即host+port)。
4. 是否开启eslint： `config/index.js/useEslint`修改 (default：false)。
5. 修改访问数据方式：`config/index.js/getDataType`修改 （default：2 直接访问远程服务接口。 0：使用本地json数据模拟；1：通过代理访问远程服务接口； 2：直接访问远程服务接口）
6. 修改mock下可匹配到的文件夹层级：`build/webpack.dev.conf.js/entryJS`修改 （default：可匹配1~4级文件夹嵌套,即最深能访问到mock/a/b/c/test_POST.json）



>【目录结构】
```
webpack
 |---build     # webpack配置文件
 
 |---config    # webpack 环境配置文件
 
 |---mock      # dev环境下的静态json数据:建议按pages中页面名称来管理接口json文件(json文件位置只要在mock下即可,不强制分类,若嵌套层级不够需要改配置文件通配符)
 
 |---src
     |---assets                ## 资源
          |---css              
              |---icon.css              ### 图标样式
              |---map.css               ### 地图样式
              |---page.css              ### 多个组件复用的页面内容样式
              |---reset.css             ### 样式重置（多为element-ui框架样式统一重置)
          |---images           ## 存放不经常变动的静态图片（往往是比较小的小icon等、可直接被编译成base64）    
          |---font             ## 字体图标
          |---js               ## 存放和业务直接相关联的js
              |---api.js                ### 统一管理接口请求，方法名作为全局变量引用
              |---directives.js         ### 自定义指令
              |---filters.js            ### 自定义过滤器
              |---global.js             ### 存放复用性较高的方法全局使用
              |---lib.js                ### 给一级父组件使用的公用js,内部引的文件都是全局调用的
          
     |---components # 组件
          |---layer            ## 层级模块
          |---map              ## 地图模块
          |---part             ## 局部模块
          |---NoData.vue       ## 全局公用组件：暂无数据 
          |---Confirm.vue      ## 全局公用组件：二次确认 
          
     |---tools      # 第三方工具类库(echarts、jquery等)、自己封装的类库(http.js、common.js)
          |---common.js        ## 封装的常用方法
          |---http.js          ## 封装常用axios方法
          |---map-draw.js      ## 统一管理项目中复用频率高的地图绘制方法
          |---map-setting.js   ## 封装常用地图方法
          
     |---pages      # 各个页面模块，模块名可以自定义,每个文件夹就是一个页面
          |---adminScheme      ## 特勤方案模块
              |---router
                   |---router.js                      ### 路由(若需要使用单页模式,则配置该文件,且在入口文件adminScheme.js中引入router.js)
              |---adminScheme.html      ### html文件
              |---adminScheme.js        ### 入口页面
              |---adminScheme.vue       ### 父组件
              |---adminScheme_....vue   ### 路由子组件...
          |---commonInfo       ## 基础信息管理模块
              |---router
                   |---router.js                     
              |---commonInfo.html    
              |---commonInfo.js       
              |---commonInfo.vue 
         |---monitorScheme      ## 特勤监测模块
                      |---router
                            |---router.js                    
                      |---monitorScheme.html     
                      |---monitorScheme.js       
                      |---monitorScheme.vue            
         ......
              
 |---static         # 静态资源（可自由指定哪些不参与编译打包，在build/webpack.prod.conf.js中通过‘copy-webpack-plugin’中间件去配置）
     |---js                    ## 直接在html中引用的js
          |---config.js                 ### 外部可配的js，可存放经常变动的全局变量，比如接口访问的域名（当同样的一个项目部署到不同的域名下时适用）
          |---init.js                   ### 存放 切换dev模式下数据请求模式最关键的方法定义 setDevHost()
     |---images                ## 存放需要外部改动的图片,或者图片较大,不适合转base64的图片
    ......

```
