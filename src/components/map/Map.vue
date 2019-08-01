<!-- 地图 -->
<template>
  <div>
    <!-- 容器 -->
    <div id="mapcontent"></div>

    <!-- 工具栏 -->
    <div v-if="isShowToolbar" class="box-wrapper toolbar flex-wrap">
      <ul class="tools-btn">
        <!-- 搜索 -->
        <li v-if="toolbar.layerSearch">
          <el-popover placement="bottom-start" width="300" trigger="click">
            <div style="padding:12px 0;margin-bottom:10px;">
              <el-row type="flex" align="middle">
                <el-col :span="6">业务图层：</el-col>
                <el-col :span="18">
                  <el-select
                    v-model="srhLayerIdArr"
                    size="small"
                    multiple
                    filterable
                    default-first-option>
                    <el-option
                      v-for="(item,idx) in layerList"
                      :key="'layer'+idx"
                      :label="item.id"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </el-col>
              </el-row>
              <el-row type="flex" align="middle">
                <el-col :span="6">地图区域：</el-col>
                <el-col :span="18" class="select-maparea-tool">
                  <span v-for="(item,idx) in selectTools" :class="{'active':idx===checkedToolIdx}" :key="item.name"
                        :title="item.name" @click="selectTool(idx)"></span>
                     <!--<span v-if="item.type != 'clear'" v-for="(item,idx) in selectTools" :key="item.name" :title="item.name" @click="selectTool(idx)"></span>-->
                     <!--<span v-else v-for="(item,idx) in selectTools" :key="item.name" :title="item.name" @click="selectTool(item.type)"></span>-->
                </el-col>
              </el-row>
              <el-row type="flex" align="middle">
                <el-col :span="6">关键字：</el-col>
                <el-col :span="14">
                  <el-input v-model="srhKeyword" placeholder="请输入关键字" size="small"></el-input>
                </el-col>
                <el-col :span="3" :offset="1">
                  <span class="el-icon-search-bg" title="搜索" @click="mapSrh"><i class="el-icon-search"></i></span>
                </el-col>
              </el-row>
            </div>
            <!-- 分页的检索结果 -->
            <div class="result" v-if="srhTab.length">
              <ul class="result-tab clrfix">
                <li v-for="(item,idx) in srhTab" :key="'layerid'+idx" :class="{active:checkedSrhTabIdx == idx}"
                    @click="checkedSrhTabIdx = idx">{{item}}
                </li>
              </ul>
              <div v-if="srhResult && srhResult.length">
                <ol class="result-con">
                  <li v-for="(i,idx) in srhResult" @mouseenter="addHL(i.attributes,idx)" @mouseleave="removeHL" @click="setCenter(i.attributes)">
                    {{idx + 1}}. {{i.attributes.NAME}}
                  </li>
                </ol>
                <el-pagination
                  class="align-c"
                  small
                  layout="prev, pager, next"
                  :current-page="currentPage"
                  :pager-count="7"
                  @current-change="currentPageChange"
                  :page-size="pageSize"
                  :total="srhResultOrigin.length">
                </el-pagination>
              </div>
              <no-data v-if="srhResult && srhResult.length==0"></no-data>
            </div>

            <!-- 插槽 -->
            <span slot="reference"><em class="ic-tools-btn ic-search-before"></em>搜索</span>
          </el-popover>
        </li>

        <!-- 图层过滤 -->
        <li v-if="toolbar.layerSwitch">
          <el-dropdown :hide-on-click="false" trigger="click">
            <span class="el-dropdown-link"><em class="ic-tools-btn ic-layer-before"></em>图层</span>
            <el-dropdown-menu slot="dropdown" size="mini" class="layer-filter">
              <el-dropdown-item v-for="(item,idx) in layerList" :key="'layer'+idx">
                <el-checkbox v-model="item.visible" @change="layerSwitch">
                  {{item.id}}
                </el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>

        <!-- 测量（测距、测面）-->
        <li v-if="toolbar.measutre">
          <el-dropdown  :hide-on-click="false" trigger="click">
            <span class="el-dropdown-link"><em class="ic-tools-btn ic-computed-before"></em>测量</span>
            <el-dropdown-menu slot="dropdown" size="mini">
              <el-dropdown-item> <span @click="mapMeasutreStart('length')"><em class="ic-tools-btn ic-computed-length"></em> 测距</span></el-dropdown-item>
              <el-dropdown-item> <span @click="mapMeasutreStart('area')"><em class="ic-tools-btn ic-computed-area"></em> 测面</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>

        <!-- 地图常规操作 -->
        <li v-if="toolbar.zoom" @click="mapZoom('+')"><em class="ic-tools-btn ic-zoom-plus-before"></em>放大</li>
        <li v-if="toolbar.zoom" @click="mapZoom('-')"><em class="ic-tools-btn ic-zoom-minus-before"></em>缩小</li>
        <li v-if="toolbar.reset" @click="mapZoomReset"><em class="ic-tools-btn ic-reset-before"></em>复位</li>
        <li v-if="toolbar.clear" @click="mapMeasutreClear"><em class="ic-tools-btn ic-clear-before"></em>清除</li>
      </ul>
    </div>

    <!-- 地图气泡 -->
    <bubble-video class="box-bubble-wrapper"></bubble-video>
    <bubble-sign class="box-bubble-wrapper"></bubble-sign>
    <!--<bubble-police class="box-bubble-wrapper"></bubble-police>-->
  </div>
</template>

<script>
  import BubbleVideo from './BubbleVideoClick';
  import BubbleSign from './BubbleSignClick';
  import BubblePolice from './BubblePoliceClick';

  import common from '@tools/common';
  import mapSetting from '@tools/map-setting';
  import { mapMutations } from 'vuex';

  export default {
    props:{
      toolbar: {
        type: Object,
        default() {
          return {
            layerSearch: false,   // 图层检索
            layerSwitch: false,   // 图层开关
            measutre: false,      // 测量
            zoom: false,          // 层级缩放
            reset: false,         // 复位
            clear: false,         // 清除
          }
        }
      }
    },
    components: {
      BubbleVideo,
      BubbleSign,
      BubblePolice,
    },
    data() {
      return {
        mapOption: {                 // 地图初始化信息
          center: '',                // 中心点位置（获取当前选中的过车记录的经纬度）
          zoom: 5                    // 缩放级别
        },
        layerList: [],               // 图层：动态获取配置文件中的图层信息
        selectTools: [               // 检索：选择查询区域工具（圆、矩形、多边形）
          {name: '画圈', type: 'circle', checked:false},
          {name: '矩形', type: 'square', checked:false},
          {name: '多边形', type: 'polygon', checked:false},
          {name: '清除', type: 'clear', checked:false}
        ],
        checkedToolIdx: '',          // 检索：当前选中的圈选工具索引
        checkedResult: [],           // 检索：当前激活的tab图层id对应的结果
        srhResult: '',               // 检索：结果
        pageSize: 5,                 // 检索：分页每页显示5条（检索出来的是全部的数据，需要前端分页）
        currentPage: 2,              // 检索：结果分页数据，默认请求第一页
        srhKeyword: '',              // 检索：关键字
        srhTab: [],                  // 检索：查询结果tab title数组
        checkedSrhTabIdx: 0,         // 检索：当前选中tab title索引
        srhLayerIdArr: [],           // 检索：选中的图层类型数组（查询条件中：业务图层下拉多选）
        srhHLLayerIdArr: []          // 检索：当前分页高亮的点所在图层id 的数组
      }
    },
    computed: {
      isShowToolbar() {
        /**
         * 一个工具都需要时隐藏工具栏
         */
        const isShow = this.toolbar.layerSearch || this.toolbar.layerSwitch || this.toolbar.measutre || this.toolbar.zoom || this.toolbar.reset || this.toolbar.clear;  // 一个都不需要的时候隐藏工具栏
        return isShow;
      }
    },
    watch: {
      checkedSrhTabIdx() {
        // 检索结果tab
        this.mapSrhByParams();
      }
    },
    mounted() {
      // 动态获取配置文件中的图层信息
      this.getLayerList();
      // map初始化
      this.init_map();
      // 移除查询圈选区域
      localStorage.removeItem('areaE');

      window.map.addEventListener(EJMap.Event.onMapExtentChange, e => {
         // 地图视野范围改变
          this.setMapExtentChange();      // 重新定位自定义气泡位置
          mapSetting.removePointLabel();  // 移除点位悬浮提示文字
      })

    },
    methods: {
      ...mapMutations([
        'setMapExtentChange'       // 地图视野改变时，监听到改变的状态
      ]),
      getLayerList() {
        //动态获取配置文件里配置过的业务图层
        getMapConfig(e => {
//          console.log(e.operlayers)
          this.layerList = e.operlayers;
          this.layerList.forEach(i => {
            i.visible = false;
          })
        }, config.map_Config)
      },
      init_map() {
        // map init
        window.map = new EJMap("mapcontent", {
          // config：地图配置文件，从外部配置文件static/js/config.js里获取
          config: config.map_Config,
          zoom: this.mapOption.zoom
        });
      },
      selectTool(idx) {
        // 选择绘制查询区域的工具
        this.checkedToolIdx = idx;
        switch (this.selectTools[idx].type) {
          case 'polygon':
            // 画多边形
            mapSetting.handle_drawPolygon();
            break;
          case 'circle':
            // 画圆
            mapSetting.handle_drawCircle();
            break;
          case 'square':
            // 画矩形
            mapSetting.handle_drawSquare();
            break;
          default:
            // 清除画线、画圈、画矩形的图层
            mapSetting.clearLayer(['layer_area']);
            mapSetting.clearLayer(this.srhHLLayerIdArr, 1);
            localStorage.removeItem('areaE');
            break;
        }
      },
      mapSrh() {
        // 修改传入图层id数组时需要重置选中的tab索引，否则可能会用刚删除那个索引导致报错
        this.checkedSrhTabIdx = 0;
        this.srhTab = this.srhLayerIdArr;
        if (!this.srhLayerIdArr.length) {
          this.$message.error('请选择业务图层');
          return;
        }
        this.mapSrhByParams();
      },
      mapSrhByParams() {
        // 地图关键词、图层等检索
        let e = localStorage.getItem('areaE');
        let srhKeyword = this.srhKeyword ? "NAME like '%" + this.srhKeyword + "%'" : "1=1";
        if(e){
          // 查询框选区域
          e = JSON.parse(localStorage.getItem('areaE'));
          if (this.checkedToolIdx == 1) {
            // 矩形时，e需要转一下
            e = {
              "rings": [[[e.xmin, e.ymin], [e.xmax, e.ymin], [e.xmax, e.ymax], [e.xmin, e.ymax], [e.xmin, e.ymin]]],
              "spatialReference": {"wkid": 4326}
            }
          }

          map.query({
            layerid: this.srhTab[this.checkedSrhTabIdx], // map检索每次检索只能检索一个，当前tab选项卡选中哪一个，就查询那个layerid
            where: srhKeyword,
            geometry: e
          }, this.callback);
        }else{
          // 查询全部
          map.query({
            layerid: this.srhTab[this.checkedSrhTabIdx],
            where: srhKeyword
          }, this.callback);
        }
      },
      callback(r) {
        // 查询后的回调方法，渲染查询结果用,此处需要前端分页
        this.srhResultOrigin = r;
        // 重新查询后恢复第一页为当前页
        this.currentPage = 1;
        if (r.length) {
          this.setResultListByPage();
        } else {
          console.log(this.srhHLLayerIdArr)
          mapSetting.clearLayer(this.srhHLLayerIdArr, 1); // 对当前页画点且高亮(先清除原有的点)
          this.srhResult = [];
        }
      },
      setResultListByPage() {
        // 获取当前页码的数据
        this.srhResult = this.srhResultOrigin.slice((this.currentPage - 1) * this.pageSize, (this.currentPage - 1) * this.pageSize + this.pageSize);

        mapSetting.clearLayer(this.srhHLLayerIdArr, 1); // 对当前页画点且高亮(先清除原有的点)

        this.srhResult.forEach((i, idx) => {
          if(idx == 0){
            // 中心点重置为第一条检索结果的坐标
            mapSetting.mapCenter({
              x:i.attributes.LONGITUDE,
              y:i.attributes.LATITUDE,
            });
          }
          const layerId = common.lpdt.timestamp + '_' + idx + '_' + common.lpobj.getRan(10000000000);
          this.addSrhLayerId(layerId)
          this.drawPoint_highLight(i.attributes, layerId, 4326, null, idx + 1);
        })
      },
      currentPageChange(currentPage) {
        // 当前页码改变
        this.currentPage = currentPage;
        this.setResultListByPage()
      },
      drawPoint_highLight(pointInfo, layerId, wkid = 4326, symbol = {}, idx) {
        // ==== 画点：检索出来高亮的点
        const symbol_deft = {
          "url": `${config.image_URL}/map-ic-point.png`,
          "height": 29,
          "width": 20,
          "type": "esriPMS"
        };
        symbol = Object.assign(symbol_deft, symbol); // 合并symbol配置，以外部传入的配置覆盖默认配置
        window.map.addPoint2GraphicsLayer({
          geom: {
            x: pointInfo.LONGITUDE,
            y: pointInfo.LATITUDE,
            spatialReference: {wkid: wkid}
          },
          symbol: symbol,
          onclickeven: (e) => {
            const layerId = this.srhTab[this.checkedSrhTabIdx];
            switch (layerId) {
              case '视频监控':
                mapSetting.showBubble_video(pointInfo);
                break;
              case '警力资源':
                //mapSetting.showBubble_police(pointInfo);
                break;
              case '信号机':
                mapSetting.showBubble_sign(pointInfo);
                break;
            }
          }
        }, layerId, false);

        var zIndex = (layerId == 'layer_hoverHL') ? 200 : 10;   //hover高亮锁定某一个点的zindex层级远比普通带序号的点高
        window.map.reorderLayer(layerId, zIndex);

        // ==== 高亮点带序号（对应分页列表序号）
        if (idx) {
          const html = '<div style="background:#ff2b2b;border-radius:50%;width:15px;height:15px;text-align:center;line-height:15px;"> ' + idx + '</div>';
          window.map.creatInfoSymbol(layerId, html, {
            x: pointInfo.LONGITUDE,
            y: pointInfo.LATITUDE,
            spatialReference: {wkid: wkid}
          }, 5, -20, zIndex);
        }
      },
      addSrhLayerId(layerId) {
        // 保存所有高亮的点（检索结果和hover时高亮的点）
        this.srhHLLayerIdArr = new Set(this.srhHLLayerIdArr);
        this.srhHLLayerIdArr.add(layerId);
        this.srhHLLayerIdArr = Array.from(this.srhHLLayerIdArr);
      },
      addHL(pointInfo) {
        // 检索结果列表 hover 时与地图联动
        this.drawPoint_highLight(pointInfo, 'layer_hoverHL', 4326, {"url": `${config.image_URL}/map-ic-point-hl.png`}, null)
      },
      removeHL() {
        // 取消鼠标hover联动效果
        mapSetting.clearLayer(['layer_hoverHL']);
      },
      setCenter(center) {
        // 设置中心点
        mapSetting.mapCenter ({x:center.LONGITUDE, y:center.LATITUDE})
      },
      layerSwitch() {
        // 图层显隐
        this.layerList = mapSetting.layerSwitch(this.layerList)
      },
      mapMeasutreStart(type) {
        // 测量(测距、测面，type可选值'length' or 'area')
        mapSetting.mapMeasutre(type);
      },
      mapZoom(action) {
        // 地图缩放（action可选值'+' or '-'）
        mapSetting.mapZoom(action)
      },
      mapZoomReset() {
        // 图层复位
        mapSetting.mapZoomReset(this.mapOption.zoom);
      },
      mapMeasutreClear() {
        /**
         *  清除测距/面
         *  清除仅通过draw方法画的图层
         */
        window.map.clearMapGraphics(); // 仅能清除draw方法打点的图层，无法清除add方法打点的图层
        mapSetting.clearMeasutre();
        this.$emit('clear-map-draw');  // 可通过该自定义方法，清除指定图层
      }
    }
  }
</script>

<style>
 @import '../../assets/css/map.css';

</style>
<style>
  .el-checkbox__label{font-size:12px;}
</style>
