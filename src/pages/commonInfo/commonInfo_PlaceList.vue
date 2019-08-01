<!-- 基础信息管理：常备单位（列表） -->
<template>
  <div class="flex-wrap" :class="{'map-full-screen': mapIsDrawing}">
    <div class="list-point-container" v-loading="showLoading">
      <!-- ***常备单位查询*** -->
      <ul class="list-filters clrfix common-place-filters">
        <li class="flex-wrap-c">
          <label>单位名称：</label>
          <el-input class="flex-item" size="mini" v-model="commonPlaceName" clearable></el-input>
        </li>
        <li class="flex-wrap-c">
          <label>单位地址：</label>
          <el-input class="flex-item" size="mini" v-model="placeAddress" clearable></el-input>
        </li>
        <li>
          <el-button type="primary" style="margin-top:3px;" size="mini" round @click="ajaxGetCommonPlacePageList()">查询</el-button>
        </li>
      </ul>

      <!-- ***常备单位列表*** -->
      <div class="pd-side20">

        <!-- list -->
        <ul class="list-background">
          <!-- head -->
          <li class="li-head">
            <el-row>
              <el-col :span="1">序号</el-col>
              <el-col :span="5">单位名称</el-col>
              <el-col :span="5">联系人电话</el-col>
              <el-col :span="2">单位性质</el-col>
              <el-col :span="2">车位数量</el-col>
              <el-col :span="6">单位地址</el-col>
              <el-col :span="3"></el-col>
            </el-row>
          </li>

          <!-- body -->
          <template v-if="tableData.length">
            <li class="li-body" v-for="(item, idx) in tableData" :class="{active:item.commonPlaceId == checkedPlaceId}" @click="checkPlace(item)">
              <el-row>
                <el-col :span="1">{{item.num}}</el-col>
                <el-col :span="5">{{item.commonPlaceName}}</el-col>
                <el-col :span="5">{{item.placePerson}} {{item.placePhone}}</el-col>
                <el-col :span="2">{{item.placeTypeName}}</el-col>
                <el-col :span="2">{{item.parkNumbers}}</el-col>
                <el-col :span="6">{{item.placeAddress}}</el-col>
                <el-col :span="3" class="position-r">
                  <div class="btn-group">
                    <span title="编辑" class="ic1 ic-edit-active"  @click.stop="editPlace(item.commonPlaceId)"></span>
                    <span title="删除" class="ic2 ic-del-x-active" @click.stop="confirmBeforePlaceDelete(item.commonPlaceId, item.commonPlaceName)"></span>
                  </div>
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

    <div class="map-view">
      <i class="ic2 ic-arrow-left" :class="{'ic-arrow-right': mapIsDrawing}" :title="mapIsDrawing ? '展开' : '收起'" @click="mapIsDrawing = !mapIsDrawing"></i>
      <i class="ic2 ic-add-square" title="添加常备单位" @click="editPlace()">添加</i>

      <!-- 地图(showToolbar：控制工具栏显隐) -->
      <enjoyor-map :toolbar="{layerSwitch: true, clear: true}"
                   :clearLayersName="['layer_point_common_place', 'layer_point_common_route']"></enjoyor-map>

      <!-- ***浮层:常备单位添加、编辑*** -->
      <layer-edit-place :isShow="showLayerEditPlace"
                        :placeId="checkedPlaceId" :checkedPlaceLocation="checkedPlaceLocation"
                        @close="showLayerEditPlace = false" @edit-complete="editPlaceComplete" @set-map-draw-status="setMapDrawStatus"
                        @point-add-complete="pointAddComplete"></layer-edit-place>
    </div>

    <!-- ***确认框：删除方案前二次确认*** -->
    <confirm :isShow="showConfirmDelPoint"
             :content="'确认要删除常备单位：\''+ delPlaceName +'\' 吗?'"
             @ok="ajaxDeletePoint"
             @close="showConfirmDelPoint = false"></confirm>


  </div>
</template>

<script>
  import EnjoyorMap from '@components/map/Map';
  import LayerEditPlace from '@components/layer/commonInfo_EditPlace';
  export default {
    components: {
      EnjoyorMap,
      LayerEditPlace
    },
    data() {
      return {
        mapIsDrawing: false,                                      // 是否正在地图绘制（true:右侧地图区域满屏显示）
        showLoading: false,                                       // 是否显示loading
        showConfirmDelPoint: false,                               // 是否显示常备单位删除 二次确认框
        showLayerEditPlace: false,                                // 是否显示常备单位编辑模态框（新增和修改公用一个，修改传入选中的单位id）

        commonPlaceName: '',                                      // 常备单位查询：单位名称
        placeAddress: '',                                         // 常备单位查询：单位地址

        checkedPlaceId:'',                                        // 常备单位列表：选中的单位id
        checkedPlaceLocation:'',                                  // 常备单位列表：选中的单位坐标

        tableData: '',                                            // 常备单位列表：列表数据
        totalCount: 0,                                            // 共几条
        currentPage: 1,                                           // 当前页码
        pageSize: 10,                                             // 每页显示几条

        delPlaceId:'',                                            // 确认删除的 单位id
        delPlaceName:'',                                          // 确认删除的 单位name
      };
    },
    mounted() {
      this.setPageSize().then(res =>{                             // 设置分页条数后再请求分页数据
        this.ajaxGetCommonPlacePageList();
      });
    },
    methods: {
      // *** ajax start ***
      ajaxGetCommonPlacePageList(currentPage = 1) {
        /**
         * 获取常备单位分页list
         */
        this.currentPage = currentPage;
        const apiName = `${config.baseUrl_HOST}${this.$api.getCommonPlacePage_GET}`;
        const params = {
          pageSize: this.pageSize,                                // 每页显示条数
          currentPage: currentPage,                               // 当前页码
          commonPlaceName: this.commonPlaceName,                  // 单位名称
          placeAddress: this.placeAddress                         // 单位地址
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              let tableData = res.resultList && res.resultList.result;
              tableData.forEach((i, idx) => {                     // 数据行序号
                i.num = this.$setPageNum(idx+1, this.pageSize, this.currentPage);
              });
              this.tableData = tableData;
              this.totalCount = res.resultList.totalCount;
            }
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxDeletePoint() {
        /**
         * 删除常备单位，成功后更新常备单位分页list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.delCommonPlace_DELETE}`;
        const params = {
          commonPlaceId:this.delPlaceId
        };
        this.showLoading = true;
        this.$http.delete(apiName, params).then(res => {
          if(res.appCode == 0){
            this.$message.success('常备单位删除成功！');
            if(this.checkedPlaceId === this.delPlaceId) this.checkedPlaceId = '';
            this.ajaxGetCommonPlacePageList();
          }else{
            this.$message.error('常备单位删除失败！');
          };
          this.showConfirmDelPoint = false;
          this.showLoading = false;
        }).catch(rej => {
          this.showConfirmDelPoint = false;
          this.showLoading = false;
        })
      },
      // *** ajax end ***

      confirmBeforePlaceDelete(placeId, placeName) {
        /**
         * 常备单位删除前二次确认
         * @param placeId {String}:   需要删除的常备单位id
         * @param placeName {String}: 需要删除的常备单位name
         */
        this.showConfirmDelPoint = true;
        this.delPlaceId = placeId;
        this.delPlaceName = placeName;
      },
      currentPageChange(currentPage){
        /**
         * 当前页码改变，重新请求分页数据
         * @param currentPage {Number}: 请求的页码
         */
        this.ajaxGetCommonPlacePageList(currentPage);
      },
      checkPlace(checkedPlace) {
        /**
         * 是否选中列表中某个常备单位
         * @param checkedPlace {Object}: 当前选中的常备单位
         */
        if(this.checkedPlaceId && this.checkedPlaceId == checkedPlace.commonPlaceId){
          // 已选中，点击取消
          this.checkedPlaceId = '';
          this.checkedPlaceLocation = '';
          this.showLayerEditPlace = false;
        }else{
          // 未选中，点击选中
          this.checkedPlaceId = checkedPlace.commonPlaceId;
          this.checkedPlaceLocation = [checkedPlace.placeX, checkedPlace.placeY];
        }
      },
      editPlace(placeId) {
        /**
         * 常备单位新增/修改
         * @param placeId {Object}:    需要编辑的常备单位
         */
        this.showLayerEditPlace = true;
        this.checkedPlaceId = placeId ? placeId :'';
        if(!placeId) this.checkedPlaceLocation = '';              // 新增时先通知子组件重置内容
      },
      editPlaceComplete(checkedPlace) {
        /**
         * 方案编辑/制作完成后，需要清空下当前正在编辑的方案id，并更新方案列表
         * @param checkedPlace {Object}:  当前选中的单位对象
         * @param checkedPlace.type {String}：   当前完成的是什么操作（新增or编辑）
         * @param checkedPlace.placeId {String}：当前编辑的单位id
         * @param checkedPlace.location {Array}：当前编辑的单位坐标[x, y]
         */
        this.checkedPlaceId = checkedPlace.placeId;
        this.checkedPlaceLocation = checkedPlace.location;
        this.ajaxGetCommonPlacePageList();
      },
      setPageSize() {
        /**
         * 根据方案容器高度控制分页条数
         */
        const winHt = document.documentElement.offsetHeight;
        this.pageSize = Math.floor((winHt-200)/46);
        return new Promise((resolve, reject) => {
          resolve('设置分页条数成功，分页条数='+this.pageSize)
        })
      },
      setMapDrawStatus(isDrawing) {
        /**
         * 设置当前地图是否为绘制状态
         * @param isDrawing { Boolean }: 当前是否正在地图绘制操作
         */
        this.mapIsDrawing = isDrawing;
      },
      pointAddComplete() {
        /**
         * 点绘制完成
         */
        this.showLayerEditPlace = true;
      }
    }
  }
</script>

<style scoped>
  /* == 组件私有样式 == */
  .list-point-container{width:760px;position:absolute;left:0;top:0;bottom:0;box-sizing:border-box;transition:left .4s;}     /* 常备单位list */
  li.li-body:hover{cursor:pointer;}
  .list-background .el-row .btn-group{padding:3px 10px 0 0;float:right;display:none;}
  .list-background li.li-body:hover .btn-group,.list-background li.li-body.active .btn-group{display:block;}
  .list-background li.li-body:hover .scheme-status,.list-background li.li-body.active .scheme-status{color:#fff;}
  .ic-del-x-active::before,.ic-edit-active::before, .ic-scan-active::before{width:15px;height:15px;margin-right:10px;}

  .map-view{border:1px solid #e6e6e6;position:absolute;top:10px;right:0;bottom:15px;left:760px;transition:all .4s;}         /* map */
  .ic-add-square{position:relative;z-index:4;display:inline-block;padding:8px 10px 7px;color:#5093e1;}
  .ic-add-square:hover{font-weight:bold;}
  .ic-add-square::before{float:left;margin-right:5px;}
  .map-full-screen .list-point-container{left:-760px;}                                                                      /* 全屏 */
  .map-full-screen .map-view{left:0;}
</style>

<style>
  /* == 覆盖elementui 样式 == */
  .common-place-filters .el-input--mini .el-input__inner{width:200px;}
</style>
