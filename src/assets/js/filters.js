'use strict';
export default {
    getShortTime(fullDate) {
      /**
       * 得到日期后面的时间，小时和分
       * @param fullData {String}:   yy-mm-dd hh:mm (eg:2018-08-05 12:00:00)
       * return :                   hh:mm:ss (12:00)
       */
      return fullDate.substr(11, 5);
    },
    keepToFixed6(num) {
      /**
       * map 坐标保留6位小数
       */
      if(typeof num == "string") num = parseFloat(num);
      return +num.toFixed(6)
    },
    getDDByYYMMDD(date) {
      /**
       * 获取某个日期的日（eg:2018-01-01的01号）
       */
      if(!date) return;
      const idx = date.lastIndexOf('-');
      return date.substring(idx+1)
    }
}

