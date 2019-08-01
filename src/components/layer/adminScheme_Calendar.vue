<!-- 日历：查看近一月的方案 -->
<template>
  <el-dialog
    title="" custom-class="dialog-header-hasbg dialog-wh1044" :show-close="true" v-loading="showLoading"
    :append-to-body='true' :close-on-press-escape='false' :close-on-click-modal='false' :visible.sync="showLayer">
       <div class="calendar-box">
         <!-- 切换年月 -->
         <ul class="calendar-month flex-wrap-c">
           <li @click="setY_M('minusY')" title="上一年">&lt;&lt;</li>
           <li @click="setY_M('minusM')" title="上一月">&lt;</li>
           <li class="this-month">{{year}} 年 {{month}} 月</li>
           <li @click="setY_M('addM')" title="下一月">&gt;</li>
           <li @click="setY_M('addY')" title="下一年">&gt;&gt;</li>
         </ul>

         <!-- 日历表格 -->
         <table class="table-calendar">
           <!-- 星期 -->
           <thead>
           <tr class="calendar-week">
             <th v-for="item in ['一','二','三','四','五','六','日']">星期{{item}}</th>
           </tr>
           </thead>

           <!-- 日期 -->
           <tbody class="calendar-date">
           <tr v-for="(tr, trIdx) in 5">
             <td v-for="(td, tdIdx) in list" :key="'td_'+tdIdx" v-if="tdIdx<7*(trIdx+1) && Math.floor(tdIdx/7) == trIdx"
                 :class="{'clash': td.resultList && td.resultList.length, 'disabled': isInvalid(td.executeDate)}"
                 @click="showPreviewByDate(td.executeDate)">
               <!-- 当天日期 -->
               <p class="date">{{td.executeDate | getDDByYYMMDD}}</p>
               <!-- 当天方案列表 -->
               <el-scrollbar class="el-scrollbar-xhidden list-scheme-today-scroller">
                 <ul class="list-scheme-today">
                   <li v-for="item in td.schemeList" :title="item.schemeName" class="ellipsis" :class="{clash: item.clash}">{{item.schemeName}}</li>
                 </ul>
               </el-scrollbar>
             </td>
           </tr>
           </tbody>
         </table>
       </div>
  </el-dialog>
</template>

<script>
  import common from '@tools/common';
  import filters from '@js/filters'
  import { mapState, mapMutations } from 'vuex';

  export default {
    props: ['isShow'],
    data() {
      return {
        showLayer: false,
        showLoading: false,
        year: common.lpdt.y,                                                          // 当前查询的年份（默认当年）
        month: common.lpdt.m < 10 ? '0'+common.lpdt.m : common.lpdt.m,                // 当前查询的月份（默认当月）
        beginDay: '',
        beginWeek: '',
        startDate: '',
        endDate: '',
        list: [],
      };
    },
    computed: {
      dateArr() {
        /**
         * 根据查询起止日期算出当前查询月前后35天的日期数组(用于无数据返回及请求数据过程中35天日期面板展示)
         */
        if(this.startDate && this.endDate) {
          let arr = common.lpdt.getDateArr(this.startDate, this.endDate);      // 仅带日期，无方案冲突信息的数组
          arr = arr.map(i => {
            return {
              executeDate: i
            }
          });
          return arr;
        }
        return [];
      }
    },
    watch: {
      isShow() {
        /**
         *  若直接用isShow,由于el-dialog 自带的关闭 :visible.sync="isShow" 直接设置 isShow 的，如果不重新赋值给showLayer的话，会导致父子组件都在修改isShow这个值而冲突
         *  故赋值给新的变量，又让父组件赋值过来设置这个变量，又可以在子组件重置这个变量，符合vue单向传值的宗旨
         */
          this.showLayer = this.isShow;
      },
      showLayer() {
        /**
         *  监听当前组件层显隐
         */
        if (!this.showLayer) {
          this.$emit('close');
        }else{
          this.init_searchDate();                                                         // 初始化查询日期，首次查询开始
        }
      }
    },
    filters: {
      /**
       * 解析yy-mm-dd格式的日期，截dd作为最终结果
       */
      getDDByYYMMDD : filters.getDDByYYMMDD
    },
    methods: {
      ...mapMutations ([
        'setVuex_previewDate',
      ]),
      // *** ajax start ***
      ajaxGetSchemeList() {
        /**
         *  获取当前查询月前后35天的方案
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeRehearseList_GET}`;
        const params = {
          schemeBeginDate: this.startDate,
          schemeEndDate: this.endDate
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            this.showLoading = false;
            if(res.appCode == 0){
              this.list = res.resultList.length ? res.resultList : this.dateArr;      // 若没有数据，则仅显示空日期
            }else{
              this.list = this.dateArr;
              this.$message.error('方案获取失败！');
            }
          }).catch(rej => {
          this.showLoading = false;
        })
      },

      init_searchDate() {
        /**
         * 初始化检索日期（找到查询月，再往前后推算35天）
         * 查询日期先看url上有没有参数带过来，没有则使用当月首日作为查询月
         */

        let urlDate = this.$route.query.startDate;
        if(urlDate){
          // 指定日期的根据指定日期查询
          this.year = new Date(urlDate).getFullYear();
          const month = new Date(urlDate).getMonth() + 1;
          this.month = month < 10 ? '0'+month : month;
        }else{
          // 为指定日期的按当前月查询
          this.month = common.lpdt.m < 10 ? '0'+common.lpdt.m : common.lpdt.m;
          this.year = common.lpdt.y;
        }
        this.updateSearchDate();
      },
      updateSearchDate() {
        /**
         * 更新查询日期，重新查询当前查询月前后35天的方案数据
         */
        this.beginDay = `${this.year}-${this.month}-01`;                        // 当前查询月第一日
        let date = new Date(this.beginDay);                                     // 转换成中国标准时间
        this.beginWeek = date.getDay();                                         // 当前查询月第一日对应周
        this.startDate = common.lpdt.dateOperator({                             // 查询开始日期
          startTime: this.beginDay,
          countDays: this.beginWeek - 1,
          type: '-'
        });
        this.endDate =  common.lpdt.dateOperator({                              // 查询结束日期
          startTime: this.beginDay,
          countDays: 28 + (7-this.beginWeek)
        });

        this.list = this.dateArr;
        this.ajaxGetSchemeList();                                               // 获取当前查询月前后35天的方案
      },
      setY_M(type) {
        /**
         * 设置查询年月
         */
        switch (type){
          case 'addM':
            // 加月
            if(Number(this.month) == 12){
              this.month = 1;
              this.year ++;
            }else{
              this.month =  Number(this.month)+1;
            }
            break;
          case 'minusM':
            // 减月
            if(Number(this.month) == 1){
              this.month =  12;
              this.year --;
            }else{
              this.month = Number(this.month)-1;
            }
            break;
          case 'addY':
            // 加年
            this.year ++;
            break;
          case 'minusY':
            // 减年
            this.year --;
            break;
        }
        this.month = Number(this.month) < 10 ? '0'+Number(this.month) : Number(this.month); // 个位补0
        this.updateSearchDate();                                                            // 更新查询日期
      },
      isInvalid(date) {
        /**
         * 方案是否已失效过期(当天之前的都是已失效的，置灰)
         */
        const today = common.lpdt.getToday();
        return (common.lpdt.dateCompare(date, today)) ? false : true;            // 方案执行日期大于今日，方案有效
      },
      showPreviewByDate(date) {
        /**
         * 查看指定日期的方案（此处用路由跳转主要是为了保留查询日期，如果用户选择日期后再刷新页面，此时可记录上一次查询日期）
         * @param date {String} : 查询方案的起止日期
         */
        this.setVuex_previewDate(date);
        this.$router.push({
          path: '/preview',
          query: {
            startDate: date,
            endDate: date
          }
        });
        this.showLayer = false;
      }
  }
  }
</script>

<style scoped>
  .calendar-box{width:981px;background:#fafafa;border-radius:4px;padding-bottom:1px;}
  .calendar-month{width:300px;margin:0 auto;text-align:center;padding:10px 0;}
  .calendar-month li{flex:1;cursor:pointer;}
  .calendar-month li.this-month{font-size:14px;width:130px;flex:inherit}
  .date{text-align:right;padding:6px;}
  .calendar-week{text-align:center;height:30px;}
  .table-calendar{border-collapse:collapse;}
  .table-calendar tr{border-top:1px solid #e9ecee;}
  .table-calendar th,.table-calendar td{border-right:1px solid #e9ecee;}
  .table-calendar th{font-weight:normal;color:#727d86;font-size:14px;}
  .table-calendar td{vertical-align:top;box-sizing:border-box;width:140px;height:96px;background:#fff;color:#92999e;}
  .table-calendar td.clash{background:#fff4f3;}     /* 有冲突的 */
  .table-calendar td.disabled{background:#fafafa;} /* 失效的 */
  .table-calendar td:hover{cursor:pointer;background:#fff9f0;}
  .table-calendar td.disabled .list-scheme-today li{color:#92999e;border-color:#c0c7d0;}
  .list-scheme-today-scroller{height:75px;}
  .list-scheme-today li{height:24px;line-height:24px;color:#2286d9;border-left:2px solid #1799ff;padding-left:5px;margin-bottom:1px;}
  .list-scheme-today li.clash{color:#f00;}
</style>
