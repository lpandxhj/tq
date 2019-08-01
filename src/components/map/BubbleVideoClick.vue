<!-- 地图自定义气泡: 视频 -->
<template>
  <div class="box-bubble-wrapper" v-if="info" :style="bubbleVideoStyle">
    <h2 class="primary-title">
      <i class="fr ic2 ic-close-x" title="关闭" @click="close"></i>
      视频信息
      <!--{{info.deviceName || '视频信息'}}-->
      <!--{{info.NAME || '视频信息'}}-->
    </h2>

    <ul class="list-bubble-info" v-if="info">
      <li>
        <label>点位名称：</label>
        <span>{{info.deviceName || '-'}}</span>
      </li>
      <li>
        <label>点位编号：</label>
        <span>{{info.ID || '-'}}</span>
      </li>
      <li>
        <label>管理部门：</label>
        <span>{{info.DEPTNAME || '-'}}</span>
      </li>
      <li>
        <label>像素级别：</label>
        <span> {{info.PIXLEVEL_NAME || '-'}} </span>
      </li>
      <li>
        <label>设备类型：</label>
        <span>{{info.DEVTYPE_NAME || '-'}}</span>
      </li>
      <li>
        <label>设备状态：</label>
        <span>{{info.DEVSTATUS_NAME || '-'}}</span>
      </li>
      <!--<li>-->
        <!--<label>设备厂家：</label>-->
        <!--<span>{{info.MANUFACT || ''}}</span>-->
      <!--</li>-->
    </ul>

    <!-- 视频播放按钮 -->
    <div class="btn-group-bottom">
      <el-button type="primary" size="mini" round @click="openVideo(info.manageId)">实时视频</el-button>
    </div>
  </div>
</template>

<script>
  import {mapState, mapMutations} from 'vuex';
  export default {
    data() {
      return {
        info: '',
        bubbleVideoStyle: {left: 0, top: 0}
      }
    },
    computed: {
      ...mapState([
        'bubbleVideoInfo',       // 视频气泡信息
        'countMapExtentChange'   // 当前地图视野改变次数（无需考虑次数具体是几次，只要监听到次数改了就意味着地图视野变了）
      ]),
    },
    watch:{
      countMapExtentChange() {
        /**
         * 地图视野范围改变时重设气泡位置
         */
        this.info && this.setBubbleStyle();
      },
      bubbleVideoInfo() {
        /**
         * 从vuex中拿到的当前信号机气泡信息
         */
        this.info = this.bubbleVideoInfo;
      },
      info() {
        /**
         * 根据当前信号机点位坐标设置气泡位置
         */
        if(this.info) {
          this.setBubbleStyle()
        }else {
          this.info = '';
        }
      },
    },
    methods: {
      ...mapMutations([
        'setVuex_bubbleVideoInfo'
      ]),
      setBubbleStyle() {
        /**
         * 设置气泡位置
         */
        window.map.MapPoint2ScreenPoint([this.info.deviceX, this.info.deviceY], (e) => {
          this.bubbleVideoStyle = {
            top: (e.y - 220 / 2 + 43) + 'px',
            left: (e.x + 62) + 'px'
          };
          console.log(this.bubbleVideoStyle)
        })
      },
      openVideo(id) {
        /**
         *  打开新窗口显示视频
         *  @param id {String} : 视频id
         */
        const url = `${config.video_URL}/videoBox.htm?videoid=${id}&noctrl=1`;
        window.open(url, 'newVideo', "height=460, width=800, directories=0, location=0, menubar=0, resizable=0, scrollbars=0, status=0, toolbar=0, titlebar=0, help=0, center=1");
      },
      close() {
        /**
         * 关闭气泡
         */
        this.info = '';
        this.setVuex_bubbleVideoInfo('');
      }
    }
  }


</script>
<style scoped>
  .box-bubble-wrapper {width: 300px;height: 220px;}
</style>
