<!-- 方案管理：方案预演 -->
<template>
  <div>
    <!-- 日历按钮 -->
    <i title="查看近一月方案" class="ic2 ic-calendar"
       v-show="!showLayerProgress"
       :class="{active: showLayerCalendar}"
       @click="showLayerCalendar = !showLayerCalendar"></i>

    <!-- 任务执行进度 -->
    <i title="任务执行进度" class="ic2 ic-task-progress"  :class="{active: showLayerProgress}"  @click="showLayerProgress = !showLayerProgress">
      <span class="count">{{taskLen}}</span>
    </i>

    <!-- 地图 -->
    <enjoyor-map class="enjoyor-map"
                 v-show="!showLayerProgress"
                 :toolbar="{layerSearch: true, layerSwitch: true, measutre: true, zoom: true, reset: true, clear: true}"></enjoyor-map>

    <!-- *** 浮层：预演动画 *** -->
    <layer-animation
                     :clashArr="clashArr"
                     :rout="rout"
                     :state="state"
                     @percent-change="animationPercentChange"
                     @speed-change="animationSpeedChange"
                     @state-change="animationStateChange"></layer-animation>

    <!-- *** 浮层：任务list *** -->
    <layer-executive-task-list
                     :isPreview="true"
                     :previewDate="previewDate"
                     @set-clash="setClash"
                     @checked-task-change="checkedTaskChange"
                     @active-task-change="activeTaskChange"
                     @set-tasklen="setTaskLen"
                     @animation-reset="animationReset"></layer-executive-task-list>

    <!-- *** 浮层：线路list *** -->
    <layer-route-list :taskIsStart="this.state != 'stop'"
                      :showLayerRltPost="showLayerRltPost"
                      :showLayerRltDevice="showLayerRltDevice"
                      :isCanChangeRoute="true"
                      @route-type-change="routeTypeChange"
                      @route-click="routeClick"
                      @show-route-rltInfo="showRouteRltInfo"></layer-route-list>

    <!-- *** 浮层：实时视频、信号机 *** -->
    <layer-device :isShow="isShowActiveInfo"
                  :serverPush_videoList="serverPush_videoList"
                  :serverPush_signList="serverPush_signList"></layer-device>

    <!-- *** 浮层：查看/编辑线路 *** -->
    <layer-edit-route :isShow="showLayerEditRoute"
                      @close="showLayerEditRoute = false"></layer-edit-route>

    <!-- *** 浮层：线路布岗 *** -->
    <layer-rlt-post :isShow="showLayerRltPost"
                    @close="showLayerRltPost = false"></layer-rlt-post>

    <!-- *** 浮层：关联设备 *** -->
    <layer-rlt-device :isShow="showLayerRltDevice"
                      @close="showLayerRltDevice = false"></layer-rlt-device>

    <!-- *** 浮层：日历（按月查看方案）*** -->
    <layer-calendar :isShow="showLayerCalendar"
                    @close="showLayerCalendar = false"></layer-calendar>

    <!-- *** 浮层：当前选中的任务途径点进度条 *** -->
    <layer-route-progress :isShow="isShowActiveInfo"
                          :isStart="isShowActiveInfo"
                          :routePointList="routePointList"
                          :serverPush_pointInfo="serverPush_pointInfo"></layer-route-progress>

    <!-- *** 浮层：所有执行任务进度条 *** -->
    <layer-task-progress  style="top:3px;"
                          :isShow="showLayerProgress"
                          :date="previewDate"></layer-task-progress>

    <!-- *** 浮层：任务执行记录 *** -->
    <layer-executive-log :isShow="showLayerExecutiveLog"
                         :serverPush_warnInfo="serverPush_warnInfo"></layer-executive-log>
  </div>
</template>

<script>
  import EnjoyorMap from '@components/map/Map';
  import LayerCalendar from '@components/layer/adminScheme_Calendar';
  import LayerDevice from '@components/layer/monitorScheme_Device';
  import LayerAnimation from '@components/layer/adminScheme_Animation';
  import LayerRouteProgress from '@components/layer/adminScheme_RouteProgress';
  import LayerRouteList from '@components/layer/adminScheme_RouteList';
  import LayerExecutiveLog from '@components/layer/monitorScheme_ExecutiveLog';
  import LayerEditRoute from '@components/layer/adminScheme_EditRoute';
  import LayerRltPost from '@components/layer/adminScheme_RltPost';
  import LayerRltDevice from '@components/layer/adminScheme_RltDevice';
  import LayerExecutiveTaskList from '@components/layer/adminScheme_ExecutiveTaskList';
  import LayerTaskProgress from '@components/layer/monitorScheme_TaskProgress';

  import filters from '@js/filters';
  import mapSetting from '@tools/map-setting';
  import mapDraw from '@tools/map-draw';
  import common from '@tools/common';
  import { mapState, mapMutations } from 'vuex';

  export default {
    components: {
      EnjoyorMap,                                          // 模块：地图
      LayerCalendar,                                       // 模块：日历
      LayerDevice,                                         // 模块：设备
      LayerAnimation,                                      // 模块：动画
      LayerRouteProgress,                                  // 模块：线路进度
      LayerRouteList,                                      // 模块：线路列表
      LayerExecutiveLog,                                   // 模块：执行记录
      LayerRltPost,                                        // 模块：关联岗位
      LayerRltDevice,                                      // 模块：关联设备
      LayerEditRoute,                                      // 模块：线路编辑
      LayerExecutiveTaskList,                              // 模块：执行任务列表
      LayerTaskProgress                                    // 模块：执行任务进度
    },
    data() {
      return {
        showLayerRltPost:false,                            // 是否显示关联岗位layer
        showLayerRltDevice:false,                          // 是否显示关联设备layer
        showLayerEditRoute:false,                          // 是否显示关联线路layer
        showLayerExecutiveLog: false,                      // 是否显示任务执行记录
        showLayerProgress: false,                          // 是否显示任务执行进度
        showLayerDevice: false,                            // 是否显示设备层（信号机和设备）
        showLayerCalendar: false,                          // 是否显示日历层
        taskLen: 0,

        previewDate: '',                                   // 预演日期
        activeRouteId: '',                                 // 当前选中高亮的线路id
        routePointList: [],                                // 当前选中高亮的线路途径点list

        checkedTaskArr: [],                                // 所有勾选的任务集(默认为冲突的任务, 从TaskList组件回调里取)
        clashArr: [],                                      // 冲突段百分比

        state: 'stop',                                     // 预演动画状态（暂停suspend/播放start/停止stop ，默认停止stop状态）
        rout: 0,                                           // 预演动画百分比进度
        times: 1,                                          // 预演动画播放倍数

        routFlag: 0,                                       // 当前手动控制的百分比基数
        serverPush_pointInfo: '',                          // 推送的实时线路进度
        serverPush_videoList: '',                          // 推送的实时设备信息
        serverPush_signList: '',                           // 推送的实时设备信息
        serverPush_warnInfo: '',                           // 推送的实时报警信息
      };
    },
    computed: {
      ...mapState([
        'routePath',
        'mapLoaded',
        'taskId',
        'routeId',
        'serverPush',
        'countPreviewStatusChange'
      ]),
      isShowActiveInfo() {
        /**
         * 是否显示当前高亮的任务实时线路、设备信息: 仅在预演进行中(state == 'start' || 'suspend'时)、且有任务被高亮激活时才显示
         */
        const flag = this.state != 'stop' && this.taskId;
        return flag ;
      }
    },
    watch: {
      countPreviewStatusChange() {
        /**
         * 根据计数来确定是否需要重置预演
         */
        this.state = 'stop';
        this.rout = 0;
        this.serverPush_pointInfo = '';
        this.ajaxStartPreview('stop');
      },
      routeId() {
        /**
         * 选中高亮线路变化（当选中的是主执线路时，需要更新推送信息）
         */
        this.activeRouteId = this.routeId;

        // 更新点位消息推送
        let serverPush_pointInfo = {
          percent: 0,
          arrivedPointIdx: 0,
          speed: 0,
          restLength: 0,
          x: '',
          y: ''
        };
        if(this.serverPush && this.serverPush[this.activeRouteId] && this.serverPush[this.activeRouteId].pointInfo) {
          serverPush_pointInfo = this.serverPush[this.activeRouteId].pointInfo;
        };
        this.serverPush_pointInfo = serverPush_pointInfo;


        // 更新视频设备消息推送
        let serverPush_videoList = [
          {
            manageId: '',
            deviceName: ''
          },{
            manageId: '',
            deviceName: ''
          }
        ];
        if(this.serverPush && this.serverPush[this.activeRouteId] && this.serverPush[this.activeRouteId].video) {
          serverPush_videoList = this.serverPush[this.activeRouteId].video;
        };
        this.serverPush_videoList = serverPush_videoList;

        // 更新信号机设备消息推送
        let serverPush_signList = [];
        for(let i=0; i<8; i++) {
          serverPush_signList.push({
            manageId: '',
            deviceName: ''
          })
        }
        if(this.serverPush && this.serverPush[this.activeRouteId] && this.serverPush[this.activeRouteId].sign) {
          serverPush_signList = this.serverPush[this.activeRouteId].sign;
        };
        this.serverPush_signList = serverPush_signList;

      },
      checkedTaskArr() {
        /**
         * 勾选的执行任务改变时，若正在预演中，则需要绘制勾选任务下的动画小车(小车坐标位置从保存的推送结果里拿)
         */
        if(this.state != 'stop') {
          this.checkedTaskArr.forEach(task => {
            const routeId = task.routeInfoList[0].routeId;
            const beforeLicensePlate = task.beforeLicensePlate || '匿名车牌';
            let pointInfo = {
              x: task.routeInfoList[0].routePointList[0].pointX,
              y: task.routeInfoList[0].routePointList[0].pointY
            };
            if(this.serverPush && this.serverPush[routeId] && this.serverPush[routeId].pointInfo) {
              pointInfo = this.serverPush[routeId].pointInfo;
            }
            mapDraw.drawPoint_car(pointInfo, routeId,  beforeLicensePlate);
          });
        }
      }
    },
    filters: {
      getShortTime: filters.getShortTime                                          // 取 hh:mm (eg:2018-08-05 12:00:00 -> 12:00)
    },
    beforeRouteEnter (to, from, next) {
      /**
       * 路由跳转时不会触发子组件mounted方法，故用路由钩子解决,这里需要延迟下等待map加载
       */
     next(vm => {
       const startDate = vm.$route.query.startDate;
       const endDate = vm.$route.query.endDate;
       if(startDate && startDate == endDate){                                     // 当前查询时间为具体某一天时，无需重新弹日历层选日期, 直接按地址栏起止日期查询
         vm.previewDate = startDate;
         vm.setVuex_previewDate(startDate);
       }else{
         vm.showLayerCalendar = true;
       }
     })
   },
    mounted() {
      if(!this.mapLoaded) {
        this.$mapLoaded().then(res => {                                           // 图层加载完后， 才能操作地图图层
          this.setVuex_mapLoaded(true);
        })
      }

      this.ajaxWebsocketSwitch(this).then(res => {
        this.ajaxStartPreview('stop');                                            // 刷新时先结束上一次线程
        this.setVuex_serverPush();
      })
    },
    methods: {
      ...mapMutations([
        'setVuex_mapLoaded',
        'setVuex_previewDate',
        'setVuex_serverPush',
      ]),
      // *** ajax start ***
      ajaxWebsocketSwitch(ts) {
        /**
         * websocket 推送绑定
         */
        return new Promise((resolve, reject) => {
          let serverPushId =  localStorage.getItem('serverPushId');
          if(!serverPushId) {
            serverPushId = `${common.lpobj.getRan(1000000)}_${new Date().getTime()}`;
            localStorage.setItem('serverPushId', serverPushId)
          };
          window.ServerPush.unlisten(serverPushId);
          window.ServerPush.receive(serverPushId, function(data){
            ts.updateInfoByServerPush(data);                                      // 保存最新推送数据
          });
          resolve({msg: 'websocket已准备就绪！', serverPushId: serverPushId});
        });
      },
      ajaxStartPreview(state, isRout = false) {
        /**
         * 预演开始、暂停、结束等预演参数改变时调用
         * @param state {String}:         预演状态（stop、 start、suspend）
         */

        const serverPushId = localStorage.getItem('serverPushId') || false;
        if(!serverPushId) {
          this.$message.error('预演参数获取异常，请尝试刷新');
          return;
        };
        const apiName = `${config.baseUrl_HOST}${this.$api.getPushServer_GET}`;
        const params = {
          state: state,                                                           // 预演状态（start、 stop、 suspend）
          date: this.previewDate,                                                 // 预演开始日期(默认为预演一天的方案，故无需设置结束日期)
          rout: (this.rout/100).toFixed(2),                                       // 预演总进度（传入的是0~1的小数）
          times: this.times,                                                      // 预演倍数
          browserId: serverPushId,                                                // 线程标识
          isrout: isRout                                                          // 是否拖动百分比
        };

        // 手动点击预演的开始、暂停、结束按钮时
        return this.$http.get(apiName, params)
          .then(r => {
             if(state == 'stop') {
                // 重置进度
                this.rout = 0;
                this.serverPush_pointInfo = '';
                mapDraw.clearPoint_car();                                         // 清除所有的动画小车

             }else if(state == 'start' && this.rout == 0) {
              this.checkedTaskArr.forEach(task => {                               // 预演动画进行中:所有已勾选的任务需要在主线起点绘制小车等待预演
                  const routeId = task.routeInfoList[0].routeId;
                  const beforeLicensePlate = task.beforeLicensePlate || '匿名车牌';
                  const pointInfo = {
                    x: task.routeInfoList[0].routePointList[0].pointX,
                    y: task.routeInfoList[0].routePointList[0].pointY
                  };
                  mapDraw.drawPoint_car(pointInfo, routeId,  beforeLicensePlate);
              })
            }
        })
      },
      // *** ajax end ***

      updateInfoByServerPush(data) {
        /**
         * 根据推送信息更新页面数据
         * @param data {Object}: 推送数据
         */
//        console.log('推送消息');
//        console.log(data);
        if(data.rout){
          // 所有执行任务的百分比总进度推送（无需匹配线路）
          const new_routFlag = data.rout_flag;                                    // 百分比flag(用于手动拖动百分比防止推送过来的百分比覆盖推送后的百分比造成混乱或者百分比乱跳)
          if(new_routFlag == this.routFlag) {
            const rout = (data.rout * 100).toFixed(2);
            this.rout = rout;
          };

        }else {
          this.saveServerPushInfo(data);                                          // 每个执行任务对应的推送消息需要匹配线路,并做临时储存
        };
      },

     saveServerPushInfo(data) {
       /**
        * 保存每条线路最新一条推送信息，并存起来（存缓存里？不能吧，一刷上一次线程都停掉了，不需要保留推送记录的吧？那就存vuex或者全局window上）
        */
       let serverPush = this.serverPush || {};
       for(let routeId in data) {
         // 每次推送过来都是某一条线路的数据
         serverPush[routeId] = serverPush[routeId] || {};
          if(data[routeId].percent) {
            // pointInfo {Object} 点位定位信息（包括途径点信息）
            this.checkedTaskArr.forEach(task => {
              const routeId = task.routeInfoList[0].routeId;
              if (data[routeId] && data[routeId].x && routeId.indexOf(routeId) != -1) mapDraw.drawPoint_car(data[routeId], routeId, task.beforeLicensePlate || '未知号牌');
            });

            serverPush[routeId].pointInfo = {
              percent:  parseFloat(data[routeId].percent)*100,
              arrivedPointIdx: data[routeId].arrivedPointIdx || 0,
              speed: data[routeId].speed || 0,
              restLength: Number(data[routeId].restlength) || 0 ,
              x: data[routeId].x,
              y: data[routeId].y
            };

            if(routeId.indexOf(this.activeRouteId) != -1) this.serverPush_pointInfo = serverPush[routeId].pointInfo; // 当前激活的任务点位信息

          }else if(data[routeId].cameradevice) {
            // video {Array} 视频信息
            let videoList = data[routeId].cameradevice;                           // 存 最近一条视频信息推送
            if(videoList.length == 1) {
              videoList.push({
                manageId: '',
                deviceName: ''
              })
            }
            serverPush[routeId].video = videoList;
            if(routeId.indexOf(this.activeRouteId) != -1) {
              this.serverPush_videoList = serverPush[routeId].video;
            }

          }else if(data[routeId].beforedevice || data[routeId].afterdevice) {
            // sign {Array} 信号机信息
            let signList = [];
            const beforeSignList = data[routeId].beforedevice;                    // 信号机前4个
            if(beforeSignList){
              for(let i=0; i<4; i++){
                if(i<beforeSignList.length){
                  signList[i] = beforeSignList[i];
                }else{
                  signList[i] = {
                    manageId: '',
                    deviceName: ''
                  }
                }
              }
            }
            const afterSignList = data[routeId].afterdevice;                      // 信号机后4个
            if(afterSignList){
              for(let i=0; i<4; i++) {
                if(i<afterSignList.length){
                  signList[i+4] = afterSignList[i];
                }else{
                  signList[i+4] = {
                    manageId: '',
                    deviceName: ''
                  }
                }
              }
            }
            serverPush[routeId].sign = signList;                                  // 存 最近一条信号机信息推送
            if(routeId.indexOf(this.activeRouteId) != -1) {
              this.serverPush_signList = serverPush[routeId].sign;
            }

          }else if(data[routeId].clash) {
            // clash {Object} 报警信息
            serverPush[routeId].clash = clash;
            this.showLayerExecutiveLog = true;
            console.log(data[routeId].clash);
            this.serverPush_warnInfo = serverPush[routeId].clash;
          };
         this.setVuex_serverPush(serverPush);
       }
     },

      setClash(clashArr) {
        /**
         * 设置冲突段
         * @param clashArr {Array} 冲突段数组
         */
        this.clashArr = clashArr;
      },

      animationReset(previewDate) {
        /**
         * 重置预演动画(此时无需调用停止预演的接口，因为给state赋值后就会触发animationStateChange()，最终还是会调用停止预演的接口，这里不主动调用是为不重复请求)
         * @param  previewDate {String}: 预演日期
         */
        this.state = 'stop';
        this.rout = 0;
        this.serverPush_pointInfo = '';
        this.previewDate = previewDate;
      },

      animationPercentChange(percentNum) {
        /**
         * 动画百分比改变
         * @param  percentNum {Number}: 动画百分比（乘以100后的）
         */
        this.routFlag = (percentNum/100).toFixed(2);    // 当前手动修改的百分比值（和推送过来的routeFlag对比作为是否接收推送数据的依据）
        this.rout = percentNum;
        if(this.state == 'start') {
          this.ajaxStartPreview('start', true)
        }
      },

      animationSpeedChange(speed) {
        /**
         * 动画倍数改变
         * @param speed {Number}: 动画倍率
         */
        this.times = speed;
        (this.state == 'start' && this.ajaxStartPreview('start'));
      },

      animationStateChange(state) {
        /**
         * 动画状态改变
         * @param state {String}: 动画状态
         */
        this.state = state;
        this.ajaxStartPreview(state);
      },

      checkedTaskChange(checkedTaskArr) {
        /**
         * 勾选的任务改变，改变接受的推送数据
         * @param checkedTaskArr{Array} : 当前勾选的任务
         */
        this.checkedTaskArr = checkedTaskArr;
      },

      activeTaskChange(routePointList) {
        /**
         * 高亮选中的任务改变, 更新线路进程中线路途径点list
         * @param routePointList {Array} : 当前高亮激活的线路途径点list
         */
        this.routePointList = routePointList;
      },

      routeClick(obj) {
        /**
         * 点击切换线路
         * @param obj {Object}: 当前操作的线路信息（包含当前点击操作类型：单击选中，双击编辑）
         * @param obj.routeInfo {Object}:        当前选中高亮的线路信息
         * @param obj.isDoubleClick {Boolean}:   当前是否为双击操作（单机选中，双击编辑/查看线路）
         * @param obj.isEdit {Boolean}:          当前是否为编辑状态（编辑状态需要绘制线路，非编辑状态仅仅是滑过高亮，无法绘制？）
         */

        this.activeRouteId = obj.routeInfo.routeId;
        if(obj.isDoubleClick){
          // 双击查看线路详情
          this.showLayerEditRoute = true;
          this.showLayerRltPost = false;
          this.showLayerRltDevice = false;
        }
      },

      routeTypeChange(routeId) {
        /**
         * 选中高亮的任务下主执线路改变（改变后需要重新刷新查询日所有方案下的任务list、线路list）
         * 预演进行中则需要停止预演，重新开始
         * @param routeId {String}: 当前选中的高亮的主线路
         */
        this.activeRouteId = routeId;
        if(this.state != 'stop'){
          this.ajaxStartPreview('stop');
        }
      },

      showRouteRltInfo(rltInfo){
        /**
         * 显示当前选中高亮的线路关联的图层信息（关联岗位、设备等）
         * @param rltInfo {Object}:          关联图层信息
         * @param rltInfo.type {String}:     关联图层类型 post：岗位， video:视频， sign:信号机， device:设备（视频、信号机统称）
         * @param rltInfo.routeId {String}:  当前选中高亮的线路id
         */
        if(rltInfo.type == 'post'){
          this.showLayerRltPost = !this.showLayerRltPost;
          if(this.showLayerRltPost) this.showLayerRltDevice = false;
        }else{
          this.showLayerRltDevice = !this.showLayerRltDevice;
          if(this.showLayerRltDevice) this.showLayerRltPost = false;
        }
      },

      setTaskLen(len) {
        /**
         * 统计当前有几条执行任务
         * @param len {Number} 当前执行任务条数
         */
        this.taskLen = len;
      }
    }
  }
</script>

<style scoped>
  /* 组件私有样式 */
  .ic-calendar,.ic-task-progress{position:absolute;top:-25px;left:140px;z-index:3;}
  .ic-task-progress{position:absolute;left:165px;z-index:3;}
  .enjoyor-map{position:absolute;top:-30px;left:0;right:0;bottom:0;}
</style>
