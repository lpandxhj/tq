'use strict';
/**
 * @author liping
 * @date 2018-05-25
 * @qq：814091973
 * @remark1: 主要存放使用频率较高的方法
 */

let MyPlugin = {};
MyPlugin.install = (Vue, options) => {
  Vue.prototype.$pageJump = (pageName, routePath='', queryStrParams) => {
    /**
     * 多页跳转（可直接跳转到目标路由子页）
     * @param pageName {string}:  页面名称
     * @param routePath {string}: 路由路径
     * @param queryStrParams {Object}: 路由参数(带再url上传参的参数)
     */
      // 根目录需要判断环境变量（开发环境用本地ip,生产环境用根目录）
    let path = process.env.NODE_ENV == 'development' ? `http://${process.env.HOST_ENV}/${pageName}` : `${config.webServer_URL}/${pageName}`;
    if(routePath) path += `#${routePath}`;                       // 存在路由跳转时, 传入路由路径 可直达路由子页
    if(queryStrParams && typeof queryStrParams == 'object') {    // 页面带url参数时传入参数键值对即可
      let str = '?';
      for(let x in queryStrParams){
        str = str + x + '=' + queryStrParams[x] + '&';
      }
      str = str.substring(0, str.length-1);
      path += str;
    }
    location.href = path;                                        // 页面重定向
  };
  
  Vue.prototype.$mapLoaded = () => {
    /**
     * 地图加载完成
     */
    return new Promise((resolve, reject) => {
      window.map.addEventListener(EJMap.Event.onMapLoaded, (e) => {
        resolve('map load finished');
      })
    })
  };
  
  Vue.prototype.$setPageNum = (idx, pageSize, currentPage) => {
    /**
     * 设置分页数据行序号（不是当前分页的序号，是所有数据条数里的序号，例：每页10条，当前第2页，第3条数据，序号为13，而不是3）
     * @param idx {Number}:         当前数据行在当前分页列表中的序号（索引idx+1）
     * @param pageSize {Number}:    一页显示几条
     * @param currentPage {Number}: 当前页码
     */
    idx += currentPage > 1 ? (currentPage-1)*pageSize : 0;
    return idx;
  };
};
export default MyPlugin





