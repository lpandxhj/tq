<!-- 暂无数据:此组件注册成全局组件了 -->
<template>
    <div class="no-data" :title="txt">
        <span class="no-data-bg">
            <i class="no-data-txt">{{txt}}</i>
        </span>
    </div>
</template>

<script>
    export default {
        props:{
            txt:{
                type:[Number,String],
                default: '暂无数据'
            }
        },
    }
</script>

<style scoped>
     .no-data{position:relative;text-align:center;padding:10px 0;margin:0 auto;}
     .no-data-bg{display:inline-block;height:95px;width:83px;background:url(../assets/images/bg-nodata.png) no-repeat center top;position:relative;}
     .no-data-txt{color:#909399;position:absolute;bottom:0;left:50%;transform:translateX(-50%);word-break: keep-all;white-space:nowrap;}
</style>
