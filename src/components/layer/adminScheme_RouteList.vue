<!-- 线路list模块 -->
<template>
  <el-scrollbar ref="routeListScroll" class="el-scrollbar-xhidden route-list-scroller"
                :class="{'el-scrollbar-yhidden':routeInfoList.length<3}"
                :style="{height: scrollerHt}"
                v-loading="showLoading">
    <ul class="route-list">
      <li v-for="(item, idx) in routeInfoList"  :key="item.routeId+'_'+idx"
          class="box-memo" :class="{'active': activeRouteId == item.routeId}"  :title="item.routeName"
          @dblclick="routeClick(item, true)"
          @click="routeClick(item)"
          @mouseenter="addRouteHL(item)"
          @mouseleave="removeRouteHL">

        <p class="btn-route flex-wrap clrfix">
          <!-- 仅备用线路可切成主执线路 -->
          <template v-if="item.routeTypeId == 'ROUTETYPE02' && (isCanChangeRoute || isEdit)">
            <!-- 预演未开始: 可随意切换线路 -->
            <i title="设为主执行线路" class="ic1 ic-set-main" :class="{'ic-set-main-active': activeRouteId == item.routeId}"
                    @click.stop="ajaxChangeRouteType(item.routeId)"  v-if="!taskIsStart" ></i>

            <!-- 预演已开始: 切线路需二次确认提示 -->
            <i title="设为主执行线路" class="ic1 ic-set-main" :class="{'ic-set-main-active': activeRouteId == item.routeId}"
                  @click.stop="isChangeRouteType(item.routeId)" v-else></i>
          </template>
          <span class="route-type">{{item.routeTypeId == 'ROUTETYPE01'? '主' : '备'}}</span>
          <span class="route-count flex-item">{{item.routeLength/1000}}KM({{item.routePlanTime}}min)</span>

          <!-- 根据当前可编辑状态isEdit 控制操作按钮：关联岗位、关联设备（视频、信号机）、删除线路 -->
          <span class="btn-route-layer">
              <i class="ic1 ic-post"
                      :class="{'ic-post-active':activeRouteId == item.routeId, 'active': activeRouteId == item.routeId && showLayerRltPost}"
                      :title="isEdit ? '关联岗位' : '查看已关联岗位'"
                      @click="showRltInfo('post', item.routeId)"></i>

              <i class="ic1 ic-video"
                      :class="{'ic-video-active':activeRouteId == item.routeId, 'active': activeRouteId == item.routeId && showLayerRltDevice}"
                      :title="isEdit ? '关联设备' : '查看已关联设备'"
                      @click="showRltInfo('device', item.routeId)"></i>

              <i v-if="isEdit" title="删除" class="ic1 ic-dustbin"
                      :class="{'ic-dustbin-active':activeRouteId === item.routeId}"
                      @click.stop="confirmBeforeRouteDelete(item.routeId, item.routeTypeId == 'ROUTETYPE01'? '当前删除的是主执行线路，' : '')"></i>
          </span>
        </p>

        <!-- 线路方向（通过起止点表示）-->
        <p class="route-direction">
          <!--<span class="route-begin" :title="item.routeId">{{item.routeId}}</span>-->
          <span class="route-begin" :title="item.routeStartPlace">{{item.routeStartPlace}}</span>
          <span class="route-end" :title="item.routeTargetPlace">{{item.routeTargetPlace}}</span>
        </p>
      </li>
    </ul>

    <!-- ***确认框：切换主备线路前二次确认*** -->
    <confirm :isShow="showConfirmChangeRoute"
             :content="'预演已开始，切换线路会让预演重新开始，确认要切换吗?'"
             @ok="ajaxChangeRouteType"
             @close="showConfirmChangeRoute = false"></confirm>

    <!-- ***确认框：删除线路前二次确认*** -->
    <confirm :isShow="showConfirmDelRoute"
             :content="delRouteContent + '确认要删除该线路吗?'"
             @ok="ajaxDeleteRoute"
             @close="showConfirmDelRoute = false"></confirm>
  </el-scrollbar>
</template>

<script>
  import mapSetting from '@tools/map-setting';
  import mapDraw from '@tools/map-draw';
  import common from '@tools/common';
  import { mapState, mapMutations } from 'vuex';
  export default {
    props: {
      isEdit: {                                             // 当前是否为编辑状态（编辑状态可从routeList中删除线路）
        type: Boolean,
        default: false
      },
      isOnlyOneLine: {                                      // 整个页面是否只有一条线存在（关联任务页只有一条线路，预演、监测页允许多条线路存在）
        type: Boolean,
        default: false
      },
      taskIsStart: {                                        // 执行任务是否已经开始（主要针对预演、监测页 执行任务开始后切换线路时需要二次确认提示的）
        type: Boolean,
        default: false
      },
      isCanChangeRoute: {                                   // 是否可以切换主备线路：方案详情查看、提交、审核时不能切换，其余情况（预演、监测、制作页）默认都可切换
        type: Boolean,
        default: false
      },
      showLayerRltPost: {                                   // 当前是否打开了关联岗位的layer(主要用作图标选中高亮样式)
        type: Boolean,
        default: false
      },
      showLayerRltDevice: {                                 // 当前是否打开了关联设备的layer(主要用作图标选中高亮样式)
        type: Boolean,
        default: false
      },

    },
    data() {
      return {
        showLoading: false,
        showConfirmDelRoute: false,                          // 是否显示线路删除二次确认框
        showConfirmChangeRoute: false,                       // 是否显示线路切换二次确认框
        scrollerHt:'',                                       // routeInfoList滚动容器高度

        routeInfoList: [],                                   // 线路list
        changeRouteId: '',                                   // 需要切换的备用线路id(切换线路只能从备用线路升级到主执线路)
        delRouteId:'',                                       // 确认删除的线路id
        delRouteContent:'',                                  // 删除线路前提示文字
        activeRouteId: ''                                    // 当前操作的线路id
      }
    },
    computed: {
      ...mapState([
        'mapLoaded',                                         // 地图加载状态
        'countRouteListChange',                              // 监听次数，次数更新时控制routeList刷新
        'taskId',                                            // 当前高亮的任务id
        'routeId'                                            // 当前高亮的线路id
      ]),
    },
    watch: {
      taskId: {
        /**
         * 任务改变，线路list改变
         */
        handler(){
          if(this.taskId){
            this.ajaxGetRouteInfo();
          }
        },
        immediate: true
      },
      countRouteListChange() {
        /**
         * 刷新线路list*（仅在 “编辑” 状态下，各种关联操作的保存需要触发线路刷新操作；而 “查看” 状态不会改变线路，故无需刷新）
         */
        if(this.isEdit) this.ajaxGetRouteInfo(this.routeId);
      },
      routeId() {
        /**
         * 当前选中高亮的线路变化
         */
        this.activeRouteId = this.routeId;
      },
    },
    mounted() {
      if(!this.mapLoaded) {
        // 地图未加载完，待加载完再进行初始化
        this.$mapLoaded().then(res => {
          this.setVuex_mapLoaded(true);
        })
      }
    },
    methods: {
      ...mapMutations([
        'setVuex_mapLoaded',                           // 设置map load 状态
        'setVuex_routeId'                              // 设置当前激活高亮的线路id
      ]),
      // *** ajax start ***
      ajaxGetRouteInfo(activeRouteId = '') {
        /**
         * 根据选中的taskid查询当前任务下的线路信息
         */
//        if(!this.isFast) mapDraw.clearAllDraw();
        const apiName = `${config.baseUrl_HOST}${this.$api.getRouteInfoList_GET}`;
        const params = {
          taskId: this.taskId
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.routeInfoList = res.resultList;
              this.setActiveRouteId(activeRouteId);      // 设为当前选中的routeId
              this.showLoading = false;
            };
            this.setScrollHt();
          }).catch(rej => {
            this.showLoading = false;
          })
      },

      ajaxDeleteRoute() {
        /**
         * 线路删除
         * @param routeId {String} : 需要删除的线路id
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.deleteRouteInfo_DELETE}`;
        const params = {
          routeId: this.delRouteId,
        };
        this.$http.delete(apiName, params)
          .then(res => {
            this.showConfirmDelRoute = false;
            if(res.appCode == 0){
              this.$message.success('线路删除成功！');
              this.ajaxGetRouteInfo();                        // 默认选中第一条线路，没有则不选中
            }
          }).catch(rej => {
          this.showConfirmDelRoute = false;
        })
      },

      ajaxChangeRouteType(routeId) {
        /**
         * 线路主备类型切换（备用线路->执行线路）
         * @param routeId {String} : 备用线路id
         */
        routeId = routeId || this.changeRouteId;
        const apiName = `${config.baseUrl_HOST}${this.$api.changeRouteType_PUT}?taskId=${this.taskId}&routeId=${routeId}`;
        this.$http.put(apiName)
          .then(res => {
            if(res.appCode == 0){
              this.ajaxGetRouteInfo();
              this.$message.success('线路切换成功!');
              this.$emit('route-type-change', routeId);
            }else{
              this.$message.success('线路切换失败!');
            }
            this.showConfirmChangeRoute = false;
          })
      },
      // *** ajax end ***


      reDrawLineAndPoint(isOnlyOneLine = true) {
        /**
         * 重新 绘制线路、关联岗位、关联设备
         * @param isOnlyOneLine {Boolean}: 一个页面是否仅存在一条线路（预演、监测的可存在多条：false;  关联任务页仅存在一条线路：true）
         */
        for(let k=0; k<this.routeInfoList.length; k++){
          const route = this.routeInfoList[k];
          if(this.activeRouteId &&  this.activeRouteId == route.routeId){
              mapDraw.drawLineAndPoint(route, isOnlyOneLine);
              return;
          }
        }
      },

      addRouteHL(item) {
        /**
         * 线路高亮
         */
        mapDraw.addRouteHL(item);
      },

      removeRouteHL() {
        /**
         * 移除线路高亮
         */
        mapDraw.removeRouteHL()
      },

      isChangeRouteType(routeId) {
        /**
         * 预演进行中切换线路需要二次确认
         * @routeId {String} 需要提升为主执行线路的备用线路id
         */
        this.showConfirmChangeRoute = true;
        this.changeRouteId = routeId;
      },

      routeClick(routeInfo, isDoubleClick = false) {
        /**
         * 编辑框未显示时：单击选中，双击编辑线路
         * 编辑框已显示时：单击、双击均为编辑线路
         * @param routeInfo {Object}:       当前选中高亮的线路信息
         * @param isDoubleClick {Boolean}:  当前是否为双击操作（单机选中线路，双击编辑线路）
         */
        localStorage.setItem('geo',routeInfo.strArea);               // 存线对象到缓存
        this.activeRouteId = routeInfo.routeId;
        mapDraw.clearAllDraw();
        // 一个页面是否仅存在一条线路（预演、监测的可存在多条：false;  关联任务页仅存在一条线路：true）
        if(!this.isOnlyOneLine) {
          // 在预演和监测页下的线路模块，线路是只读的，绘制主线的时候layerId需要带上routeId做线路标识, 备用线路不带routeId（因为预演和监测只有一条主线）
          const mainRouteId = this.routeInfoList.length ? this.routeInfoList[0].routeId : '';
          mapDraw.clearAllDraw(mainRouteId);                        // 清除待执行任务组件上绘制的主线
          if(this.activeRouteId == mainRouteId) {
            this.reDrawLineAndPoint(false);                         // 非线路编辑状态：绘制主线时需要带上routeId
          }else{
            this.reDrawLineAndPoint(true);
          }
        }else {
          this.reDrawLineAndPoint(true);                            // 线路可编辑状态：绘制所有线路都是一样图层，不带routeId
        }
        this.setVuex_routeId(this.activeRouteId);
        this.$emit('route-click', {
          routeInfo: routeInfo,
          isDoubleClick: isDoubleClick,
          isEdit: this.isEdit
        });
      },

      setActiveRouteId(routeId = '') {
        /**
         * 设置选中的线路（若传入指定选中线路，则直接选中并赋值为指定线路id，未指定的默认选中第一条）
         * @param routeId {String} : 当前选中的线路
         */
        if(!this.routeInfoList.length) {
          this.activeRouteId = '';
        }else {
          routeId =  routeId || this.routeInfoList[0].routeId;      // 新增、修改 线路后选中当前编辑的线路( 删除线路后，则默认选中第一项)
          this.setRouteScrollY(routeId);
          this.activeRouteId = routeId;
          this.isOnlyOneLine && this.reDrawLineAndPoint();          // 只有关联任务页才需要绘制一条唯一的线（预演、监测页允许在待执行任务列表绘制多条主线，故在首次加载线路时无需绘制默认线路）
        }
        this.setVuex_routeId(this.activeRouteId);                   // 存vuex
      },

      setRouteScrollY(routeId) {
        /**
         * 根据当前选中的routeId获取当前在routeList中第几个,算scrollY
         * @param routeId {String} : 当前选中的routeId
         */
        let order = 0;
        this.routeInfoList.some((i, idx) => {
          if(i.routeId == routeId){
            order = idx;
            return true;
          }
        });
        let scrollY = order*80;
        this.$refs.routeListScroll.$refs.wrap.scrollTop = scrollY;
      },

      confirmBeforeRouteDelete(routeId, content = '') {
        /**
         * 线路删除前二次确认
         * @param routeId {String}:  需要删除的线路id
         * @param content {String}:  删除前提示文字
         */
        this.showConfirmDelRoute = true;
        this.delRouteContent = content;
        this.delRouteId = routeId;
      },

      showRltInfo(type, routeId) {
        /**
         * 显示线路关联信息（关联岗位、关联设备）
         */
        this.activeRouteId = routeId;
        this.setVuex_routeId(this.activeRouteId);                   // 存vuex
        this.$emit('show-route-rltInfo',{type: type, routeId: routeId})
      },

      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         */
        const routeLen = this.routeInfoList.length;
        if(routeLen == 0) {
          this.scrollerHt = '0px';
        }else if(routeLen == 1) {
          this.scrollerHt = '77px';
        }else {
          this.scrollerHt = '154px';
        }
      }
    }
  }
</script>

<style scoped>
  .btn-route i.ic-set-main{padding-left:0;}
  /* 线路list */
  .route-list-scroller{position:absolute;left:10px;bottom:15px;height:154px;width:251px;}
  .route-list{width:240px;}
  .route-list li:last-child{margin-bottom:5px;}
  .route-list li:hover{cursor:pointer;}
  .btn-route .ic1{float:left;padding:0 4px 0 4px;line-height:0;}
  .btn-route .route-type{padding:0 5px 0 4px;color:#5093e1;float:left;}
  .btn-route .route-count{color:#727d86;text-align:center;}
  .btn-route .btn-route-layer{text-align:right;position:relative;right:-7px;}
  .route-direction{clear:both;display:flex;position:relative;padding-top:9px;margin:9px 0 4px;}
  .route-direction::before{content:'';position:absolute;display:block;top:0;left:0;right:0;border-top:1px solid #b5bfca;border-bottom:1px solid #c1c9d2;height:0;}
  .route-direction span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .route-begin::before, .route-end::after{content:'';display:block;position:absolute;top:-3px;border-radius:50%;height:4px;width:4px;border:2px solid #5093e1;background:#fff;}
  .route-begin{color:#5093e1;text-align:left;}
  .route-begin::before{left:0;border-color:#5093e1;}
  .route-end{color:#91278d;text-align:right;}
  .route-end::after{right:0;border-color:#91278d;}
  .route-list li.active{background:#5093e1;color:#fff;border-color:#5093e1;border-radius:8px;}
  .route-list li.active .btn-route .route-type, .route-list li.active .btn-route .route-count,
  .route-list li.active span.route-begin, .route-list li.active span.route-end{color:#fff;}
  .route-list li.active span.route-begin::before, .route-list li.active span.route-end::after{border-color:#fff;background:#5093e1;}
  .route-list li.active .route-direction::before{border-color:#fff;}
</style>

