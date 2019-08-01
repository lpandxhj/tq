<!-- 方案管理：任务管理（任务列表） -->
<template>
  <div style="top:0;">
    <!-- ***地图*** -->
    <enjoyor-map :toolbar="toolbarOpt"></enjoyor-map>

    <!-- 添加任务（手动添加、预案调用） -->
    <div class="top-bar" style="right:464px;" v-if="isEdit">
      <router-link tag="span" title="返回至方案列表" class="current-scheme-name" :to="{name: 'schemelist'}">{{schemeName}}</router-link>
      <el-popover placement="right" width="100" trigger="click" :visible-arrow="false" popper-class="popper-add" v-model="showPopoverAddTask">
        <p @click="editTask('add')">手动添加</p>
        <p @click="addTaskUseBase">预案调用</p>
        <span slot="reference" class="btn-add-task" v-if="isFast && !fastIsShowAddTask" style="padding-left:0;">快速特勤任务添加 <i class="ic2 ic-add-active"></i></span>
        <span slot="reference" class="btn-add-task" v-if="!isFast">任务添加 <i class="ic2 ic-add-active"></i></span>
      </el-popover>
    </div>

    <div class="task slide-right" :class="{active: !isEdit || !mapIsDrawing}">
      <!-- *** 浮层：任务list *** -->
      <layer-task-list :isEdit="isEdit"
                       @edit-task="editTask"
                       @add-route="addRoute"
                       @fast-can-add-task="fastCanAddTask"></layer-task-list>

      <!-- *** 浮层：线路list *** -->
      <layer-route-list :isEdit="isEdit"
                        :isOnlyOneLine="true"
                        :showLayerRltPost="showLayerRltPost"
                        :showLayerRltDevice="showLayerRltDevice"
                        @route-type-change="routeTypeChange"
                        @route-click="routeClick"
                        @show-route-rltInfo="showRouteRltInfo"></layer-route-list>
    </div>

    <!-- *** 浮层：线路新增（通过常备线路方式添加） *** -->
    <layer-srh-common-route :isShow="showLayerCommonRoute"
                            @close="commonRouteClose"
                            @route-check="commonRouteCheck"
                            @route-check-cancel="commonRouteCheckCancel"></layer-srh-common-route>

    <!-- *** 浮层：任务新增/编辑 *** -->
    <layer-edit-task :isShow="showLayerEditTask"
                     :isEdit="isEdit"
                     :schemeId="schemeId"
                     :schemeName="schemeName"
                     :schemeRankId="schemeRankId"
                     @close="showLayerEditTask = false"></layer-edit-task>

    <!-- *** 浮层：线路新增/修改/查看 *** -->
    <layer-edit-route :isShow="showLayerEditRoute"
                      :isEdit="isEdit"
                      :lineIsAdding="lineIsAdding"
                      :isBaseOnNet="addLineBaseOnNet"
                      :routeTypeId="addRouteTypeId"
                      :isAddRoute="isAddRoute"
                      :commonRouteId="commonRouteId"
                      :commonRouteInfo="commonRouteInfo"
                      @line-add-complete="lineAddComplete"
                      @cancel="editRouteComplete"
                      @set-map-draw-status="setMapDrawStatus"></layer-edit-route>

    <!-- *** 浮层：线路布岗 *** -->
    <layer-rlt-post :isShow="showLayerRltPost"
                    :isEdit="isEdit"
                    @close="showLayerRltPost = false"
                    @set-map-draw-status="setMapDrawStatus"></layer-rlt-post>

    <!-- *** 浮层：关联设备 *** -->
    <layer-rlt-device :isShow="showLayerRltDevice"
                      :isEdit="isEdit"
                      @close="showLayerRltDevice = false"
                      @set-map-draw-status="setMapDrawStatus"></layer-rlt-device>
 </div>
</template>

<script>
 import EnjoyorMap from '@components/map/Map';
 import LayerEditTask from '@components/layer/adminScheme_EditTask';
 import LayerSrhCommonRoute from '@components/layer/adminScheme_SrhCommonRoute';
 import LayerRltPost from '@components/layer/adminScheme_RltPost';
 import LayerRltDevice from '@components/layer/adminScheme_RltDevice';
 import LayerEditRoute from '@components/layer/adminScheme_EditRoute';
 import LayerRouteList from '@components/layer/adminScheme_RouteList';
 import LayerTaskList from '@components/layer/adminScheme_TaskList';

 import common from "@tools/common";
 import mapSetting from '@tools/map-setting';
 import { mapState, mapMutations } from 'vuex';
 export default {
   props:{
     isEdit:{
       type: Boolean,
       default: true
     }
   },
   components: {
     EnjoyorMap,
     LayerEditTask,
     LayerSrhCommonRoute,
     LayerEditRoute,
     LayerRltPost,
     LayerRltDevice,
     LayerRouteList,
     LayerTaskList
   },
   data() {
     return {
       isAddRoute: false,                                   // 当前是否为新增线路操作
       lineIsAdding: false,                                 // 是否正在画线
       mapIsDrawing: false,                                 // 是否正在操作地图（画线、点、布岗、编辑地图线等，都需要从子组件通知到父组件，用来控制左侧任务及线路列表层的显隐）
       showConfirmDelTask: false,                           // 是否显示任务删除二次确认框
       showPopoverAddTask: false,                           // 是否显示新增任务popover
       showLayerCommonRoute: false,                         // 是否显示常备线路layer
       showLayerEditRoute: false,                           // 是否显示线路编辑layer
       showLayerEditTask: false,                            // 是否显示任务编辑模态框（传入选中的方案id）
       showLayerRltPost: false,                             // 是否显示关联岗位layer
       showLayerRltDevice: false,                           // 是否显示关联设备layer
       addLineBaseOnNet: false,                             // 新增线路使用智能规划（线路网上的）
       fastIsShowAddTask: false,                                  // 快速特勤下有没有添加任务（快速特勤仅允许设置单个任务）

       schemeId: '',                                        // 方案id
       schemeName: '',                                      // 方案name
       schemeRankId: '',                                    // 方案rank（任务默认等级为方案rank）

       taskList:[],                                         // 任务list
       activeTaskId:'',                                     // 当前选中高亮的任务id
       delTaskId:'',                                        // 确认删除的任务id

       commonRoutePointArr:[],                              // 从常备线路里拿到的线路点位数组

       routeInfoList:[],                                    // 线路list
       activeRouteId:'',                                    // 当前选中高亮的线路id
       addRouteTypeId:'',                                   // 当前新增的线路type，主：ROUTETYPE01； 备：ROUTETYPE02

       commonRouteId: '',
       commonRouteInfo: '',
     }
   },
   computed: {
     ...mapState([
       'mapLoaded',
     ]),
     isFast() {
       /**
        * 当前任务是否为快速特勤任务（快速特勤特点：任务新增后会自动创建方案，标记为快速特勤，且只有一个任务，不能多任务）
        */
       return this.$route.query.isFast ? true : false;      // 从路由对象上截取当前任务是否为快速特勤任务
     },
     toolbarOpt() {
       /**
        * 根据当前是否是编辑状态来判断地图工具栏选项
        */
       let toolbar = {layerSearch: true, layerSwitch: true, measutre: true, zoom: true, reset: true, clear: true};
       if(!this.isEdit) {
         toolbar = {layerSearch: false, layerSwitch: false, measutre: false, zoom: false, reset: false, clear: false}
       }
       return toolbar;
     }
   },
   watch: {
     activeRouteId() {
       /**
        * 当前选中的线路(若线路不存在，则隐藏线路编辑框)
        */
       if(!this.activeRouteId){
         this.showLayerEditRoute = false;
       }
     }
   },
   beforeRouteEnter (to, from, next) {
     next(vm => {
       vm.init_module()
     })
   },
   updated() {
     const taskId = this.$route.query.taskId;
     if(this.isFast) {
       this.setVuex_taskId({
         taskId: taskId
       });
     }
   },
   methods: {
     ...mapMutations([
       'setVuex_mapLoaded',
       'setVuex_routeListChange',
       'setVuex_taskId',
       'setVuex_routeId'
     ]),

     init_module() {
       /**
        * 模块初始化
        */
       this.schemeId = this.$route.query.schemeId;            // 从路由对象上截取方案id
       this.schemeName = this.$route.query.schemeName;        // 从路由对象上截取方案name
       this.schemeRankId = this.$route.query.schemeRankId;    // 从路由对象上截取方案rank

       if(!this.mapLoaded){
         this.$mapLoaded().then(res => {
           this.setVuex_mapLoaded(true);                      // 设置地图加载状态
         })
       }
     },

     editTask(type) {
       /**
        * 任务新增/编辑
        * @param type {String}:      操作类型（新增：add; 编辑：edit）
        * @param taskId {String}:    当前编辑的任务id（新增：''; 编辑：从vuex中取taskId）
        */
       if(type == 'add') this.setVuex_taskId('');
       this.showLayerEditTask = true;
       this.showPopoverAddTask = false;
     },

     addTaskUseBase() {
       /**
        * 任务新建方式：预案调用
        */
       this.$message.error('抱歉，预案调用暂未开放，敬请期待！');
       this.showPopoverAddTask = false;
     },

     lineAddComplete() {
       /**
        * 线路添加完成
        */
       this.showLayerEditRoute = true;
       this.lineIsAdding = false;
     },

     addRoute(obj) {
       /**
        * 新增线路
        * @param obj.taskInfo {Object}:         线路所属任务信息
        * @param obj.routeType {String}:        新增线路类型（主、备）
        * @param obj.isBaseOnNet {Boolean}:     是否智能规划线路（是否在路网上绘制线路）,default: false
        * @param obj.isByCommonRoute {Boolean}: 是否通过备用线路添加，default: false
        */
       this.editRoute('add', obj.taskInfo, obj.routeType, obj.isBaseOnNet, obj.isByCommonRoute)
     },

     editRoute(action, item, routeType, isBaseOnNet = false, isByCommonRoute = false){
       /**
        * 编辑线路（新增/修改）
        * @param action {String}:               新增（add） or 修改(edit)
        * @param item {Object}:                 当前线路对象
        * @param routeType {String}:            新增的线路类型（主备线路两种）
        * @param obj.isBaseOnNet {Boolean}:     是否智能规划线路（是否在路网上绘制线路）,default: false
        * @param obj.isByCommonRoute {Boolean}: 是否通过备用线路添加，default: false
        */
       if(action == 'add'){
         // 新增线路（手动新增）
         this.activeTaskId = item.taskId;
         this.addLineBaseOnNet = isBaseOnNet;
         this.addRouteTypeId = routeType == '主' ? 'ROUTETYPE01' : 'ROUTETYPE02';
         this.isAddRoute = true;
         this.showLayerEditRoute = false;

         if(!isByCommonRoute) {
           this.lineIsAdding = true;                // 手动绘线（直接绘线、智能规划都是需要手动触发绘线的）
         } else {
           this.showLayerCommonRoute = true;        // 通过常备线路新增
         }
         setTimeout(() => {
           this.setMapDrawStatus(true)
         }, 200);
         item.showPopoverType1 = false;
         item.showPopoverType2 = false;
       }else{
         // 编辑线路
         this.isAddRoute = false;
         this.showLayerEditRoute = true;
         this.setVuex_routeId(this.activeRouteId);  // 编辑的时候需要高亮激活当前编辑的线路
       }
     },

     editRouteComplete() {
       /**
        * 线路编辑保存或取消后
        */
       this.showLayerEditRoute = false;
       this.showLayerCommonRoute = false;
     },

     commonRouteCheck(commonRoute) {
       /**
        * 选中常备线路完成, 刷新线路途径点list
        * @param commonRoute.checkedRouteList {Array}: 当前选中的常备线路，获取来传递给右侧线路编辑layer
        */
       this.commonRouteInfo = commonRoute;
       this.showLayerEditRoute = true;
       this.commonRouteId = commonRoute.commonRouteId;
     },

     commonRouteCheckCancel() {
       /**
        * 取消常备线路选中，清空新增线路，关闭线路新增layer
        */
        this.showLayerEditRoute = false;
        this.commonRouteId = '';
     },

     commonRouteClose() {
       /**
        * 关闭备选线路新增
        */
       this.mapIsDrawing = false;
       this.showLayerCommonRoute = false;
       this.showLayerEditRoute = false;
       this.commonRouteId = '';
     },

     routeClick(obj) {
       /**
        * 点击切换线路
        * @param obj {Object}: 当前操作的线路信息
        * @param obj.routeInfo {Object}:        当前选中高亮的线路信息
        * @param obj.isDoubleClick {Boolean}:   当前是否为双击操作（单机选中线路，双击编辑/查看线路）
        */
       this.activeRouteId = obj.routeInfo.routeId;
       if(obj.isDoubleClick) {
         // 双击开启线路编辑
         this.editRoute('edit', obj.routeInfo);
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
       this.activeRouteId = rltInfo.routeId;
       if(rltInfo.type == 'post'){
         this.showLayerRltPost = !this.showLayerRltPost;
         if(this.showLayerRltPost) this.showLayerRltDevice = false;
       }else{
         this.showLayerRltDevice = !this.showLayerRltDevice;
         if(this.showLayerRltDevice) this.showLayerRltPost = false;
       }
     },

     setMapDrawStatus(isDrawing) {
       /**
        * 设置当前地图是否为绘制状态
        * @param isDrawing { Boolean }: 当前是否正在地图绘制操作
        */
       this.mapIsDrawing = isDrawing;
     },

     routeTypeChange(routeId) {
       /**
        * 选中高亮的任务下主执线路改变
        *  监测进行中则需要提示
        *  @param routeId {String}: 当前选中的高亮的主线路
        */
       this.activeRouteId = routeId;
     },

     fastCanAddTask(isCanAddTask) {
       /**
        * 快速特勤下控制任务添加按钮显隐
        * @param isCanAddTask {Boolean}: 是否可继续添加任务（仅允许单任务，没有任务时才允许添加任务，有一个任务了就隐藏添加按钮）
        */
       this.fastIsShowAddTask = isCanAddTask;
     }
   }
 }
</script>


<style scoped>
 /* 组件私有样式 */
 .current-scheme-name{color:#5093e1;}
 .current-scheme-name:hover{font-weight:bold;cursor:pointer;}
 .task{top:0;bottom:0;}
 .btn-add-task{padding-left:20px;}
 .ic-add-active::before{position:relative;top:6px;}
 .task-list>li{position:relative;border-radius:4px 8px 8px 4px;}
 .task-list>li::before{content:'';display:block;position:absolute;top:0;left:0;width:3px;height:79px;background:#5093e1;border-radius:4px;}
 .task-list>li .task-name{float:left;width:150px;color:#5093e1;}
 .task-list>li:hover .task-name, .task-list>li.active .task-name{font-weight:bold;}
 .task-list>li.active{background:#5093e1;color:#fff;border-color:#5093e1;border-radius:8px;}
 .task-list>li.active::before{display:none;}
 .task-list>li.active .task-name{color:#fff;}
 .task-list .ic1::before{width:16px;height:16px;}
 .task-list .btn-task{margin-top:-1px;}
 .task-list .btn-task .ic1{position:relative;top:4px;left:2px;padding:0 1px 0 2px;}
 .task-list .btn-task .ic-edit{padding-right:3px;}
</style>
<style>
 /* 覆盖elementui样式 */
 .popper-add[x-placement^=right]{margin:58px 0 0 0;padding:10px 0;border:none;}
 .popper-add p{height:30px;line-height:30px;padding-left:15px;}
 .popper-add p:hover{background:#5093e1;color:#fff;cursor:pointer;}
</style>
