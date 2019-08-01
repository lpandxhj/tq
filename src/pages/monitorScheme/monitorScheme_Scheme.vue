<!-- 特勤监测：方案 -->
<template>
  <div v-loading.fullscreen="showLoading">
    <!-- 顶部操作条：切换方案、查看任务进度、查看7天待执行方案 -->
    <top-bar :taskLen="taskLen"
            @show-executive-log="showExecutiveLog"
            @show-one-week-scheme="showOneWeekScheme"
            @show-task-progress="showTaskProgress"></top-bar>

    <!-- 地图 -->
    <enjoyor-map v-show="!showLayerTaskProgress"
                 :toolbar="{layerSearch: true, layerSwitch: true, measutre: true, zoom: true, reset: true, clear: true}"></enjoyor-map>

    <!-- 任务信息 -->
    <div class="task">
        <!-- ***浮层：任务list *** -->
        <layer-executive-task-list
                         :serverPushId="serverPushId"
                         @set-tasklen="setTaskLen"
                         @checked-task-change="checkedTaskChange"
                         @active-task-change="activeTaskChange"></layer-executive-task-list>

        <!-- *** 浮层：线路list *** -->
        <layer-route-list :taskIsStart="activeTaskIsStart"
                          :showLayerRltPost="showLayerRltPost"
                          :showLayerRltDevice="showLayerRltDevice"
                          :isCanChangeRoute="true"
                          @route-click="routeClick"
                          @show-route-rltInfo="showRouteRltInfo"></layer-route-list>
    </div>

    <!-- *** 浮层：查看一周待执行任务 *** -->
    <layer-one-week-scheme :isShow="showLayerOneWeekScheme"
                           :serverPush="serverPushExecutiveLog"></layer-one-week-scheme>


    <!-- *** 浮层：任务执行记录 *** -->
    <layer-executive-log :isShow="showLayerExecutiveLog"></layer-executive-log>

    <!--（警员、信号机、视频）-->
    <div class="task-layers-info slide-left" :class="{active: isShowActiveInfo}">
        <!-- 关联设备、警员数量及在线状态 统计 -->
        <ul class="box-shadow layer-count">
          <li class="ic3 ic-count-police" :class="{'active':checkedLayer == 'police'}" @click="layerToggle('police')"
              title="警力资源"><i>25</i>/30
          </li>
          <li class="ic3 ic-count-video" :class="{'active':checkedLayer == 'video'}" @click="layerToggle('video')"
              title="视频监控"><i>5</i>/18
          </li>
          <li class="ic3 ic-count-sign" :class="{'active':checkedLayer == 'sign'}" @click="layerToggle('sign')"
              title="信号设备"><i>1</i>/20
          </li>
        </ul>

        <!-- ***浮层：查看/编辑线路*** -->
        <layer-edit-route style="top:48px;"
                          :isShow="showLayerEditRoute"
                          @close="showLayerEditRoute = false"></layer-edit-route>

        <!-- *** 浮层：关联岗位及警员 *** -->
        <layer-rlt-police style="top:48px;"
                          :isShow="showLayerRltPost"
                          @close="showLayerRltPost = false"></layer-rlt-police>

        <!-- *** 浮层：关联设备 *** -->
        <layer-rlt-device style="top:48px;"
                          :isShow="showLayerRltDevice"
                          :activeTab="checkedLayer"
                          :retSetScrollHt="true"
                          @tab-change="deviceTabChange"
                          @close="showLayerRltDevice = false"></layer-rlt-device>

        <!-- *** 浮层：当前选中的 正在执行的任务 视频、信号机实时动态 *** -->
        <layer-device style="top:48px;"
                          :isShow="true"
                          :isCheckDevice="true"
                          :serverPush_videoList="serverPush_videoList"
                          :serverPush_signList="serverPush_signList"></layer-device>
    </div>

    <!-- ***浮层：当前选中的任务途径点进度条 *** -->
    <layer-route-progress :isShow="isShowActiveInfo"
                          :routePointList="routePointList"
                          :serverPush_pointInfo="serverPush_pointInfo"></layer-route-progress>

    <!-- *** 浮层：所有执行任务进度条 *** -->
    <layer-task-progress style="top:33px;" :isShow="showLayerTaskProgress"></layer-task-progress>
  </div>
</template>

<script>
  import EnjoyorMap from '@components/map/Map';
  import TopBar from '@components/layer/monitorScheme_TopBar';
  import LayerOneWeekScheme from '@components/layer/monitorScheme_OneWeekScheme';
  import LayerDevice from '@components/layer/monitorScheme_Device';
  import LayerEditRoute from '@components/layer/adminScheme_EditRoute';
  import LayerRltDevice from '@components/layer/adminScheme_RltDevice';
  import LayerRltPolice from '@components/layer/monitorScheme_RltPolice';
  import LayerRouteList from '@components/layer/adminScheme_RouteList';
  import LayerExecutiveLog from '@components/layer/monitorScheme_ExecutiveLog';
  import LayerRouteProgress from '@components/layer/adminScheme_RouteProgress';
  import LayerExecutiveTaskList from '@components/layer/adminScheme_ExecutiveTaskList';
  import LayerTaskProgress from '@components/layer/monitorScheme_TaskProgress';

  import filters from '@js/filters';
  import {mapState, mapMutations} from 'vuex';
  import mapDraw from '@tools/map-draw';
  import common from '@tools/common';

  export default {
    components: {
      EnjoyorMap,
      TopBar,
      LayerOneWeekScheme,
      LayerDevice,
      LayerEditRoute,
      LayerRltDevice,
      LayerRltPolice,
      LayerRouteList,
      LayerExecutiveLog,
      LayerRouteProgress,
      LayerExecutiveTaskList,
      LayerTaskProgress
    },
    data() {
      return {
        showLoading: false,
        showLayerExecutiveLog: false,       // 是否显示执行记录列表
        showLayerOneWeekScheme: false,      // 是否显示一周待执行方案
        showLayerTaskProgress: false,       // 是否显示一周待执行方案
        activeTaskIsStart: false,           // 当前高亮激活的任务是否已经开始监测（通过选中的taskId的state状态去判断）
        showLayerRltPost: false,            // 是否显示关联岗位layer
        showLayerRltDevice: false,          // 是否显示关联设备layer
        showLayerEditRoute:false,           // 是否显示关联线路layer
        layerPoliceShow: false,             // 显示缓冲区警力图层
        layerVideoShow: false,              // 显示缓冲区视频图层
        layerSignShow: false,               // 显示缓冲区信号机图层
        isLowResolution: false,             // 是否为低分辨率展示(任务列表滚动容器高度随着分辨率不同而不同、关联设备警员等列表分页条数和也分辨率相关)
        taskLen: 0,                         // 当前执行任务条数

        checkedLayer: '',                   // 所有勾选的任务集(默认勾选第一个, 从vuex中取TaskList)
        routePointList: [],                 // 当前选中高亮的线路途径点list

        serverPushId: '',                   // 线程标识
        serverPush_videoList: '',
        serverPush_signList: '',
        serverPushExecutiveLog: '',         // 任务执行记录
        serverPush_pointInfo: ''  ,

        state: 'stop',                      // 当前任务是否开始执行
      };
    },
    computed: {
      ...mapState([
        'schemeId',
        'taskId',
        'routeId'
      ]),
      isShowActiveInfo() {
        /**
         * 是否显示当前高亮的任务实时线路、设备信息: 只有在选中任务开始后才有显示
         */
        const flag = this.taskId;
        return flag;
      }
    },
    watch: {
    },
    filters: {
      getShortTime: filters.getShortTime   // 自定义过滤器：从长的日期格式中截取后半段具体时间（eg:2018-08-05 12:00:00 -> 12:00:00）
    },
    mounted() {
      this.ajaxWebsocketSwitch(this).then(res => {
        this.setVuex_serverPush();
      })
    },
    methods: {
      ...mapMutations([
        'setVuex_taskId',
        'setVuex_serverPush'
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
            ts.saveServerPushInfo(data);                                      // 保存最新推送数据
          });
          resolve({msg: 'websocket已准备就绪！', serverPushId: serverPushId});
        });
      },
      // *** ajax end ***

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
            let videoList = data[routeId].cameradevice;   // 存 最近一条视频信息推送
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
//            console.log('视频来了,routeid='+routeId)
//            console.log( data[routeId].cameradevice)

          }else if(data[routeId].beforedevice || data[routeId].afterdevice) {
            // sign {Array} 信号机信息
            let signList = [];
            const beforeSignList = data[routeId].beforedevice;        // 前4个
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
            const afterSignList = data[routeId].afterdevice;          // 后4个
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
            serverPush[routeId].sign = signList;                      // 存 最近一条信号机信息推送
            if(routeId.indexOf(this.activeRouteId) != -1) {
              this.serverPush_signList = serverPush[routeId].sign;
            }
//            console.log('信号机来了')
//            console.log( serverPush[routeId].sign)

          }else if(data[routeId].clash) {
            // clash {Object} 报警信息
            serverPush[routeId].clash = clash;
          }
          this.setVuex_serverPush(serverPush);
        }
      },
      routeClick(obj) {
        /**
         * 点击切换线路
         * @param obj {Object}: 当前操作的线路信息（包含当前点击操作类型：单击选中，双击编辑）
         * @param obj.routeInfo {Object}:        当前选中高亮的线路信息
         * @param obj.isDoubleClick {Boolean}:   当前是否为双击操作（单机选中，双击编辑/查看线路）
         */
        if(obj.isDoubleClick){
          // 双击查看线路详情
          this.showLayerEditRoute = true;
          this.showLayerRltPost = false;
          this.showLayerRltDevice = false;
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
      layerToggle(layerName) {
        // 控制业务图层列表显示
        this.checkedLayer = this.checkedLayer == layerName ? '' : layerName;
        if(layerName == 'police') {
          this.showLayerRltDevice = false;
          this.showLayerRltPost = true;
        }else{
          this.showLayerRltDevice = true;
          this.showLayerRltPost = false;
        }
      },
      deviceTabChange(checkedLayer) {
        /**
         * tab选项卡切换
         * @param checkedLayer {String}: 当前选中的tab页卡
         */
        this.checkedLayer = checkedLayer;
      },
      checkedTaskChange(checkedTaskArr) {
        /**
         * 勾选的任务改变，改变接受的推送数据
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
      showExecutiveLog(flag) {
        /**
         * 是否显示可执行记录
         */
        this.showLayerExecutiveLog = flag;
      },
      showOneWeekScheme(flag) {
        /**
         * 是否显示一周待执行方案
         */
        this.showLayerOneWeekScheme = flag;
      },
      showTaskProgress(flag) {
        /**
         * 是否查看所有执行任务进度
         */
        this.showLayerTaskProgress = flag;
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
  .task-layers-info{position:absolute;top:40px;bottom:0;width:300px;color:#727d86;}
  .layer-count{border-radius:4px 0 0 4px;display:flex;margin-bottom:6px;}
  .layer-count li{flex:1;color:#aaa;line-height:20px;}
  .layer-count li i{font-size:16px;margin-left:10px;}
  .layer-count-police i{color:#4296ee;}
  .layer-count-video i{color:#fe7c26;}
  .layer-count-sign i{color:#f44088;}
  .layer-count li:hover{cursor:pointer;}
  .btn-task .cut-line::after{margin:0 0 0 4px;top:-2px;}
</style>
