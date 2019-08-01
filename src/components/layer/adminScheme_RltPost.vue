<!-- 特勤方案：关联岗位/线路布岗 -->
<template>
  <div class="box-shadow layer-rlt-post" :class="{active: isShow && routeId, 'read-only': !isEdit}" >
    <!-- ***isEdit:true  可编辑状态*** -->
    <template v-if="isEdit">
      <h2 class="primary-title">
        <i class="fr ic-close" title="关闭" @click="cancel"></i>
        <i class="fr ic1 ic-dustbin" title="删除关联" @click="delPost"></i>
        <i class="fr ic2 ic-mapdraw-reset" title="重置" @click="reset"></i>
        <i class="fr ic2 ic-add" :class="{active: postIsAdding}" :title="postIsAdding ? '结束添加' : '添加关联'" @click="addPost"></i>
        线路布岗
      </h2>

      <!-- 关联岗位列表 -->
      <el-scrollbar class="el-scrollbar-xhidden list-post-scroller" :style="{height:scrollerHt}" v-loading="showLoading">
        <ul class="list-border list-post clrfix" v-if="postList.length">
          <li v-for="(item, idx) in postList" :key="item.deviceId" :class="{active: item.checked || item.pId == pId}"
              @mouseenter="addPostHL('layer_point_post', item)"
              @mouseleave="removePostHL('layer_point_post', item)">
            <!-- 复选框 -->
            <i class="ic2 ic-ckb-box" :class="{active: item.checked}" @click="checkedChange(item)"></i>
            <!-- 岗位信息 -->
            <div class="post-info">
            <span class="post-name ellipsis" title="点击修改岗位名称"
                  v-show="editPostNameIdx !== idx" @click="setAutoFocus('editPostNameIdx', idx, 'input_post_name_'+idx)">{{idx+1}}. {{item.postName}}</span>
              <el-input class="post-name" type="primary" size="mini" :id="'input_post_name_'+idx" v-model.trim="item.postName"
                        v-show="editPostNameIdx === idx"  @blur="editPostNameIdx = ''" clearable></el-input>

              <span class="post-desc ellipsis" title="点击修改岗位名称"
                    v-show="editPostDescIdx !== idx" @click="setAutoFocus('editPostDescIdx', idx, 'input_post_desc_'+idx)">{{item.postDescribe}}</span>
              <el-input class="post-desc" type="primary" size="mini"  :id="'input_post_desc_'+idx" v-model.trim="item.postDescribe"
                        v-show="editPostDescIdx === idx" @blur="editPostDescIdx = ''" clearable></el-input>
            </div>
            <!-- 岗位警员 -->
            <div class="post-police-count">
              <p class="post-police-count1 ic2 ic-police-count" title="点击修改民警数量"
                 @click="setAutoFocus('editPoliceNumIdx', idx, 'input_police_num_'+idx)" >
                <span class="police-count"
                      v-show="editPoliceNumIdx !== idx">{{item.policeNumber}}</span>
                <input class="no-arrow police-count" type="number" :id="'input_police_num_'+idx" v-model.number="item.policeNumber"
                       v-show="editPoliceNumIdx === idx"  @blur="editPoliceNumIdx = ''"/>
              </p>
              <p class="post-police-count2 ic2 ic-police-count-aux" title="点击修改协警数量"
                 @click="setAutoFocus('editPoliceAuxNumIdx', idx, 'input_police_aux_num_'+idx)" >
               <span class="police-aux-count"
                     v-show="editPoliceAuxNumIdx !== idx">{{item.policeAuxNumber}}</span>
                <input class="no-arrow police-aux-count" type="number" :id="'input_police_aux_num_'+idx" v-model.number="item.policeAuxNumber"
                       v-show="editPoliceAuxNumIdx === idx"  @blur="editPoliceAuxNumIdx = ''"/>
              </p>
            </div>
          </li>
        </ul>
        <no-data v-else style="padding-top:100px;" :txt="'暂无关联岗位'"></no-data>
      </el-scrollbar>

      <!-- 按钮操作 -->
      <div class="btn-group-bottom" style="background:none;">
        <el-button size="mini" round type="primary" @click="ajaxSavePostList">保 存</el-button>
        <el-button size="mini" round @click="cancel">取 消</el-button>
      </div>
    </template>


    <!-- ***isEdit:false  只读查看状态*** -->
    <template v-else>
      <h2 class="primary-title">
        <i class="fr ic-close" title="关闭" @click="$emit('close')"></i>
        线路布岗
      </h2>

      <!-- 关联岗位列表 -->
      <el-scrollbar class="el-scrollbar-xhidden list-post-scroller" :style="{height:scrollerHt}" v-loading="showLoading">
        <ul class="list-border list-post clrfix" v-if="postList.length">
          <li v-for="(item, idx) in postList" :key="item.deviceId" :class="{active: item.checked || item.pId == pId}"
              @mouseenter="addPostHL('layer_point_post', item)"
              @mouseleave="removePostHL('layer_point_post', item)">
            <!-- 岗位信息 -->
            <div class="post-info">
              <span class="post-name ellipsis" :title="item.postName">{{idx+1}}. {{item.postName}}</span>
              <span class="post-desc ellipsis" :title="item.postDescribe">{{item.postDescribe}}</span>
            </div>
            <!-- 岗位警员 -->
            <div class="post-police-count">
              <p class="post-police-count1 ic2 ic-police-count">
                <span class="police-count">{{item.policeNumber}}</span>
              </p>
              <p class="post-police-count2 ic2 ic-police-count-aux">
               <span class="police-aux-count">{{item.policeAuxNumber}}</span>
              </p>
            </div>
          </li>
        </ul>
        <no-data v-else style="padding-top:100px;" :txt="'暂无关联岗位'"></no-data>
      </el-scrollbar>

      <!-- 按钮操作 -->
      <div class="btn-group-bottom" style="background:none;">
        <el-button size="mini" round @click="cancel">关 闭</el-button>
      </div>
    </template>
  </div>
</template>

<script>
  import common from '@tools/common';
  import mapSetting from '@tools/map-setting';
  import mapDarw from '@tools/map-draw';
  import { mapState, mapMutations } from 'vuex';

  export default {
    props: [
      'isEdit',
      'isShow'
    ],
    data() {
      return {
        showLoading: false,             // 关联岗位加载loading
        postIsAdding: false,            // 是否正在关联岗位

        editPostNameIdx: '',            // 当前编辑的岗位名称索引
        editPostDescIdx: '',            // 当前编辑的岗位描述索引
        editPoliceNumIdx: '',           // 当前编辑的警员数量框索引
        editPoliceAuxNumIdx: '',        // 当前编辑的协警数量框索引
        scrollerHt:'',

        layerIdArr_checkedPost:[],      // 当前勾选的岗位图层id集合
        postList: [],                   // 已关联的岗位信息list
        activeRouteId: ''               // 当前操作的线路id
      };
    },
    computed: {
      ...mapState([
        'pId',                          // 地图点位hover时，当前点位标识
        'taskId',                       // 当前选中的任务id
        'routeId'                       // 当前选中的线路id
      ]),
    },
    watch: {
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
        if(this.isShow && this.activeRouteId){
          this.ajaxGetPostList();
        }
      },
      postIsAdding() {
        /**
         * 监听当前是否是在操作地图，通知父组件是否需要隐藏左侧任务框 this.postIsAdding:true时隐藏左侧任务列表
         */
        this.$emit('set-map-draw-status', this.postIsAdding)
      }
    },
    mounted() {
      this.setScrollHt();
    },
    methods: {
      ...mapMutations([
        'setVuex_routeListChange',   // 累加次数，使routeList组件中刷新列表
      ]),
      // *** ajax start ***
      ajaxGetPostList() {
        /**
         * 获取岗位信息list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getPostInfoList_GET}`;
        const params = {
          taskId: this.taskId,
          routeId: this.routeId
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
               this.postList = res.resultList;
               // 设置默认属性（num:打点序号，checked:前端复选框勾选标识， id:同一图层点位删除要用）
               this.postList.forEach((i, idx) => {
                 const random_id = 'id_'+new Date().valueOf() + '_' + common.lpobj.getRan();  // 自定义岗位id，用于勾选操作时作为删除同一图层里某点位的标识使用
                 this.$set(i, 'num', idx+1);
                 this.$set(i, 'checked', false);
                 this.$set(i, 'pId', random_id);
                 if(this.isEdit) mapDarw.drawPoint_post('layer_point_post', i, 'ic-point-post.png', 50)
               });
//               console.log(this.postList)
            }else{
              this.$message.error('岗位信息获取失败！');
            }
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxSavePostList() {
        /**
         * 保存线路关联岗位信息
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.rltRoutePostList_POST}?taskId=${this.taskId}&routeId=${this.routeId}`;
        const params = this.postList;
        this.$http.post(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('保存成功！');
              window.map.removeLayerById('layer_point_post_checked');
              this.setVuex_routeListChange();
              this.$emit('close');
            }else{
              this.$message.error('保存失败！');
            }
          }).catch(rej => {
          this.$message.error('保存失败！');
        })
      },
      // *** ajax end ***


      addPostHL(layerId, item) {
        /**
         * 岗位点高亮显示
         * @param layerId {String}:  点位图层id
         * @param item {Object}:     点位对象
         */
         mapDarw.addHL_point_post(layerId, item, 'ic-point-post-active.png')
      },
      removePostHL(layerId, item) {
        /**
         * 移除岗位点高亮
         * @param layerId {String}:  点位图层id
         * @param item {Object}:     点位对象
         */
        mapDarw.removeHL_point_post(layerId, item, 'ic-point-post.png')
      },










      reDrawPoint_post() {
        /**
         * 重绘岗位点
         */
        window.map.removeLayerById('layer_point_post');                 // 清除关联的岗位图层
        this.postList.forEach((i, idx) => {                             // 重新绘制岗位点
          const random_id = 'id_'+new Date().valueOf() + '_' + common.lpobj.getRan();  // 自定义岗位id，用于勾选操作时作为删除同一图层里某点位的标识使用
          i.pId = random_id;
          i.num = idx+1;                                                // 重新标序号
          mapDarw.drawPoint_post('layer_point_post', i, 'ic-point-post.png', 50)
        });
        this.postIsAdding = false;
      },
      addPost() {
        /**
         * 添加关联岗位
         */
        if(this.postIsAdding){                                          // 正在取点，再次点击则结束取点操作
          window.map.finishDraw();
          this.postIsAdding = false;
        }else{                                                          // 未在取点，点击则开始取点
          this.postIsAdding = true;
          window.map.drawMultipoint({
            display: true,
            clean: false,
            symbol: {
              "url": `${config.image_URL}/ic-point-post.png`,
              "height": 25,
              "width": 20,
              "type": "esriPMS"
            }
          }, cb_drawMultipoint);

          const ts = this;
          let newPoint_postList = [];
          function cb_drawMultipoint(e) {
            e.points.forEach((i, idx) => {
              const num = ts.postList.length + 1+idx;                   // 当前岗位点的序号
              // 新的点
              const pId = 'id_'+new Date().valueOf() + '_' + common.lpobj.getRan(); // 自定义岗位id，用于勾选操作时作为删除同一图层里某点位的标识使用
              const newPoint_post = {
                postName: '岗位名称',                                    // 岗位名称
                policeNumber: 0,                                        // 警员数量
                policeAuxNumber: 0,                                     // 协警数量
                postDescribe: '岗位描述',                                // 岗位描述
                postX: i[0],                                            // 地图坐标x
                postY: i[1],                                            // 地图坐标y
                checked: false,                                         // 默认不选中
                num: num,                                               // 当前岗位序号
                pId: pId                                                // 用于图层删除的标识id
              };
              newPoint_postList.push(newPoint_post)                     // 保存新画的点数组
            });
            console.log('新加的点')
            console.log(newPoint_postList)

            console.log('***************')

            console.log('原来的点')
            console.log(ts.postList)
//            debugger
            ts.postList = ts.postList.concat(newPoint_postList);        // 合并原先的点和现有的点
            ts.reDrawPoint_post();                                      // 重绘岗位点(重绘不清已勾选岗位)
            window.map.clearMapGraphics();                              // 清除多点绘制自带点位图层
          }
        }
      },












      delPost() {
        /**
         * 删除选中的关联岗位（地图上也要删除相应的图层）、移除不相关的高亮图层,剩下未选中的需要重新赋值给postList
         */
        this.postList = this.postList.filter(i => {
          return !i.checked
        });
        mapDarw.clearPostLayer();                                 // 删除需要清除选中的图层
        this.reDrawPoint_post();                                  // 重绘点
      },

      setActiveRouteId() {
        /**
         * 设置当前线路id(此处不直接使用routeId是因为routeId不能在关闭模块时清空，否则就会影响兄弟组件routeList的选中项的当前激活状态)
         * 如果不使用这个中间值来中转下的话必须监听模块显示和线路id变化两种情况，导致重复请求
         */
        if(this.isShow){
          this.activeRouteId = this.routeId;
        }else {
          this.$emit('close');
          this.activeRouteId = '';
        }
      },
      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         * @param dValue {number} : 差值
         */
        const winHt = document.documentElement.offsetHeight;
        this.scrollerHt = `${winHt-198}px`;
      },
      setAutoFocus(key, idx, elementId) {
        /**
         * 动态控制文本框自动聚焦
         */
        this[key] = idx;
        setTimeout(function(){
          document.getElementById(elementId).select();
        }, 200)
      },
      checkedChange(item) {
        /**
         * 当前选中的岗位改变时, 联动地图岗位点高亮显示
         * @param item { Object }: 当前岗位对象
         */
        item.checked = !item.checked;
        if(item.checked){
          // 选中加入已选中列表，地图高亮点
          mapDarw.drawPoint_post('layer_point_post_checked', item, 'ic-point-post-checked.png', 100)
        }else{
          // 从已选中列表中移除，清除地图高亮点
          window.map.deleteLayer({layerId: 'layer_point_post_checked', pId: item.pId}) ; // 删除指定layerId 的 指定pid的点位
        }
      },
      cancel() {
        /**
         * 取消布岗操作，清空地图布岗图层、重新请求接口、关闭布岗弹层
         */
        if(this.isEdit){
          mapDarw.clearPostLayer();
          this.ajaxGetPostList();
        }
        this.$emit('close');
      },
      reset() {
        /**
         * 布岗重置
         */
        mapDarw.clearPostLayer();
        this.ajaxGetPostList()
      }
    }
  }
</script>

<style scoped>
  .layer-rlt-post{position:absolute;right:-1000px;top:43px;z-index:2;bottom:5px;width:300px;transition:right .4s;}
  .layer-rlt-post.read-only{top:10px;}
  .layer-rlt-post.active{right:0;}
  .primary-title .ic-close, .primary-title .ic-dustbin, .primary-title .ic-add, .primary-title .ic-mapdraw-reset{margin-left:3px;}
  .ic-dustbin::before{float:left;height:16px;width:16px;margin:4px 0 0 5px;}
  .list-post-scroller{width:300px;margin-top:19px;position:relative;left:-10px;}
  .list-post{position:relative;}
  .list-post li{float:left;width:100%;padding:4px 14px 1px 35px;box-sizing:border-box;}
  .read-only .list-post li{padding-left:15px;}
  .ic-ckb-box{position:absolute;left:0;top:0;padding:8px 10px 10px 10px;}
  .post-info{float:left;width:180px;}
  .post-name,.post-desc{display:block;height:22px;line-height:22px;border:none;margin-bottom:3px;color:#549df2;}
  .post-desc{color:#727d86;}
  .post-police-count{float:right;display:flex;padding-top:5px;}
  .post-police-count p{flex:1;cursor:pointer;}
  .post-police-count p.post-police-count2{margin-left:10px;}
  .post-police-count .police-count,
  .post-police-count .police-aux-count{display:block;position:relative;top:-1px;height:18px;line-height:16px;border:1px solid transparent;width:20px;overflow:hidden;background:#549df2;color:#fff;border-radius:4px;text-align:center;box-sizing:border-box;}
  .post-police-count .police-aux-count{background:#6fd4be;}
  .post-police-count input.police-count,
  .post-police-count input.police-aux-count{background:#fff;border-color:#549df2;color:#465461;}
  .post-police-count input.police-aux-count{border-color:#6fd4be;}
</style>
<style>
  /* 覆盖elementui 样式 */
  .post-info .el-input__inner{height:22px;line-height:22px;}
  .post-info .el-input__suffix .el-input__suffix-inner{position:relative;top:-3px;right:2px;}
  .post-name .el-input__inner,  .post-desc .el-input__inner{position:relative;left:-7px;}
</style>

