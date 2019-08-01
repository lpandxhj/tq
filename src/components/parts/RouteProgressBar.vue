<!-- 监测：当前执行线路的进度 -->
<template>
      <!-- 当前线路进度（可查看起止点、计划的途径点、已途径点、当前点等） -->
      <ul class="list-route-point" :title="!routePointList.length && '暂无执行线路'">
        <li v-for="(point, pidx) in routePointList"
            v-if="routePointList.length"
            :class="{arrived: isStart && isArrivedPoint(pidx), next: isStart && isNextPoint(pidx)}">

          <!-- 隐藏的点名称（仅在hover时显示） -->
          <el-tooltip class="item" effect="dark" :content="point.pointName" popper-class="my-tips" placement="top-start">
            <i class="point-circle"></i>
          </el-tooltip>

          <!-- 两点之间的百分比进度 -->
          <p class="progress-percent-bg" :style="{width: setPointPercent(pidx) +'%'}"></p>

          <!-- 点名称（仅显示起、止、下一个点 的名称） -->
          <span class="point-name "
                :class="{'point-active-name': isActivePoint, 'point-next-name':isNextPoint(pidx)}"
                v-show="isBeginPoint(pidx) || isEndPoint(pidx) || (isStart && isNextPoint(pidx))">{{point.pointName}}</span>

          <!-- 点距起点的距离（仅显示当前激活点、终点 距起点的距离）-->
          <span class="point-length"
                v-if="isActivePoint(pidx) || isEndPoint(pidx) "
                :class="{'point-active-length': isActivePoint(pidx), 'point-end-length': isEndPoint(pidx)}">{{(point.pointLength/1000).toFixed(0)}}KM</span>
        </li>
      </ul>
</template>

<script>
  export default {
    props: [
      'isStart',                 // 任务是否已开始执行
      'routePointList',          // 途径点点位list
      'arrivedPointIdx',         // 当前已到达的点位
      'percent'                  // 当前两点之间的百分比
    ],
    data() {
      return {
      }
    },
    methods: {
      setPointPercent(pointIdx) {
        /**
         * 设置点到下一个点的运动进度（已到达点索引 > 当前遍历的点索引，说明该点已经到达了，进度100%； 到达点 == 遍历点，说明运动进行中，位置在到达点和下一个点之间，具体进度按推送的来； 到达点<当前遍历点，说明还未开始运动），进度0%
         */
        let percent = 0;
        if(this.arrivedPointIdx > pointIdx){
          percent = 100;
        }else if(this.arrivedPointIdx == pointIdx){
          percent = this.percent;
        }
        return percent
      },

      isArrivedPoint(idx) {
        /**
         * routePointList[idx]点是否为 已到达的点（历史点）
         */
        return (this.arrivedPointIdx - idx) >= 0;
      },

      isActivePoint(idx) {
        /**
         *  routePointList[idx]点是否为 当前激活的点（当前到达的点）
         */
        return idx !=0 && idx == this.arrivedPointIdx;
      },

      isNextPoint(idx) {
        /**
         *  routePointList[idx]点是否为 下一个点（即将到达的点）
         */
        return idx == this.arrivedPointIdx+1;
      },

      isBeginPoint(idx) {
        /**
         *  routePointList[idx]点是否为 起点
         */
        return idx == 0;
      },

      isEndPoint(idx) {
        /**
         *  routePointList[idx]点是否为 终点
         */
        return idx == this.routePointList.length-1;
      },
    }
  }
</script>

<style scoped>
  /* 途径点进度条 */
  .list-route-point{display:flex;height:50px;position:relative;}
  .list-route-point::before{content:'';position:absolute;left:0;top:22px;right:0;display:block;height:4px;background:#aab5c2;z-index:2;border-radius:20px;}
  .list-route-point li{flex:1;position: relative;}
  .list-route-point li:nth-child(odd) .point-name{bottom:0;}
  .list-route-point li:nth-child(even) .point-name{top:0;}
  .list-route-point li:first-child .point-circle::after,
  .list-route-point li:last-child .point-circle::after{background:#aab5c2;}
  .list-route-point li:last-child{width:10px;flex: inherit}
  .list-route-point li:last-child .point-name{left:inherit;right:-1px;top:30px;}
  .list-route-point li .progress-percent-bg{display:block;height:4px;position:absolute;left:0;top:22px;z-index:2;background:#3dcf8f;border-radius:20px;}
  .list-route-point li .point-circle{float:left;height:10px;width:10px;position:relative;z-index:4;border-radius:50%;top:19px;left:0;}
  .list-route-point li .point-circle::after{content:'';z-index:3;display:block;height:10px;width:10px;background:#fff;border:2px solid #aab5c2;box-sizing:border-box;border-radius:50%;position:relative;top:0;left:0;}
  .list-route-point li .point-name{position:absolute;white-space:nowrap;max-width:100px;left:0;}
  .list-route-point li .point-active-name{top:30px;left:-2px;}
  .list-route-point li .point-next-name{left:-25px;display:block;width:60px;text-align:center;}
  .list-route-point li .point-length{position:absolute;top:0;}
  .list-route-point li .point-active-length{left:-31px;right:inherit;display:block;width:70px;text-align:center;}
  .list-route-point li .point-end-length{left:inherit;right:-2px;text-align:right;}
  .list-route-point li .point-circle:hover{cursor:pointer;}
  .list-route-point li .point-circle:hover::after{background:#aab5c2;}
  .list-route-point li.arrived .point-circle::after{background:#6fd4be;border-color:#6fd4be;}
  .list-route-point li.next .point-circle::before{content:'';position:absolute;z-index:1;top:-3px;right:-3px;bottom:-3px;left:-3px;background:#5093e1;opacity:.7;border-radius:50%;}
  .list-route-point li.next .point-circle::after{background:#fff;border-color:#5093e1;}
  .list-route-point li.next .point-circle:hover::after{background:#5093e1;border-color:#fff;}
</style>
