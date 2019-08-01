import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
  state:{
    routePath:'/scheme',                    // 路由：当前路由路径
    schemeId:'',                            // 方案：当前方案id
    
    taskId:'',                              // 任务：当前任务id
    executeTaskId:'',                       // 任务：当前执行任务id
    taskList:[],                            // 任务：可执行任务list（预演、监测页都指代可执行任务）
    taskInfo:'',                            // 任务：当前任务信息
    countTaskListChange: 0,                 // 任务：taskList 刷新次数， 次数更新时控制任务list刷新
    
    routeId:'',                             // 线路：当前路线id
    editRouteId: '',                        // 线路：新增or修改的线路id(新增：''，修改：当前激活的routeId)
    countRouteListChange: 0,                // 线路：routeList 刷新次数，次数更新时控制线路list刷新
  
    previewDate: '',
    countExecuteTaskListChange: 0,          // 执行日期改变次数，次数更新控制执行任务更新
    countPreviewStatusChange: 0,            // 计数改变，预演停止
    
    serverPush: '',                         // 推送：任务推送进度
    countServerPush: 0,
    
    mapLoaded: false,                       // 地图：是否加载完
    bubbleVideoInfo: '',                    // 地图：视频气泡信息
    bubbleSignInfo: '',                     // 地图：信号机气泡信息
    bubblePoliceInfo: '',                   // 地图：警员气泡信息
    pId: '',                                // 地图：点位唯一标识
    countMapExtentChange: 0,                // 地图：map视野变化次数，次数更新时重设地图气泡定位
  },
  mutations:{
    // 路由
    setVuex_routePath(state, routePath) {
      /**
       * 设置路由路径
       * @param routePath {String}: 当前页路由路径
       */
      state.routePath = routePath
    },
   
    // 方案
    setVuex_schemeId(state, schemeId) {
      /**
       * 设置当前选中的方案id
       * @param schemeId {String}: 当前选中的方案id
       */
      state.schemeId = schemeId;
    },
    
    // 任务
    setVuex_taskId(state, obj) {
      /**
       * 设置当前任务id、执行任务id
       * @param obj {Object}: 当前选中的任务
       * @param obj.taskId {String}: 任务id
       * @param obj.executeTaskId {String}: 执行任务id
       */
      state.taskId = obj.taskId;
      state.executeTaskId = (typeof obj.executeTaskId != 'undefined') ? obj.executeTaskId : '';
    },
    setVuex_taskInfo(state, obj) {
      /**
       * 设置当前选中的任务信息
       * @param obj {Object}: 当前选中的任务
       */
      let newObj = {};
      for(let i in obj) {
        newObj[i] = obj[i]
      }
      state.taskInfo = newObj;
    },
    setVuex_taskListChange(state) {
      /**
       * 记录任务list改变次数，用于在兄弟组件操作时同时联动taskList组件的列表刷新
       */
      state.countTaskListChange ++;
    },
    
    // 线路
    setVuex_routeId(state, id) {
      /**
       * 设置当前线路id
       * @param id {String}: 线路id
       */
      state.routeId = id;
    },
    setVuex_routeListChange(state) {
      /**
       * 记录关联线路list改变次数，用于在兄弟组件关联绑定操作时同时联动RouteList组件的列表刷新
       */
      state.countRouteListChange ++;
    },
    
    setVuex_previewDate(state, date) {
      /**
       * 设置预演日期
       * @param date {String}: 预演日期
       */
      state.previewDate = date;
      state.countExecuteTaskListChange ++;
    },
    setVuex_resetPreview(state) {
      /**
       * 停预演动画
       */
      state.countPreviewStatusChange ++;
    },
  
    // 推送
    setVuex_serverPush(state, obj) {
      /**
       * 存最新推送数据
       * @param obj {Object}: 推送结果
       */
      state.serverPush = obj;
      state.countServerPush ++;
    },
  
    // 地图
    setVuex_mapLoaded(state, mapIsLoaded) {
      /**
       * 记录地图loaded 状态
       * @param mapIsLoaded {Boolean}: 当前地图load状态
       */
      state.mapLoaded = mapIsLoaded;
    },
    setVuex_bubbleVideoInfo(state, bubbleVideoInfo) {
      /**
       * 设置 ”视频“ 气泡信息
       * @param bubbleVideoInfo {Object}: 当前视频气泡内容
       */
      state.bubbleVideoInfo = bubbleVideoInfo
    },
    setVuex_bubbleSignInfo(state, bubbleSignInfo) {
      /**
       * 设置 ”信号机“ 气泡信息
       * @param bubbleVideoInfo {Object}: 当前视频气泡内容
       */
      state.bubbleSignInfo = bubbleSignInfo
    },
    setVuex_bubblePoliceInfo(state, bubblePoliceInfo) {
      /**
       * 设置 ”警员“ 气泡信息
       * @param bubbleVideoInfo {Object}: 当前视频气泡内容
       */
      state.bubblePoliceInfo = bubblePoliceInfo
    },
    setMapExtentChange(state) {
      /**
       * 记录地图视野范围变化次数，用于联动已显示的气泡组件位置
       */
      state.countMapExtentChange ++;
    },
    setVuex_pId(state, pId) {
      /**
       * 设置当前地图途径点序号（地图联动list途径点高亮）
       * @param pId {Number}: 当前途径点序号
       */
      state.pId =  pId;
    }
  }
});

export default store
