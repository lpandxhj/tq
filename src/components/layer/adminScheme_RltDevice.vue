<!-- 特勤方案：关联设备 -->
<template>
  <div class="box-shadow layer-rlt-device" :class="{active: isShow && routeId, 'read-only': !isEdit}"
       v-loading.fullscreen="showLoadingBuffer">
    <h2 class="primary-title">
      {{isEdit ? '缓冲查询设备' : '关联设备'}} {{isCheckDevice}}
      <i class="fr ic-close" title="关闭" @click="cancel"></i>
      <i v-if="isEdit" class="fr ic2 ic-set" title="关联设备"></i>
      <!-- 监测页开放设备巡检功能(可替换设备) -->
      <i v-if="isCheckDevice" class="fr ic2" title="设备巡检"></i>

      <!-- 控制图层显隐(有绑定关联设备时可控制) -->
      <i class="fr ic2 ic-layer-eyes"
         :class="{active: showLayerVideo}"
         :title="showLayerVideo ? '图层隐藏' : '图层显示'"
         @click="isShowLayer('showLayerVideo')"
         v-if="checkedLayer=='video'"></i>

      <i class="fr ic2 ic-layer-eyes"
         :class="{active: showLayerSign}"
         :title="showLayerSign ? '图层隐藏' : '图层显示'"
         @click="isShowLayer('showLayerSign')"
         v-else></i>
    </h2>

    <!-- 关联设备列表 -->
    <el-tabs type="border-card" v-model="checkedLayer" class="tab-device">
      <!-- 视频列表 -->
      <el-tab-pane name="video">
          <span slot="label" :class="{active:checkedLayer=='video'}" @click="checkedLayer=='video'">视频
            <!--<template v-if="isEdit">( {{checkedVideoList.length || 0}} / {{ (rltVideoList.length + videoList.length) || 0}} )</template>-->
            <!--<template v-else>( {{checkedVideoList.length || 0}} )</template>-->
          </span>
          <el-scrollbar class="el-scrollbar-xhidden list-device-scroller" :style="{height:scrollerHt}"
                      v-loading="showLoadingVideo">
          <ul class="list-border list-device list-device-video">
            <!-- 上一次保存的关联视频 -->
            <li v-for="item in rltVideoList" :key="item.d"
                @mouseenter="addDeviceHL('layer_point_video', item, 'ic-point-video-active.png')"
                @mouseleave="removeDeviceHL('layer_point_video', item, 'ic-point-video.png')">
              <i v-if="isEdit" class="ic2 ic-ckb-box" :class="{active: item.checked}"
                 @click="checkedChange(item, 'ic-point-video-checked.png', 'layer_point_video_checked')"></i>
              <span class="ellipsis name" :title="item.deviceName">{{item.deviceName}}</span>
              <span class="ellipsis id" :title="item.deviceId">{{item.deviceId}}</span>
            </li>

            <!-- 缓冲区查询出来的视频 -->
            <li v-for="item in videoList" :key="item.id"
                @mouseenter="addDeviceHL('layer_point_video_buffer', item, 'ic-point-video-active.png')"
                @mouseleave="removeDeviceHL('layer_point_video_buffer', item, 'ic-point-video.png')">
              <i v-if="isEdit" class="ic2 ic-ckb-box" :class="{active: item.checked}"
                 @click="checkedChange(item, 'ic-point-video-checked.png', 'layer_point_video_checked')"></i>
              <span class="ellipsis name" :title="item.deviceName">{{item.deviceName}}</span>
              <span class="ellipsis id" :title="item.deviceId">{{item.deviceId}}</span>
            </li>
          </ul>
          <no-data v-if="isEdit && !videoList.length && !rltVideoList.length" style="padding-top:100px;" :txt="'缓冲区暂无视频'"></no-data>
          <no-data v-if="!isEdit && !rltVideoList.length " style="padding-top:100px;" :txt="'暂无关联视频'"></no-data>
        </el-scrollbar>
      </el-tab-pane>

      <!-- 信号机列表 -->
      <el-tab-pane name="sign">
        <span slot="label" :class="{active:checkedLayer=='sign'}" @click="checkedLayer=='sign'">信号机
          <!--<template v-if="isEdit">( {{checkedSignList.length || 0}} / {{(rltSignList.length + signList.length) || 0}} )</template>-->
          <!--<template v-else>( {{checkedSignList.length || 0}} )</template>-->
        </span>
        <el-scrollbar class="el-scrollbar-xhidden list-device-scroller" :style="{height:scrollerHt}"
                      v-loading="showLoadingSign">
          <ul class="list-border list-device list-device-sign">
              <!-- 上一次保存的关联信号机 -->
              <li v-for="item in rltSignList" :key="item.id"
                  @mouseenter="addDeviceHL('layer_point_sign', item, 'ic-point-sign-active.png')"
                  @mouseleave="removeDeviceHL('layer_point_sign', item, 'ic-point-sign.png')">
                <i v-if="isEdit" class="ic2 ic-ckb-box" :class="{active: item.checked}"
                   @click="checkedChange(item, 'ic-point-sign-checked.png', 'layer_point_sign_checked')"></i>
                <span class="ellipsis name" :title="item.deviceName">{{item.deviceName}}</span>
                <span class="ellipsis id" :title="item.deviceId">{{item.deviceId}}</span>
              </li>

              <!-- 缓冲区查询出来的信号机 -->
              <li v-for="item in signList" :key="item.id"
                  @mouseenter="addDeviceHL('layer_point_sign_buffer', item, 'ic-point-sign-active.png')"
                  @mouseleave="removeDeviceHL('layer_point_sign_buffer', item, 'ic-point-sign.png')">
                <i v-if="isEdit" class="ic2 ic-ckb-box" :class="{active: item.checked}"
                   @click="checkedChange(item, 'ic-point-sign-checked.png', 'layer_point_sign_checked')"></i>
                <span class="ellipsis name" :title="item.deviceName">{{item.deviceName}}</span>
                <span class="ellipsis id" :title="item.deviceId">{{item.deviceId}}</span>
              </li>
          </ul>
          <no-data v-if="isEdit && !signList.length && !rltSignList.length" style="padding-top:100px;" :txt="'缓冲区暂无信号机'"></no-data>
          <no-data v-if="!isEdit && !rltSignList.length " style="padding-top:100px;" :txt="'暂无关联信号机'"></no-data>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>

    <!-- 按钮操作 -->
    <div class="btn-group-bottom" style="background:none;">
      <template v-if="isEdit">
        <el-button size="mini" round type="primary" @click="ajaxSaveDeviceList">保 存</el-button>
        <el-button size="mini" round @click="cancel">取 消</el-button>
      </template>
      <el-button v-else size="mini" round @click="cancel">关 闭</el-button>
    </div>

    <!-- 地图工具： 缓冲区距离控制手柄 -->
    <!--<map-buffer-distance-handle v-if="isShow" class="buffer-distabce-handle"></map-buffer-distance-handle>-->
  </div>
</template>

<script>
  /**
   * 【map图层信息】
   * 缓冲区多边形 —— layerId: layer_area_buffer，                                                  zIndex: -20
   * 缓冲区设备点 —— layerId（视频：layer_point_video_buffer;  信号机：layer_point_sign_buffer），    zIndex: 5
   * 设备点:checked —— layerId（视频：layer_point_video_checked; 信号机：layer_point_sign_checked），zIndex: 100
   */

  import MapBufferDistanceHandle from '@components/map/BufferDistanceHandle';

  import mapSetting from '@tools/map-setting';
  import mapDraw from '@tools/map-draw';
  import common from '@tools/common';
  import filters from '@js/filters';
  import {mapState, mapMutations} from 'vuex';

  export default {
    props: [
      'isEdit',
      'isShow',
      'retSetScrollHt',
      'isCheckDevice',
      'activeTab'
    ],
    components: {
      MapBufferDistanceHandle
    },
    data() {
      return {
        showLoadingBuffer: false,               // 设备缓冲loading
        showLoadingVideo: false,                // 视频列表loading
        showLoadingSign: false,                 // 信号机列表loading
        showLayerVideo: true,                   // 是否在地图上显示视频图层
        showLayerSign: true,                    // 是否在地图上显示信号机图层
        scrollerHt: '',                         // 设备list滚动容器高度

        checkedLayer: 'video',                  // tab默认显示视频模块
        bufferDistance: config.bufferDistance,  // 缓冲设备范围

        videoListBuffer: [],                    // 缓冲区视频原始list
        videoList: [],                          // 缓冲区视频list（这个是经过过滤过的，已经排除了已关联的视频了）
        rltVideoList: [],                       // 已关联视频
        signListBuffer: [],                     // 缓冲区信号机原始list
        signList: [],                           // 缓冲区信号机list
        rltSignList: [],                        // 已关联信号机

        activeRouteId: ''                       // 当前操作的线路id
      };
    },
    computed: {
      ...mapState([
        'taskId',
        'routeId'
      ]),
      checkedVideoList() {
        /**
         * 当前勾选的视频list
         *遍历已关联的信号机rltVideoList、缓冲区videoList，取勾选项拼新数组
         */
        let checkedVideoList = [];
        this.rltVideoList.forEach(i => {                                                                                                // 遍历已关联的视频：rltVideoList, 取勾选项
          if (i.checked) checkedVideoList.push(i);
        });
        this.videoList.forEach(i => {                                                                                                   // 遍历视频缓冲列表，videoList, 取勾选项
          if (i.checked) checkedVideoList.push(i);
        });
        return checkedVideoList;
      },
      checkedSignList() {
        /**
         * 当前勾选的信号机list
         * 遍历已关联的信号机rltSignList、缓冲区signList，取勾选项拼新数组
         */
        let checkedSignList = [];
        this.rltSignList.forEach(i => {                                                                                                 // 遍历已关联的视频：rltSignList, 取勾选项
          if (i.checked) checkedSignList.push(i);
        });
        this.signList.forEach(i => {                                                                                                    // 遍历视频缓冲列表，signList, 取勾选项
          if (i.checked) checkedSignList.push(i);
        });
        return checkedSignList;
      }
    },
    watch: {
      activeTab() {
        /**
         * 当前选中的tab
         */
        this.checkedLayer = this.activeTab;
      },

      routeId() {
        /**
         * 线路切换时 若当前模块为显示状态，则赋值当前线路id，关闭时清除
         */
        this.setActiveRouteId();
      },

      isShow() {
        /**
         * 模块显示时赋值当前线路id，关闭时清除
         */
        this.setActiveRouteId();
      },

      activeRouteId() {
        /**
         * 监听当前线路id改变
         */
        this.checkedLayer = 'video';                                                                                                    // tab 选项卡重置初始值
        if (this.isShow && this.activeRouteId) {
          if (this.isEdit) {
            // 编辑状态：加载已关联的设备、缓冲区查询
            mapDraw.clearDevicelayer();                                                                                                 // 移除所有高亮图层
            this.clearBuffer();
            const p_getRlt = this.ajaxGetDeviceList();
            const p_getBuffer = this.bufferSearch();
            Promise.all([p_getRlt, p_getBuffer]).then(res => {
              this.bufferSearch();                                                                                                      // 缓冲区查询
            }).catch(rej => {
              console.log(rej)
            })

          } else {
            // 查看状态：获取已关联的视频
            this.ajaxGetDeviceList();
          }
        }
      },
      checkedLayer() {
        /**
         * tab页卡切换时，清空高亮图层，重新获取已关联的图层并重绘关联点
         */
        this.$emit('tab-change', this.checkedLayer);
      },

      bufferDistance() {
        /**
         * 缓冲距离改变时，重新获取缓冲区设备list
         */
        this.clearBuffer();
        mapDraw.clearDevicelayer();
        this.bufferSearch();
      }
    },
    mounted() {
      this.setScrollHt();
    },
    methods: {
      ...mapMutations([
        'setVuex_routeListChange',                                                                                                      // 累加次数，使routeList组件中刷新列表
      ]),

      // *** ajax start ***
      ajaxGetDeviceList() {
        /**
         * 一次性获取关联设备信息list：返回结果根据设备类型分视频（rltVideoList）和信号机（rltSignList）
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getRltDeviceList_GET}`;
        const params = {
          taskId: this.taskId,
          routeId: this.routeId,
        };
        return this.$http.get(apiName, params)
          .then(res => {
            if (res.appCode == 0) {
              let deviceList = res.resultList;
              deviceList = deviceList.map((i, idx) => {
                if (this.isEdit) {
                  // 编辑状态重绘关联设备点前先清空原先在routeList组件中仅供查看的设备点
                  mapSetting.clearLayer(['layer_point_video', 'layer_point_sign']);
                  const layerId = (i.deviceTypeId == 'RLTDEVICETYPE01') ? 'layer_point_video_checked' : 'layer_point_sign_checked';     // 图层id
                  const icon = (i.deviceTypeId == 'RLTDEVICETYPE01') ? 'ic-point-video-checked.png' : 'ic-point-sign-checked.png';      // 图层图标
                  mapDraw.drawPoint_device(layerId, i, icon, 100);
                }
                i.pId = 'id_' + new Date().valueOf() + '_' + common.lpobj.getRan() + '_idx_' + idx;
                i.checked = true;
                return i;
              });
              // 已关联视频
              this.rltVideoList = deviceList.filter(i => {
                return i.deviceTypeId == 'RLTDEVICETYPE01'
              });
              // 已关联信号机
              this.rltSignList = deviceList.filter(i => {
                return i.deviceTypeId == 'RLTDEVICETYPE02'
              });
            } else this.$message.error('设备关联信息获取失败！');
          }).catch(rej => {
            this.$message.error('设备关联信息获取失败');
          })
      },

      ajaxSaveDeviceList() {
        /**
         * 保存线路关联设备信息
         */
        const deviceTypeId = (this.checkedLayer == 'video') ? 'RLTDEVICETYPE01' : 'RLTDEVICETYPE02';                                    // 设备类型
        const params = (this.checkedLayer == 'video') ? this.checkedVideoList : this.checkedSignList;                                   // 关联设备list
        const apiName = `${config.baseUrl_HOST}${this.$api.rltRouteDeviceList_POST}?taskId=${this.taskId}&routeId=${this.routeId}&deviceTypeId=${deviceTypeId}`;
        this.$http.post(apiName, params)
          .then(res => {
            if (res.appCode == 0) {
              this.$message.success('保存成功！');
              this.clearBuffer();
              this.setVuex_routeListChange();
              this.$emit('close');
            } else {
              this.$message.error('保存失败！');
            }
          }).catch(rej => {
          this.$message.error('保存失败！');
        })
      },
      // *** ajax end ***

      setActiveRouteId() {
        /**
         * 设置当前线路id(此处不直接使用routeId是因为routeId不能在关闭模块时清空，否则就会影响兄弟组件routeList的选中项的当前激活状态)
         * 如果不使用这个中间值来中转下的话必须监听模块显示和线路id变化两种情况，导致重复请求
         */
        if (this.isShow) {
          this.activeRouteId = this.routeId;
        } else {
          this.$emit('close');
          this.activeRouteId = '';
          this.checkedLayer = 'video';  // tab 选项卡重置初始值
          this.showLayerVideo = true;   //
          this.showLayerSign = true;
        }
      },

      filterBufferList(bufferList, rltList) {
        /**
         * 在缓冲区设备list中过滤掉已关联的设备
         * @param deviceType {String}: 当前高亮tab项下设备类型 video/sign (default:video)
         */
        for (let i = 0; i < rltList.length; i++) {
          for (let j = 0; j < bufferList.length; j++) {
            if (bufferList[j].deviceId == rltList[i].deviceId) {
              bufferList.splice(j, 1)
            }
          }
        }
        return bufferList;
      },
      bufferSearch() {
        /**
         * 线路缓冲设备查询
         */
        const ts = this;
        this.showLoadingBuffer = true;
        setTimeout(() => {
          this.showLoadingBuffer = false;
          let geo = localStorage.getItem("geo") ? JSON.parse(localStorage.getItem("geo")) : '';                                        // 不设置延迟会获取不到缓存中的geo
          if (!geo) return;
          this.showLoadingVideo = true;
          this.showLoadingSign = true;
          window.map.bufferGeometry({
            geometry: {
              'paths': geo.paths,
              'spatialReference': {
                'wkid': 4326
              }
            },
            distance: ts.bufferDistance
          }, cb_drawBuffer);
        }, 1000);

        function cb_drawBuffer(data) {
          /**
           * 根据缓冲距离绘制缓冲区，并显示缓冲区内设备图层
           * @param data {Object} : 缓冲查询返回结果对象
           */
          // 绘制半透明缓冲区
          window.map.removeLayerById('layer_area_buffer');
          mapDraw.drawArea_buffer('layer_area_buffer', data.geometry.rings, -20);

          // 过滤缓冲区内的视频
          window.map.identity({
            layerid: '视频监控',
            where: '1=1',
            geometry: data.geometry
          }, (result) => {
            ts.showLoadingVideo = true;
            const videoListBuffer = [];
            let videoList = ts.setDevicePoint(result, 'video');
            videoList.forEach(i => {
              // 缓冲区信号机需要在地图上打点（已关联的稍后会叠加在缓冲区图标上面），此时无需过滤已关联的点
              i.deviceTypeId = 'RLTDEVICETYPE01';
              i.deviceTypeName = '视频监控';
              mapDraw.drawPoint_device('layer_point_video_buffer', i, 'ic-point-video.png', 5);
              videoListBuffer.push(i);
            });
            ts.videoListBuffer = videoListBuffer;                                                    // 缓冲区视频原始数据
            ts.videoList = ts.filterBufferList(videoList, ts.rltVideoList);                          // 缓冲出来的视频图层list（缓冲区列表中需要移除缓冲区中已关联的视频）
            ts.showLoadingVideo = false;
          });

          // 过滤缓冲区内的信号机
          window.map.identity({
            layerid: '信号控制',
            where: '1=1',
            geometry: data.geometry
          }, (result) => {
            ts.showLoadingSign = true;
            const signListBuffer = [];
            let signList = ts.setDevicePoint(result, 'sign');
            signList.forEach(i => {
              i.deviceTypeId = 'RLTDEVICETYPE02';
              i.deviceTypeName = '信号机';
              mapDraw.drawPoint_device('layer_point_sign_buffer', i, 'ic-point-sign.png', 5);       // 缓冲区信号机需要在地图上打点（已关联的稍后会叠加在缓冲区图标上面），此时无需过滤已关联的点
              signListBuffer.push(i);
            });
            ts.signListBuffer = signListBuffer;                                                     // 缓冲区信号机原始数据
            ts.signList = ts.filterBufferList(signList, ts.rltSignList);                            // 缓冲出来的信号机图层list（缓冲区列表中需要移除缓冲区中已关联的信号机）
            ts.showLoadingSign = false;
          });
        }
      },

      clearBuffer() {
        /**
         * 清空缓冲区
         */
        mapDraw.clearBufferLayer();
        this.videoList = [];
        this.signList = [];
      },

      setDevicePoint(result, type = 'video') {
        /**
         * 设置设备点位、过滤设备图层
         * @param result {Array}:   缓冲区结果数组
         * @param layerId {String}: 需要缓冲的图层图层id('视频监控' or '信号控制');
         */
        let list = [];
        result.forEach(i => {
          // 设备点位信息
          const point = {
            pId: 'id_' + new Date().valueOf() + '_' + common.lpobj.getRan(),                                                            // 自定义缓冲区设备id，用于勾选操作时作为设备标识使用
            checked: false,
            deviceId: i.attributes.ID,
            deviceName: i.attributes.NAME,
            deviceX: filters.keepToFixed6(i.attributes.LONGITUDE),
            deviceY: filters.keepToFixed6(i.attributes.LATITUDE),
            deviceLength: 0,
            mapDeviceX: 0,
            mapDeviceY: 0,
            mapLength: 0,
            manageId: type == 'video' ? i.attributes.MANAGEID : i.attributes.SSID,
            // 以下这几个大写的字段数据库目前没存,所以自定义图层气泡拿不到完整的信息（若要直接在气泡上显示完整信息，数据库需要存这些字段)
//            DEPTNAME: i.attributes.DEPTNAME || '',                                                                                    // 设备所属部门
//            DEVTYPE_NAME: i.attributes.DEVTYPE_NAME || '',                                                                            // 设备类型
//            DEVSTATUS_NAME: i.attributes.DEVSTATUS_NAME || '',                                                                        // 设备状态
//            ID: i.attributes.ID,                                                                                                      // 设备编号
//            PIXLEVEL_NAME:  i.attributes.PIXLEVEL_NAME || '',                                                                         // 设备像素
//            MANUFACT: i.attributes.MANUFACT || ''                                                                                     // 设备厂家
          };
          list.push(point);
        });

        const lineGeo = localStorage.getItem('geo') ? JSON.parse(localStorage.getItem('geo')) : '';
        if (!list.length || !lineGeo) return [];
        list = this.resetPointDistance(list, lineGeo);
        return list;
      },

      resetPointDistance(pointList, lineGeo) {
        /**
         * 根据点位 和 线对象 算出点到起点的距离. 到上一个映射点的距离. 映射点信息等,最后按到起点的距离 升序
         * @param pointList {Array}:  点对象集合
         * @param lineGeo   {Object}: 线对象
         */
        // 遍历每个点，重新计算调整后的线到原途径点的映射距离及到起点的距离
        pointList.forEach(i => {
          let r = EJMap.commonFunction.getProjectionPoint(lineGeo, i.deviceX, i.deviceY);
          i.deviceLength = Math.ceil(r.distanceStarting);                                                                               // 设备点最近映射点到起点的距离
          i.mapLength = Math.ceil(r.nearestPointDistance);                                                                              // 设备点到映射点的距离
          i.mapDeviceX = filters.keepToFixed6(r.nearestPoint.x);                                                                        // 映射点坐标
          i.mapDeviceY = filters.keepToFixed6(r.nearestPoint.y);
        });
        return pointList;
      },

      removeDeviceHL(layerId, item, icon) {
        /**
         * 移除联动的高亮设备点
         * @param layerId {String}: 点位图层id
         */
        mapDraw.removeHL_point_device(layerId, item, icon)
      },

      addDeviceHL(layerId, item, icon) {
        /**
         * 高亮设备点
         * @param layerId {String}:  点位图层id
         * @param item {Object}:     点位对象
         * @param icon {String}:     点位图标图片名称
         */
        mapDraw.addHL_point_device(layerId, item, icon)
      },

      isShowLayer(layerType) {
        /**
         * 控制图层显示隐藏（包括缓冲区图层和已关联图层）
         * @param layerType {String}: 当前图层
         */
        this[layerType] = !this[layerType];
        let layerIdArr = [                                                                                                              // 需要隐藏的图层id集
          'layer_point_sign_checked',
          'layer_point_sign',
          'layer_point_sign_buffer'
        ];
        if (layerType == 'showLayerVideo') {
          layerIdArr = [
            'layer_point_video_checked',
            'layer_point_video',
            'layer_point_video_buffer'
          ];
        };

        // 图层 隐藏
        if (!this[layerType]) {
          mapSetting.clearLayer(layerIdArr);
          return;
        }

        // 图层 显示: 绘制已关联的、缓冲区的设备点
        if (layerType == 'showLayerVideo') {
          // 视频点位
          this.videoListBuffer.forEach(i => {
              mapDraw.drawPoint_device('layer_point_video_buffer', i, 'ic-point-video.png', 5);                                         // 缓冲区原始视频点位
          });
          this.checkedVideoList.forEach(i => {
              mapDraw.drawPoint_device('layer_point_video_checked', i, 'ic-point-video-checked.png', 100);                              // 已勾选的点位(图层覆盖在缓冲区之上)
          });
        } else {
          // 信号机点
          this.signListBuffer.forEach(i => {
            mapDraw.drawPoint_device('layer_point_sign_buffer', i, 'ic-point-sign.png', 5);                                             // 缓冲区原始视频点位
          });
          this.checkedSignList.forEach(i => {
            mapDraw.drawPoint_device('layer_point_sign_checked', i, 'ic-point-sign-checked.png', 100);                                  // 已勾选的点位(图层覆盖在缓冲区之上)
          });
        }
      },

      checkedChange(item, icon, layerId) {
        /**
         * 当前选中的设备改变时, 联动地图设备点高亮显示,
         * @param item {Object}:      当前设备对象
         * @param icon {String}:      设备绘制点图标
         * @param layerId {String}:   当前设备所在的图层
         */
        item.checked = !item.checked;
        if (item.checked) {
          mapDraw.drawPoint_device(layerId, item, icon, 100);                                                                           // 选中加入已选中列表
        } else {
          window.map.deleteLayer({layerId: layerId, pId: item.pId});                                                                    // 从已选中列表中移除指定layerId 的 指定pId的点位
        }
      },

      cancel() {
        /**
         * 取消关键设备操作，清空地图设备图层、重新请求接口、关闭关联设备弹层
         */
        this.$emit('close');
        if (this.isEdit) {
          this.clearBuffer();
          this.setVuex_routeListChange();
        }
      },

      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         * @param dValue {number} : 差值
         */
        const winHt = document.documentElement.offsetHeight;
        const diff = this.retSetScrollHt ? 291 : 228;
        this.scrollerHt = `${winHt - diff}px`;
      }
    }
  }
</script>

<style scoped>
  .layer-rlt-device{position:absolute;right:-1000px;top:43px;z-index:2;bottom:5px;width:300px;transition:right .4s;}
  .layer-rlt-device.active{right:0;}
  .layer-rlt-device.read-only{top:10px;}
  .layer-rlt-device.read-only .list-device li{padding-left:15px;}
  .primary-title .ic-close{margin-left:3px;}
  /* 设备list */
  .list-device-scroller{height:500px;width:300px;margin-top:5px;position:relative;left:-10px;}
  .list-device{position:relative;width:300px;}
  .list-device li{display:flex;align-items:center;padding:10px 14px 10px 35px;}
  .list-device .name{flex:1;}
  .list-device .id{display:inline-block;width:115px;padding-right:0;box-sizing:border-box;text-align:right;}
  .list-device li.disabled{color:#f96868;}    /* 异常设备 */
  .ic-ckb-box{position:absolute;left:0;top:3px;padding:8px 10px 10px 10px;}
  .ic-layer-eyes{margin-right:5px;}

  /*.buffer-distabce-handle{position:fixed;top:92px;z-index:2;}  !* 控制缓冲范围的手柄 *!*/
</style>


