<!-- 地图自定义气泡: 信号机 -->
<template>
    <div class="box-bubble-wrapper" v-if="info" :style="bubbleSignStyle">
      <h2 class="primary-title">
        <i class="fr ic2 ic-close-x" title="关闭" @click="close"></i>
        信号控制
      </h2>

      <ul class="list-bubble-info" v-if="info">
        <li>
          <label>设备名称：</label>
          <span>{{info.deviceName || '-'}}</span>
          <!--<span>{{info.NAME || '-'}}</span>-->
        </li>
        <li>
          <label>所属大队辖区：</label>
          <span>{{info.DEVTYPE_NAME || '-'}}</span>
        </li>
        <li>
          <label>管理部门：</label>
          <span>{{info.DEPTNAME || '-'}}</span>
        </li>
        <li>
          <label>设备类型：</label>
          <span>{{info.DEVTYPE_NAME || ''}} </span>
        </li>
        <li>
          <label>设备厂家：</label>
          <span>{{info.MANUFACT || '-'}}</span>
        </li>
      </ul>

      <!-- 信号控制按钮 -->
      <div class="btn-group-bottom">
        <el-button type="primary" size="mini" round @click="openSignal(info.manageId)">信号控制</el-button>
      </div>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';
    export default {
        data() {
            return {
              info:'' ,
              bubbleSignStyle: {left: 0, top: 0}
            }
        },
        computed: {
          ...mapState([
              'bubbleSignInfo',       // 信号机气泡信息
              'countMapExtentChange'  // 当前地图视野改变次数（无需考虑次数具体是几次，只要监听到次数改了就意味着地图视野变了）
          ]),
        },
        watch:{
          countMapExtentChange() {
            /**
             * 地图视野范围改变时重设气泡位置
             */
            this.info && this.setBubbleStyle();
          },
          bubbleSignInfo() {
            /**
             * 从vuex中拿到的当前信号机气泡信息
             */
            this.info = this.bubbleSignInfo
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
            'setVuex_bubbleSignInfo'
          ]),
          setBubbleStyle() {
            /**
             * 设置气泡位置
             */
            window.map.MapPoint2ScreenPoint([this.info.deviceX, this.info.deviceY], (e) => {
              this.bubbleSignStyle = {
                top: (e.y - 220 / 2 + 43) + 'px',
                left: (e.x + 62) + 'px'
              };
            })
          },
          openSignal(id) {
            /**
             *  打开新窗口显示信号机控制
             *  @param id {String} : 信号机id
             */
            const url = `${config.sign_URL}/smallplay.html?id=${id}`;
            window.open(url, 'newSign', "height=460, width=800, directories=0, location=0, menubar=0, resizable=0, scrollbars=0, status=0, toolbar=0, titlebar=0, help=0, center=1");
          },
          close() {
            /**
             * 关闭气泡
             */
            this.info = '';
            this.setVuex_bubbleSignInfo('');
          }
        }
    }
</script>
<style scoped>
  .box-bubble-wrapper{width:300px;height:220px;}
</style>
