<!-- 基础信息管理：常备线路（列表） -->
<template>
  <div class="flex-wrap" :class="{'map-full-screen': mapIsDrawing}" >
    <!-- 线路列表 -->
    <div class="list-route-container" v-loading="showLoading">
      <!-- ***常备线路查询*** -->
      <ul class="list-filters clrfix common-route-filters">
        <li class="flex-wrap-c">
          <label>线路名称：</label>
          <el-input class="flex-item" size="mini" v-model="commonRouteName" clearable @clear="ajaxGetCommonRoutePageList(1)"></el-input>
        </li>
        <li class="flex-wrap-c">
          <label>线路起点：</label>
          <el-input class="flex-item" size="mini" v-model="routeStartPlace" clearable @clear="ajaxGetCommonRoutePageList(1)"></el-input>
        </li>
        <li class="flex-wrap-c">
          <label>线路终点：</label>
          <el-input class="flex-item" size="mini" v-model="routeTargetPlace" clearable @clear="ajaxGetCommonRoutePageList(1)"></el-input>
        </li>
        <li>
          <el-button type="primary" style="margin-top:3px;" size="mini" round @click="ajaxGetCommonRoutePageList()">查询</el-button>
        </li>
      </ul>

      <!-- ***常备线路列表*** -->
      <div class="pd-side20">
        <!-- list -->
        <ul class="list-background">
          <!-- head -->
          <li class="li-head">
            <el-row>
              <el-col :span="1">序号</el-col>
              <el-col :span="6">线路名称</el-col>
              <el-col :span="4">线路起点</el-col>
              <el-col :span="4">线路终点</el-col>
              <el-col :span="4">线路长度(m)</el-col>
              <el-col :span="5">预计形式时间（min）</el-col>
            </el-row>
          </li>

          <!-- body -->
          <template v-if="tableData.length">
            <li class="li-body" v-for="(item, idx) in tableData" :class="{active:item.commonRouteId == activeRouteId}" @click="routeClick(item)">
              <el-row>
                <el-col :span="1">{{idx+1}}</el-col>
                <!--<el-col :span="6">{{item.commonRouteId}}</el-col>-->
                <el-col :span="6">{{item.commonRouteName}}</el-col>
                <el-col :span="4">{{item.routeStartPlace}}</el-col>
                <el-col :span="4">{{item.routeTargetPlace}}</el-col>
                <el-col :span="4">{{item.routeLength}}</el-col>
                <el-col :span="5" class="position-r">
                  <div class="btn-group">
                    <span title="编辑" class="ic1 ic-edit-active"
                          :class="{active: item.commonRouteId == activeRouteId && showLayerEditRoute}"
                          @click="editRoute('edit', item.commonRouteId)"></span>
                    <span title="删除" class="ic2 ic-del-x-active"
                          @click.stop="confirmBeforeRouteDelete(item.commonRouteId, item.commonRouteName)"></span>
                  </div>
                  {{item.routePlanTime}}
                </el-col>
              </el-row>
            </li>
          </template>

          <!-- 暂无数据 -->
          <li v-if="tableData && !tableData.length"><no-data style="padding:100px 0;"></no-data></li>
        </ul>

        <!-- 分页 -->
        <el-pagination background layout="prev, pager, next, total"
                       v-show="tableData.length"
                       :current-page="currentPage"
                       :total="totalCount"
                       :page-size="pageSize"
                       @current-change="currentPageChange"></el-pagination>
      </div>
    </div>


    <!-- 地图区域 -->
    <div class="map-view">
      <!-- 控制地图区域全屏 -->
      <i class="ic2 ic-arrow-left" :class="{'ic-arrow-right': mapIsDrawing}" :title="mapIsDrawing ? '展开' : '收起'" @click="mapIsDrawing = !mapIsDrawing"></i>
      <!-- 添加线路 -->
      <i class="ic2 ic-add-square" title="添加常备线路" @click="showPopoverType = true">添加</i>
      <el-popover placement="right" width="100" trigger="click" :visible-arrow="false" popper-class="popper-add" v-model="showPopoverType">
        <p @click="editRoute('add')">手动添加</p>
        <p @click="editRoute('add', '', true)">智能规划</p>
      </el-popover>

      <!-- 地图 -->
      <enjoyor-map :toolbar="toolbar" @clear-map-draw="clearMapDraw"></enjoyor-map>

      <!-- ***浮层：常备线路新增/编辑*** -->
      <layer-edit-route :isShow="showLayerEditRoute"
                        :isEdit="true"
                        :isCommonRoute='true'
                        :lineIsAdding="lineIsAdding"
                        :isBaseOnNet="addLineBaseOnNet"
                        :isAddRoute="isAddRoute"
                        :editRouteId="activeRouteId"
                        @line-add-complete="lineAddComplete"
                        @cancel="cancel"
                        @edit-complete="editRouteComplete"
                        @set-map-draw-status="setMapDrawStatus"></layer-edit-route>
    </div>

    <!-- ***确认框：删除常备线路前二次确认*** -->
    <confirm :isShow="showConfirmDelRoute"
             :content="'确认要删除线路: \''+ delRouteName +'\' 吗?'"
             @ok="ajaxDeleteRoute"
             @close="showConfirmDelRoute = false"></confirm>
  </div>
</template>

<script>

  import EnjoyorMap from '@components/map/Map';
  import LayerEditRoute from '@components/layer/adminScheme_EditRoute';
  import { mapState, mapMutations } from 'vuex';
  import mapSetting from '@tools/map-setting';
  import mapDraw from '@tools/map-draw';
  export default {
    components: {
      EnjoyorMap,
      LayerEditRoute
    },
    data() {
      return {
        isAddRoute: false,                                          // 当前是否为新增线路操作
        mapIsDrawing: false,                                        // 是否正在地图绘制（true:右侧地图区域满屏显示）
        lineIsAdding: false,                                        // 是否正在地图绘线
        showLoading: false,                                         // 是否显示loading
        showConfirmDelRoute: false,                                 // 是否显示常备线路删除 二次确认框
        showLayerEditRoute: false,                                  // 是否显示常备线路编辑模态框（新增和修改公用一个，修改传入选中的线路id）
        addLineBaseOnNet: false,                                    // 新增线路使用智能规划（线路网上的）
        showPopoverType: false,

        commonRouteName: '',                                        // 查询条件：线路名称
        routeStartPlace: '',                                        // 查询条件：线路起点
        routeTargetPlace: '',                                       // 查询条件：线路终点
        tableData: '',                                              // 查询结果：列表数据
        totalCount: 0,                                              // 总条数
        currentPage: 1,                                             // 查询页码
        pageSize: 10,                                               // 分页条数（每页显示几条）

        activeRouteId:'',                                           // 选中高亮的线路id

        delRouteId:'',                                              // 确认删除的 线路id
        delRouteName:'',                                            // 确认删除的 线路name
      };
    },
    computed: {
      toolbar() {
        /**
         * 地图工具栏选项
         */
        let toolbar = {
          layerSwitch: true,
          reset: true,
          clear: true
        };
        if(this.activeRouteId) delete toolbar.clear;                // 编辑时不可在地图上直接清除线路（线路仅能在列表中清除，地图区域仅能编辑线路）
        return toolbar;
      },
    },
    mounted() {
      this.setPageSize().then(res =>{                               // 设置分页条数后再请求分页数据
        this.ajaxGetCommonRoutePageList();
      });
    },
    methods: {
      ...mapMutations([
        'setVuex_routeId'                                          // 设置高亮激活的线路id
      ]),
      // *** ajax start ***
      ajaxGetCommonRoutePageList(currentPage = 1) {
        /**
         * 获取常备线路分页list
         */
        this.currentPage = currentPage;
        const apiName = `${config.baseUrl_HOST}${this.$api.getCommonRoutePage_GET}`;
        const params = {
          pageSize: this.pageSize,                                  // *每页显示条数
          currentPage: currentPage,                                 // *请求的页码
          commonRouteName: this.commonRouteName,                    // 线路名称
          routeStartPlace: this.routeStartPlace,                    // 线路起点
          routeTargetPlace: this.routeTargetPlace                   // 线路终点
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.tableData = res.resultList && res.resultList.result;
              this.totalCount = res.resultList.totalCount;
            }
            this.showLoading = false;
          }).catch(rej => {
            this.showLoading = false;
        })
      },
      ajaxDeleteRoute() {
        /**
         * 删除常备线路，成功后更新常备线路分页list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.delCommonRoute_DELETE}`;
        const params = {
          commonRouteId:this.delRouteId
        };
        this.$http.delete(apiName, params).then(res => {
          if(res.appCode == 0){
            this.$message.success('常备线路删除成功！');

            // 删除的线路为当前高亮的线路：清除地图绘制、清除选中状态
            if(this.activeRouteId === this.delRouteId) {
              this.clearMapDraw();
              this.setVuex_routeId('');
              this.activeRouteId = '';
            }
            this.ajaxGetCommonRoutePageList(this.currentPage);
          }else{
            this.$message.error('常备线路删除失败！');
          }
          this.showConfirmDelRoute = false;
        }).catch(rej => {
          this.showConfirmDelRoute = false;
        })
      },
      // *** ajax end ***

      confirmBeforeRouteDelete(routeId, routeName) {
        /**
         * 常备线路删除前二次确认
         * @param routeId {String}:   需要删除的常备线路id
         * @param routeName {String}: 需要删除的常备线路name
         */
        this.showConfirmDelRoute = true;
        this.delRouteId = routeId;
        this.delRouteName = routeName;
      },
      currentPageChange(currentPage){
        /**
         * 当前页码改变，重新请求分页数据
         * @param currentPage {Number}: 请求的页码
         */
        this.ajaxGetCommonRoutePageList(currentPage)
      },
      routeClick(route) {
        /**
         * 是否选中列表中某条常备线路
         * @param route.routeId {String}:        常备线路id
         * @param route.routePointList {Array}:  常备线路点位集
         */
          this.activeRouteId = route.commonRouteId;
          localStorage.setItem('geo', route.strArea);
          localStorage.setItem('pointList', JSON.stringify(route.routePointList));
          this.setVuex_routeId(this.activeRouteId);
        this.reDrawLine();
      },
      lineAddComplete() {
        /**
         * 线路添加完成
         */
        this.showLayerEditRoute = true;
        this.lineIsAdding = false;
      },
      editRouteComplete(routeId) {
        /**
         * 线路编辑完成后，重新请求数据刷新routeList，并选中当前编辑的线路
         * @param routeId {String} :  刚编辑完的线路
         */
        this.showLayerEditRoute = false;
        this.activeRouteId = routeId;
        this.ajaxGetCommonRoutePageList();
        this.reDrawLine();
      },
      editRoute(action, routeId, isBaseOnNet = false){
        /**
         * 编辑线路（新增/修改）
         * @param action {String}:       新增（add） or 修改(edit)
         * @param routeId {String}:      当前编辑的线路id（新增为空）
         * @param isBaseOnNet {Boolean}: 画线是否在路网上智能规划
         */
        if(action == 'add'){
          // 新增线路（手动新增）
          this.activeRouteId = '';
          this.isAddRoute = true;
          this.showLayerEditRoute = false;
          this.addLineBaseOnNet = isBaseOnNet;
          this.lineIsAdding = true;
          setTimeout(() => {
            this.setMapDrawStatus(true)
          }, 200)
        }else{
          // 编辑线路(切换选中线路时可编辑)
          this.isAddRoute = false;
          this.activeRouteId = routeId;
          this.showLayerEditRoute = true;
          this.setVuex_routeId(routeId);  // 编辑的时候需要高亮激活当前编辑的线路
        }
        this.showPopoverType = false;
      },
      clearMapDraw() {
        /**
         * 地图顶部工具栏清除 未保存的 线路新增操作
         */
        mapSetting.clearLayer(['layer_line','layer_point_pass']);
        this.showLayerEditRoute = false;
      },
      setMapDrawStatus(isDrawing) {
        /**
         * 设置当前地图是否为绘制状态
         * @param isDrawing { Boolean }: 当前是否正在地图绘制操作
         */
        this.mapIsDrawing = isDrawing;
      },
      setPageSize() {
        /**
         * 设置方案容器高度，从而控制分页条数，高度需要配合条数高度的倍数来
         */
        const winHt = document.documentElement.offsetHeight;
        this.pageSize = Math.floor((winHt-200)/46);
        return new Promise((resolve, reject) => {
          resolve('设置分页条数成功，分页条数='+this.pageSize)
        })
      },
      cancel() {
        /**
         * 未保存（取消/关闭）编辑时，重新绘制当前选中的线路
         */
        this.showLayerEditRoute = false;

        if(this.isAddRoute) {
          // 取消新增，不画线，不选中

        }else {
          // 取消编辑，重画线，保持选中
          this.reDrawLine();
        }
      },
      reDrawLine() {
        /**
         * 重绘线路
         */
        mapSetting.clearLayer(['layer_line','layer_point_pass']);
        let geo = localStorage.getItem('geo') ? JSON.parse(localStorage.getItem('geo')) : '';
        let routePointList = localStorage.getItem('pointList') ? JSON.parse(localStorage.getItem('pointList')) : [];
        if(!geo) return;
        mapDraw.drawLine_route('layer_line', geo.paths[0], false);  // 绘制线
        mapDraw.drawPoint_pass(routePointList);                     // 绘制线上点
        geo.type = 'polyline';
        window.map.setLayerExtent(geo);                             // 图形显示在当前地图视图范围内
      }
    }
  }
</script>

<style scoped>
  /* 常备线路list */
  .list-route-container{width:760px;position:absolute;left:0;top:0;bottom:0;box-sizing:border-box;transition:left .4s;}
  li.li-body:hover{cursor:pointer;}
  .list-background .el-row .btn-group{padding:3px 10px 0 0;float:right;visibility:hidden;}
  .list-background li.li-body:hover .btn-group,.list-background li.li-body.active .btn-group{visibility:visible;}
  .ic-del-x-active::before,.ic-edit-active::before{width:15px;height:15px;margin-right:10px;}
  /* map */
  .map-view{border:1px solid #e6e6e6;position:absolute;top:10px;right:0;bottom:15px;left:760px;transition:all .4s;}
  .ic-add-square{position:relative;z-index:4;display:inline-block;padding:8px 10px 7px;color:#5093e1;}  /* 添加（方框+） */
  .ic-add-square:hover{font-weight:bold;}
  .ic-add-square::before{float:left;margin-right:5px;}
  /* 地图全屏 */
  .map-full-screen .list-route-container{left:-760px;}
  .map-full-screen .map-view{left:0;}
</style>

<style>
  /* == 覆盖elementui 样式 == */
  .common-route-filters .el-input--mini .el-input__inner{width:128px;}
  .current-point-location .el-input--mini .el-input__inner{height:28px;line-height:28px;}
  .current-point-location .el-button--mini.is-round{min-width:inherit;height:22px;padding:4px 16px;margin-left:10px;}
  .popper-add{margin:-28px 0 0 64px;padding:10px 0;border:none;}
  .popper-add p{height:30px;line-height:30px;padding-left:15px;}
  .popper-add p:hover{background:#5093e1;color:#fff;cursor:pointer;}
</style>
