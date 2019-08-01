<!-- 基础信息管理：常备单位新增（编辑） -->
<template>
  <el-dialog
    custom-class="dialog-wh480" :title="title" :show-close="placeId ? true : false" v-loading="showLoading"
    :modal='false' :modal-append-to-body='false' :close-on-click-modal='false' :close-on-press-escape='false' :visible.sync="showLayer">
      <div class="form-wrap">
        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">单位名称：</el-col>
          <el-col :span="8"><el-input style="width:100%;" size="mini" :title="info.commonPlaceName" v-model="info.commonPlaceName" clearable></el-input></el-col>
          <el-col :span="4" class="label">单位性质：</el-col>
          <el-col :span="8"><el-input size="mini" :title="info.placeTypeName" v-model="info.placeTypeName" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">单位地址：</el-col>
          <el-col :span="20"><el-input size="mini" :title="info.placeAddress" v-model="info.placeAddress" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">定位位置：</el-col>
          <el-col :span="8" class="position-r">
            <i class="ic2 ic-location" @click="addPoint()"></i>
            <el-input size="mini" v-model="locationStr"></el-input>
          </el-col>
          <el-col :span="4" class="label">车位数量：</el-col>
          <el-col :span="8"><el-input size="mini" :title="info.parkNumbers" v-model="info.parkNumbers" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label">联系人：</el-col>
          <el-col :span="8"><el-input size="mini" :title="info.placePerson" v-model="info.placePerson" clearable></el-input></el-col>
          <el-col :span="4" class="label">联系电话：</el-col>
          <el-col :span="8">
            <el-input size="mini" :title="info.placePhone" v-model.number="info.placePhone"
                      @keyup="value=value.replace(/^[0-9]*$/g,'')" clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label">备注：</el-col>
          <el-col :span="20"><el-input size="mini" :title="info.placeMemo" v-model="info.placeMemo" clearable></el-input></el-col>
        </el-row>
      </div>

    <!-- 按钮操作 -->
    <span slot="footer" class="dialog-footer">
        <el-button size="mini" round type="primary" @click="saveInfo">保 存</el-button>
        <el-button size="mini" round @click="cancel">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import filters from '@js/filters';
  import common from '@tools/common';
  import mapSetting from '@tools/map-setting'
  export default {
    props:[
      'isShow',                               // 是否显示当前模块
      'placeId',                              // 常备单位id
      'checkedPlaceLocation'                  // 选中的单位坐标
    ],
    data() {
      return {
        isBindEdit: false,                    // 是否给点位绑定了编辑事件
        showLoading: false,                   // 是否显示loading
        showLayer: false,                     // 是否显示当前组件

        title: '常备单位添加',
        location: [],
        info:{                                // 常备单位 基本信息
          commonPlaceName: '',                // *单位名称
          placeAddress: '',                   // *地址
          placeX: '',                         // *单位点坐标
          placeY: '',                         // *单位点坐标
          placeTypeId: '',                    // 单位性质
          placeTypeName: '',                  // 单位性质名称
          placePerson: '',                    // 联系人
          placePhone: '',                     // 联系电话
          parkNumbers: 0,                     // 停车位
          placeMemo: '',                      // 备注
        },
      };
    },
    computed: {
      locationStr() {
        /**
         * 拼接坐标字符串
         */
        if(!this.placeId){
          // 新增
          if(this.location.length){
            return `${this.location[0]}, ${this.location[1]}`
          }else return '';

        }else{
          // 编辑
          if(this.location.length){
            return `${this.location[0]}, ${this.location[1]}`
          }else{
            return `${this.info.placeX}, ${this.info.placeY}`
          }
        }
      }
    },
    watch: {
      placeId() {
        /**
         * id改变时，更新点位坐标
         */
        this.clearPlace();
        if(this.checkedPlaceLocation) this.drawPoint_place({x: this.checkedPlaceLocation[0], y: this.checkedPlaceLocation[1]})
        if(this.showLayer) this.setInfo();    // 显示的时候切换id也需要重新请求接口
      },
      isShow() {
        /**
         *  若直接用isShow,由于el-dialog 自带的关闭 :visible.sync="isShow" 直接设置 isShow 的，如果不重新赋值给showLayer的话，会导致父子组件都在修改isShow这个值而冲突
         *  故赋值给新的变量，又让父组件赋值过来设置这个变量，又可以在子组件重置这个变量，符合vue单向传值的宗旨
         */
        this.showLayer = this.isShow;
      },
      showLayer() {
        /**
         *  监听当前组件层显隐
         */
        if(!this.showLayer){
          this.$emit('close');
          if(this.placeId) this.resetInfo(); // 编辑的时候窗口关闭需要清除
        }else this.setInfo();
      },
    },
    mounted() {
      window.map.addEventListener(EJMap.Event.ondeactivate, e => {
        // 监听点位点编辑事件(必须用id判断,否则会监听所有的地图编辑事件)
        if(e._layer.id == 'layer_point_common_place') {
          this.cb_getPoint(e.geometry);
        }
      });
    },
    methods: {
      // *** ajax start ***
      ajaxGetCommonPlaceInfo() {
        /**
         * 获取常备单位详情
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getCommonPlaceList_GET}`;
        const params = {
          commonPlaceId: this.placeId,    // 单位id
        };
        this.showLoading = true;
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.info = res.resultList[0];
            }
            this.showLoading = false;
          }).catch(rej => {
            this.showLoading = false;
          })
      },
      ajaxAddPlace() {
        /**
         * 新增单位 (id为空)
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.addCommonPlace_POST}`;
        this.showLoading = true;
        this.$http.post(apiName, this.info)
          .then(res => {
            this.showLoading = false;
            if (res.appCode == 0) {
              this.$message.success('常备单位添加成功！');
              this.$emit('edit-complete', {
                type:'add',
                placeId: res.resultList,
                location: [this.info.placeX, this.info.placeY]
              });
              this.showLayer = false;
            } else {
              this.$message.error('常备单位添加失败！');
            }
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxEditPlace() {
        /**
         * 编辑单位
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.editCommonPlace_PUT}`;
        if(this.placeId)  this.info.commonPlaceId = this.placeId;
        if(!this.info.parkNumbers) this.info.parkNumbers = 0;  // 注：接口不支持接收空值车位数，没有车位默认0
        this.showLoading = true;
        this.$http.put(apiName, this.info)
          .then(res => {
            this.showLoading = false;
            if (res.appCode == 0) {
              this.$message.success('常备单位编辑成功！');
              this.$emit('edit-complete', {
                type:'edit',
                placeId: this.placeId,
                location: [this.info.placeX, this.info.placeY]
              });
              this.showLayer = false;
            } else {
              this.$message.error('常备单位编辑失败！');
            }
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      // *** ajax end ***

      setInfo() {
        /**
         * 判断当前是编辑还是新增，编辑的根据placeId获取任务信息
         */
        if (this.placeId) {
          // 单位编辑
          this.title = '常备单位详情';
          this.ajaxGetCommonPlaceInfo().then(res => {
            if(this.info.placeX && this.info.placeY) this.drawPoint_place({x: this.info.placeX, y: this.info.placeY})
          });
        } else {
          // 单位添加
          this.title = '常备单位添加';
        }
      },
      resetInfo() {
        /**
         * 信息重置
         */
        this.location = [];
        this.info = {
          commonPlaceName: '',                                // *单位名称
          placeTypeId: '',                                    // *常备类型
          placeTypeName: '',                                  // *常备类型名称
          placeAddress: '',                                   // *地址
          placeX: '',                                         // *单位点坐标
          placeY: '',                                         // *单位点坐标
          placePerson: '',                                    // 联系人
          placePhone: '',                                     // 联系电话
          parkNumbers: 0,                                     // 停车位数量
          placeMemo: '',                                      // 备注
        }
      },
      saveInfo() {
        /**
         * 根据id来判断当前操作是新增还是编辑（新增Id为空）
         */
        if (this.location.length) {                           // 单位坐标（新增/修改坐标后需要用最新的坐标）
          this.info.placeX = this.location[0];
          this.info.placeY = this.location[1];
        }
        if (!this.checkNull()) return;
        if (this.placeId) {
          this.ajaxEditPlace();                               // 编辑
        } else {
          this.ajaxAddPlace();                                // 新增
        }
        this.drawPoint_place({x: this.info.placeX, y: this.info.placeY})
        this.$emit('set-map-draw-status', false);             // 关闭map全屏展示
        window.map.endEdit();                                 // 点位恢复不可编辑
      },
      cb_getPoint(e) {
        /**
         * 获取点坐标
         */
        this.location = [filters.keepToFixed6(e.x), filters.keepToFixed6(e.y)];
        this.$emit('set-map-draw-status', false);             // 关闭map全屏展示
        this.$emit('point-add-complete');
        window.map.endEdit();
      },
      clearPlace() {
        /**
         * 清除常备单位点
         */
        window.map.removeLayerById('layer_point_common_place')
      },
      addPoint() {
        /**
         * 常备单位取点(重新打点、编辑点)
         */
        this.$emit('set-map-draw-status', true);             // map全屏展示
        this.showLayer = false;                              // 隐藏当前编辑窗口
        if(this.locationStr){
          // 点位坐标存在, 点击则编辑点(编辑事件只要绑定一次就够了，绑定多了容易出错)
          if(!this.isBindEdit){
            window.map.startEdit('layer_point_common_place');// 开启点位编辑功能
            this.isBindEdit = false;                         // 仅需要绑定一次,否则会出错
          }

        }else{
          // 点位坐标不存在，点击触发画点
          this.clearPlace();
          window.map.drawPoint({
            display: false,
            clean: true,
          }, (e) => {
            /**
             * 拿到点位坐标后赋值坐标，点可编辑
             */
            this.drawPoint_place(e, true)
            this.cb_getPoint(e)
          })

        }
      },
      drawPoint_place(e, isEdit = false) {
        /**
         * 绘制常备单位点
         */
        this.clearPlace();
        mapSetting.mapCenter({                                // 中心点定位
          x: e.x,
          y: e.y
        });
        window.map.addPoint2GraphicsLayer({
          geom: {
            x: e.x,
            y: e.y,
            spatialReference: {wkid: 4326}
          },
          symbol: {
            "url": `${config.image_URL}/ic-point-normal.png`,
            "height": 28.5,
            "width": 19.5,
            "type": "esriPMS"
          },
          edit: isEdit,
          ondbclick: e => {
            this.showLayer = true;                            // 双击显示常备单位layer
          },
        }, 'layer_point_common_place', false);

        // 打好点后取消绘制状态
         this.$emit('set-map-draw-status', false)
      },
      checkNull() {
        /**
         * 必填项非空验证
         */
        let flag = this.info.commonPlaceName && this.info.placeAddress && this.info.placeX && this.info.placeY;
        if (!flag) {
          this.$message.error('抱歉，必填项不能为空!');
          return false;
        }
        return flag;
      },
      cancel() {
        /**
         * 清除点图层、关闭当前layer
         */
//        this.clearPlace();
        this.showLayer = false;
        this.resetInfo();
         this.$emit('set-map-draw-status', false);             // 关闭map全屏展示
        window.map.endEdit();                                  // 点位恢复不可编辑
      },
    }
  }
</script>

<style scoped>
  .form-wrap{padding:0 15px 0 0;}
  .ic-location::before{position:absolute;right:0;top:5px;z-index:1;}
</style>
