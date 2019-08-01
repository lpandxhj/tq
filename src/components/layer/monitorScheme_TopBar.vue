<!-- 特勤监测：方案头部条 -->
<template>
    <ul class="top-bar clrfix" :class="{right0: showLayerTaskProgress}" v-loading.fullscreen="showLoading">
      <!-- 快速特勤 -->
      <li class="ic2 ic-fast-plan2" title="快速特勤" @click="$pageJump('adminScheme.html', '/rlttask', {isFast: 1})">快速特勤</li>

      <!-- 选择今日待执行方案 -->
      <li class="select-scheme">
        <el-select v-model="schemeId" size="mini" placeholder="今日待执行方案">
          <el-option v-for="(item, idx) in schemeList"
                    :key="item.schemeId"
                    :label="item.schemeName"
                    :value="item.schemeId">
          </el-option>
        </el-select>
      </li>

      <!-- 查看任务进度列表 -->
      <li title="任务执行进度" class="ic2 ic-task-progress"
          :class="{active:showLayerTaskProgress}"
          @click="showTaskProgress">
          <span class="count">{{taskLen}}</span>
      </li>

      <!-- 查看执行记录 -->
      <li title="执行记录" class="ic2 ic-executive-log"
            :class="{active:showLayerExecutiveLog}"
            v-show="!showLayerTaskProgress"
            @click="showExecutiveLog">
      </li>

      <!-- 查看7天待执行方案 -->
      <li title="7天待执行方案" class="ic2 ic-calendar-week"
            :class="{active:showLayerOneWeekScheme}"
            v-show="!showLayerTaskProgress"
            @click="showOneWeekScheme">
      </li>
    </ul>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import common from '@tools/common';

  export default {
    props: [
      'taskLen'                                    // 执行任务条数
    ],
    data() {
      return {
        showLoading: false,
        showLayerExecutiveLog: false,              // 是否显示执行记录列表
        showLayerOneWeekScheme: false,             // 是否显示一周待执行方案
        showLayerTaskProgress: false,              // 是否显示一周待执行方案

        startDate: common.lpdt.getToday(),         // 执行日期：今日
        schemeList:[],                             // 方案下拉选项list
        schemeId: '',                              // 当前选中的方案id
      };
    },
    computed:{
      ...mapState([
        'routePath'
      ]),
    },
    watch: {
      schemeId() {
        /**
         * 方案改变时，记录当前schemeId及方案下的待执行任务taskList 存vuex 给监测各路由页 共享
         */
        this.setVuex_schemeId(this.schemeId)
      },
    },
    mounted() {
      /**
       * 获取今日待执行方案列表
       */
      this.ajaxGetExecuteSchemeList();
    },
    methods: {
      ...mapMutations([
        'setVuex_routePath',                        // 设置路由路径
        'setVuex_schemeId'                          // 设置方案id
      ]),
      // *** ajax start ***
      ajaxGetExecuteSchemeList() {
        /**
         * 获取今日待执行方案列表
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeForWeek_GET}`;
        const params = {
          schemeBeginDate: this.startDate,
          schemeEndDate: this.startDate
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            this.showLoading = false;
            if(res.appCode ==0 ){
              this.schemeList = res.resultList[0].schemeList;
              this.schemeId = this.schemeList.length ? this.schemeList[0].schemeId : '';
            }else{
              this.$message.error('今日待执行方案获取失败');
            }
          }).catch(rej => {
            this.showLoading = false;
            this.$message.error('今日待执行方案获取失败');
        })
      },
      // *** ajax end ***

      showExecutiveLog() {
        /**
         * 查看执行记录列表
         */
        this.showLayerExecutiveLog = !this.showLayerExecutiveLog;
        this.$emit('show-executive-log', this.showLayerExecutiveLog);
      },
      showOneWeekScheme() {
        /**
         * 查看一周待执行方案
         */
        this.showLayerOneWeekScheme = !this.showLayerOneWeekScheme;
        this.$emit('show-one-week-scheme', this.showLayerOneWeekScheme);
      },
      showTaskProgress() {
        /**
         * 查看执行任务进度
         */
        this.showLayerTaskProgress = !this.showLayerTaskProgress;
        this.$emit('show-task-progress', this.showLayerTaskProgress);
      }
    }
  }
</script>

<style scoped>
  .top-bar{right:464px;}
  .select-scheme{margin-top:1px;width:150px;}
  .top-bar li{float:left;}
  .top-bar li.ic-fast-plan2{float:right;color:#465461;white-space:nowrap;height:18px;line-height:18px;margin:7px 0 0 0;padding-right:10px;border-right:1px dotted #b5b5b5}
  .right0{right:0;}
  .right0 li.ic-fast-plan2{border-right:0;}
  .top-bar li.ic-fast-plan2:hover{color:#5093e1;cursor:pointer;}
  .ic-task-progress, .ic-executive-log, .ic-calendar-week{margin:6px 0 0 9px;}
  /*.ic-task-progress::before, .ic-executive-log::before, .ic-calendar-week::before{margin:6px 0 0 9px;}*/
  .ic-fast-plan2::before{float:left;margin:0 2px 0 0;}
</style>
<style>
  /* 覆盖elementui样式 */
  .select-scheme input::-webkit-input-placeholder {color:#465461;}
  .select-scheme .el-input__inner{border:none;}
  .select-scheme .el-input__suffix{left:0;right:inherit;}
  .select-scheme .el-icon-arrow-up:before{font-size:12px;color:#5093e1;font-weight:bold;}
  .select-scheme .el-input--suffix .el-input__inner{padding:0 12px 0 30px;color:#465461;}
</style>
