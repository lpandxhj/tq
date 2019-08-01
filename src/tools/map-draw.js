'use strict';
import mapSetting from './map-setting';
import store from '../store/store';

/**
 * 和该项目业务直接相关的地图绘制、图层清空
 * 【1】线：
 * 1）绘制关联线路；                  zIndex: 1
 *
 * 【2】点：
 * 1）绘制线路起止点、映射点、途径点；  zIndex: 10
 * 2）绘制关联岗位；                  zIndex: 10
 * 3）绘制关联设备（信号机、视频）；    zIndex: 10
 * 4）绘制动画小车；                  zIndex: 20
 *
 * 【3】面：
 * 1）绘制缓冲区；                   zIndex: -20
 */
export default {
  isHasRoute(routeInfo) {
    /**
     * 是否存在线路
     * @param routeInfo {Object}: 线路对象
     */
    if(!routeInfo.strArea) return false;
    let geo = (typeof routeInfo.strArea == 'string') ? JSON.parse(routeInfo.strArea) : routeInfo.strArea;
    return geo || false;
  },
  
  // 线
  drawLine_route(layerId = 'layer_line', paths, isHighLight = false) {
    /**
     * 绘制关联线路
     * @param layerId {String}:       点位图层id
     * @param paths {Array}:          图形线对象（组成线的点数组）
     * @param isHighLight {Boolean}:  是否为高亮线路
     */
    const color = isHighLight ? [145, 39, 141] :  [170, 181, 194];
    const zIndex = isHighLight ? 9999 :  1;
    mapSetting.auto_drawLine({
      paths: paths,
      layerId : layerId,
      zIndex : zIndex,
      symbol: {
        "type": "esriSLS",
        "style": "esriSLSSolid",
        "color": color,
        "width": 3
      },
      cb_click :null
    });
  },
  addRouteHL(route) {
    /**
     * 线路高亮(整个项目仅存在唯一的一个图层)
     * @param route {Object}: 线路对象
     */
    let geo = this.isHasRoute(route);
    const paths = geo && geo.paths[0];
    if(!paths) return;
    this.drawLine_route('layer_line_active', paths, true);
    window.map.reorderLayer('layer_line_active', 5);
  },
  removeRouteHL() {
    /**
     * 移除线路高亮
     */
    window.map.removeLayerById('layer_line_active')
  },
  
  
  // 点
  drawPoint_pass (pointList, layerId = 'layer_point_pass') {
    /**
     * 线路起止点、途径点、映射点绘制
     * @param pointList {Array}:      所有点数组
     * @param layerId {String}:       指定图层id
     */
    window.map.removeLayerById(layerId);      // 清图层
    // 绘制点
    pointList.forEach((i, idx) => {
      if(i.pointTypeName.indexOf('途径点') != -1){
        // 途径点
        const random = (Math.random()*100000).toString().split('.')[0];                                // 随机数
        const random_id = 'id_'+new Date().valueOf() + '_' + random;
        i.num = idx;                                                                                     // 途径点序号
        i.pId = random_id;
        if(i.mapPointX && i.mapPointY) this.drawPoint_nearest(layerId, i, 'ic-point-nearest.png', 10);  // 映射点(映射点在最底下)
        this.drawPoint_middle(layerId, i, 'ic-point-middle.png', 10);

      }else if(i.pointTypeName.indexOf('起点') != -1) {
        // 起点
        this.drawPoint_side(layerId, i, 'ic-point-begin.png', 10);

      }else if(i.pointTypeName.indexOf('终点') != -1) {
        // 终点
        this.drawPoint_side(layerId, i, 'ic-point-end.png', 10);
      }
    });
  },
  
  drawPoint_nearest(layerId, item, icon, zIndex = 9999) {
    /**
     * 绘制映射点
     * @param layerId {String}:  点位图层id
     * @param item {Object}:     点位对象
     * @param icon {String}:     点位图标图片名称
     * @param zIndex {String}:   图层层级
     */
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: item.mapPointX,
        y: item.mapPointY,
        spatialReference: {wkid: 4326}
      },
      symbol: {
        "url": `${config.image_URL}/${icon}`,
        "height": 7,
        "width": 7,
        "type": "esriPMS"
      },
    }, layerId, false);
    window.map.reorderLayer(layerId, zIndex);
  },
  
  drawPoint_middle(layerId, item, icon, zIndex = 9999) {
    /**
     * 绘制途径点
     * @param layerId {String}:  点位图层id
     * @param item {Object}:     点位对象
     * @param icon {String}:     点位图标图片名称
     * @param zIndex {String}:   图层层级
     */
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: item.pointX,
        y: item.pointY,
        spatialReference: {wkid: 4326}
      },
      attributes : item,
      mixlabel : 'num',
      symbol: {
        "url": `${config.image_URL}/${icon}`,
        "height": 20,
        "width": 17,
        "xoffset": 5,
        "yoffset": 8,
        "lableoffsetx" : 13,
        "lableoffsety" : 12,
        "lablecolor" : '#fff',
        "lablefontweight":'lighter',
        "type": "esriPMS"
      },
      onmouseover: e => {
        /**
         * 点位名称label提示
         */
        const labelTxt = e.graphic.attributes.pointName;
        const pointX = e.graphic.attributes.pointX;
        const pointY = e.graphic.attributes.pointY;
        mapSetting.drawPointLabel(labelTxt, pointX, pointY, 35, 35);
        store.commit('setVuex_pId', e.graphic.attributes.pId);
      },
      onmouseout: e => {
        /**
         * 移除点位label提示
         */
        mapSetting.removePointLabel();
        store.commit('setVuex_pId', 0);
      }
    }, layerId, false);
    window.map.reorderLayer(layerId, zIndex);
  },
  
  drawPoint_side(layerId, item, icon, zIndex = 9999) {
    /**
     * 绘制起止点
     * @param layerId {String}:  点位图层id
     * @param item {Object}:     点位对象
     * @param icon {String}:     点位图标图片名称
     * @param zIndex {String}:   图层层级
     */
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: item.pointX,
        y: item.pointY,
        spatialReference: {wkid: 4326}
      },
      attributes : item,
      mixlabel : 'num',       // 这个mixlabel配置其实是无用代码，这里不得不加是因为途径点和起止点是同一个图层，后面绘制的起止点若不配置mixlabel，则这个统一的图层上的所有点都不具备mixlabel功能；
      symbol: {
        "url": `${config.image_URL}/${icon}`,
        "height": 28,
        "width": 14,
        "xoffset": -1,
        "yoffset": 10,
        "type": "esriPMS"
      },
      onmouseover: e => {
        /**
         * 点位名称label提示
         */
        const labelTxt = e.graphic.attributes.pointName;
        const pointX = e.graphic.attributes.pointX;
        const pointY = e.graphic.attributes.pointY;
        mapSetting.drawPointLabel(labelTxt, pointX, pointY, 6, 55);
        store.commit('setVuex_pId', e.graphic.attributes.pId);
      },
      onmouseout: e => {
        /**
         * 移除点位label提示
         */
        mapSetting.removePointLabel();
        store.commit('setVuex_pId', 0);
      }
    }, layerId, false);
    window.map.reorderLayer(layerId, zIndex);
  },
  
  drawPoint_car(item, routeId, plateNum) {
    /**
     * 绘制动画小车（带车牌）
     * @param item {Object} :     当前定位信息
     * @param routeId {String} :  当前线路id
     * @param plateNum {String} : 当前任务前导车牌
     */
    window.map.deleteLayer({layerId: 'layer_point_car', ID: routeId}); // 先删除，再绘制
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: item.x,
        y: item.y,
        spatialReference: {wkid: 4326}
      },
      attributes : {
        ID: routeId,
        value : plateNum
      },
      mixlabel : 'value',
      symbol: {
        "url": `${config.image_URL}/ic-point-car.png`,
        "height": 51,
        "width": 48,
        "yoffset": 24,
        "lableoffsetx" : 31,
        "lableoffsety" : 13,
        "lablecolor" : '#5093e1',
        "lablefontweight":'lighter',
        "lablebackground":'#fff',
        "type": "esriPMS"
      }
    }, 'layer_point_car', false);
    window.map.reorderLayer('layer_point_car', 20);
  },
  
  drawPoint_post(layerId, attributes, icon, zIndex = 9999) {
    /**
     * 绘制关联岗位点
     * @param layerId {String}:     点位图层id
     * @param attributes {Object}:  点位对象
     * @param icon {String}:        点位图标图片名称（此处未写死图片路径是因为chekced的时候绘制点也复用了这个方法，只有icon参数变了）
     * @param zIndex {String}:      图层层级
     */
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: attributes.postX,
        y: attributes.postY,
        spatialReference: {wkid: 4326}
      },
      attributes : attributes,
      mixlabel : 'num',
      symbol: {
        "url": `${config.image_URL}/${icon}`,
        "height": 25,
        "width": 20,
        "lableoffsetx" : 19,
        "lableoffsety" : 12,
        "lablecolor" : '#fff',
        "lablefontweight":'lighter',
        "type": "esriPMS"
      },
      onmouseover: e => {
        /**
         * 高亮当前聚焦点位：提示点位名称、 高亮点位图标
         */
        e.graphic.attributes.pageX = e.pageX;
        e.graphic.attributes.pageY = e.pageY;
        this.addHL_point_post(layerId, e.graphic.attributes, 'ic-point-post-active.png');
      },
      onmouseout: e => {
        /**
         * 移除点位高亮
         */
        this.removeHL_point_post(layerId, e.graphic.attributes, icon);
      }
    }, layerId, false);
    window.map.reorderLayer(layerId, zIndex);
  },
  setSymbol_point_post(layerId, pId, icon) {
    /**
     * 修改岗位点图标
     * @param layerId {String}:    点位图层id
     * @param pId {String}:        点位id
     * @param icon {String}:       点位图标
     */
    window.map.setSymbolById({
      layerId: layerId,
      pId : pId,
      symbol: {
        point: {
          "url": `${config.image_URL}/${icon}`,
          "height": 25,
          "width": 20,
          "lableoffsetx" : 19,
          "lableoffsety" : 12,
          "lablecolor" : '#fff',
          "lablefontweight":'lighter',
          "type": "esriPMS"
        }
      }
    });
  },
  addHL_point_post(layerId, attributes, icon) {
    /**
     * 岗位点高亮
     * @param layerId {String}:    点位图层id
     * @param attributes {Object}: 点位对象
     * @param icon {String}:       点位图标图片
     */
    const labelTxt = attributes.postName;
    const pointX = attributes.postX;
    const pointY = attributes.postY;
    mapSetting.drawPointLabel(labelTxt, pointX, pointY, 15 , 40);   // 显示点位名称提示
    this.setSymbol_point_post(layerId, attributes.pId, icon);       // 点位图层highlight
    store.commit('setVuex_pId', attributes.pId);
  },
  removeHL_point_post(layerId, attributes, icon) {
    /**
     * 移除岗位点高亮
     * @param layerId {String}:    点位图层id
     * @param attributes {Object}: 点位对象
     * @param icon {String}:       点位图标图片
     */
    mapSetting.removePointLabel();                                  // 移除点位名称提示
    this.setSymbol_point_post(layerId, attributes.pId, icon);       // 移除highlight，恢复normal
    store.commit('setVuex_pId', 0);
  },
  clearPostLayer() {
    /**
     * 清除所有关联岗位图层
     */
    mapSetting.clearLayer([
      'layer_point_post',                                           // normal:  岗位图层
      'layer_point_post_checked',                                   // checked: 勾选高亮的岗位图层
    ])
  },

  
  drawPoint_device(layerId, attributes, icon, zIndex = 9999) {
    /**
     * 绘制关联设备点
     * @param layerId {String}:     点位图层id
     * @param attributes {Object}:  点位对象
     * @param icon {String}:        点位图标图片名称
     * @param zIndex {Number}:      点位图标层级
     */
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: attributes.deviceX,
        y: attributes.deviceY,
        spatialReference: {wkid: 4326}
      },
      attributes: attributes,
      symbol: {
        "url": `${config.image_URL}/${icon}`,
        "height": 19.5,
        "width": 19.5,
        "type": "esriPMS"
      },
      onclickeven: e => {
        /**
         * 点位气泡
         */
        if(e.graphic.attributes.deviceTypeId == 'RLTDEVICETYPE02') {
          store.commit('setVuex_bubbleSignInfo', e.graphic.attributes);
        }else{
          store.commit('setVuex_bubbleVideoInfo', e.graphic.attributes);
        }
      },
      onmouseover: e => {
        /**
         * 高亮当前聚焦点位：提示点位名称、 高亮点位图标
         */
        const icon_active = (e.graphic.attributes.deviceTypeId == 'RLTDEVICETYPE01') ? 'ic-point-video-active.png' : 'ic-point-sign-active.png';
        this.addHL_point_device(layerId, e.graphic.attributes, icon_active)
      },
      onmouseout: e => {
        /**
         * 移除点位高亮
         */
        this.removeHL_point_device(layerId, e.graphic.attributes, icon)
      }
    }, layerId, false);
    window.map.reorderLayer(layerId, zIndex);
  },
  setSymbol_point_device(layerId, pId, icon) {
    /**
     * 修改设备点图标
     * @param layerId {String}:    点位图层id
     * @param pId {String}:        点位id
     * @param icon {String}:       点位图标
     */
    window.map.setSymbolById({
      layerId: layerId,
      pId : pId,
      symbol: {
        point: {
          "url": `${config.image_URL}/${icon}`,
          "height": 19.5,
          "width": 19.5,
          "type": "esriPMS"
        }
      }
    });
  },
  addHL_point_device(layerId, attributes, icon) {
    /**
     * 设备点高亮
     * @param layerId {String}:     点位图层id
     * @param attributes {Object}:  点位对象
     * @param icon {String}:        点位图标
     */
    const labelTxt = attributes.deviceName;
    const pointX = attributes.deviceX;
    const pointY = attributes.deviceY;
    mapSetting.drawPointLabel(labelTxt, pointX, pointY, 35 , 35);   // 显示点位名称提示
    this.setSymbol_point_device(layerId, attributes.pId, icon);     // 修改点位图片
  },
  removeHL_point_device(layerId, attributes, icon) {
    /**
     * 移除设备点高亮
     * @param layerId {String}:     点位图层id
     * @param attributes {Object}:  点位对象
     * @param icon {String}:        点位图标
     */
    mapSetting.removePointLabel();                                  // 移除点位名称提示
    this.setSymbol_point_device(layerId, attributes.pId, icon);     // 修改点位图片
  },
  clearDevicelayer() {
    /**
     * 清除所有关联设备图层
     */
    mapSetting.clearLayer([
      'layer_point_video_checked',                           // checked: 勾选高亮的视频图层
      'layer_point_sign_checked',                            // checked: 勾选高亮的信号机图层
    ])
  },
  
  // 面
  drawArea_buffer(layerId, rings, zIndex = 9999) {
    /**
     * 缓冲区绘制
     * @param layerId {String}:  缓冲区图层id
     * @param rings {Array}:     缓冲区区域面对象（由一组点组成的面）
     * @param zIndex {String}:   图层层级
     */
    window.map.addPolygon2GraphicsLayer({
      geom: {
        rings: rings,
        spatialReference: 4326
      },
      symbol: {
        'type': 'esriSFS',
        'style': 'esriSFSSolid',
        'color': [80, 147, 225, 80]
      },
      onmouseup: false,
      edit: false
    }, 'layer_area_buffer', false);
    window.map.reorderLayer(layerId, zIndex);         // 缓冲区图层半透明多边形置底 （不遮挡其余图层）
  },
  clearBufferLayer() {
    /**
     * 清空缓冲区所有图层
     */
    mapSetting.clearLayer([
      'layer_point_video_buffer',                                     // 缓冲区视频图层
      'layer_point_sign_buffer',                                      // 缓冲区信号机图层
      'layer_area_buffer',                                            // 缓冲区半透明多边形
    ]);
  },
  
  
  // 关联线路及关联的点位（线、点、面）
  drawLineAndPoint(route, isOnlyOneLine = false) {
    /**
     * 绘制线、点（线路存在才会有各种关联点——起止点、途径点、设备点、岗位点）；
     * @param route {Object} :          需要绘制的线路对象
     * @param isOnlyOneLine {Boolean} : 是否只有一条线（有复选框的任务list绘制线路可绘制多条，勾选一个任务默认绘制一条，而单独的线路list组件中每次仅绘制当前选中的那条线）
     */
    let geo = this.isHasRoute(route);
    const paths = geo && geo.paths[0];
    if(paths){
      geo.type = 'polyline';
      window.map.setLayerExtent(geo);                                                                        // 图形显示在当前地图视图范围内
      
      const routeId = route.routeId;
      // 绘制执行线路
      const layerId_line = !isOnlyOneLine ? `${routeId}_layer_line` : 'layer_line';                          // 线图层
      this.drawLine_route(layerId_line, paths);
    
      const layerId_point_pass = !isOnlyOneLine ? `${routeId}_layer_point_pass` : 'layer_point_pass';        // 起止点、途径点图层
      // 绘制起止点、途径点
      if(route.routePointList && route.routePointList.length)
        this.drawPoint_pass(route.routePointList, layerId_point_pass);
    
      // 绘制关联岗位点
      const layerId_point_post = !isOnlyOneLine ? `${routeId}_layer_point_post` : 'layer_point_post';        // 关联岗位点图层
      if(route.rltRoutePostList && route.rltRoutePostList.length)
        route.rltRoutePostList.forEach((i, idx) => {
          const random = (Math.random()*100000).toString().split('.')[0];                                    // 随机数
          const random_id = 'id_'+new Date().valueOf() + '_' + random;                                       // 岗位图层中每个岗位点id
          i.pId = random_id;
          i.ID = random_id;
          i.num = idx+1;
          this.drawPoint_post(layerId_point_post, i, 'ic-point-post.png', 10);
        });
    
      // 绘制关联设备（视频、信号机）点
      if(route.rltRouteDeviceList && route.rltRouteDeviceList.length){
        route.rltRouteDeviceList.forEach(i => {
          const random = (Math.random()*100000).toString().split('.')[0];                                     // 随机数
          const random_id = 'id_'+new Date().valueOf() + '_' + random;                                        // 关联设备图层中每个设备点id
          i.ID = random_id;
          const icon = (i.deviceTypeId == 'RLTDEVICETYPE01') ? 'ic-point-video-checked.png' : 'ic-point-sign-checked.png';
          let layerId_point_device = (i.deviceTypeId == 'RLTDEVICETYPE01') ?  `${routeId}_layer_point_video` : `${routeId}_layer_point_sign`;     // 视频、信号机图层
          if(isOnlyOneLine) {
              layerId_point_device = (i.deviceTypeId == 'RLTDEVICETYPE01') ?  `layer_point_video` : `layer_point_sign`;
          }
          this.drawPoint_device(layerId_point_device, i, icon, 10);
        });
      }
    }
  },
  clearPoint_car(routeId = '') {
    /**
     * 根据routeId清除动画小车(动画小车都在一个图层上的，动画小车按routeId作为点位唯一标识)
     * @param routeId {String}: 线路id 作为唯一标识, 若不指定，默认清除整个小车图层layer_point_car
     */
    
    if(routeId) {
      window.map.deleteLayer({layerId: 'layer_point_car', ID: routeId}); // 先删除，再绘制
    }else {
      window.map.removeLayerById('layer_point_car');
    }
  },
  clearAllDraw (routeId = '') {
    /**
     * 清除线路绘制相关的点、线、面（各线路对应的点、线、面图层）
     */
    let clearLayerArr = [
      {
        name: '线路图层',                   // 图层名称
        id: 'layer_line',                  // 图层id
        isAddPrefix: true                  // routeId存在时，图层需要绑定到线路,前缀为routeId
      },{
        name: '线路起止点、途径点、映射点图层',
        id: 'layer_point_pass',
        isAddPrefix: true
      },{
        name: '线路关联岗位图层',
        id: 'layer_point_post',
        isAddPrefix: true
      },{
        name: '线路关联岗位图层选中',
        id: 'layer_point_post_checked',
        isAddPrefix: false
      },{
        name: '线路关联视频图层',
        id: 'layer_point_video',
        isAddPrefix: true
      },{
        name: '线路关联视频图层选中',
        id: 'layer_point_video_checked',
        isAddPrefix: false
      },{
        name: '线路关联信号机图层',
        id: 'layer_point_sign',
        isAddPrefix: true
      },{
        name: '线路关联信号机选中',
        id: 'layer_point_sign_checked',
        isAddPrefix: false
      },{
        name: '线路缓冲区图层',
        id: 'layer_area_buffer',
        isAddPrefix: false
      },{
        name: '线路缓冲区视频图层',
        id: 'layer_point_video_buffer',
        isAddPrefix: false
      },{
        name: '线路缓冲区信号机图层',
        id: 'layer_point_sign_buffer',
        isAddPrefix: false
      }
    ];
   
    if(routeId) {
      // 部分图层需要绑定到线路id上，预演、监测时可勾选绘制多条线路时就需要绑定到routeId上
      let arr = [];
      clearLayerArr.forEach(i => {
        if(i.isAddPrefix) i.id = `${routeId}_${i.id}`;
        arr.push(i)
      });
      clearLayerArr = arr;
    }
    clearLayerArr = clearLayerArr.map(i => {return i.id});    // 拿到id, 根据layerId 清相应图层
    mapSetting.clearLayer(clearLayerArr)
  },
}




