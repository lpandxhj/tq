<!-- 常备线路 智能关联（该组件功能还未完善） -->
<template>
  <div class="box-shadow layer-srh-common-route slide-right" :class="{active: isShow}">
      <h2 class="primary-title">
        常备线路查询
        <i class="ic2 ic-close-x" title="关闭" @click="close"></i>
      </h2>

      <el-input v-model="routeStartPlace" placeholder="请输入起点位置" type="primary" size="mini" class="input-search">
        <i slot="suffix" class="el-input__icon el-icon-search" title="搜索" @click.stop="ajaxGetCommonRouteList"></i>
      </el-input>
      <el-scrollbar class="el-scrollbar-xhidden list-common-route-scroller" :style="{height:scrollerHt}">
        <ul class="list-common-route">
          <!-- 选中的线路 -->
          <li class="checked" v-for="(item, idx) in checkedCommonRouteList" :key="'checkedBaseRoute'+idx">
            <span class="route-name ellipsis" :title="item.commonRouteName">{{item.commonRouteName}}</span>
            <p class="route-from-to">
              <span class="route-begin ellipsis" :title="item.routeStartPlace">{{item.routeStartPlace}}</span>
              <span class="route-end ellipsis" :title="item.routeTargetPlace">{{item.routeTargetPlace}}</span>
            </p>
            <i class="ic1 ic-minus active" @click.stop="commonRouteCancel(idx)" title="移除线路"></i>
          </li>

          <!-- 常备线路检索结果list -->
          <template v-if="commonRouteListOrigin.length">
            <li v-for="(item, idx) in commonRouteList" :key="'commonRoute'+idx" @click="$set(item, 'active', !item.active)">
              <span class="route-name ellipsis" :title="item.commonRouteName">{{item.commonRouteName}}</span>
              <p class="route-from-to">
                <span class="route-begin ellipsis" :title="item.routeStartPlace">{{item.routeStartPlace}}</span>
                <span class="route-end ellipsis" :title="item.routeTargetPlace">{{item.routeTargetPlace}}</span>
              </p>

              <i class="ic2 ic-plus" @click.stop="commonRouteCheck(item)" title="选定线路"></i>
            </li>
          </template>
           <!--暂无数据 -->
          <li class="no-result" v-else>
            <no-data></no-data>
          </li>
        </ul>
      </el-scrollbar>

     <!--按钮操作 -->
     <div class="btn-group-bottom">
         <el-button size="mini" round @click="close">关 闭</el-button>
      </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  export default {
    props: ['isShow'],
    components: {
    },
    data() {
      return {
        routeStartPlace:'',                                        // 检索的起点位置
        scrollerHt:'500px',
        commonRouteListOrigin:[],                                  // 常备线路原始数据
        commonRouteList:[
          {
            routeStartPlace:'起点1',
            routeTargetPlace:'终点1'
          },
          {
            routeStartPlace:'起点2',
            routeTargetPlace:'终点2',
          }
        ],                                                         // 未选中的常备线路
        checkedCommonRouteList:[],                                 // 选中的常备线路
      };
    },
    watch: {
      isShow() {
        if (this.isShow) {
          this.ajaxGetCommonRouteList();                           // 初始化常备线路list
        }
      }
    },
    mounted() {
      this.setScrollHt();
    },
    methods: {
      ...mapMutations([
        'setVuex_routeListChange',                                 // 累加次数，使routeList组件中刷新列表
      ]),
      // *** ajax start ***
      ajaxGetCommonRouteList() {
        /**
         * 获取常备线路list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getCommonRouteList_GET}`;
        const params = {
          routeStartPlace: this.routeStartPlace                    // 检索的起点位置
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.commonRouteListOrigin = res.resultList;
              this.commonRouteList = res.resultList;
            }
          });
      },
      // *** ajax end ***

      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         * @param dValue {number} : 差值
         */
        const winHt = document.documentElement.offsetHeight;
        this.scrollerHt = `${winHt-275}px`;
      },

      commonRouteCheck(item) {
        /**
         * 选中常备线路
         * @param item {Object}: 线路对象
         */
        this.checkedCommonRouteList.push(item);                   // 加入选中的常备线路列表
        this.routeStartPlace = item.routeTargetPlace;             // 选定的常备线路终点为下一段线路的起点 并重新检索（保留原先选定的线路）；
        this.$emit('edit-complete');                              // 选定一条完成
        this.ajaxGetCommonRouteList();
      },

      commonRouteCancel(idx) {
        /**
         * 删除某条选中线路时，同时删除本身及后面的线路,检索框关键字更新为最后选中的线路终点
         * @param idx  {Number}: 线路索引
         */
        const len = this.checkedCommonRouteList.length - idx;     // 需要删除的线路个数（从idx索引开始删掉最后）
        this.checkedCommonRouteList.splice(idx, len);
        this.routeStartPlace = this.checkedCommonRouteList.length ? this.checkedCommonRouteList[this.checkedCommonRouteList.length-1].routeTargetPlace : '';  // 更新检索关键词
        this.ajaxGetCommonRouteList();
      },

      close() {
        this.$emit('close');
        this.setVuex_routeListChange()                            // 刷新线路列表
      }
    }
  }
</script>

<style scoped>
  /* ======== 常备线路列表 ========= */
  .layer-srh-common-route{position:absolute;z-index:5;top:125px;bottom:5px;width:240px;border-radius:4px 4px 0 0;}
  .slide-right.active{left:10px;}
  .list-common-route-scroller{width:230px;margin-top:10px;}
  .list-common-route{padding-right:10px;}
  .list-common-route>li{position:relative;border-radius:4px;margin-top:5px;padding-top:4px;}
  .list-common-route>li:hover{background:#f6f7f8;cursor:pointer;}
  .list-common-route>li.no-result:hover{background:none;cursor:default;}
  .list-common-route>li:first-child{margin-top:0;}
  .list-common-route>li .route-name{padding:0 5px;display:block;width:185px;}
  .list-common-route>li .route-from-to{display:flex;position:relative;padding:16px 5px 5px;}
  .list-common-route>li .route-from-to::before{content:'';position:absolute;height:1px;left:5px;right:28px;top:9px;background:#bbc6d3;}
  .route-begin,.route-end{flex:1;}
  .route-begin{color:#5a99e3;}
  .route-end{color:#973393;text-align:right}
  .ic-plus,.ic-minus{width:25px;text-align:right;position:absolute;right:5px;top: 10px;}
  .ic-plus::before,.ic-minus::before{width:18px;height:18px;}
  .route-begin::before, .route-end::before{content:'';display:inline-block;width:6px;height:6px;background:#fff;border-radius:20px;border:1px solid #5a99e3;position:absolute;top:5px;}
  .route-begin::before{left:5px;}
  .route-end::before{right:28px;border-color:#973393;}
  .no-result{padding-top:50px;}
  .no-result:hover{background:none;}
  .no-result::before{display:none;}
  /* checked */
  .list-common-route>li.checked{background:#5093e1;border-color:#5093e1;color:#fff;}
  .list-common-route>li.checked .route-begin, .list-common-route>li.checked .route-end{color:#fff;}
  .list-common-route>li.checked .route-begin::before, .list-common-route>li.checked .route-end::before{border:2px solid #fff;background:#5093e1;height:4px;width:4px;}
  .list-common-route>li.checked .route-from-to::before{background:#fff;}
</style>
<style>
  /* 覆盖elementUi 样式 */
  .input-search .el-input__inner{border-radius:0;background:#f0f1f2;}
  .input-search .el-icon-search::before{color:#b9c5d3;font-size:15px;}
  .input-search .el-icon-search:hover::before{cursor:pointer;color:#5093e1;}
</style>

