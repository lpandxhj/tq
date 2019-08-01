<!-- 二次确认框:此组件注册成全局组件了 -->
<template>
  <el-dialog :title="txt" :visible.sync="isShowConfirm" width="30%" class="dialog-confirm" :append-to-body="true">
      <p class="dialog-content">{{content}}</p>
      <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="$emit('ok')" round size="mini">确 定</el-button>
      <el-button @click="$emit('close')" round size="mini">取 消</el-button>
  </span>
  </el-dialog>
</template>

<script>
  export default {
    props: {
      txt: {
        type: [Number, String],
        default: '提示'
      },
      content: {
        type: String,
        default: '是否确认删除？'
      },
      isShow:{
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShowConfirm: false
      }
    },
    watch: {
      isShow() {
        /**
         * 监听确认框显示隐藏
         */
        this.isShowConfirm = this.isShow;
      }
    }
  }
</script>

<style scoped>
     .dialog-confirm .dialog-content{padding:0 10px 15px 10px;}
     .dialog-confirm .dialog-footer{background:none;}
</style>
