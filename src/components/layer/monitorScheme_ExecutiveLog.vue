<!-- 任务执行记录(执行任务状态、执行过程中的冲突等)：这个组件功能还未完善，接手的老弟辛苦改下了~~~ -->
<template>
  <div class="box-memo log-list-container slide-down" :class="{active: isShow}">
    <el-scrollbar class="el-scrollbar-xhidden log-list-scroller">
      <ul class="log-list">
        <li v-for="(item, idx) in executiveLogList" class="ellipsis-row2"
            :class="{warn: item.isWarn}" :key="item.recordId+'_'+idx" :title="item.recordContent">
          {{item.recordTime | getShortTime}} {{item.recordContent}}
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>


<script>
  import filters from '@js/filters';
  import { mapState } from 'vuex';
  export default {
    props: [
      'isShow',
      'serverPush_warnInfo'
    ],
    data() {
      return {
        showLoading: false,
        executiveLogList: []
      };
    },
    computed: {
      ...mapState([
        'serverPush'
      ])
    },
    watch: {
       isShow() {
         /**
          * 模块显示时请求数据
          */
       },
      executiveLogList() {
        /**
         * 各类冲突消息推送
         */
         this.executiveLogList = this.serverPush_warnInfo;
      }
    },
    filters: {
      getShortTime: filters.getShortTime   // 自定义过滤器：从长的日期格式中截取后半段具体时间（eg:2018-08-05 12:00:00 -> 12:00:00）
    },
    methods: {
      // *** ajax start ***
      // *** ajax end ***


    }
  }
</script>

<style scoped>
  /* ========== 执行记录 ========== */
  .log-list-container{height:265px;width:240px;left:264px;}
  .log-list-container.active{top:10px;}
  .log-list-scroller{height:240px;width:228px;}
  .log-list{width:220px; line-height:1.4;}
  .log-list li{margin-bottom:7px;}
  .log-list li:last-child{margin-bottom:0;}
  .log-list li.warn{color:#e54d4d;}
</style>

