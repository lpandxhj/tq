"use strict";
/**
 * @author liping
 * @date 2018-04-13
 * @qq：814091973
 * @remark1: 参数传入风格（参数个数<3的用普通的传参数实现，参数位置需要一一对应；>3的采用json对象传入，内部参数无序;==3的两种均可用）
 * @remark2: 变量、方法等命名规范：基本采用驼峰式写法，若有回调，则cb_开头，后面紧接驼峰式写法
 *
 */

/***
 * 时间相关方法集
 * @constructor
 */
function LpDt(){
    this.dt = new Date();
    this.y = this.dt.getFullYear();         //当年
    this.m = this.dt.getMonth() + 1;        //当月
    this.w = this.dt.getDay();              //今日周几
    this.d = this.dt.getDate();             //当日
    this.h = this.dt.getHours();            //当前时
    this.f = this.dt.getMinutes();          //当前分
    this.s = this.dt.getSeconds();          //当前秒
    this.ms = this.dt.getMilliseconds();    //当前毫秒
    this.timestamp = this.dt.valueOf();     //当前的时间戳（精确到毫秒：13位数）
}
LpDt.prototype = {
    standard2NormalTime(dt, separator){
      /**
       * 标准日期对象格式转普通字符串格式日期
       * @param dt{Object}:         标准日期对象格式
       * @param separator{String}:  分隔符
       */
      separator = separator || '-';
      if(!dt) return;
      var y = dt.getFullYear();         //年
      var m = dt.getMonth() + 1;        //月
      var d = dt.getDate();             //日
      var h = dt.getHours();            //时
      var f = dt.getMinutes();          //分
      var s = dt.getSeconds();          //秒
      var r = y + separator + (m<10 ? '0'+m : m) + separator +  (d<10 ? '0'+d : d) + ' ' +  (h<10 ? '0'+h : h) +':' +  (f<10 ? '0'+f : f) + ':' +  (s<10 ? '0'+s : s) ;
      return r;
    },
    isLeapYear:function(year){
        /**
         * 判断指定年份否为闰年
         * @param year(Number || String)：指定的年份，（default:当年），（eg:2018）
         * => return(Boolean):            返回值：是否为闰年
         **/
        year = (year ? year : this.y).toString().substr(0,4);  //若传入了完整的日期，则截取前4位年份
        var isLeapYear = (year%400 == 0 || year%4 == 0 && year%100 !=0) ? true : false;
        return isLeapYear;
    },
    timestampToDateStr:function(timestamp, separator){
        /**
         * 时间戳转日期时间
         * @param timestamp(Number) :     时间戳,（default:当前时间）
         * @param separator(String) :     分隔符,（default:'-'）
         * => return(String):             返回值：转换后的日期
         **/
        timestamp = timestamp ? timestamp : this.timestamp;
        if(typeof timestamp == "string") timestamp = Number(timestamp);   //避免传入时间戳加了引号成string时做的优化
        separator = separator ? separator : '-';
        if(timestamp.toString().length == 10) timestamp = timestamp*1000 ;//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var dt = new Date(timestamp);
        var y, M, d, h, m, s;
        y = dt.getFullYear();
        M = (dt.getMonth()+1 < 10 ? '0'+(dt.getMonth()+1) : dt.getMonth()+1);
        d = dt.getDate() < 10 ? '0'+dt.getDate() : dt.getDate();
        h = dt.getHours() < 10 ? '0'+dt.getHours() : dt.getHours();
        m = dt.getMinutes() < 10 ? '0'+dt.getMinutes() : dt.getMinutes();
        s = dt.getSeconds() < 10 ? '0'+dt.getSeconds() : dt.getSeconds();
        if(timestamp.toString().length == 13) s += ':'+ dt.getMilliseconds();
        var date = y+ separator + M + separator + d + ' ' + h + ':' + m + ':' +s;
        return date;
    },
    dateToTimestamp:function(date){
        /**
         * 日期时间转时间戳
         * @param date(String) :          日期,（default:当前时间）
         * => return(Number):             返回值：转换后的时间戳
         **/
        date = date ? date : this.getNowTime();
        if(typeof date == "string"){
            date = new Date(date);  //日期格式的date 需要转成Object的类型的才能使用相关Date属性和方法
        }
        return date.getTime();
    },
    dateCompare:function(date1, date2){
        /**
         * 日期比较大小，返回一个布尔值，前-后>0,true ;<0 false
         * @param date1(String) :          需要对比的日期
         * @param date2(String) :          对比大小参考的日期,不传默认与当天日期对比（default:当前日期）
         * => return(Boolean):             返回值：date1-date2>0 的布尔值
         **/
        date1 = this.dateToTimestamp(date1);
        date2 = date2 ? this.dateToTimestamp(date2) : this.dateToTimestamp(this.getToday());
        // date2 = this.dateToTimestamp(date2);
        return date1-date2 >= 0 ? true : false;
    },
    dateOperator: function (options) {
        /**
         * 根据传入的开始日期、计算间隔（单位：天）、操作类型（加减操作）、分隔符 得到目标日期
         * @param startTime(String) :     从哪天开始计算,（default：当天）
         * @param countDays(Number) :     每次加减的天数（单位：天）
         * @param type(String)：          日期加减操作，(default:'+')（可选值：+/-）
         * @param separator(String)：     日期分隔符，(default:'-')（eg:2018-01-01）
         * => return(String):             返回值：换算后的日期
         **/
            //get options
        var deftOpt = {
                startTime:this.getToday(this.separator),
                countDays:1,
                type:'+',
                separator:'-'
            };
        var opt = lpobj.combineKey(deftOpt,options);
        var r = new Date(opt.startTime);  //转换成中国标准时间
        r = r.getTime();                                                    //标准时间 转 毫秒 便于计算
        if (opt.type == '+') {
            r = r + opt.countDays * 24 * 60 * 60 * 1000;
        } else if (opt.type == '-') {
            r = r - opt.countDays * 24 * 60 * 60 * 1000;
        } else {
            return false;
        }
        r = new Date(r);                                                     //换算好后 把毫秒 转 标准时间 便于对象取值（r.getMonth()+1 取月、r.getDate()取天等）
        var yy = r.getFullYear();
        var mm = (r.getMonth() + 1)< 10 ? '0' + (r.getMonth() + 1) : (r.getMonth() + 1);
        var dd = r.getDate()< 10 ? ('0' + r.getDate()) : r.getDate();
        var target_day = yy + opt.separator + mm + opt.separator + dd;
        return target_day;
    },
    timeOperator:function(options){
      /**
       * 根据传入的时间、计算间隔（单位：s）、操作类型（加减操作）、分隔符 得到目标时间
       * @param startTime(String) :     从何时开始计算,（default：当前时间）
       * @param countS(Number) :        每次加减的秒数（单位：秒）
       * @param type(String)：          日期加减操作，(default:'+')（可选值：+/-）
       * @param separator(String)：     日期分隔符，(default:'-')（eg:2018-01-01 01：15：00）
       * => return(String):             返回值：换算后的日期
       **/
        var deftOpt = {
            startTime:this.getNowTime(this.separator),
            countS:60,    //秒为单位，默认一分钟，60s
            type:'+',
            separator:'-'
        };
        var opt = lpobj.combineKey(deftOpt,options);
        var r = new Date(opt.startTime);  //转换成中国标准时间
        r = r.getTime();                                                    //标准时间 转 毫秒 便于计算
        if (opt.type == '+') {
            r = r + opt.countS * 1000;
        } else if (opt.type == '-') {
            r = r - opt.countS * 1000;
        } else {
            return false;
        }
        r = new Date(r);
        var yy = r.getFullYear();
        var mm = (r.getMonth() + 1)< 10 ? '0' + (r.getMonth() + 1) : (r.getMonth() + 1);
        var dd = r.getDate()< 10 ? ('0' + r.getDate()) : r.getDate();
        var hh = r.getHours()< 10 ? ('0' + r.getHours()) : r.getHours();
        var ff = r.getMinutes()< 10 ? ('0' + r.getMinutes()) : r.getMinutes();
        var ss = r.getSeconds()< 10 ? ('0' + r.getSeconds()) : r.getSeconds();
        var target_time = yy + opt.separator + mm + opt.separator + dd +' '+hh+':'+ff+':'+ss;
        return target_time;
    },

    getDateArr: function (startTime, endTime) {
        /**
         * 根据传入的起止时间来算中间的日期间隔，返回日期数组
         * @param startTime(String) :         从哪天开始计算,（default:当天）
         * @param endTime(String) :           到哪天结束
         * => return(Array):                  返回值:指定起止日期范围内的日期数组
         **/
        startTime = startTime ? startTime : this.getToday();
        endTime = endTime ? endTime : this.getToday();
        var dateArr = [startTime];           // 默认包括第一项startTime
        while (startTime != endTime) {
            startTime = this.dateOperator({
                startTime:startTime
            });
            dateArr.push(startTime);
        }
        return dateArr;
    },
    getToday: function (separator) {
        /**
         * 当天日期
         * @param separator(String)：          日期分隔符，(default:'-')，（legalValue:'-'/'/'）（eg:2018-01-01 or eg:2018/01/01）
         * => return(String):                  返回值：当前日期
         **/
        separator = separator ? separator : '-';
        var today = this.y + separator + (this.m < 10 ? '0' + this.m : this.m) + separator + (this.d < 10 ? '0' + this.d : this.d);
        return today;
    },
    getNowTime: function (separator) {
        /**
         * 获取当前时间，精确到秒
         * @param separator(String)：           日期分隔符，（default:'-'），（eg:2018-01-01 01:00:00）
         * => return(String):                   返回值：当前时间
         **/
        separator = separator ? separator : '-';
        var nowTime = this.y + separator + (this.m < 10 ? '0' + this.m : this.m) + separator + (this.d < 10 ? '0' + this.d : this.d) + ' ' + (this.h < 10 ? '0' + this.h : this.h) + ':' + (this.f < 10 ? '0' + this.f : this.f) + ':' + (this.s < 10 ? '0' + this.s : this.s);
        return nowTime;
    },
    getWeeksByYear:function(year){
        /**
         * 统计指定年份有几周，向下取整，取周的汇总
         * @param year(Number || String)：      指定年份,（default:当年),（eg:2018）
         * => return(Number):                   返回值：指定年份总周数
         **/
        year = year ? year : this.y;
        var countDays = this.isLeapYear(year) ? 366 : 365;//获取该年的总天数，按除以7来向下取整，不满7天的不算一周
        var countWeeks = Math.floor(countDays/7);
        return countWeeks;
    },
    getWeekByDay: function(date) {
      /**
       * 获取指定日期对应的星期（默认返回格式星期日、星期一...）
       * @param date(String)：      指定日期,（default:当天),（eg:2018-01-01）
       * => return(Number):         返回值：指定日期对应的星期 （eg:星期一）
       */
      date = date ? date : this.getToday();
      date = new Date(date);  //转换成中国标准时间
      date = date.getDay()
      var week = '';
      switch (date){
        case 0 :
          week = '星期日';
          break;
        case 1 :
          week = '星期一';
          break;
        case 2 :
          week = '星期二';
          break;
        case 3 :
          week = '星期三';
          break;
        case 4 :
          week = '星期四';
          break;
        case 5 :
          week = '星期五';
          break;
        case 6 :
          week = '星期六';
          break;
      }
      return week;
    },
    countDaysByDate :function(year,month){
        /**
         * 统计指定年月有几天
         * @param year(Number || String)：    指定年份,（default:当年),（eg:2018）
         * @param month(Number || String)：   指定月份,（default:当月),（eg:04）
         * => return(Number):                 返回值：指定月份总天数
         **/
        month = month ? month : this.m;
        year = year ? year : this.y;
        var  countDays;
        switch ((Number(month)){
            case 2:
                countDays = this.isLeapYear(year) ? 29 : 28; //2月平月：闰年29，非闰28
                break;
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                countDays = 31;                           //大月：31
                break;
            default:
                countDays = 30;                           //小月：30
                break
        }
        return countDays;
    },
    countDown:function (options){
        /**
         * 倒计时：从当前时间算起，固定时间的倒计时（单位：秒）
         * @param times {Number}：               需要倒计时的时间（单位：秒）,（default:60)
         * @param format {String}：              倒计时显示的单位，（default:'秒'),(legalValue:'天时分秒'/'天'/'天时'/'天时分'/'天时分秒'）可选某个，也可组合
         * @param loop {Number}:                 循环次数
         * @param delay {Number}:                延迟多少时间开始（default:0)默认马上开始,不延迟
         * @param callback {Function}：          计时器每次改遍时间后的回调方法，便于把计算后的值传出
         **/

            //get options
        var deftOpt = {
                times:60,
                format:'天/时/分/秒', //天
                callback:null
            };
        var opt = lpobj.combineKey(deftOpt,options);
        var timer=null;

        timer=setInterval(function(){
            var d=0,h=0,m=0,s=0;
            d = Math.floor(opt.times / (60 * 60 * 24));
            h = Math.floor(opt.times / (60 * 60)) - (d * 24);
            m = Math.floor(opt.times / 60) - (d * 24 * 60) - (h * 60);
            s = Math.floor(opt.times) - (d * 24 * 60 * 60) - (h * 60 * 60) - (m * 60);
            if (d < 10) d = '0' + d;
            if (h < 10) h = '0' + h;
            if (m < 10) m = '0' + m;
            if (s < 10) s = '0' + s;
            var r = '';
            if(!opt.format){
                r = s + '秒';
            }else{
                if(opt.format.indexOf('天') != -1) r += d + '天';
                if(opt.format.indexOf('时') != -1) r += h + '时';
                if(opt.format.indexOf('分') != -1) r += m + '分';
                if(opt.format.indexOf('秒') != -1) r += s + '秒';
            }
            opt.callback(r);
            opt.times--;
        },1000);
        if(opt.times<=0){
            clearInterval(timer);
        }
    }
}
let lpdt = new LpDt();


/***
 * 对象相关方法集
 * @constructor
 */function LpObj(){}
LpObj.prototype = {
    urlParamsToJson: function (str) {
        /**
         * url参数转json
         * @param str(String) :                     传入的url字符串（default:取当前地址栏）(eg:'http://www.baidu.com?a=1&b=2&c=3')
         * => return(Object):                       返回值：json （eg:{a:1,b:2,c:3}）
         **/
        if (!str) str = location.href;
        var obj = {};
        str.replace(/([^?&]+)=([^?&]+)/g, function (s, v, k) {
            obj[v] = decodeURIComponent(k);
            return k + '=' + v;
        });
        return obj;
    },
    jsonToUrlParams: function (obj, firstHasChartAnd) {
        /**
         * json格式的参数转成字符串拼接到url上时使用
         * @param obj(Object) :                       需要转成地址栏参数字符串的json对象
         * @param firstHasChartAnd(Boolean) :         转换后的字符串首字符是否为&  （eg:&a=1&b=2&c=3）
         * * => return(String):                       返回值：带&字符拼接好的string（eg:a=1&b=2&c=3）
         **/
        var params_arr = [];
        for (var i in obj) {
            params_arr.push("&" + i + "=" + obj[i]);
        }
        var str = params_arr.join("");
        if (!firstHasChartAnd) str = str.substring(1); //第一个字符不要&（一般直接跟在?后面才不要&）
        return str;
    },
    getRan(max){
        /**
         * 取m以内的随机数
         * @param max(Number) :                       最大值
         * * => return(String):                       返回值：m以内的随机数
         **/
        let r = (Math.random()*max).toString().split('.')[0];
        return r;
    },
    getRandomItem:function(arr){
        /**
         * 获取数组arr中的随机项
         * @param arr                                   目标数组
         */
        var len = arr.length;
        var ran = parseInt(Math.random()*len); // array idx < array.length
        return arr[ran];
    },
    removeTheSameByKey:function(data, key){
        /**
         * 数组按key去重
         * @param data(Array) :                         需要去重的目标数组
         * @param key(String) :                         根据该key值去重,若key不传，则默认传入的数组是常量数组，而不是json格式的数组
         * => return(Array):                            返回值：去重后的数组
         **/
        var obj = {}, arr = [];
        if(key){
            for (var i = 0; i < data.length; i++) {
                if (!obj[data[i][key]]) {
                    obj[data[i][key]] = true;    //存入hash表
                    arr.push(data[i]);           //把当前数组的当前项push到临时数组里面
                }
            }
        }else{
            for (var j = 0; j < data.length; j++) {
                if (!obj[data[j]]) {
                    obj[data[j]] = true;
                    arr.push(data[j]);
                }
            }
        }
        return arr;
    },
    groupByKey:function(data, key, keyArray){
        /**
         * 数组按key分组
         * @param data(Array) :                         需要分组的目标数组
         * @param key(String) :                         根据该key值分组
         * @param keyArray(Array) :                     最外面的分组是否还需要其他字段（这些字段只能为现有的字段中取）
         * => return(Array):                            返回值：分组后的数组
         **/
        keyArray = keyArray || [];
        var map = {};
        var list = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (!map[item[key]]) {
                var obj = {};
                obj[key] = item[key]; //主键1
                for(var x in keyArray){         //其他键
                    obj[keyArray[x]] = item[keyArray[x]]
                }
                obj.list = [];
                obj.list.push(item);
                list.push(obj);
                map[item[key]] = item;

            } else {
                for (var j in list) {
                    if (list[j][key] == item[key]) {
                        list[j].list.push(item);
                        break;
                    }
                }
            }
        }
        return list;
    },
    sortByKey:function(data,key,type){
        /**
         * 数组按key排序
         * @param data(Array) :                         需要排序的目标数组
         * @param key(String) :                         根据该key值排序
         * @param type(String) :                        排序方式:默认升序(default:'up'),(legalValue:'up/down')
         * => return(Array):                            返回值：排序后的数组
         **/
        type = type ? type : 'up';//默认升序

        var r = data.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        if(type == "down") r = r.reverse(); //降序
        return r;
    },
    sortByRandom:function(data){
        /**
         * 随机数组：数组乱序
         * @param data(Array) :                         需要随机排序的目标数组
         * => return(Array):                            返回值：排序后的数组
         **/
        var len = data.length;
        var newArr = [];
        for(var i=0;i<len;i++){
            if(!data.length) break;
            var ran = parseInt(Math.random()*data.length);  // array idx < array.length
            newArr.push(data[ran]);
            data.splice(ran,1);                             //为避免添加重复的项，每选出一项后需要从原数组中清除该项
        }
        return newArr;
    },
    arrCombine:function(arr1, arr2){
        /**
         * 数组合并：合并后默认去重
         * @param arr1(Array) :                          需要合并的目标数组1
         * @param arr2(Array) :                          需要合并的目标数组2
         * => return(Array):                             返回值：合并数组
         **/
        arr1.push.apply(arr1,arr2);
        return arr1;
    },
    combineKey(defaultOpt, newOpt){
        //合并配置项，以传进来的为主，没有则使用旧的配置项
        for(var i in newOpt){
            if(newOpt[i]) defaultOpt[i] = newOpt[i];

        }
        return defaultOpt;
    },
    getRan(m){
        /**
         * 取m以内的随机数
         * @param m {Number} : 控制随机数大小(default: 1000000)
         */
        m = m || 100000000;
        var r = (Math.random()*m).toString().split('.')[0];
        return r;
      }
}
var lpobj = new LpObj();


/***
 * 正则相关方法集
 * @constructor
 */
function LpReg(){}
LpReg.prototype = {
  trim : function (str) {
    /**
     * 字符串去首尾空格
     * @param str { String }
     * => return(String):                                  返回值：去除首尾空格后的str
     */
    if(typeof str != 'string') str = str.toString();
    return str.replace(/(^\s*)|(\s*$)/g,"");
  },
  checkVehiclePlate: function (vehiclePlate){
     /**
      * 验证车牌格式是否正确
      * @param vehiclePlate {String}:                        车牌号
      * => return {Boolean}:                                 返回值：车牌格式是否正确
      */
    return /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(vehiclePlate);
   },
  checkMobilePhone: function (num) {
    /**
     * 手机号码格式验证
     * @param num {Number}:                              手机号码
     */
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(num))){
      console.log("手机号码格式不正确！");
      return false;
    }
    return true;
  }
}
var lpreg = new LpReg();








//暴露实例接口
export default {
    lpdt,
    lpobj,
    lpreg
}




