'use strict'
export default {
  drag: {
    //元素拖拽
    inserted(el){
      el.onmousedown = function (ev) {
        var disX = ev.clientX - el.offsetLeft;
        var disY = ev.clientY - el.offsetTop;
        document.onmousemove = function (ev) {
          var l = ev.clientX - disX;
          var t = ev.clientY - disY;
          el.style.position = 'fixed';
          el.style.left = l + 'px';
          el.style.top = t + 'px';
        };
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      }
    }
  },
  focus: {
    // 自动聚焦
    inserted(el) {
      el.focus()
    }
  }
}


