<!-- 可拖动的进度条 -->
<template>
 <div class="progress-bar-wrap">
   <div class="progress-bar-container" id="container">
     <!-- 可拖动的手柄 -->
     <span class="progress-bar-handle" id="handle"></span>

     <!-- 进度条进度变化条 -->
     <p class="progress-bar-fill" id="fill"></p>

     <!-- 当前进度百分比 -->
     <span class="progress-bar-percent">{{percent}}%</span>
   </div>
 </div>
</template>

<script>
  export default {
    props: {
      percentNum: {                                                           // 外部直接可控进度百分比
        type: Number,
        default: 0
      },
    },
    data(){
      return {
        percent:0                                                             // 进度条百分比
      }
    },
    watch: {
      percentNum() {
        /**
         * 进度条百分比（可通过外部传入的百分比设置进度条当前进度）
         */
         this.percent = this.percentNum;                                     // 父组件可控制进度条百分比
         this.updatePercent(this.percent);
      }
    },
    mounted(){
      // this.setTheme();
      this.init_progressBar();
    },
    methods: {
      init_progressBar() {
       /**
        * 初始化进度条
        */
        const ts = this;
        let left = 0;                                                         // 拖动手柄左侧偏移量
        const container = document.getElementById('container');               // 进度条容器
        const handle = document.getElementById('handle');                     // 拖动的手柄
        // 手柄拖动控制进度条
        handle.onmousedown = function(event){
          event = event || window.event;
          let leftVal = event.clientX - this.offsetLeft;                      // 进度条容器到左侧的偏移量（leftVal：container.getBoundingClientRect().left替代）

          // 拖动一定写到 down 里面才可以
          document.onmousemove = function(event) {
            event = event || window.event;
            left = event.clientX - leftVal;                                   // 手柄相对进度条容器的偏移量
            if(left < 0){
             // 最小值临界点
             left = 0;
            }else if(left > container.offsetWidth - handle.offsetWidth){
             // 总长度-块长度=剩余长度，剩余长度小于块左侧距离的时候是最大值临界点
             left = container.offsetWidth - handle.offsetWidth;
           }
            const percentNum = parseInt(left/(container.offsetWidth-handle.offsetWidth) * 100);
            ts.updatePercent(percentNum);                                     // 根据当前百分比更新进度条
            // 防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
          }
        };
        // 弹起鼠标按下的拖动手柄后 回传当前最新百分比给父组件
        handle.onmouseup = function(){
          ts.$emit('change', ts.percent)
        };

        // 点击目标位置控制进度条
        container.onmousedown = function(event) {
          event = event || window.event;
          const left = event.clientX - container.getBoundingClientRect().left;
          const percentNum = parseInt(left/(container.offsetWidth-handle.offsetWidth) * 100);
          ts.updatePercent(percentNum);
        };

        // 弹起鼠标清除移动事件，不然松开了搞不好还能拖动
        document.onmouseup = function(){
          document.onmousemove = null;
        };
     },

      updatePercent(percentNum) {
        /**
         * 根据百分比控制填充条长度、手柄位置
         * @param percentNum {Number} : 进度条百分比，结果为*100后的数值，非带%的字符串
         */
        let container = document.getElementById('container');                 // 进度条容器
        let handle = document.getElementById('handle');                       // 拖动的手柄
        let fill = document.getElementById('fill');                           // 填充条
        let left = percentNum*(container.offsetWidth-handle.offsetWidth)/100; // 偏移量
        this.percent = percentNum;                                            // 偏移量占百分比
        fill.style.width = percentNum + '%';                                  // 填充条宽度
        handle.style.left = left + "px";                                      // 手柄位置
      }
    }
 }
</script>

<style>
  .progress-bar-wrap{padding:6px 0;}
  .progress-bar-container{height:10px;background:#ececec;border-radius:20px;position:relative;cursor:pointer;}
  .progress-bar-handle{display:block;height:14px;width:10px;cursor:pointer;position:absolute;top:-3px;left:0;z-index:10;background:#fff;border:1px solid #3dcf8f;border-radius:4px;}
  .progress-bar-fill{height:10px;background:#3dcf8f;opacity:.85;border-radius:20px 0 0 20px;position:absolute;top:0;left:0;}
  .progress-bar-percent{position:absolute;left:50%;top:-3px;transform:translateX(-50%);color:#000;}        /* 中间内部*/
</style>
