// 引用axios
import axios from 'axios'
import qs from 'qs'
function urlParamsToJson(str) {
  /**
   * 【url参数转json】
   * @param str(String) :       传入的url字符串（default:取当前地址栏）(eg:'http://www.baidu.com?a=1&b=2&c=3')
   * => return(Object):   返回值：json （eg:{a:1,b:2,c:3}）
   **/
  if (!str) str = location.href;
  let obj = {};
  str.replace(/([^?&]+)=([^?&]+)/g, function (s, v, k) {
    obj[v] = decodeURIComponent(k);
    return k + '=' + v;
  });

  obj = trimData(obj);          // 过滤空
  return obj;
}
function trimData(data) {
  /**
   * 【过滤json数据value为空的项】
   * @param data（Object）:        请求数据
   * => return(Object):     返回值：数据均为有效字段(已去除value为空的选项了)
   */
  data = data || {};
  for (let key in data) {
    const isInvalid = data[key] === undefined || data[key] === null || data[key] === 'undefined' ||  data[key] === 'null';  // 有的是0的（0、''有时也是有效值）
    if (isInvalid) {
      // 移除无效参数
      delete data[key];
    }
  }
  return data;
}


let headers = {};
headers['Cache-Control'] = "no-cache";                              // 接口数据不需要缓存
headers.token = sessionStorage.getItem('token') || config.token;    // 正式环境：从sessionStorage上获取token； 测试环境：直接写死token ;
function httpAxios(method, url, params, headersOpt = {}) {
    headers = Object.assign(headers, headersOpt);                   // 合并头设置
    if (params) params = trimData(params);                          // 过滤无效参数

    return new Promise((resolve, reject) => {
        axios({
            method: method,
            headers:headers,
            url: url,
            data: method === 'POST' || method === 'PUT' ? params : null,
            params: method === 'GET' || method === 'DELETE' ? params : null,
            withCredentials: false
        }).then((res) => {
            if (res.status == 200) {
              resolve(res.data);
            }else {
              console.log(res)
            }

        }).catch(function (err) {
          console.log(err)
          if(err.response.data.status == 403 || err.response.data.message.indexOf('token') != -1) {
              // token 失效，清session, 退出登录
              alert(err.response.data.message);
              sessionStorage.removeItem('token');
              // top.location.href = 'http://192.168.91.168:10003/tsms-web';
              top.location.href = config.webServer_URL;
          }else {
            reject(err);
          }

        });
    });
}



//对外方法
export default {
    get: function (url, params, headers) {
        return httpAxios('GET', url, params, headers);
    },
    post: function (url, params, headers = {}) {
        return httpAxios('POST', url, params, headers);
    },
    postFormUrlencoded: function (url, params, headers = {}) {
        headers = Object.assign(headers,{'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'})
        params = qs.stringify(params);//特殊：不能用JSON.stringify()去转，格式和qs.stringify()转的有所差别
        return httpAxios('POST', url, params, headers);
    },
    put: function (url, params, headers = {}) {
        return httpAxios('PUT', url, params, headers);
    },
    delete: function (url, params, headers) {
        return httpAxios('DELETE', url, params, headers);
    }
};
