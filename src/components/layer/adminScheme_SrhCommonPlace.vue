<!-- 常备单位 智能关联 -->
<template>
  <div class="layer-srh-common-place">
    <el-tabs type="border-card" :value="checkedLayer" class="tab-list">
      <!-- 预案调用 -->
      <el-tab-pane name="video">
        <span slot="label" :class="{active:checkedLayer=='plan'}" @click="checkedLayer=='plan'">预案调用</span>
        <el-scrollbar class="el-scrollbar-xhidden" :style="{height:scrollerHt}">
          <ul class="list-border">
            <li>预案调用</li>
          </ul>
        </el-scrollbar>
      </el-tab-pane>

      <!-- 历史任务 -->
      <el-tab-pane name="sign">
        <span slot="label" :class="{active:checkedLayer=='history'}" @click="checkedLayer=='history'">历史任务</span>
        <el-scrollbar class="el-scrollbar-xhidden" :style="{height:scrollerHt}">
          <ul class="list-border">
            <li>历史任务 常备线路</li>
          </ul>
        </el-scrollbar>
      </el-tab-pane>

      <!-- 常备线路 -->
      <el-tab-pane name="sign">
        <span slot="label" :class="{active:checkedLayer=='base'}" @click="checkedLayer=='base'">常备线路</span>
        <el-scrollbar class="el-scrollbar-xhidden" :style="{height:scrollerHt}">
          <ul class="list-border">
            <li>常备线路</li>
          </ul>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    props: [],
    components: {
    },
    data() {
      return {
        scrollerHt:'500px',
        checkedLayer: '',                               // 当前选中的图层（默认不选中）
        deviceList:[],                                  // 当前线路关联设备List（关联设备包括视频监控、信号机）
        deviceVideoShow: false,
        deviceSignShow: false,
      };
    },
    updated() {
      this.setScrollHt();
    },
    watch: {
      checkedLayer() {
        if(this.checkedLayer){
          switch (this.checkedLayer){
            case "plan":
              // 预案调用
              this.ajaxGetPlanList();
              break;
            case "history":
              // 历史任务
              this.ajaxGetHistoryList();
              break;
            case "base":
              // 常备线路
              this.ajaxGetBaseList();
              break;
          }
          //this.setScrollHt();
        }
      }
    },
    mounted() {
      this.setScrollHt();
    },
    methods: {
      ajaxGetPlanList() {
        /**
         * 获取预案list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getPlanList_GET}`;
        const params = {
          executeTaskId: this.executeTaskId                 // 执行任务编号
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.planList = res.resultList;
            }
          })
      },
      ajaxGetHistoryList() {
        /**
         * 获取历史记录list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getHistoryList_GET}`;
        const params = {
          executeTaskId: this.executeTaskId                 // 执行任务编号
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.historyList = res.resultList;
            }
          })
      },
      ajaxGetBaseList() {
        /**
         * 获取常备线路list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getBaseList_GET}`;
        const params = {
          executeTaskId: this.executeTaskId                 // 执行任务编号
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.baseList = res.resultList;
            }
          })
      },

      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         * @param diff {number} : 差值
         */
        const winHt = document.documentElement.offsetHeight;
        const diff = this.checkedLayer == 'police' ? 200 : 230;
        this.scrollerHt = `${winHt-diff}px`;
        console.log(this.scrollerHt)
      }
    }
  }
</script>

<style scoped>
  .layer-srh-common-place{position:absolute;right:0;top:40px;bottom:0;width:280px;color:#727d86;}
  .el-dropdown-menu__item{width:60px;line-height:24px;padding:0 0 0 20px;box-sizing:border-box;}
  .el-dropdown-menu__item:hover{background:#5093e1;color:#fff;}
</style>
<style>
  /* tab */
  .tab-device{border:none;box-shadow:none;width:260px;}
  .el-tabs__nav{width:100%;display:flex;}
  .tab-device .el-tabs__nav .el-tabs__item{flex:1;text-align:center;height:30px;line-height:30px;}
  .tab-device>.el-tabs__header{border:none;background:#e1e3e5;color:#465461;width:260px;}
  .tab-device>.el-tabs__header .el-tabs__item.is-active{background:#f0f1f2;color:#465461;}
  .tab-device>.el-tabs__content{padding:0;width:270px;}
</style>

