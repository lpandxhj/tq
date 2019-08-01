<!-- 监测：当前执行线路的进度 -->
<template>
  <div class="route-progress-container" :class="{active:isShow}">
    <!-- 半透明背景-->
     <p class="mask-bg box-shadow border-radius"></p>

    <div class="route-progress">
      <p class="current-point-status">
        <strong>距离下一途径点【{{nextPoint.pointName}}】还有{{nextPoint.restLength.toFixed(0)}}米，当前时速{{nextPoint.speed}}km/h，预计用时{{nextPoint.planTime}}分钟</strong>
      </p>

      <!-- 当前线路进度（可查看起止点、计划的途径点、已途径点、当前点等） -->
      <route-progress-bar class="list-route-point"
                          :isStart="isStart"
                          :routePointList="routePointList"
                          :percent="progress.percent"
                          :arrivedPointIdx="progress.arrivedPointIdx"></route-progress-bar>
    </div>
  </div>
</template>

<script>
  import RouteProgressBar from '@components/parts/RouteProgressBar';
  import { mapState } from 'vuex';
  export default {
    props: [
      'isShow',
      'isStart',
      'routePointList',
      'serverPush_pointInfo'
    ],
    components: {
      RouteProgressBar
    },
    data() {
      return {
        progress: {
            "percent": 0,                                                         // 当前点距下一个途径点间的百分比进度
            "arrivedPointIdx": 0,                                                 // 已到达的点的索引（第二个点已到达，目前百分比进度在第二个点~第三个点之间）
            "speed": 0,                                                           // 当前速度
            "restLength": 0                                                       // 距下一个途径点距离
        }
      }
    },
    computed: {
      ...mapState([
        'routeId',
        'serverPush'
      ]),
      nextPoint() {
        /**
         * 下一个途径点信息
         */
        let r = {
          pointName: '',                                                          // 下一个途径点名称
          planTime: 0,                                                            // 当前位置距下一个途径点的预计用时
          speed: 0,                                                               // 当前速度（km/h）
          restLength: 0,                                                          // 距下一个途径点的剩余距离
        };
        if(this.routePointList && this.routePointList.length){
          if(this.progress.arrivedPointIdx != (this.routePointList.length-1)){
             // 下一个途径点存在时（即当前点非终点时）
            const nextPoint = this.routePointList[this.progress.arrivedPointIdx+1]; // 下一个途径点
            if(nextPoint) {
              r.pointName = nextPoint.pointName;
              r.speed = this.progress.speed || nextPoint.speed;
              r.restLength = this.progress.restLength || nextPoint.pointLength;
              r.planTime =  Math.ceil(r.restLength/1000/r.speed*60);
            }
          }else{
            // 到终点时除了点名字有值，其余均为0
            r.pointName = this.routePointList[this.routePointList.length-1].pointName;
          }
        }
        return r;
      },
    },
    watch: {
      serverPush_pointInfo() {
        /**
         * 途径点位置消息推送：当前途径点进度信息
         */
        this.progress = this.serverPush_pointInfo;
      }
    },
    methods: {
    }
  }
</script>

<style scoped>
     .route-progress-container{width:660px;height:100px;padding:10px 15px 8px;box-sizing:border-box;position:fixed;bottom:-1000px;z-index:4;left:50%;transform:translateX(-47%);transition:bottom .4s;}
     .route-progress-container.active{bottom:15px;}
     .route-progress-container .mask-bg{position:absolute;top:0;bottom:0;left:0;right:0;background:#fff;opacity:.7;z-index:1;}
     .route-progress-container .route-progress {position:relative;z-index:2;}
     .route-progress .current-point-status{color:#465461}
     .route-progress .list-route-point{margin:8px 0 0;}
</style>
