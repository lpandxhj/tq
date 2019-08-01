8 <!-- 头部公用组件 -->
<template>
    <header>
        <p class="login-info">
          张三 M16347
          <span title="退出" class="ic2 btn-login-out" @click="loginOut"></span>
        </p>
        {{systemName}}
    </header>
</template>

<script>
  export default {
    data () {
      return {
        systemName:'特勤管理系统'
      }
    },
    watch:{
    },
    mounted () {
       this.systemName = config.systemName || '特勤管理系统';
    },
    methods: {
      loginOut () {
        // 退出登录
        window.top.location = `${config.webServer_URL}`;
      }
    }
  }
</script>
<style scoped>
  header{height:50px;line-height:50px;background:#5093e1;font-size:21px;color:#fff;position:absolute;top:0;left:0;right:0;z-index:1;}
  header::before{content:'';float:left;height:36px;width:36px;background:url(../assets/images/bg-logo.png) no-repeat;margin:7px 10px 0;}
  .login-info{float:right;}
  .btn-login-out{display:inline-block;height:50px;width:49px;}
  .btn-login-out::before{display:inline-block;height:20px;width:20px;background-position:-360px 0;position:relative;top:5px;left:10px;}
  .btn-login-out:hover{cursor:pointer;}
  .btn-login-out:hover::before{background-position:-360px -20px;}
</style>
