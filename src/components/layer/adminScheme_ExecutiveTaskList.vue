<!-- 执行任务list模块 -->
<template>
  <div>
    <!-- ******************************************************************************** isPreview: true  预演页执行任务 **************************************************************************** -->
    <el-scrollbar class="el-scrollbar-xhidden task-list-scroller"
                  :style="{height: scrollerHt, top: '100px'}"
                  v-loading.fullscreen="showLoading"
                  v-if="isPreview">
      <!--:style="{height: isLowResolution ? '269px' : '358px', top: '100px'}"-->
      <ul class="task-list" v-if="executeTaskList.length">
        <!-- 任务list -->
        <li v-for="(item, idx) in executeTaskList" class="box-memo"
            :key="item.taskId+'_'+idx"
            :title="item.routeInfoList.length ? '' : '该任务未关联线路'"
            :class="['status-'+item.executeStatusId,{'active': activeTaskId == item.taskId, 'disabled': !item.routeInfoList.length}]"
            @click.stop="taskClick(item)"
            @mouseenter="addRouteHL(item)"
            @mouseleave="removeRouteHL">

          <!-- 方案、任务名称 -->
          <div>
            <p class="scheme-name ellipsis">
              <!-- 复选框(无线路的任务不可手动点勾选) -->
              <i class="ic2 ic-ckb-box" :class="{active: item.checked}"
                 @click.stop="checkedChange(item)" v-if="item.routeInfoList.length">
              </i>
              <i class="ic2 ic-ckb-box disabled" :class="{active: item.checked}" v-else></i>
              {{item.schemeName}}
              <!--{{item.routeInfoList.length && item.routeInfoList[0].routeId}}-->
            </p>
            <p class="task-name ellipsis">{{item.taskName}}</p>
          </div>

          <!-- 车牌、时间 -->
          <p class="clrfix">
            <span class="fr time">{{item.executeBeginTime | getShortTime}} — {{item.executeEndTime | getShortTime}}</span>
            <span class="fl license-plate">{{item.beforeLicensePlate || '未知号牌'}}</span>
          </p>
        </li>
      </ul>
    </el-scrollbar>




    <!-- ******************************************************************************** isPreview: false  监测页执行任务 **************************************************************************** -->
    <el-scrollbar class="el-scrollbar-xhidden task-list-scroller"
                  :class="{'el-scrollbar-yhidden':executeTaskList.length<5}"
                  :style="{height: scrollerHt}"
                  v-loading.fullscreen="showLoading"
                  v-else>
      <!--:style="{height: isLowResolution ? '354px' : '445px'}"-->
      <ul class="task-list" v-if="executeTaskList.length">
        <li v-for="(item, idx) in executeTaskList" class="box-memo"
            :key="item.taskId+'_'+idx"
            :title="item.routeInfoList.length ? '' : '该任务未关联线路'"
            :class="['status-'+item.executeStatusId,{'active': activeTaskId == item.taskId, 'disabled': !item.routeInfoList.length}]"
            @click="taskClick(item)"
            @mouseenter="addRouteHL(item)"
            @mouseleave="removeRouteHL">
          <!-- 任务名称 -->
          <p>
            <!-- 复选框(无线路的任务不可勾选) -->
            <i class="ic2 ic-ckb-box" v-if="item.routeInfoList.length" :class="{active: item.checked}" @click.stop="checkedChange(item)"></i>
            <i class="ic2 ic-ckb-box disabled" v-else></i>
            {{item.taskName}}
          </p>

          <!-- 任务相关人员信息（前导车、警员等） -->
          <p>
            <span class="ic2 ic-plate" :class="{'ic-plate-active': activeTaskId == item.taskId}"> {{item.beforeLicensePlate || '未知号牌'}}</span>
            <span class="police">
               <i class="p-name cut-line">{{item.dutyPolice || '匿名司机'}}</i>
               <i class="p-tel">{{item.dutyPoliceTel || '无'}}</i>
             </span>
          </p>
          <!-- 操作按钮（修改任务状态、快速特勤入口） -->
          <p class="pd">
               <span class="btn-task">
                 <!-- 任务完结，某些按钮禁用 -->
                 <template v-if="item.executeStatusId != 'EXECUTESTATUS03'">
                    <i title="开始" class="ic1 ic-begin"
                       :class="{'ic-begin-active': activeTaskId == item.taskId}"
                       @click.stop="taskStatusChange(item, 0, 'EXECUTESTATUS02')"
                       v-if="item.isWaitExecute"></i>

                    <i title="任务已开始" class="ic1 ic-begin active"
                       :class="{'ic-begin-active': activeTaskId == item.taskId}"
                       v-else></i>

                    <i title="复位" class="ic1 ic-reset"
                       :class="{'ic-reset-active': activeTaskId == item.taskId}"
                       @click.stop="taskStatusChange(item, 1, 'EXECUTESTATUS01')"></i>

                    <i title="快速特勤" class="ic1 ic-fast-plan cut-line"
                       :class="{'ic-fast-plan-active': activeTaskId == item.taskId}"
                       @click="$pageJump('adminScheme.html', '/fasttasklist')"></i>
                 </template>

                 <i title="任务已完结" class="ic1 ic-end active"
                      :class="{'ic-end-active': activeTaskId == item.taskId}"
                      v-if="item.executeStatusId == 'EXECUTESTATUS03'"></i>

                 <i title="结束" class="ic1 ic-end"
                      :class="{'ic-end-active': activeTaskId == item.taskId}"
                      @click.stop="taskStatusChange(item, 1, 'EXECUTESTATUS03')"
                      v-else></i>
              </span>
              <span class="time no-wrap">{{item.executeBeginTime | getShortTime}} — {{item.executeEndTime | getShortTime}}</span>
          </p>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<script>
  import mapSetting from '@tools/map-setting';
  import mapDraw from '@tools/map-draw';
  import common from '@tools/common';
  import filters from '@js/filters';
  import { mapState, mapMutations } from 'vuex';

  export default {
    props: {
      isEdit: {
        type: Boolean,                                    // 是否为编辑状态
        default: true
      },
      isPreview: {
        type: Boolean,                                    // 是否为预演
        default: false
      },
      isStart: {
        type: Boolean,                                    // 预演动画是否已经开始
        default: false
      },
      serverPushId: {
        type: String,
      }
    },
    data() {
      return {
        showLoading: false,
        isLowResolution:false,                             // 是否为低分辨率展示(任务列表滚动容器高度随着分辨率不同而不同)
        scrollerHt:'',                                     // taskList滚动容器高度

        checkedTaskArr: [],                                // 所有勾选的任务集(默认为冲突的任务)
        executeTaskList: [],                               // 当前任务list
        activeTaskId: '',                                  // 当前高亮激活的任务id
        executeTaskId: '',                                 // 当前激活的执行任务id
        routePointList: [],                                // 当前激活的任务关联线路点位集
      }
    },
    computed: {
      ...mapState([
        'mapLoaded',
        'schemeId',
        'previewDate',
        'countExecuteTaskListChange',
        'taskList',
        'taskId'
      ]),
    },
    filters: {
      getShortTime: filters.getShortTime                    // 取 hh:mm (eg:2018-08-05 12:00:00 -> 12:00)
    },
    watch: {
      schemeId: {
        /**
         * 监测页：当前方案改变时，重新初始化taskList
         */
        handler () {
          // 预演页不用操作
          if(!this.isPreview) {
            if(this.schemeId) {
              this.ajaxGetTaskListByMonitor().then(res => {
                this.setScrollHt();
              });
            }else {
              this.executeTaskList = [];
              this.setVuex_taskId({
                taskId: '',
                executeTaskId: ''
              });
            }
          }
        },
        immediate: true
      },
      countExecuteTaskListChange () {
        /**
          * 预演页：预演日期改变时，重新获取最新的taskList
        */
         this.ajaxGetTaskListByPreview().then(res => {
           this.setScrollHt();
         });
      },
      checkedTaskArr: {
        handler () {
          /**
           * 绘制勾选的任务下的线路及关联布岗、设备、途径点等（默认勾选冲突的线路，其余的可手动勾选）
           */
          this.$emit('checked-task-change', this.checkedTaskArr);
        },
        immediate: true
      },
    },
    mounted() {
      if(!this.mapLoaded) {
        this.$mapLoaded().then(res => {                                           // 图层加载完后， 才能操作地图图层
          this.setVuex_mapLoaded(true);
        })
      }
    },
    methods: {
      ...mapMutations ([
        'setVuex_mapLoaded',
        'setVuex_taskId',  // 设置当前高亮激活的任务
      ]),
      // *** ajax start ***
      ajaxStartAction(state, taskId, routeId, positionDeviceId = '') {
        /**
         * 任务开始、复位
         * @param state {String}:             执行状态（stop、 start）
         * @param taskId {String}:            当前执行任务id
         * @param routeId {String}:           当前执行任务线路id
         * @param positionDeviceId {String}:  定位设备标识
         * @param browserId {String}:         线程标识
         */
        const serverPushId = localStorage.getItem('serverPushId') || this.serverPushId; // 页面加载时，缓存中存在，则先停止上一次线程（等同于手动点击结束按钮）
        const apiName = `${config.baseUrl_HOST}${this.$api.getActionPush_GET}`;
        const params = {
          state: state,                                                           // 任务执行状态（start、stop）
          browserId: serverPushId,                                                // 线程标识
          taskId: taskId,                                                         // 任务id
          routeId: routeId,                                                       // 线路id
          positionDeviceId: positionDeviceId                                      // 定位设备id
        };

        // 手动控制任务开始、复位、结束按钮时
        return this.$http.get(apiName, params)
          .then(r => {
            if(this.state == 'stop'){
              localStorage.removeItem('serverPushId');                            // 预演结束：停线程、清缓冲
            }else if(this.state == 'start'){
              localStorage.setItem('serverPushId', this.serverPushId)             // 预演开始：启线程、存缓存
            }
          })
      },
      ajaxGetTaskListByPreview() {
        /**
         * 预演页executeTaskList：查询指定日期所有待执行任务
         */
        this.clearPrevCheckedRouteDraw();
        mapDraw.clearPoint_car();
        this.$emit('animation-reset', this.previewDate); // 重置预演动画,停上一次线程


        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeRehearseList_GET}`;
        const params = {
          schemeBeginDate: this.previewDate,
          schemeEndDate: this.previewDate
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              let list = res.resultList;
              if(list.length) {
                this.executeTaskList = this.getTaskInfo(list[0]);
                this.$emit('set-tasklen', this.executeTaskList.length); // 当前执行任务条数
                this.activeTaskId = '';
                this.executeTaskId = '';
                if(this.executeTaskList.length) {
                  this.activeTaskId = this.executeTaskList[0].taskId;
                  this.executeTaskId = this.executeTaskList[0].executeTaskId;
                  this.$emit('active-task-change', this.executeTaskList[0].routeInfoList[0].routePointList);
                  this.checkedTaskArr = this.executeTaskList.filter(i => {return i.checked});
                  this.drawDefaultRouteDelay().then(res => {
                    this.showLoading = false;                          // 首次默认绘制第一个任务的主线
                  });
                }else {
                  this.$message.warning(`抱歉，${this.previewDate} 暂无待执行任务！`);
                  this.showLoading = false;
                }
                this.setVuex_taskId({
                  taskId: this.activeTaskId,
                  executeTaskId: this.executeTaskId
                });
              }
            }else{
              this.$message.error('方案获取失败！');
            }
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxGetTaskListByMonitor() {
        /**
         * 监测页executeTaskList：获取今日指定方案下待执行任务列表
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeForWeek_GET}`;
        const params = {
          schemeBeginDate: common.lpdt.getToday(),
          schemeEndDate: common.lpdt.getToday(),
          schemeId: this.schemeId
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            this.showLoading = false;
            if(res.appCode ==0 ){
              const schemeList = res.resultList[0].schemeList;    // 拿到今日所有的方案
              let arr = [];
              for(let j=0; j<schemeList.length; j++){
                const taskList = schemeList[j].taskDetailInfoList;
                if(!taskList) break;
                taskList.forEach((i, idx) => {
                  i.checked = false;
                  arr.push(i)
                });
              }

              this.$emit('set-tasklen', arr.length);             // 当前执行任务条数
              this.clearPrevCheckedRouteDraw();
              if(!arr.length) {
                this.executeTaskList = [];
                this.activeTaskId = '';
                this.executeTaskId = '';
                this.$message.warning(`抱歉，该方案下今日暂无待执行任务！`);

              }else {
                arr[0].checked = true;
                this.executeTaskList = common.lpobj.sortByKey(arr, 'executeBeginTime');           // 任务list按执行时间排序
                if(this.executeTaskList.length) {
                  this.activeTaskId = this.executeTaskList[0].taskId;
                  this.executeTaskId = this.executeTaskList[0].executeTaskId;
                  this.$emit('active-task-change', this.executeTaskList[0].routeInfoList[0].routePointList);
                  this.clearPrevCheckedRouteDraw();                                               // 先清除上一次预演任务list中勾选的全部线路
                  this.checkedTaskArr.push(this.executeTaskList[0]);
                  this.drawDefaultRouteDelay(); // 首次默认绘制第一个任务的主线
                }
              }
              console.log(this.activeTaskId)
              this.setVuex_taskId({
                taskId: this.activeTaskId,
                executeTaskId: this.executeTaskId
              });

            }else{
              this.$message.error('今日待执行方案获取失败');
            }
          }).catch(rej => {
          this.showLoading = false;
          this.$message.error('今日待执行方案获取失败');
        })
      },
      // *** ajax end ***

      drawDefaultRouteDelay() {
        /**
         * 延迟绘制默认勾选的主线
         */
        return new Promise((resolve, reject) => {
          if(this.checkedTaskArr.length) {
            setTimeout(() => {
              const route = this.executeTaskList[0].routeInfoList[0];
              route && mapDraw.drawLineAndPoint(route);
              resolve('线路绘制成功，可关闭遮罩');
            }, 1500)
          }
        })

      },

      getTaskInfo(data) {
        /**
         * 拼接方案下的所有任务为一个数组, 作为当前需要冲突预演的任务list
         * @param data {Object}: 当天的方案list（每个方案对象包含了任务数组）
         */
        let clashArr = [];
        data.resultList.forEach(i => {
          let width = ((i.routetime[1]-i.routetime[0])*100).toFixed(2);
          width = width < 1 ? 1 : width;                                    // 宽度取整后小于1%的，默认设为1%
          clashArr.push({
            left: (i.routetime[0]*100).toFixed(2)+'%',
            width: width+'%'
          })
        });                                                                 // 冲突段
        this.$emit('set-clash', clashArr);

        let arr = [];
        const schemeList = data.schemeList;                                 // 当天的方案list
        for(let j=0; j<schemeList.length; j++){
          const taskList = schemeList[j].taskDetailInfoList;
          taskList.forEach(i => {
            i.checked = i.clash == 1 ? true : false;
            arr.push(i);
            if(i.checked && i.routeInfoList.length) {
               mapDraw.drawLineAndPoint(i.routeInfoList[0]);
            }
          });
        }
        if(arr.length) {
          arr = common.lpobj.sortByKey(arr, 'executeBeginTime');            // 任务list按执行时间排序
          arr[0].checked = true;
        }
        return arr;
      },

      taskStatusChange(item, isWaitExecute, executeStatusId) {
        /**
         * @param taskId(String)：            任务id
         * @param isWaitExecute(Number)：     是否待执行的状态
         * @param executeStatusId(String)：   当前任务状态（EXECUTESTATUS01：待执行、 EXECUTESTATUS02：执行中、 EXECUTESTATUS03：已完成）
         */
        // 任务状态改变（是否待执行的状态）
        item.isWaitExecute = isWaitExecute;
        item.executeStatusId = executeStatusId;

        // 这里还需要一个ajax请求来修改任务执行状态

        let type = 'info'; // 常规消息提示
        let msg = '';
        const routeId = item.routeInfoList.length ? item.routeInfoList[0].routeId : '';
        if(!routeId) return
        switch (executeStatusId) {
          case 'EXECUTESTATUS01':
            msg = '任务已复位';
            this.ajaxStartAction('stop',  item.taskId, routeId, item.positionDeviceId);  // 结束线程，删除动画小车
            break;
          case 'EXECUTESTATUS02':
            msg = '任务已开始';
            this.ajaxStartAction('start',  item.taskId, routeId, item.positionDeviceId);
            break;
          case 'EXECUTESTATUS03':
            msg = '任务已完结';
            this.ajaxStartAction('stop',  item.taskId, routeId, item.positionDeviceId);  // 结束进程。动画小车保留在最后的位置
            break;
        }
        // 先移除任务列表右侧原有的消息提示
        if (document.querySelector(".task-message")) {
          const body = document.querySelector("body");
          let taskMessage = document.querySelector(".task-message");
          body.removeChild(taskMessage);
        }

        // 提示任务当前操作
        this.$message({
          message: msg,
          duration: 4000,
          type: type,
          showClose: true
        });
      },

      taskClick(item) {
        /**
         * 当前选中的任务改变(高亮任务默认被勾选)
         * @param item {Object}: 当前任务
         */
        if(!item.routeInfoList.length) {
          this.$message.error('该任务未关联线路');
          return;
        }
        if(!item.checked){
          // 之前未勾选的现在勾选上
          item.checked = true;
          this.checkedTaskArr.push(item);
          const route = item.routeInfoList ? item.routeInfoList[0] : '';
          route && mapDraw.drawLineAndPoint(route);                                // 绘制主线
//          const beforeLicensePlate = item.beforeLicensePlate || '匿名车牌';
//          route && mapDraw.drawLineAndPoint(route, false, beforeLicensePlate);

        }
        this.activeTaskId = item.taskId;
        this.executeTaskId = item.executeTaskId;
        this.routePointList = item.routeInfoList[0].routePointList;
        this.setVuex_taskId({
          taskId:  this.activeTaskId,
          executeTaskId: this.executeTaskId
        });
//        console.log('taskList taskId=' + item.taskId);
        this.$emit('active-task-change', this.routePointList);

        // 中心点定位为当前激活线路
        if(!item.strArea) return;                                        // 地图对象不存在
        let geo = (typeof item.strArea == 'string') ? JSON.parse(item.strArea) : item.strArea;
        geo.type = 'polyline';
        window.map.setLayerExtent(geo);                                  // 图形显示在当前地图视图范围内
      },

      clearPrevCheckedRouteDraw() {
        /**
         * taskList变动时, 清除上一次地图绘制的所有图层
         */
        this.checkedTaskArr.forEach(i => {                                 // 清除执行任务模块中绘制的主线（图层id带线路标识：routeId_layer_line、routeId_layer_point_pass......）
          const routeId = i.routeInfoList[0].routeId;
          mapDraw.clearAllDraw(routeId);
        });
        this.checkedTaskArr = [];
        mapDraw.clearAllDraw();                                            // 清除线路模块中的线路（图层id不带线路标识：layer_line、layer_point_pass......）
      },

      checkedChange(item) {
        /**
         * 复选框勾选(选中的直接绘制线，默认是绘制冲突的线，手动勾选可自由控制显示那几条线路)
         * @param item {Object}： 当前操作的任务
         */
        this.clearPrevCheckedRouteDraw();                                            // 清除上一次所有的主线绘制（上一次勾选的主线）

        item.checked = !item.checked;
        let checkedTaskArr = [];
        this.executeTaskList.forEach(i => {                                          // 重设勾选项，重新绘制
          if(i.checked && i.routeInfoList.length) {
            checkedTaskArr.push(i);
            const route = i.routeInfoList ? i.routeInfoList[0] : '';
            route && mapDraw.drawLineAndPoint(route);                               // 绘制主线
          }
        });
        this.checkedTaskArr = checkedTaskArr;

        if(!item.checked) {
          // 取消勾选
          mapDraw.clearPoint_car(item.routeInfoList[0].routeId);                     // 清除动画小车
          if(item.taskId == this.activeTaskId) {                                     // 当前取消的项 == 高亮选中项
            this.activeTaskId = '';
            this.executeTaskId = '';
            this.routePointList = [];
          }
        }else {
          // 勾选当前项
          this.activeTaskId = item.taskId;
          this.executeTaskId = item.executeTaskId;
        }
        this.setVuex_taskId({
          taskId: this.activeTaskId,
          executeTaskId: this.executeTaskId
        })
      },

      addRouteHL(item) {
        /**
         * 线路高亮
         */
        if(!item.routeInfoList.length) return;
        mapDraw.addRouteHL(item.routeInfoList[0]);
      },

      removeRouteHL() {
        /**
         * 移除线路高亮
         */
        mapDraw.removeRouteHL();
      },

      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         */
        const ht = document.documentElement.offsetHeight;
        const minHt = 720;                                               // 能显示5条的最小高度，高度临界点最小值
        this.isLowResolution = ht < minHt  ? true : false;               // 是否为低分辨率显示（左侧任务列表正常显示5条就滚动, 小分辨率的4条即滚动）

        if(this.isLowResolution) {
          // 低分辨率
          let maxLen = 4;                                                // 最多显示4条就滚动
          if(this.isPreview) maxLen = 3;                                 // 预演比监测少一条数据，因为预演多了一个动画控制占据了一条数据的高度（动画控制不包含在滚动容器里）
          // 低分辨显示时，4条即滚动，<4条的滚动容易高度根据当前条数设置
          if(this.executeTaskList.length < maxLen) {
            this.scrollerHt = this.executeTaskList.length * 90 + 10+ 'px';
          }else{
            // 区分预演和监测
            if(this.isPreview) {
              this.scrollerHt = '269px';
            }else {
              this.scrollerHt = '354px';
            }
          }
        }else {
          // 高分辨率
          let maxLen = 5;                                                // 最多显示5条就滚动
          if(this.isPreview) maxLen = 4;                                 // 预演比监测少一条数据，因为预演多了一个动画控制占据了一条数据的高度（动画控制不包含在滚动容器里）
          // 高分辨显示时，5条即滚动，<5条的滚动容易高度根据当前条数设置
          if(this.executeTaskList.length < maxLen) {
            this.scrollerHt = this.executeTaskList.length * 90 + 10 + 'px';
          }else{
            // 区分预演和监测
            if(this.isPreview) {
              this.scrollerHt = '358px';
            }else {
              this.scrollerHt = '443px';
            }
          }
        }
      },
    }
  }
</script>

<style scoped>
  .task-list>li .task-name{padding:1px 0;}
  .ic-ckb-box{float:left;padding:1px 5px 0 0;height:16px;margin-right:4px;}
  .license-plate{color:#5093e1;}
</style>

