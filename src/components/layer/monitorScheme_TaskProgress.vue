<!-- 特勤监测：所有任务进度查看 -->
<template>
  <div class="task-progress-list-container slide-left" :class="{active: isShow}" v-loading="showLoading">
    <!-- 任务查询 -->
    <ul class="list-filters clrfix">
      <li class="flex-wrap-c">
        <label>任务查询：</label>
        <el-input class="task-srh" v-model="taskName" size="mini" placeholder="请输入任务名称" clearable @clear="ajaxGetTaskProgressList"></el-input>
      </li>
      <li class="flex-wrap-c">
        <label>前导车牌：</label>
        <el-input class="task-srh" v-model="beforeLicensePlate" size="mini" placeholder="请输入前导车牌" clearable @clear="ajaxGetTaskProgressList"></el-input>
        <i class="ic2 ic-search" title="搜索" @click="ajaxGetTaskProgressList"></i>
      </li>
    </ul>
    <!--<span style="background:#fff;position:absolute;z-index:100;">{{serverPush}}</span>-->

    <el-scrollbar class="el-scrollbar-xhidden task-progress-list-scroller" :style="{height:scrollerHt}">
      <ul class="task-progress-list" v-if="taskList.length">
        <li v-for="(item, idx) in taskList" :class="['status-'+ item.executeStatusId, {warn: item.isWarn}]">
          <div class="task-info">
            <!-- 任务基本信息 -->
            <p class="task-baseinfo">
              <span class="ellipsis task-name" :title="item.taskName">{{item.taskName}}</span>
              <!--<span class="ellipsis task-name" :title="item.taskName">{{item.routeInfoList.length && item.routeInfoList[0].routeId}}</span>-->
              <i class="plate-num">{{item.beforeLicensePlate || '匿名车牌'}}</i>
            </p>
            <!-- 行驶速度、时间（真实时间在任务开始后推送过来时间） -->
            <p class="task-process">
              <span class="distance"> 0/{{item.routeInfoList.length && item.routeInfoList[0].routeLength/1000}}(KM)</span>
              <span class="time"> 0/{{item.routeInfoList.length && item.routeInfoList[0].routePlanTime}}(Min)</span>
            </p>
          </div>

          <!-- 当前线路进度（可查看起止点、计划的途径点、已途径点、当前点等） -->
          <route-progress-bar :routePointList="item.routeInfoList.length && item.routeInfoList[0].routePointList"
                              :percent="item.percent"
                              :arrivedPointIdx="item.arrivedPointIdx"></route-progress-bar>
        </li>
      </ul>
      <no-data v-else style="padding-top:170px;" :txt="'抱歉，暂无执行任务'"></no-data>
    </el-scrollbar>
  </div>
</template>


<script>
  import RouteProgressBar from '@components/parts/RouteProgressBar';
  import {mapState} from 'vuex';
  import common from '@tools/common';

  export default {
    props: [
      'isShow',                                       // 是否显示进度页
      'date'                                          // 执行日期
    ],
    components: {
      RouteProgressBar
    },
    data() {
      return {
        showLoading: false,
        scrollerHt: '0px',
        taskName: '',                                 // 查询条件： 任务名称
        beforeLicensePlate: '',                       // 查询条件： 前导车牌
        taskList: [],                                 // 查询结果：任务进度list

        activeSchemeId: ''                            // 当前选中的方案
      }
    },
    computed: {
      ...mapState([
        'schemeId',                                   // 方案id
        'serverPush',                                  // 推送结果
        'countServerPush'
      ]),
      executeDate() {
        /**
         * 执行日期（未指定时默认当天）
         */
        return this.date || common.lpdt.getToday();
      }
    },
    watch: {
      countServerPush() {
//        console.log('推送变了');
        this.getRoutePointProgress();
      },
      schemeId() {
        /**
         * 监听方案变化
         */
        this.activeSchemeId = this.schemeId;
      },
      activeSchemeId: {
        /**
         * 当前所选方案
         */
        handler() {
          this.isShow && this.ajaxGetTaskProgressList();
        },
        immediate: true
      },
      isShow() {
        /**
         * 显示时加载任务列表
         */
        if(this.isShow) {
          this.ajaxGetTaskProgressList();
        }
      }
    },
    mounted() {
        this.setScrollerHt();                         // 动态设置高度，便于自定义滚动条滚动
    },
    methods: {
      // *** ajax start ***
      ajaxGetTaskProgressList() {
        // 获取今日待执行方案下所有执行任务
        const apiName = `${config.baseUrl_HOST}${this.$api.selectExecuteTaskDetailInfoList_GET}`;
        const params = {
          schemeId: this.schemeId,                    // 方案编号
          executeDate: this.executeDate,              // 执行日期
          taskName: this.taskName,                    // 任务名称
          beforeLicensePlate: this.beforeLicensePlate // 前导车牌
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            let taskList = res.resultList;
            // 设置线路默认进度 在起点（percent:两个途径点之间的百分比进度，default:0;  arrivedPointIdx:当前已到达的途径点索引，初始在起点上，default:0）
            taskList.forEach(i => {
              i.percent = 0;
              i.arrivedPointIdx = 0;
            });
            taskList = common.lpobj.sortByKey(taskList, 'executeBeginTime');
            this.taskList = taskList;
            this.getRoutePointProgress();
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      // *** ajax end ***

      getRoutePointProgress() {
        /**
         * 把推送数据根据routeId匹配到任务列表中
         */
        this.taskList.forEach(i => {
          if(i.routeInfoList.length) {
            const routeId = i.routeInfoList[0].routeId; // 当前线路id
            i.percent = (this.serverPush && this.serverPush[routeId] && this.serverPush[routeId].pointInfo && this.serverPush[routeId].pointInfo.percent) || 0;
            i.arrivedPointIdx = (this.serverPush && this.serverPush[routeId] && this.serverPush[routeId].pointInfo && this.serverPush[routeId].pointInfo.arrivedPointIdx) || 0;
          }
        })
      },
      setScrollerHt() {
        /**
         * 根据页面高度动态设置滚动容器高度
         */
        const winHt = document.documentElement.offsetHeight;
        this.scrollerHt = `${winHt-195}px`;
      },
    }
  }
</script>

<style scoped>
   /* 查询过滤 */
  .list-filters{height:30px;line-height:30px;padding:10px 20px;}
  .list-filters label{color:#465461;padding-right:10px;float:left;}
  .list-filters .ic-search{float:left;padding:0 5px;}
  /* 任务进度list */
  .task-progress-list-container{position:absolute;bottom:0;z-index:3;padding-right:15px;border-top:1px solid #e9e9e9;border-left:1px solid #e9e9e9;border-radius:4px 0 0 0;box-shadow:-2px -2px 4px #f2f2f2;}
  .task-progress-list-container.active{left:10px;right:0;background:#fff;z-index:5;}
  .task-progress-list-scroller{height:500px;}
  .task-progress-list{color:#465461;margin-right:15px;}
  .task-progress-list>li{border-left:3px solid transparent;margin-bottom:6px;padding:10px 15px 10px 0;border-radius:0 4px 4px 0;box-sizing:border-box;position:relative;}
  .task-progress-list>li.status-EXECUTESTATUS01{border-color:#ea7d60;background:#fff4f3;}                         /* 待执行 */
  .task-progress-list>li.status-EXECUTESTATUS02{border-color:#eab457;background:#fff9f0;}                         /* 执行中 */
  .task-progress-list>li.status-EXECUTESTATUS03{border-color:#3dcf8f;background:#f2fefc;}                         /* 执行完 */
  .task-progress-list>li.warn::before{content:'';position:absolute;background:url(../../assets/images/ic2.png) no-repeat -80px -40px;display:block;height:20px;width:20px;left:9px;top:9px;}
  .task-info{width:300px;padding-left:29px;box-sizing:border-box;float:left;}
  .task-info .task-baseinfo{display:flex;margin:1px 0 12px 0;}
  .task-info .task-baseinfo .task-name{flex:1;}
  .task-info .task-process{margin-bottom:3px;}
  .task-info .plate-num{display:inline-block;margin-left:7px;border:1px solid #5093e1;border-radius:3px;color:#5093e1;height:14px;line-height:14px;width:65px;text-align:center;}
  .task-info .distance, .task-info .time{color:#fff;border-radius:3px;padding:1px 10px;}
  .task-info .distance{background:#eab457;margin-right:12px;}
  .task-info .time{background:#6fd4be;}
</style>
<style>
  /* 覆盖element样式 */
  .el-input.task-srh {float: left;width: 180px;}
  .el-tooltip__popper.is-dark{background:#c7d3e2;color:#465461;line-height:.2;}
  .el-tooltip__popper[x-placement^=top] .popper__arrow::after{border-top-color:#c7d3e2;top:-6px;left:-2px;border-width:6px;}
</style>
