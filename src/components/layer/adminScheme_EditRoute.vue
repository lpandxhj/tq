<!-- 特勤方案：线路编辑(根据isEdit来判断编辑权限) -->
<template>
  <div class="box-shadow layer-route-point" :class="{active:isShow && isShowLayer ,'read-only': !isEdit, 'form-wrap-theme2': !isEdit}" v-loading="showLoading">
      <!-- ******************************************************************************** isEdit:true  可编辑状态 ********************************************************************************* -->
      <template v-if="isEdit">
        <h2 class="primary-title">
          <i class="fr ic-close" title="关闭" @click="$emit('cancel')"></i>
          <i class="fr ic1 ic-edit" :title="lineIsEditing ? '编辑完成' :'线路编辑'" :class="{'active':lineIsEditing}" @click="editLine"></i>
          <i class="fr ic2 ic-add-point" :title="pointIsAdding ? '添加完成' : '添加途径点'" :class="{active:pointIsAdding}"  @click="addPoint"></i>
          <i class="fr ic1 ic-dustbin" title="清空途径点" @click="deletePoint()"></i>
          {{title}}
        </h2>

        <el-row class="form-item">
          <el-col :span="6" class="label ic-request">线路名称：</el-col>
          <el-col :span="18">
            <el-input style="width:100%;" size="mini" :title="info && info.routeName" v-model="info && info.routeName" clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="6" class="label ic-request">线路长度：</el-col>
          <el-col :span="6" class="ic-suffix-mi position-r">
            <el-input style="width:100%;" size="mini" :title="endPoint && endPoint.pointLength" v-model="endPoint && endPoint.pointLength" disabled></el-input>
          </el-col>
          <el-col :span="6" class="label ic-request">预计用时：</el-col>
          <el-col :span="6" class="ic-suffix-min position-r">
            <el-input style="width:100%;" size="mini" :title="countTime" v-model="countTime" disabled></el-input>
          </el-col>
        </el-row>

        <!-- 线路点位list -->
        <el-scrollbar class="el-scrollbar-xhidden list-route-scroller" :style="{height:scrollerHt}">
            <ul class="list-point" v-if="linePointArr.length">
              <!-- ***起点*** -->
              <li class="route-point-begin">
                <!-- 名称-->
                <input class="input-primary name" type="text" id="input_point_name_begin"
                       v-model.trim="beginPoint.pointName"
                       v-show="editName === 'name_begin'"
                       @blur="editName = ''"/>
                <span class="name ellipsis"
                      v-show="editName !== 'name_begin'"
                      @click="setAutoFocus('editName', 'name_begin', 'input_point_name_begin')">{{beginPoint.pointName}}</span>
                <i class="ic2 ic-speed" title="行驶速度"></i>
                <i class="ic2 ic-time" title="预计用时"></i>
                <i class="ic2 ic-park-time" title="停留时长"></i>
              </li>


              <!-- ***途径点List*** -->
              <li class="route-point-middle"
                      :class="{'point-invalid': distanceIsOverrun(item.mapLength), active: item.pId == pId}"
                      v-for="(item, idx) in middlePointList" :key="'middle_point'+idx"
                      :title="distanceIsOverrun(item.mapLength) ? '途径点已偏离路线，建议删除' : ''"
                      @mouseenter="addMiddlePointHL(item, idx)"
                      @mouseleave="removeMiddlePointHL">
                  <i v-if="!isCommonRoute" class="ic2 ic-saveto-common-point" title="存储为常备单位" @click="ajaxAddCommonPlace(item)"></i>
                  <i class="ic2 ic-del-x" title="删除途径点" @click="deletePoint(idx+1)"></i>

                  <!-- 名称 -->
                  <input class="input-primary name" type="text"
                         :id="'input_point_name_'+idx"
                         v-model.trim="item.pointName"
                         v-show="editName === 'name_'+idx" @blur="editName = ''" />
                  <span class="name ellipsis"
                        :title="item.pointName"
                        v-show="editName !== 'name_'+idx"
                        @click="setAutoFocus('editName', 'name_'+idx, 'input_point_name_'+idx)">{{idx+1}}. {{item.pointName}}</span>

                  <!-- 距起点的距离 -->
                  <span class="distance">{{item.pointLength}}m</span>

                  <!-- 速度 -->
                  <input class="no-arrow speed" type="number"
                         :id="'input_point_speed_'+idx"
                         v-model.number="item.speed"
                         v-show="editSpeed === 'speed_'+idx"
                         @blur="editSpeed = ''"
                         @change="countPlanTime(item, idx+1)"/>
                  <span class="speed overflow-h"
                        v-show="editSpeed !== 'speed_'+idx"
                        @click="setAutoFocus('editSpeed', 'speed_'+idx, 'input_point_speed_'+idx)">{{item.speed}}</span>

                  <!-- 用时 -->
                  <span class="time overflow-h">{{item.planTime}}</span>

                  <!-- 停留时长 -->
                  <input class="no-arrow park-time" type="number"
                         :id="'input_point_park_'+idx"
                         v-model.number="item.parkTime"
                         v-show="editParkTime === 'parktime_'+idx"
                         @blur="editParkTime = ''"
                         @change="countPlanTime(item, idx+1)"/>
                  <span class="park-time overflow-h"
                        v-show="editParkTime !== 'parktime_'+idx"
                        @click="setAutoFocus('editParkTime', 'parktime_'+idx, 'input_point_park_'+idx)">{{item.parkTime}}</span>
              </li>


              <!-- ***终点*** -->
              <li class="route-point-end" v-if="endPoint">
                <i v-if="!isCommonRoute" class="ic2 ic-saveto-common-point" title="存储为常备单位" @click="ajaxAddCommonPlace(endPoint)"></i>
                <span class="distance">{{endPoint.pointLength}}m</span>

                <!-- 名称 -->
                <input class="input-primary name" type="text" id="input_point_name_end"
                       v-model.trim="endPoint.pointName"
                       v-show="editName === 'name_end'"
                       @blur="editName = ''"/>
                <span class="name ellipsis"
                      v-show="editName !== 'name_end'"
                      @click="setAutoFocus('editName', 'name_end', 'input_point_name_end')">{{endPoint.pointName}}</span>

                <!-- 速度 -->
                <input class="no-arrow speed" type="number" id="input_point_speed_end"
                       v-model.number="endPoint.speed"
                       v-show="editSpeed === 'speed_end'"
                       @blur="editSpeed = ''"
                       @change="countPlanTime(endPoint, linePointArr.length-1)"/>
                <span class="speed overflow-h"
                      v-show="editSpeed !== 'speed_end'"
                      @click="setAutoFocus('editSpeed', 'speed_end', 'input_point_speed_end')">{{endPoint.speed}}</span>

                <!-- 用时 -->
                <span class="time overflow-h">{{endPoint.planTime}}</span>
              </li>
            </ul>
            <no-data title="暂无数据" v-else></no-data>
        </el-scrollbar>

        <!-- 按钮操作 -->
        <div class="btn-group-bottom">
          <el-button size="mini" round type="primary" @click="saveInfo">保 存</el-button>
          <el-button size="mini" round @click="cancel">取 消</el-button>
        </div>
      </template>

      <!-- ******************************************************************************** isEdit:false  只读查看状态 ****************************************************************************** -->
      <template v-else>
        <h2 class="primary-title">
          <i class="fr ic-close" title="关闭" @click="$emit('cancel')"></i>
          线路信息
        </h2>
        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="6" class="label">线路名称：</el-col>
          <el-col :span="18">{{info && info.routeName}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="6" class="label">线路长度：</el-col>
          <el-col :span="6" class="ic-suffix-mi position-r">{{endPoint && endPoint.pointLength}}</el-col>
          <el-col :span="6" class="label">预计用时：</el-col>
          <el-col :span="6" class="ic-suffix-min position-r">{{countTime}}</el-col>
        </el-row>

        <!-- 线路点位list -->
        <el-scrollbar class="el-scrollbar-xhidden list-route-scroller" :style="{height:scrollerHt}">
          <ul class="list-point" v-if="linePointArr.length">
              <!-- ***起点*** -->
              <li class="route-point-begin">
                <span class="name ellipsis">{{beginPoint.pointName}}</span>
                <i class="ic2 ic-speed" title="行驶速度"></i>
                <i class="ic2 ic-time" title="预计用时"></i>
                <i class="ic2 ic-park-time" title="停留时长"></i>
              </li>

              <!-- ***途径点List*** -->
              <li class="route-point-middle"
                  :class="{'point-invalid': distanceIsOverrun(item.mapLength), active: item.pId == pId}"
                  v-for="(item, idx) in middlePointList"
                  :key="'middle_point'+idx" :title="distanceIsOverrun(item.mapLength) ? '途径点已偏离路线，建议删除' : ''"
                  @mouseenter="addMiddlePointHL(item, idx)"
                  @mouseleave="removeMiddlePointHL">
                  <span class="name ellipsis" :title="item.pointName">{{idx+1}}. {{item.pointName}}</span>
                  <span class="distance">{{item.pointLength}}m</span>
                  <span class="speed overflow-h">{{item.speed}}</span>
                  <span class="time overflow-h">{{item.planTime}}</span>
                  <span class="park-time overflow-h">{{item.parkTime}}</span>
              </li>

              <!-- ***终点*** -->
              <li class="route-point-end" v-if="endPoint">
                <span class="distance">{{endPoint.pointLength}}m</span>
                <span class="name ellipsis">{{endPoint.pointName}}</span>
                <span class="speed overflow-h">{{endPoint.speed}}</span>
                <span class="time overflow-h">{{endPoint.planTime}}</span>
              </li>
            </ul>
          <no-data title="暂无数据" v-else></no-data>
        </el-scrollbar>

        <!-- 按钮操作 -->
        <div class="btn-group-bottom">
          <el-button size="mini" round @click="$emit('cancel')">关 闭</el-button>
        </div>
      </template>
  </div>
</template>

<script>
  /**
   * 【map图层信息】
   * 轨迹线 —— layerId: layer_line,                        zIndex: 1
   * 映射点+途径点+起止点 —— layerId: layer_point_pass,      zIndex: 10
   * 途径点：hover —— layerId: layer_point_middle_active,   zIndex: 9999
   */
  import mapSetting from '@tools/map-setting';
  import mapDraw from '@tools/map-draw';
  import common from '@tools/common';
  import filters from '@js/filters';
  import { mapState, mapMutations } from 'vuex';
  export default {
    props: [
      'isEdit',                               // 是否为编辑状态（制作时为编辑、其余均为查看状态）
      'isCommonRoute',                        // 是否为常备线路编辑（常备线路不隶属于任何任务下，关联线路是隶属于关联任务下的）
      'isShow',                               // 是否显示当前layer
      'routeTypeId',                          // 新增线路时的线路类型
      'isAddRoute',                           // 当前是否为新增操作
      'lineIsAdding',                         // 是否正在首次绘线（新增线路时）
      'isBaseOnNet',                           // 是否为智能画线（绘制线条是否在路网上）
      'commonRouteId',                         // 是否通过常备线路新增的
      'commonRouteInfo'                        // 常备线路新增时带过来的线路信息
    ],
    data() {
      return {
        showLoading: false,                   // 编辑操作时加载数据等待
        pointIsAdding: false,                 // 是否正在地图取点操作
        lineIsEditing: false,                 // 是否正在地图线路编辑操作
        linePointArr: [],                     // 线上沿途的点（包括起止点、途径点）

        editName: '',                         // 正在修改的点位名称
        editSpeed: '',                        // 正在修改的速度
        editParkTime: '',                     // 正在修改的停留时间

        title:'线路添加',
        scrollerHt:'500px',                   // 途径点滚动条容器高度
        beginPoint:'',                        // 起点
        endPoint:'',                          // 终点
        middlePointList:[],                   // 途径点集合

        info: {                               // 线路信息
          taskId: this.taskId,                // 线路归属的任务id
          routeTypeId: this.routeTypeId,      // 线路类型
          routeName: '',
          routeStartPlace: '起点',
          routeTargetPlace: '终点',
          routeLength: 100,
          routePlanTime: 20,
          routePointList:[]
        },

        editRouteId: ''                       // 当前新增或者编辑的线路id
      };
    },
    computed: {
      ...mapState([
        'mapLoaded',                          // 地图加载状态
        'pId',                                // 地图上hover点位时，当前途径点的序号
        'taskId',                             // 当前taskList组件中高亮激活的任务id
        'routeId',                            // 当前routeList组件中高亮激活的线路id
      ]),
      isShowLayer() {
        /**
         * 若当前选中的任务下没有线路 则隐藏线路编辑框，除非是新增线路才会显示
         */
        if(!this.isAddRoute) {
          return this.routeId;
        }
        return true;
      },
      countTime() {
        /**
         * 线路预估用时（单位：min）
         */
        let time = 0;
        this.middlePointList.forEach(i => {
          time += i.planTime;
        });
        time += this.endPoint && this.endPoint.planTime;
        return time;
      },
    },
    watch: {
      commonRouteId() {
        /**
         * 根据常备线路新增
         */
        this.clearLine();
        if(this.commonRouteId && this.commonRouteInfo) {
//          debugger
          this.info.routeName = this.commonRouteInfo.commonRouteName;
          this.reDrawLine(this.commonRouteInfo.strArea, this.commonRouteInfo.routePointList);                     // 绘制线路
        }
      },
      'beginPoint.pointName'() {
        /**
         * 起点 名称变动时，重新存缓存(起点除了名称，没有速度、用时等其他属性的变化)
         */
        let pointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')): [];    // 获取起点更新前缓存里的起止点及途径点对象数组
        pointList[0] = this.beginPoint;                                                                           // 更新起点对象
        localStorage.setItem('pointList',JSON.stringify(pointList));                                              // 存最新的起止点、途径点对象数组到缓存
      },
      endPoint: {
        /**
         * 终点 属性变动时，重新存缓存(终点需考虑名称、速度、用时等属性的变化)
         */
        handler: function (val, oldVal) {
          let pointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')): [];   // 获取起点更新前缓存里的起止点及途径点对象数组
          pointList[pointList.length-1] = this.endPoint;                                                           // 更新终点对象
          localStorage.setItem('pointList',JSON.stringify(pointList));                                             // 存最新的起止点、途径点对象数组到缓存
        },
        deep: true
      },
      middlePointList: {
        /**
         * 途径点 属性变动时，重新存缓存(途径点需考虑名称、速度、用时等属性的变化)
         */
        handler: function (val, oldVal) {
          let pointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')): [];   // 获取起点更新前缓存里的起止点及途径点对象数组
          let newPointList = this.middlePointList.map(i => {return i});                                            // 更新途径点对象
          newPointList.unshift(pointList[0]);                                                                      // 使用原有的起点
          newPointList.push(pointList[pointList.length-1]);                                                        // 使用原有的终点
          localStorage.setItem('pointList',JSON.stringify(newPointList));                                          // 存最新的起止点、途径点对象数组到缓存
        },
        deep: true
      },

      linePointArr() {
        /**
         * 把所有的点拆分成 起、止、途径点 三类，分别存入beginPoint、endPoint、middlePointList 三个对象中
         */
        // 途径点
        this.middlePointList = [];
        this.linePointArr.forEach((i, idx) => {
          if(idx === 0){
            // 起点
            i.pointLength = 0;
            this.beginPoint = i;
          }else if(idx === this.linePointArr.length-1){
            // 终点
            i.planTime = this.countPlanTime(i, idx); // idx == this.linePointArr.length-1
            this.endPoint = i;
          }else{
            // 途径点
            i.planTime = this.countPlanTime(i, idx);  // idx 从 1开始
            this.middlePointList.push(i)
          }
        });
      },
      lineIsAdding() {
        /**
         * 监听父组件是否触发了画线操作
         */
        if(this.lineIsAdding) {
          this.clearLine();
          this.handle_drawLine();
        }
      },
      routeId() {
        /**
         * 编辑时赋值为当前routeId (这步肯定有问题)
         */
        this.editRouteId = this.routeId;
        window.map.endEdit();                         // 结束线路编辑
      },
      isShow() {
        if(this.isShow) {
          this.editRouteId && this.setInfo();
        }else window.map.endEdit();                   // 结束线路编辑
      },
      isAddRoute() {
        /**
         * 新增时赋空
         */
        if(this.isAddRoute) {
          this.clearLine();
          this.editRouteId = '';
          this.setInfo()
        }
      },
      editRouteId() {
        this.editRouteId && this.isShow && this.setInfo();
      },
    },
    mounted() {
      this.setScrollHt();
      window.map.addEventListener(EJMap.Event.ondeactivate, e => {
        if(e._layer.id == 'layer_line') {             // 监听线路编辑事件(必须用id判断,否则会监听所有的地图编辑事件)
          this.cb_getLineInfo(e.geometry, true);
        }
      });
    },
    methods: {
      ...mapMutations([
        'setVuex_mapLoaded',                          // 设置地图加载状态
        'setVuex_routeId',                            // 新增或者编辑后保存操作后重设置高亮的线路id
        'setVuex_routeListChange',                    // 累加次数，使routeList组件中刷新线路列表
      ]),
      // *** ajax start ***
      ajaxAddRoute() {
        /**
         * 关联线路添加
         */
        this.info.taskId = this.taskId;
        this.info.routeTypeId = this.routeTypeId;
        const apiName = `${config.baseUrl_HOST}${this.$api.addRouteInfo_POST}`;
        this.showLoading = true;
        this.$http.post(apiName, this.info)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('线路添加成功！');
              this.setVuex_routeId(res.resultList);
              this.setVuex_routeListChange();
              this.$emit('cancel');
              this.$emit('set-map-draw-status', false);
            }else{
              this.$message.error(res.resultList);
            };
            this.showLoading = false;
          }).catch(rej => {
          this.$message.error('抱歉，线路添加失败！');
          this.showLoading = false;
        })
      },
      ajaxEditRoute() {
        /**
         * 关联线路修改
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.editRouteInfo_PUT}`;
        delete this.info.routeGeo;                     // 这个参数会在编辑保存提交的时候引起接口报错，和后端协商后统一清空该字段
        this.showLoading = true;
        this.$http.put(apiName, this.info)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('线路编辑成功！');
              this.setVuex_routeId(this.editRouteId);
              this.setVuex_routeListChange();
              this.$emit('cancel');
              this.$emit('set-map-draw-status', false);
            }else{
              this.$message.error('线路编辑失败！');
            };
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxGetRouteInfo() {
        /**
         * 查询关联线路信息
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getRouteInfoList_GET}`;
        const params = {
          taskId: this.taskId,
          routeId: this.routeId
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.info = res.resultList.length ? res.resultList[0] : [];
              if(this.info) this.linePointArr = this.info.routePointList || [];
            };
            this.showLoading = false;
          }).catch(rej => {
            this.$message.error('抱歉线路信息获取失败！');
            this.showLoading = false;
          })
      },
      ajaxAddCommonRoute() {
        /**
         * 常备线路添加
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.addCommonRoute_POST}`;
        this.info.commonRouteName = this.info.routeName;
        delete this.info.routeName;                   // 移除原关联线路不需要的参数
        delete this.info.routeTypeId;
        delete this.info.taskId;

        this.showLoading = true;
        this.$http.post(apiName, this.info)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('线路添加成功！');
              this.$emit('edit-complete', res.resultList);
              this.$emit('set-map-draw-status', false);
            }else{
              this.$message.error('线路添加失败！');
            };
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxEditCommonRoute() {
        /**
         * 常备线路修改
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.editCommonRoute_PUT}`;
        this.info.commonRouteId = this.editRouteId;
        this.info.commonRouteName = this.info.routeName;
        delete this.info.routeName;                     // 移除原关联线路不需要的参数
        delete this.info.routeTypeId;
        delete this.info.taskId;
        delete this.info.routeGeo;                      // 这个参数会在编辑保存提交的时候引起接口报错，和后端协商后统一清空该字段

        this.showLoading = true;
        this.$http.put(apiName, this.info)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('线路编辑成功！');
              this.$emit('edit-complete',this.editRouteId);
              this.$emit('set-map-draw-status', false);
            }else{
              this.$message.error('线路编辑失败！');
            };
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxGetCommonRouteInfo() {
        /**
         * 查询常备线路信息
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getCommonRouteList_GET}`;
        const params = {
          commonRouteId: this.editRouteId,
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.info = res.resultList[0];
              this.info.routeId = this.editRouteId;   // 常备线路返回的name、id 字段要和关联线路时的统一，故此处有赋值和删除属性操作
              this.info.routeName = this.info.commonRouteName;
              delete this.info.commonRouteId;         // 移除原关联线路不需要的参数
              delete this.info.commonRouteName;
              this.linePointArr = this.info.routePointList || [];
            };
            this.showLoading = false;
          }).catch(rej => {
            this.$message.error('抱歉常备线路信息获取失败！');
            this.showLoading = false;
          })
      },
      ajaxAddCommonPlace(item) {
        /**
         * 存常备单位
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.addCommonPlace_POST}`;
        const params = {
          commonPlaceName: item.pointName,    // *单位名称
          placeAddress: '这里的地址没地方获取呀',// *地址
          placeX: item.pointX,                // *单位点坐标
          placeY: item.pointY                 // *单位点坐标
        };
        this.showLoading = true;
        this.$http.post(apiName, params)
          .then(res => {
            if (res.appCode == 0) {
              this.$message.success('常备单位添加成功！');
            } else {
              this.$message.error('常备单位添加失败！');
            };
            this.showLoading = false;
          }).catch(rej => {
          this.$message.error('常备单位添加失败！');
          this.showLoading = false;
        })
      },
      // *** ajax end ***

      setInfo() {
        /**
         * 判断当前是编辑还是新增，编辑的根据editRouteId获取线路信息
         */
        if(!this.isAddRoute){
          // 线路编辑(新增的需要从父组件指定线路类型，编辑直接从接口获取类型)
          if(this.isCommonRoute){
            this.title = '常备线路编辑';
            window.map.removeLayerById('layer_line');         // 清除线路
            window.map.removeLayerById('layer_point_pass');   // 清除线路途径点、起止点图层
            this.ajaxGetCommonRouteInfo().then(res => {
//              this.reDrawLine();
              this.reDrawLine(this.info.strArea, this.info.routePointList);
            });
          }else{
            this.title = '线路编辑';
            window.map.removeLayerById('layer_line');         // 清除线路
            window.map.removeLayerById('layer_point_pass');   // 清除线路途径点、起止点图层
            this.ajaxGetRouteInfo().then(res => {
//              this.reDrawLine();
              this.reDrawLine(this.info.strArea, this.info.routePointList);
            });
          }
        }else{
          // 线路添加 清空表单
          this.title =  this.isCommonRoute ? '常备线路添加': '线路添加';
          this.info = {
            taskId: this.taskId,               // 线路归属的任务id
            routeTypeId: this.routeTypeId,     // 线路类型
            routeName: '',
            routeStartPlace: '起点',
            routeTargetPlace: '终点',
            routeLength: 100,
            routePlanTime: 20,
            routePointList:[]
          }
        }
      },

      saveInfo() {
        /**
         * 保存线路信息(isEdit判断当前是编辑还是新增、isCommonRoute判断是关联线路操作还是常备线路操作)
         */
        if(!common.lpreg.trim(this.info.routeName)){
          this.$message.error('抱歉，线路名称不能为空！');
          return;
        }
        // 线路通用参数赋值
        this.info.routeStartPlace = this.beginPoint.pointName;                        // 线路起点名称
        this.info.routeTargetPlace = this.endPoint.pointName;                         // 线路终点名称
        this.info.routeLength = this.endPoint.pointLength;                            // 线路总长度
        this.info.routePlanTime = this.countTime;                                     // 预估总用时
        this.info.routePointList = this.middlePointList.map(i => { return i});        // 线路点-途径点对象数组
        this.info.routePointList.unshift(this.beginPoint);                            // 线路点-起点对象
        this.info.routePointList.push(this.endPoint);                                 // 线路点-终点对象
        this.info.strArea = localStorage.getItem('geo')? JSON.parse(localStorage.getItem('geo')) : '';

        if(!this.isAddRoute){
          // 线路编辑
          if(this.isCommonRoute){
            // 常备线路修改
            this.ajaxEditCommonRoute();
          }else{
            // 关联线路修改
            this.ajaxEditRoute();
          }

        }else{
          // 线路新增
          if(this.isCommonRoute){
            // 常备线路新增
            this.ajaxAddCommonRoute();
          }else{
            // 关联线路新增
            this.ajaxAddRoute();
          }
        }
      },

      cancel() {
        /**
         * 线路未保存 点取消（vuex中routeId不变，因为未修改激活的routeId）
         * 清除未保存的绘制，且刷新routeList（促使routeList中自动画线）；
         */
        this.info.routeName = '';
        mapDraw.clearAllDraw();
        this.setVuex_routeListChange();
        this.$emit('cancel');
        this.$emit('set-map-draw-status', false);
      },

      handle_drawLine(){
        /**
         * 手动画线
         */
        const ts = this;
        function cb_drawLine_route (e) {
          /**
           * 回调：手动画线
           */
          window.map.addLine2GraphicsLayer({
            geom: {
              paths: e.paths,
              spatialReference: {wkid: e.spatialReference.wkid}
            },
            symbol: {
              "type": "esriSLS",
              "style": "esriSLSSolid",
              "color": [170, 181, 194],
              "width": 3
            },
            onmouseup: false,
            edit: true
          }, 'layer_line', false);
          window.map.reorderLayer('layer_line', 1);

          ts.cb_getLineInfo(e).then(res => {
            ts.$emit('line-add-complete'); // 线条绘制完成
          })

        }
        function cb_drawLine_route_onNet (e) {
          /**
           * 回调：智能画线
           */
          // 智能画线需要传递的点坐标数组（这个数组去除首尾坐标后也用来作为途径点数组）
          const mapParams = e.paths[0].map(i => {
            return {
              x: i[0],
              y: i[1],
              spatialReference: {wkid: 4326 }
            }
          });
          console.log(mapParams)
          debugger
          window.map.networkAnalysis(mapParams, null, null, false, function (ee) {
            const paths = ee.routeResults[0].route.geometry.paths[0];
            window.map.addLine2GraphicsLayer({
              geom: {
                paths: [paths],
                spatialReference: ee.routeResults[0].route.geometry.spatialReference
              },
              symbol: {
                "type": "esriSLS",
                "style": "esriSLSSolid",
                "color": [170, 181, 194],
                "width": 3
              },
              onmouseup: false,
              edit: true
            }, 'layer_line', false);
            window.map.reorderLayer('layer_line', 1);

            let pList = [];                     // 把手动打点的首尾点去除，中间点作为途径点
            mapParams.forEach((i, idx) => {
              // 智能画线手动打的的起点和终点和实际线路起止点相隔太近，容易出现误差，故删除了首尾两个点
              if(idx !== 0 && idx !== mapParams.length-1){
                pList.push(i)
              }
            });

            ts.cb_getLineInfo(ee.routeResults[0].route.geometry, false, pList)
              .then(res => {
                ts.$emit('line-add-complete'); // 线条绘制完成
                ts.$emit('set-map-draw-status', false);
              })
          })
        }

        const cb_fun = this.isBaseOnNet ? cb_drawLine_route_onNet : cb_drawLine_route;  // 选择回调方法
        window.map.drawPolyline({
          display: false,
          clean: true ,
          symbol: {
            "type": "esriSLS",
            "style": "esriSLSSolid",
            "color": [170, 181, 194],
            "width": 3
          }
        }, cb_fun);
      },

      cb_getLineInfo(lineGeo, isRouteEdit = false, pList = []) {
        /**
         * 线路画好后回调: 存地图线对象到本地缓存，地图绘制点，点集合转对象类型存缓存
         * @param lineGeom {Object}:     线对象
         * @param isRouteEdit {Boolean}: 当前操作是否是线路编辑（线路编辑需要更新下缓存的起止点对象信息，重新算距起点的距离）
         * @param pList {Array}:         智能绘线的点集合（是当前操作为新增 isRouteEdit = false）
         */
        this.lineIsEditing = false;
        let linePaths = lineGeo.paths[0];
        localStorage.setItem('geo',JSON.stringify(lineGeo));          // 存线对象

        let pointList = [];                                           // 按类型拼接所有的点（包括起、止点、途径点3中类型）

        if(isRouteEdit){
          /**
           * 线路编辑状态，获取缓存里所有点位坐标，（线路编辑有可能导致起止点坐标改变，先获取缓存里存的线路点位信息，更新下起止点信息,途径点不变）
           */
          const newBeginPoint = linePaths[0];                          // 线路调整后的起点
          const newEndPoint = linePaths[linePaths.length-1];           // 线路调整后的终点

          pointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')): [];   // 获取当前线路的起止点及途径点对象数组
          pointList[0].pointX = filters.keepToFixed6(newBeginPoint[0]);                                        // 线路编辑有可能导致起止点坐标改变
          pointList[0].pointY = filters.keepToFixed6(newBeginPoint[1]);
          pointList[pointList.length-1].pointX = filters.keepToFixed6(newEndPoint[0]);
          pointList[pointList.length-1].pointY = filters.keepToFixed6(newEndPoint[1]);
          pointList = this.resetPointDistance(pointList, lineGeo);
        }else{
          /**
           * 线路新增状态，根据线上的转折点作为途径点，拼接起止点+途径点的点位对象数组，存缓存且传递给子组件刷新途径点列表
           */
          // 起点(pointList得到的点是不包括起点的，故此处新增起点)
          pointList.unshift({
            pointName: '起点',
            pointTypeId: 'ROUTEPOINTTYPE01',
            pointTypeName: '起点',
            pointX: filters.keepToFixed6(linePaths[0][0]),
            pointY: filters.keepToFixed6(linePaths[0][1]),
            speed: 40,
            planTime: 0,
            parkTime: 0,
            sectionLength: 0,
            pointLength: 0
          });

          // 途径点
          if(pList.length){
            // 当前为智能画线后的新增(智能画线中线的结束点为最后一个终点，需要和途径点一起算至起点的距离，故添加到pList序列中)
            pList.push({
              x: linePaths[linePaths.length-1][0],
              y: linePaths[linePaths.length-1][1]
            });
            pList.forEach(i => {
              const random_id = 'id_'+new Date().valueOf() + '_' + common.lpobj.getRan();
              pointList.push({
                pId: random_id,
                pointName: '途径点',
                pointTypeId: 'ROUTEPOINTTYPE02',
                pointTypeName: '途径点',
                pointX: filters.keepToFixed6(i.x),
                pointY: filters.keepToFixed6(i.y),
                speed: 40,
                planTime: 0,
                parkTime: 0,
                sectionLength: 0,
                pointLength: 0
              })
            });
            pointList = this.resetPointDistance(pointList, lineGeo);
          }else{
            // 当前为手动画线后的新增
            let pointArr = EJMap.commonFunction.getLinePathDis(lineGeo);  // 得到 除起点外 线路上其他各点距起点的真实距离（非直线距离）
            const random_id = 'id_'+new Date().valueOf() + '_' + common.lpobj.getRan();
            pointArr.forEach(i => {
              pointList.push({
                pId: random_id,
                pointName: '途径点',
                pointTypeId: 'ROUTEPOINTTYPE02',
                pointTypeName: '途径点',
                pointX: filters.keepToFixed6(i.epoint[0]),
                pointY: filters.keepToFixed6(i.epoint[1]),
                speed: 40,
                planTime: 0,
                parkTime: 0,
                sectionLength: Math.ceil(i.distance),
                pointLength: Math.ceil(i.distanceStarting)
              })
            });
          }
          // 终点
          pointList[pointList.length-1].pointName = '终点';
          pointList[pointList.length-1].pointTypeId = 'ROUTEPOINTTYPE04';
          pointList[pointList.length-1].pointTypeName = '终点';
        }

        this.linePointArr = pointList;                                  // 线上所有的点传递给子组件
        mapDraw.drawPoint_pass(pointList);                              // 根据分类好的点集合画不同类型的点（起止点、途径点）
        localStorage.setItem('pointList',JSON.stringify(pointList));    // 存起止点、途径点对象数组到缓存
        return new Promise((resolve, reject) => {
          resolve('线条绘制/编辑结束');
        })
      },

      reDrawLine(strArea, routePointList) {
        // 地图对象不存在
        if(!strArea) return;
        let geo = (typeof strArea == 'string') ? JSON.parse(strArea) : strArea;
        geo.type = 'polyline';

        // 线对象存在则 重绘线
        if(!geo.paths) return;
        mapDraw.drawLine_route('layer_line', geo.paths[0]);
        window.map.setLayerExtent(geo);                             // 图形显示在当前地图视图范围内
        localStorage.setItem('geo', strArea);

        // 途径点对象存在则 重绘点
        if(routePointList.length){
          mapDraw.drawPoint_pass(routePointList);
          this.linePointArr = routePointList;
          localStorage.setItem('pointList',JSON.stringify(routePointList));
        }
      },

      clearLine() {
        /**
         * 清除地图上的线路信息（包括地图线、点图层、缓存中的点、线对象）
         */
        mapDraw.clearAllDraw();
        localStorage.removeItem('geo');
        localStorage.removeItem('pointList');
        this.linePointArr = [];
      },
      editLine() {
        /**
         * 开启/关闭 线路编辑
         */
        this.lineIsEditing = !this.lineIsEditing;
        if(!this.lineIsEditing){
          // 正在编辑的，点击关闭编辑
          window.map.endEdit();
          this.$emit('set-map-draw-status', false);
        }else{
          // 未在编辑的, 点击开启编辑
          window.map.startEdit('layer_line');
          this.$emit('set-map-draw-status', true);
        }
      },
      addPoint() {
        /**
         * 地图取点（新增途径点）
         */
        if(this.pointIsAdding){
          // 结束取点
          this.pointIsAdding = false;
        }else{
          // 开始取点
          this.pointIsAdding = true;
          window.map.drawPoint({
            display: false,
            clean: false
          }, cb_drawPoint)
        }
        this.$emit('set-map-draw-status', this.pointIsAdding);
        const ts = this;
        function cb_drawPoint(e){
          let pointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')) : [];
          if(pointList.length > 1){
            // 存在起止点;
            const random_id = 'id_'+new Date().valueOf() + '_' + common.lpobj.getRan();
            const new_middle_point = {
              pId: random_id,
              pointName: '途径点',
              pointTypeId: 'ROUTEPOINTTYPE02',
              pointTypeName: '途径点',
              pointX: filters.keepToFixed6(e.x),
              pointY: filters.keepToFixed6(e.y),
              speed: 40,
              planTime: 0,
              parkTime: 0,
              sectionLength: 0,
              pointLength: 0
            };
            pointList.splice(pointList.length-1, 0 , new_middle_point);         // 添加新的途径点（加在起止点中间）
            const lineGeo = localStorage.getItem('geo') ? JSON.parse(localStorage.getItem('geo')) : null;
            pointList = ts.resetPointDistance(pointList, lineGeo);              // 重新按距起点距离排序途径点位置
            ts.linePointArr = pointList;
            mapDraw.drawPoint_pass(pointList);                                  // 绘制点
            localStorage.setItem('pointList', JSON.stringify(pointList));       // 存起止点、途径点对象数组到缓存
            ts.pointIsAdding = false;
          }
        }
      },
      deletePoint(pointIdx) {
        /**
         * 删除途径点
         * @param pointIdx {Number}: 需要删除的途径点索引（1开始传，因为0时起点），传空则清空所有途径点，仅剩下起止点
         */
        const lineGeo = localStorage.getItem('geo') ? JSON.parse(localStorage.getItem('geo')) : null;
        let pointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')) : [];
        if(!pointList.length) return;
        window.map.removeLayerById('layer_point_middle_active');

        if(pointIdx){
          // 删除指定途径点（含对应映射点）
          pointList.splice(pointIdx, 1);
        }else{
          // 清空所有途径点（含对应映射点、不包含起止点）
          pointList.splice(1, pointList.length-2);
        }
        pointList = this.resetPointDistance(pointList, lineGeo);         // 重新算现有途径点到起点的距离
        this.linePointArr = pointList;
        mapDraw.drawPoint_pass(pointList);                               // 根据分类好的点集合画不同类型的点
        localStorage.setItem('pointList', JSON.stringify(pointList));    // 存起止点、途径点对象数组到缓存
      },
      resetPointDistance(pointList, lineGeo) {
        /**
         * 根据点位 和 线对象 算出点到起点的距离. 到上一个映射点的距离. 映射点信息等,最后按到起点的距离 升序
         * @param pointList {Array}:  点对象集合
         * @param lineGeo   {Object}: 线对象
         */
        pointList.forEach((i, idx) => {
          // 遍历每个点，重新计算调整后的线到原途径点的映射距离及到起点的距离
          let r = EJMap.commonFunction.getProjectionPoint(lineGeo, i.pointX, i.pointY);
          i.sectionLength = Math.ceil(r.parDistance);                   // 该途径点最近的映射点到上一个映射点的距离
          i.pointLength = Math.ceil(r.distanceStarting);                // 途径点最近映射点到起点的距离
          if(idx !=0 && i.pointLength == 0) {
            debugger                                                    // 距起点长度为0时错误排查（未解决，偶发bug）
          }
          i.mapLength = Math.ceil(r.nearestPointDistance);              // 途径点到映射点的距离
          i.mapPointX = filters.keepToFixed6(r.nearestPoint.x);         // 映射点坐标
          i.mapPointY = filters.keepToFixed6(r.nearestPoint.y);
        });
        pointList = common.lpobj.sortByKey(pointList, 'pointLength');   // 按距起点长度重新排序
        return pointList;
      },
      addMiddlePointHL(item, idx) {
        /**
         * 高亮途径点
         * @params item {Object}: 当前途径点位对象
         * @params idx {Number}:  当前途径点小旗帜序号
         */
         this.$set(item, 'num', idx+1);
         mapDraw.drawPoint_middle('layer_point_middle_active', item, 'ic-point-middle-active.png');
         mapSetting.drawPointLabel(item.pointName, item.pointX, item.pointY, 45, 0)
      },
      removeMiddlePointHL() {
        /**
         * 移除高亮的途径点
         */
        window.map.removeLayerById('layer_point_middle_active');
        mapSetting.removePointLabel();
      },
      setAutoFocus(key, val, elementId) {
        /**
         * 动态控制文本框自动聚焦
         */
        this[key] = val;
        setTimeout(function(){
          document.getElementById(elementId).select();
        }, 1)
      },
      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         * @param diff {number} : 差值
         */
        const winHt = document.documentElement.offsetHeight;
        this.scrollerHt = `${winHt-298}px`;
      },
      countPlanTime(item, idx) {
        /**
         * 两个途径点之间预计用时 =（当前点距起点距离-上一个点到起点的距离/速度 + 停留时间
         * @param item {Object}: 当前点对象（不包括起点）
         * @param idx  {Number}: 当前点在linePointArr中的索引
         */
        const pointLength = (item.pointLength -  this.linePointArr[idx-1].pointLength)/1000;         // 两途径点所对应映射点的距离（当前点距起点距离-上一个点到起点的距离）,最终转成km/h
        const planTime = Math.ceil((pointLength/item.speed)*60 + Number(item.parkTime));             // 根据速度算两途径点所对应映射点预估用时
        item.planTime = planTime;
        return planTime;
      },
      distanceIsOverrun(distance) {
        /**
         * 映射点距离是否超出限制范围： config.nearestPointDistance_limit 的值
         * @param distance {Number} : 映射点距离
         */
        return distance > config.nearestPointDistance_limit
      },
    }
  }
</script>

<style scoped>
  .layer-route-point{position:absolute;right:-1000px;top:43px;z-index:2;bottom:5px;width:300px;transition:right .4s;}
  .layer-route-point.active{right:0;}
  .layer-route-point.read-only{top:10px;}
  .primary-title .ic1::before, .primary-title .ic2::before{cursor:pointer;width:18px;height:16px;margin-left:5px;}
  .ic-suffix-mi::after,.ic-suffix-min::after{content:'米';position:absolute;right:5px;top:7px;color:#c0c4cc;}
  .ic-suffix-min::after{content:'分';}

  .list-route-scroller{width:290px;margin-top:25px;}
  .list-point{position:relative;padding-right:10px;}
  .list-point::before{content:'';display:block;position:absolute;top:8px;bottom:0;left:90px;width:3px;background:#bbc6d3;}
  .list-point li{position:relative;height:50px;box-sizing:border-box;padding-top:12px;}
  .list-point li::before{content:'';position:absolute;display:block;width:6px;height:6px;border:2px solid #bbc6d3;background:#fff;border-radius:20px;left:86px;bottom:0;}
  .list-point .speed,.list-point .time,.list-point .park-time{float:left;text-align:center;height:18px;color:#fff;border-radius:4px;border:none;box-sizing:border-box;}
  .list-point .name{float:left;width:80px;margin-right:14px;text-align:right;position:relative;top:24px;transition:all .2s;}
  .list-point .distance{color:#aab5c2;position:absolute;right:200px;top:11px;}
  .list-point .speed{width:31px;background:#549df2;}
  .list-point .time{width:34px;background:#6fd4be;margin:0 12px;cursor:not-allowed;}
  .list-point .park-time{width:34px;background:#f3b03e;}
  /* 可编辑状态下的name、speed、park-time */
  .list-point input.name{height:21px;line-height:21px;width:53px;top:22px;}
  .list-point input.speed,
  .list-point input.park-time{background:#fff;border:1px solid #549df2;color:#465461;}
  .list-point input.park-time{border-color:#f3b03e;}
  .ic-saveto-common-point,.ic-del-x{float:right;cursor:pointer;padding:3px 3px 0;position:relative;top:-4px;}
  /* 起点 */
  li.route-point-begin{height:16px;padding:0;}
  li.route-point-begin::before{border-color:#5093e1;}
  li.route-point-begin .name{top:2px;color:#5093e1;}
  li.route-point-begin input.input-primary{top:0;}
  li.route-point-begin .ic2{height:16px;margin-left:4px;position:relative;top:5px;}
  li.route-point-begin .ic2::before{height:16px;}
  li.route-point-begin .ic-speed::before{background-position:-240px -40px;}
  li.route-point-begin .ic-time{margin:0 18px 0 21px;}
  li.route-point-begin .ic-time::before{background-position:-260px -40px;}
  li.route-point-begin .ic-park-time::before{background-position:-280px -40px;}
  /* 失效途径点 */
  li.route-point-middle.point-invalid{color:#f00;}
  li.route-point-middle.point-invalid::before{border-color:#f00;}
  li.route-point-middle.point-invalid::after{content:'途径点已偏离路线';display:block;position:absolute;left:100px;top:37px;color:#f96868;}
  /* 终点 */
  li.route-point-end .name{top:23px;color:#91278d;}
  li.route-point-end::before{border-color:#91278d;}
  li.route-point-middle:hover, li.route-point-end:hover{cursor:pointer;}
  li.route-point-middle:hover::before, li.route-point-middle.active::before,
  li.route-point-end:hover::before{background:#f96868;border-color:#f96868;box-shadow:0 0 12px #f96868;}
  .btn-group-bottom{background:none;}
  /* 线路查看状态 */
  .form-wrap-theme2 .ic-suffix-mi::after,.form-wrap-theme2 .ic-suffix-min::after{position:static;padding-left:3px;}
</style>




