'use strict'
/**
 * 银江地图常用操作
 * @author： liping
 * @date  ： 2018-06-02
 * @qq    ： 814091973
 */
let aroundLayerIdArr = [];  //存放查看周边所有的图层id

export default {
  // =========================  图层绘制（手动/自动画点、线、面...） ===============================
  /**
   * 手动画单个点
   */
  handle_drawPoint (cb) {
    //触发：手动画点
    window.map.drawPoint({
      display: false,
      clean: false
    }, cb_drawPoint)

    function cb_drawPoint (e) {
      //回调：手动画点
      window.map.addPoint2GraphicsLayer({
        geom: {
          x: e.x,
          y: e.y,
          spatialReference: {wkid: e.spatialReference.wkid}
        },
        symbol: {
          'url': `${config.mapServer_URL}+'/js/enjoyor/images/symbols/marker_red.png`,
          'height': 17,
          'width': 17,
          'type': 'esriPMS'
        }
      }, 'layer_point_handle', false);

      cb && cb([e.x, e.y]);   // 画点后获取点的坐标
    }
  },

  /**
   * 手动画多个点
   */
  handle_drawMultiPoint (cb) {
    //触发：手动画多个点
    window.map.drawMultipoint({
      display: false,
      clean: false
    }, cb_drawMultiPoint)

    function cb_drawMultiPoint (e) {
      //回调：手动画多个点
      for (var i = 0; i< e.points.length; i++) {

        console.log(e.points)
      }
      // window.map.addPoint2GraphicsLayer({
      //   geom: {
      //     x: e.x,
      //     y: e.y,
      //     spatialReference: {wkid: e.spatialReference.wkid}
      //   },
      //   symbol: {
      //     'url': `${config.mapServer_URL}+'/js/enjoyor/images/symbols/marker_red.png`,
      //     'height': 17,
      //     'width': 17,
      //     'type': 'esriPMS'
      //   }
      // }, 'layer_point_handle', false);
      //
      // cb && cb(e.paths);   // 画点后获取点的坐标
    }
  },


  /**
   * 手动画线
   * @param layerId {String}: 画线的id
   * @param cb {Function}:    画线后的回调
   */
  handle_drawLine (layerId = 'layer_line', cb) {
    //触发：手动画线
    window.map.drawPolyline({
      display: false,
      clean: true
    }, cb_drawLine);

    function cb_drawLine (e) {
      //回调：手动画线
      window.map.addLine2GraphicsLayer({
        geom: {
          paths: e.paths,
          spatialReference: {wkid: e.spatialReference.wkid}
        },
        attributes: {
          type: '',
          number: 1
        },
        onmouseup: false,
        edit: true
      }, layerId, false);

      cb && cb(e.paths);   // 画完线后获取线上的所有点坐标
    }
  },


  /**
   * 手动画多边形
   */
  handle_drawPolygon (cb) {
    //触发：手动画多边形
    window.map.drawPolygon({
        display: false,
        clean: true
      },
      this.cb_drawPolygon);
    function cb_drawPolygon (e) {
      //回调：手动画多边形
      window.map.clearLayerById('layer_area')
      localStorage.setItem('areaE', JSON.stringify(e))
      window.map.addPolygon2GraphicsLayer({
        geom: {
          rings: e.rings,
          'spatialReference': e.spatialReference
        },
        attributes: {
          type: '',
          number: 1
        },
        symbol: {
          'type': 'esriSFS',
          'style': 'esriSFSSolid',
          'color': [115, 76, 0, 155],
          'outline': {
            'type': 'esriSLS',
            'style': 'esriSLSSolid',
            'color': [110, 110, 110, 255],
            'width': 1
          }
        },
        onmouseup: false,
        edit: true
      }, 'layer_area', false);
      cb && cb(e.rings);   // 画完获取多边形上所有点的坐标
    }
  },


  /**
   * 手动画圆
   */
  handle_drawCircle (cb) {
    //触发：手动画圆
    window.map.drawCircle({
        display: false,
        clean: true
      },
      this.cb_drawCircle);
    function cb_drawCircle (e) {
      //回调：手动画圆
      window.map.clearLayerById('layer_area')
      localStorage.setItem('areaE', JSON.stringify(e))
      window.map.addPolygon2GraphicsLayer({
        geom: {
          rings: e.rings,
          'spatialReference': e.spatialReference
        },
        attributes: {
          type: '',
          number: 1
        },
        symbol: {
          'type': 'esriSFS',
          'style': 'esriSFSSolid',
          'color': [115, 76, 0, 155],
          'outline': {
            'type': 'esriSLS',
            'style': 'esriSLSSolid',
            'color': [110, 110, 110, 255],
            'width': 1
          }
        },
        onmouseup: false,
        edit: true
      }, 'layer_area', false);

      cb && cb(e.rings); // 画完圆后获取圆周长上的所有点坐标
    }
  },

  /**
   * 手动画矩形
   */
  handle_drawSquare (cb) {
    //触发：手动画矩形
    window.map.drawRectangle({
      display: false,
      clean: true
    }, this.cb_drawSquare);

    function  cb_drawSquare (e) {
      //回调：手动画矩形
      window.map.clearLayerById('layer_area');
      localStorage.setItem('areaE', JSON.stringify(e))
      window.map.addPolygon2GraphicsLayer({
        geom: {
          rings: [[[e.xmin, e.ymin], [e.xmax, e.ymin], [e.xmax, e.ymax], [e.xmin, e.ymax]]],
          'spatialReference': e.spatialReference
        },
        attributes: {
          type: '',
          number: 1
        },
        symbol: {
          'type': 'esriSFS',
          'style': 'esriSFSSolid',
          'color': [115, 76, 0, 155],
          'outline': {
            'type': 'esriSLS',
            'style': 'esriSLSSolid',
            'color': [110, 110, 110, 255],
            'width': 1
          }
        },
        onmouseup: false,
        edit: true
      }, 'layer_area', false);
      cb && cb([[[e.xmin, e.ymin], [e.xmax, e.ymin], [e.xmax, e.ymax], [e.xmin, e.ymax]]]);   // 画完矩形后获取4个点的坐标
    }
  },

  /**
   * 自动画点
   * @param pointInfo(Object)           点位信息：包括坐标属性、attribute属性（用于鼠标事件中动态获取属性值）
   * @param layerId(String)             图层id：图层id
   * @param wkid(Number)                点位坐标类型
   * @param symbol(Object)              点位图标配置：图标url、尺寸
   * @param cb_click(Function)          点位点击事件回调：如果需要动态获取点的attribute属性，需要在pointInfo中传入attribute属性
   * @param zIndex(Number)              图层层级（deft:300）
   */
  auto_drawPoint (opt) {
    // 默认配置
    const opt_deft = {
      pointInfo: {},
      layerId : 'layer_id',
      wkid : 4326,
      zIndex : 300,
      symbol : {
        "url": `${config.mapServer_URL}/js/enjoyor/images/symbols/symbol/map-ic-point.png`,
        "height": 46,
        "width": 18,
        "type": "esriPMS"
      },
      cb_click :null
    };

    // 新传入的配置替换默认配置
    opt = Object.assign(opt_deft, opt);
    // 坐标不存在，无法画点
    if(typeof opt.pointInfo.LONGITUDE == undefined || typeof opt.pointInfo.LATITUDE == undefined)  return ;
    // 开始画点
    window.map.addPoint2GraphicsLayer({
      geom: {
        x: opt.pointInfo.LONGITUDE,
        y: opt.pointInfo.LATITUDE,
        spatialReference: {wkid: opt.wkid}
      },
      symbol: opt.symbol,
      onclickeven: e => {
        opt.cb_click && opt.cb_click(opt.pointInfo);
      },
    }, opt.layerId, false);

    // 设置图层层级
    window.map.reorderLayer(opt.layerId, opt.zIndex);
  },

  /**
   * 自动画线
   *
   */
  auto_drawLine (opt) {
    // 默认配置
    const opt_deft = {
      paths: [],
      layerId : 'layer_line',
      wkid : 4326,
      zIndex : 300,
      symbol : {
        "type" : "esriSLS",
        "style" : "esriSLSDash",
        "color" : [255, 0, 0 ],
        "width" : 2
      },
      cb_click :null
    };

    // 新传入的配置替换默认配置
    opt = Object.assign(opt_deft, opt);
    // 开始画线
    window.map.addLine2GraphicsLayer({
      geom : {
        paths : [opt.paths],              //所有点位的集合  [[[x1,y1],[x2,y2]...[xn,yn]]]
        spatialReference:{wkid:4326}
      },
      symbol : opt.symbol,
    }, opt.layerId, false);
    window.map.reorderLayer(opt.layerId, opt.zIndex);
  },

  /**
   * 自动画气泡
   *
   */
  auto_drawSymbol(html = '', xOffset = 0, yOffset = 0, zIndex = 100) {
    // 画图标上的label气泡
    html = html || '<div style="width:15px;height:15px;text-align:center;line-height:15px;">气泡标签</div>'
    window.map.creatInfoSymbol(opt.layerId, html, {
      x: opt.pointInfo.LONGITUDE,
      y: opt.pointInfo.LATITUDE,
      spatialReference: {wkid: opt.wkid}
    }, xOffset, yOffset, zIndex);
  },

  /**
   * 视频设备气泡
   * @param attributes(Object)          点位对象（包含点位坐标、属性等）
   * @param layerId(String)             气泡id (默认 layer_symbol_video)
   */
  showBubble_video (attributes, layerId = 'layer_symbol_video') {
    let html = `<span> 视频设备气泡 </span>`;
    window.map.creatInfoSymbol(layerId, html, {
      "x": attributes.LONGITUDE,
      "y": attributes.LATITUDE,
      "spatialReference": {"wkid": 4326}
    }, 20, 100, 100, false) //（id, html, geo, x偏移量, y偏移量, zIndex, ）
  },

  /**
   * 信号设备气泡
   * @param attributes(Object)          点位对象（包含点位坐标、属性等）
   * @param layerId(String)             气泡id (默认 layer_symbol_sign)
   */
  showBubble_sign (attributes, layerId = 'layer_symbol_sign') {
    let html = `<span> 信号机气泡 </span>`;
    window.map.creatInfoSymbol(layerId, html, {
      "x": attributes.LONGITUDE,
      "y": attributes.LATITUDE,
      "spatialReference": {"wkid": 4326}
    }, 20, 100, 100, false) //（id, html, geo, x偏移量, y偏移量, zIndex, ）
  },

  /**
   * 警员气泡
   * @param attributes(Object)          点位对象（包含点位坐标、属性等）
   * @param layerId(String)             气泡id (默认 layer_symbol_police)
   */
  showBubble_police (attributes, layerId = 'layer_symbol_police') {
    let html = `<span> 警员气泡 </span>`;
    window.map.creatInfoSymbol(layerId, html, {
      "x": attributes.LONGITUDE,
      "y": attributes.LATITUDE,
      "spatialReference": {"wkid": 4326}
    }, 20, 100, 100, false) //（id, html, geo, x偏移量, y偏移量, zIndex, ）
  },
  
  /**
   * 点位标签文字提示(标签坐标又经纬度坐标转换而来)
   */
  drawPointLabel (labelTxt, pointX, pointY, offsetX = 0, offsetY = 0) {
    /**
     * 绘制点位提示文字，在鼠标移入点位时显示，移开时移除
     * @param labelTxt {String}:  点位提示文字
     * @param pointX {Number}:    点位坐标x
     * @param pointY {Number}:    点位坐标y
     * @param [offsetY, offsetY] {Number}: 提示标签的位置偏移量
     */
    window.map.MapPoint2ScreenPoint([pointX, pointY], (e) => {
      const left = e.x - offsetX;
      const top = e.y - offsetY;
      let el = document.createElement('p');
      el.id = 'point_label_txt';
      el.innerHTML = '<span>' +labelTxt+ '</span>';
      el.style.cssText = 'top:'+ top + 'px;left:'+ left +'px';
      document.getElementById('mapcontent').appendChild(el);      // 提示文字记得相对地图容器定位，否则偏差较大
    })
  },
  
  removePointLabel() {
    /**
     * 移除点位提示文字
     */
    const point_label = document.getElementById('point_label_txt');
    point_label && document.getElementById('mapcontent').removeChild(point_label);
  },




  // =========================  常用操作（层级缩放、复位、清除、图层显隐、中心点定位）  ===============================
  /**
   * 地图中心点定位（通过中心点坐标x,y实现）
   * @param center                      中心点坐标
   * @param wkid                        坐标类型（地理坐标：4326、 投影坐标：102100）
   */
  mapCenter (center, wkid = 4326, cb = null) {
    window.map.centerAt({
      x: center.x,
      y: center.y,
      spatialReference: { wkid: wkid }
    }, cb)
  },

  /**
   * 地图中心点定位，把图形最大可能的显示在当前地图视图范围内（通过图形对象geo实现）
   * @param geo                         图形对象
   */
  mapCenterByGeo (geo) {
    const limitPoints = window.map.getFeatureExtent(geo);        // 图形所在范围（返回最小、最大的4个坐标）, 用来算线路中心点（取最大最小的平均值）
    this.mapCenter({                                             // 图形中心点定位
      x: (limitPoints[2]+limitPoints[0])/2,
      y: (limitPoints[3]+limitPoints[1])/2,
    });
  },

  /**
   * 地图缩放
   * param action(String)                 缩放动作（可选值：'+'、'-', 分别对应放大、缩小）
   */
  mapZoom (action) {
    if (action == '+') {
      window.map.zoomIn()
    } else {
      window.map.zoomOut()
    }
  },

  /**
   * 图层复位
   * @param zoom(Number)                  缩放层级
   */
  mapZoomReset (zoom) {
    window.map.zoomTo(zoom)
  },

  /**
   * 清空指定id的图层
   * @param layersArr(Array)              图层id数组（可批量清除，eg:['layer_point','layer_area','layer_line']）
   * @param isClearInfoSymbol(Boolean)    是否需要清除气泡
   */
  clearLayer (layersArr, isClearInfoSymbol = 0) {
    layersArr.forEach(i => {
      window.map.removeLayerById(i);                         // 清除点位
      // window.map.clearLayerById(i);                       // 清除点位
      isClearInfoSymbol && window.map.destroyInfoSymbol(i);  // 清除气泡
    })
  },

  /**
   * 清除测量（测距、测面）
   */
  clearMeasutre (){
    window.map.measutreClear();
  },

  /**
   * 控制图层显隐(仅可控制地图配置文件中配置过的图层)
   * param layerList(Array)               业务图层配置 (eg:[{"id": "报警卡口", checked: false},{"id": "拦截点", checked: false}])
   */
  layerSwitch(layerList) {
    layerList.forEach(i => {
      if (i.visible) {
        // 设置图层可见
        window.map.setLayerVisibleById(i.id, true);
      } else {
        // 设置图层不可见
        window.map.setLayerVisibleById(i.id, false);
      }
    })
    return layerList;
  },


  // =========================  查询操作（图层查询、查看周边、缓冲区、测距测面...）  ===============================
  /**
   * 测距、测面
   * param type(String)                   测量类型（可选值：'length'、'area', 分别对应测距、测面）
   */
  mapMeasutre (type){
    if(type == 'length'){
      // 测距
      window.map.measutreLength();
    }else{
      // 测面
      window.map.measutreArea();
    }
  },

  /**
   * 查看周边警力、视频、信号机
   * @param center                        查看周边中心点坐标
   * @param wkid                          根据坐标类型设置wkid(地理坐标：4326 ；投影坐标：102100)，默认4326
   * @param cb_opt                        查看周边回调方法集：可获取到查询结果的所有图层信息（图层list、layerId、点位信息等）
   */
  showAround (center, cb_opt = {}, wkid = 4326 ) {
    const cb_opt_deft = {
      cb_queryPolice : null ,                   // 警员列表    （返回警员列表 list）
      cb_policeClick : this.showBubble_police , // 警员点击    （返回当前点击警员的 attributes、当前点图层id）
      cb_querySign : null ,                     // 信号机列表  （返回信号机列表 list）
      cb_signClick : this.showBubble_sign ,     // 信号机点击  （返回当前点击信号机的 attributes、当前点图层id）
      cb_queryVideo : null ,                    // 视频列表    （返回视频列表 list）
      cb_videoClick : this.showBubble_video ,   // 视频点击    （返回当前点击视频的 attributes、当前点图层id）
      cb_clearAround : null ,                   // 清除周边功能
    }
    cb_opt = Object.assign(cb_opt_deft, cb_opt);

    // 查看周边关闭按钮样式配置
    const zdyOption = {
      visible : true,
      url : `${config.image_URL}/close.png`,
      height : 13,
      width : 13,
      centerPointVisible : false
    };
    // 查看周边圈样式配置
    const polygonSymbol = {
      "type": "esriSFS",
      "style": "esriSFSSolid",
      "color": [115,76,0,155],
      "outline": {
        "type": "esriSLS",
        "style": "esriSLSSolid",
        "color": [110,110,110,255],
        "width": 1
      }
    };
    // 重绘查看周边面前 先清除上一次的周边里画的点(警力资源、视频监控、信号机)
    this.clearAround(1, null)
    window.map.centerAndZoom({ "x": center.x, "y": center.y, "spatialReference": { "wkid": wkid } },7);
    window.map.drawDragCircle(center.x, center.y, 500, 2000, e => {
      // 查寻周边圈起来的范围里的所有警力和视频，在回调里自己画点画上去
      let srh_e = {
        'rings': e.rings,
        'spatialReference': {'wkid': 4326}
      };
      window.map.query({layerid: '警力资源', where: '1=1', geometry: srh_e}, cb_drawPoint_police);
      window.map.query({layerid: '视频监控', where: '1=1', geometry: srh_e}, cb_drawPoint_video);
      window.map.query({layerid: '信号控制', where: '1=1', geometry: srh_e}, cb_drawPoint_sign);
      // 通过查看周边圈上的关闭按钮 清除周边的面和点
      document.getElementById('button_layer').addEventListener( "click",() => {
        // 清除周边回调（返回周边资源里的所有图层id集合aroundLayerIdArr）
        cb_opt.cb_clearAround && cb_opt.cb_clearAround(aroundLayerIdArr);
        this.clearAround(1, null);
      },false );
    },zdyOption,polygonSymbol);

    // 查询后的回调
    let ts = this;
    // 查看周边里画画'警力资源'点:返回符合条件的点位
    function cb_drawPoint_police (list) {
      // 先清除上一次的周边里的警力资源点位
      ts.clearAround(0, 'police')
      // 开放给外部的回调（获取到周边资源里的所有警员）
      cb_opt.cb_queryPolice && cb_opt.cb_queryPolice(list);
      list.forEach((i, idx) => {
        const layerId = 'layer_around_police' + idx;
        addAroundLayerId(layerId)
        ts.auto_drawPoint({
          pointInfo: i.attributes,
          layerId : layerId,
          wkid : 4326,
          symbol : {
            "url": `${config.image_URL}/map-ic-police.png`,
            "height": 20,
            "width": 20,
            "type": "esriPMS"
          },
          cb_click : (e) => {
            //console.log("警员点击事件")
            // 开放给外部的回调(外部不传用默认气泡、传了则使用外部气泡)
            cb_opt.cb_policeClick(i.attributes, layerId);
          }
        })
      })
    }

    // 查看周边里画'视频监控'点:返回符合条件的点位
    function cb_drawPoint_video (list) {
      // 先清除上一次的周边里的视频监控点位
      ts.clearAround(0, 'video');
      // 开放给外部的回调（获取到周边资源里的所有视频设备）
      cb_opt.cb_queryVideo && cb_opt.cb_queryVideo(list);
      list.forEach((i, idx) => {
        const layerId = 'layer_around_video' + idx;
        addAroundLayerId(layerId);
        // 画点：查看周边的'视频监控设备'
        ts.auto_drawPoint({
          pointInfo: i.attributes,
          layerId : layerId,
          wkid : 4326,
          symbol : {
            "url": `${config.image_URL}/icon_map_site.png`,
            "height": 20,
            "width": 16,
            "type": "esriPMS"
          },
          cb_click : (e) => {
            // console.log("视频点击事件");
            // 开放给外部的回调(外部不传用默认气泡、传了则使用外部气泡)
            cb_opt.cb_videoClick(i.attributes, layerId);
          }
        });
      })
    }

    // 查看周边里画'信号控制'点:返回符合条件的点位
    function cb_drawPoint_sign (list) {
      // 先清除上一次的周边里的信号机点位
      ts.clearAround(0, 'sign');
      // 开放给外部的回调（获取到周边资源里的所有信号机设备）
      cb_opt.cb_querySign && cb_opt.cb_querySign(list);
      list.forEach((i, idx) => {
        const layerId = 'layer_around_sign' + idx;
        addAroundLayerId('layer_around_sign' + idx)
        // 画点：查看周边的'信号控制设备'
        ts.auto_drawPoint({
          pointInfo: i.attributes,
          layerId : layerId,
          wkid : 4326,
          symbol : {
            "url": `${config.image_URL}/map-ic-sign.png`,
            "height": 20,
            "width": 15,
            "type": "esriPMS"
          },
          cb_click : e => {
            // console.log("信号机点击事件")
            // console.log(i.attributes)
            cb_opt.cb_signClick(i.attributes, layerId); // 开放给外部的回调
          }
        });
      })
    }

    // 添加查看周边里的图层id(重复id不添加)
    function addAroundLayerId (layerId) {
      aroundLayerIdArr = new Set(aroundLayerIdArr)
      aroundLayerIdArr.add(layerId)
      aroundLayerIdArr = Array.from(aroundLayerIdArr)
    }
  },

  /**
   * 清除周边
   * @param isClearCircle(Boolean)        是否清除圈这个面对象(编辑区域面时，不需要重绘区域面，只需要重绘响应的点)
   * @param needClearLayerIdKey(String)   需要清除的业务图层id关键字（可模糊匹配）
   */
  clearAround (isClearCircle, needClearLayerIdKey) {
    if (isClearCircle) {
      // 清除圈在地图上画的面（半径缩放时不需要清除面，只需要清除所有的点）
      window.map.clearDragCircle()
    }
    if (needClearLayerIdKey) {
      let needClearLayer = []
      let needSaveLayer = []
      aroundLayerIdArr.forEach(i => {
        if (i.indexOf(needClearLayerIdKey) != -1) {
          // 匹配需要删除的id,推入需清除的数组
          needClearLayer.push(i)
        } else {
          // 保留不需要删除的id
          needSaveLayer.push(i)
        }
      });
      // 仅清除圈内目标图层点
      this.clearLayer(needClearLayer);
      // 更新当前周边圈内还保留的点
      aroundLayerIdArr = needSaveLayer

    } else {
      // 清空圈内点
      this.clearLayer(aroundLayerIdArr)
      aroundLayerIdArr = []
    }
  },
}




