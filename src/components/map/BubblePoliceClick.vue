<!-- 地图自定义气泡: 视频 -->
<template>
  <div class="box-wrapper box-wrapper-bubble-right" v-if="info" :style="bubblePoliceStyle">
    <h2 class="primary-title">
      <i class="el-icon-close ic-close-primary" title="关闭" @click="$emit('close-bubble', 'police')"></i>
      {{info.NAME || '警员信息'}}
    </h2>

    <ul class="list-normal box-pd10" v-if="info">
      <li>
        <label>警员编号：</label>
        <span>{{info.ID || ''}}</span>
      </li>
      <li>
        <label>警员姓名：</label>
        <span>{{info.NAME || ''}}</span>
      </li>
      <li>
        <label>是否在线：</label>
        <span> {{info.STATUS_DEV_NAME || ''}} </span>
        <a :href="'tel:'+info.MOBILE" class="btn-primary" :class="{'btn-disabled':!info.MOBILE}" style="margin-left:10px;">呼叫</a>
      </li>
      <li>
        <label>警员地址：</label>
        <span>{{info.ADDR || ''}}</span>
      </li>
      <li>
        <label>所属部门：</label>
        <span>{{info.NAME_DEPT || ''}}</span>
      </li>
      <li>
        <label>所属岗位：</label>
        <span>{{info.POST_NAME || ''}}</span>
      </li>
    </ul>
    <!-- 抱歉,暂无数据！ -->
    <no-data v-else></no-data>
  </div>
</template>

<script>
  import {mapState, mapMutations} from 'vuex';
  export default {
    props: ['pointInfo'],
    data() {
      return {
        info: '',
        bubblePoliceStyle: {left: 0, top: 0}
      }
    },
    watch: {
      pointInfo() {
        this.info = this.pointInfo;
        if(this.info) this.setBubbleStyle();
      }
    },
    mounted() {
      // 地图视野范围改变时(屏幕坐标重新换算）, 气泡重新定位
      window.map.addEventListener(EJMap.Event.onMapExtentChange, e => {
        this.setBubbleStyle()
      })
    },
    methods: {
      setBubbleStyle() {
        // 气泡样式
        window.map.MapPoint2ScreenPoint([this.info.LONGITUDE, this.info.LATITUDE], (e) => {
          this.bubblePoliceStyle = {
            top: (e.y - 220 / 2 + 25) + 'px',
            left: (e.x + 10) + 'px'
          };
        })
      }
    }
  }


</script>
<style scoped>
  .box-wrapper-bubble-right{height:220px;width:300px;position:fixed;z-index:9999;}
</style>
