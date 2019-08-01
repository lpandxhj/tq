<!-- 方案管理： 预演动画 -->
<template>
  <div class="box-memo box-ainimation">
    <!-- 方案日期、播放控制 -->
    <p class="animation-handle clrfix">
      <span>{{previewDate.substring(0, 10)}}</span>
      <span class="ic2 ic-animation-stop" @click="btnHandle('stop')" title="停止"></span>
      <span class="ic2 ic-animation-play"  title="播放" @click="btnHandle('start')" v-show="isPause" ></span>
      <span class="ic2 ic-animation-pause"  @click="btnHandle('suspend')" title="暂停" v-show="!isPause"></span>
    </p>

    <!-- 进度条(包含红色冲突段) -->
    <div class="animation-progress-bar">
        <!-- 进度条 -->
        <progress-bar :percentNum="percentNum" @change="percentChange"></progress-bar>
        <!-- 冲突段 -->
        <p class="progress-bar-clash" v-for="(item, idx) in clashArr" :key="'clash_'+idx" :style="{width:item.width, left:item.left}"></p>
    </div>

    <!-- 倍数控制 -->
    <ul class="speed-opt flex-wrap-c">
      <li v-for="(item, idx) in speedArr" :key="'speed'+item" class="flex-item" :class="{active:speedIdx == idx}" :title="item+'倍速度播放'"
                @click="speedIdx = idx">{{item.toFixed(1)}}X</li>
    </ul>
  </div>
</template>

<script>
  import ProgressBar from '@components/parts/ProgressBar' ;
  import { mapState } from 'vuex';
  export default {
    props: ['clashArr', 'rout', 'state'],
    components: {
      ProgressBar
    },
    data() {
      return {
        isPause: true,                                          // 默认暂停
        speedArr: [1.0, 2.0, 4.0, 16.0, 32.0],                  // 倍数选项
        speedIdx: 0,                                            // 当前选中的倍数索引
        percentNum: 0,                                          // *100换算后的百分比（Number类型），不要单位
      };
    },
    computed: {
      ...mapState([
        'previewDate'
      ]),
      speed() {
        /**
         * 当前动画播放倍数（根据当前激活的倍数索引值speedIdx计算）
         */
        return this.speedArr[this.speedIdx];
      }
    },
    watch: {
      speed() {
        /**
         * 监听倍数改变
         */
        this.$emit('speed-change', this.speed)
      },
      rout() {
        /**
         * 小车运动时控制百分比(外部推送控制百分比，非手动拖拽)
         */
        this.percentNum = Number(this.rout);
      },
      state() {
        /**
         * 重置动画时，需要重置动画配置（倍数、百分比、状态恢复到初始值）
         */
        if(this.state == 'stop') {
          this.isPause = true;
          this.speedIdx = 0;
        }
      }
    },
    mounted() {
    },
    methods: {
      btnHandle(state) {
        /**
         * 动画状态改变
         * @param state {String}: 动画状态
         */
        this.$emit('state-change', state);

        this.isPause = state != 'start' ? true : false;     // 停止时播放按钮恢复暂停状态
        if(state == 'stop') {                               // 停止时重置倍数、百分比
          this.speedIdx = 0;
          this.percentNum = 0;
          this.$emit('percent-change', 0);
        }
      },
      percentChange(percentNum) {
        /**
         * 进度条百分比改变(手动控制进度时)
         */
        this.percentNum = percentNum;
        this.$emit('percent-change', percentNum);
      }
    }
  }
</script>

<style scoped>
  .box-ainimation{width:240px;height:80px;box-sizing:border-box;position:relative;z-index:5;margin:10px 0 0 10px;}
  .animation-handle .ic2{float:right;}
  .ic-animation-stop{margin-left:5px;}
  .speed-opt::before{content:'倍数';display:inline-block;margin:0 5px 3px 0;position:relative;top:2px;}
  .speed-opt li{margin:0 3px;color:#465461;}
  .speed-opt li:hover{cursor:pointer;font-weight:bold;}
  .speed-opt li.active{color:#3dcf8f;}
  .animation-progress-bar{position:relative;}
  .progress-bar-clash{position:absolute;top:6px;height:10px;background:#f96868;opacity:.4;}
</style>

