<!-- 方案管理：上传附件 -->
<template>
  <div class="upload-file">
    <!-- 可编辑（查看、上传、删除）-->
    <el-upload v-if="isEdit" multiple  name="multipartFile"
               :action="action" :headers="headers" :file-list="fileList" :show-file-list="false"
               :on-success="uploadSuccess" :before-upload="checkFileSize">
     <p class="btn-upload-file">
       <button class="btn-primary" title="选择文件">选择文件</button>
       <span class="tips-limit">（限 .jpg 与 .png、word 格式，10MB以内）</span>
     </p>


      <!-- 上传文件列表 -->
      <ul class="list-uploadfile clrfix">
        <li class="list-uploadfile-item" v-for="(item, idx) in fileList">
          <i class="el-icon-delete" title="删除" @click.stop="delFile(idx)"></i>
          <i v-if="fileList.length" :class="'ic-file-type ic-file-type-'+ item.suffix"></i>
          <p class="file-name" :title="item.fileName">{{item.fileName}}</p>
        </li>
      </ul>
    </el-upload>


    <!-- 不可编辑（仅查看） -->
    <template v-else>
      <ul class="list-uploadfile clrfix">
        <li class="list-uploadfile-item" v-for="(item, idx) in fileList" v-if="fileList.length">
          <i class="el-icon-download" title="下载" @click.stop="downLoadFile(item.fileUrl)"></i>
          <i v-if="fileList.length" :class="'ic-file-type ic-file-type-'+ item.suffix"></i>
          <p class="file-name" :title="item.fileName">{{item.fileName}}</p>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  import common from '@tools/common';
  export default {
    props:['isEdit' , 'schemeFileList'],
    data() {
      return {
        fileList:[],
      };
    },
    computed: {
      headers() {
        // 上传 请求头
        const token = sessionStorage.getItem('token') || config.token;
        return { token: token }
      },
      action(){
        // 上传 url
        return `${config.baseUrl_HOST}/ftp/upload/file`
      }
    },
    watch: {
      schemeFileList(){
        this.fileList = this.schemeFileList;
      },
      fileList() {
        /**
         * 设置文件类型标识
         */
        this.fileList.forEach(i => {
          const sIdx = i.fileName.lastIndexOf('.')+1;
          this.$set(i, 'suffix', i.fileName.substring(sIdx).toLocaleLowerCase())
        })
      }
    },
    mounted() {
      this.fileList = this.schemeFileList;
    },
    methods: {
      uploadSuccess(response, file, fileList) {
        /**
         * 上传成功
         */

        if(typeof response == 'string'){
          const r = JSON.parse(response);
          if(r.appCode == 0) {
            this.fileList.push({
              fileName: file.name,
              fileSize: file.size,
              fileUrl: r.resultList
            })
            this.$emit('file-update', this.fileList);                                     // 父组件更新附件列表
          }
        }
      },
      checkFileSize(file){
        /**
         * 检查文件大小、格式是否符合规范
         */
         const maxSize = 10 * 1024;
         const fileSize = Math.round(file.size / 1024);
         if(fileSize > maxSize){
           this.$message.error('抱歉，文件大小不能超过10M');
            return false;
         };
         // 允许jpg/png/word/ppt/pdf
        const flag = file.type == 'image/jpeg' || file.type == 'image/png' || file.type.indexOf('word') != -1 || file.type == 'application/vnd.ms-powerpoint' || file.type == 'application/pdf';
        if(!flag){
          this.$message.error('抱歉，文件格式不支持')
          return false;
        }
      },
      delFile(idx) {
        /**
         * 删除文件
         * @param idx {Number}: 删除文件在文件列表中的索引值，通过更新文件列表来实现前端删除
         */
        this.fileList.splice(idx, 1);
      },
      downLoadFile(url) {
        /**
         * 文件下载
         * @param url {String}: 文件下载地址
         */
        window.open(url, '_blank');
      }
    }
  }
</script>

<style scoped lang="less">
  /* 组件私有样式 */
  .tips-limit{color:#aaa;margin-left:-5px;line-height:22px;}    /* 文件上传 */
  .btn-upload-file{padding-top:6px;text-align:left;}
  .list-uploadfile{width:100%;padding:10px 0;text-align:center;}
  .list-uploadfile-item{float:left;width:16%;height:70px;padding-top:5px;box-sizing:border-box;margin-left:.5%;position:relative;}
  .ic-file-type{line-height:inherit;}
  .ic-file-type::before{content:'';display:inline-block;height:25px;width:25px;box-sizing:border-box;background:url(../../assets/images/ic-file-type.png) no-repeat;}
  .ic-file-type-doc::before{background-position:0 0;}
  .ic-file-type-ppt::before{background-position:-25px 0;}
  .ic-file-type-pdf::before{background-position:-50px 0;}
  .ic-file-type-png::before{background-position:-75px 0;}
  .ic-file-type-jpg::before, .upload-file .ic-file-type-jpeg::before{background-position:-100px 0;}
  p.file-name{ overflow: hidden;  text-overflow: ellipsis; display: -webkit-box;  -webkit-line-clamp: 2;  -webkit-box-orient: vertical;word-break: break-all;}
  .el-icon-delete,
  .el-icon-download{position:absolute;left:0;right:0;top:0;bottom:0;display:none;}     /* 文件删除 */
  .el-icon-delete::after,
  .el-icon-download::after{content:'';display:block;position:absolute;left:0;right:0;top:0;bottom:0;background:#000;opacity:.3;border-radius:4px;z-index:0;}
  .list-uploadfile-item:hover .el-icon-delete,
  .list-uploadfile-item:hover .el-icon-download{display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .list-uploadfile-item:hover .el-icon-delete::before,
  .list-uploadfile-item:hover .el-icon-download::before{color:#fff;font-size:22px;position:relative;z-index:1;}
</style>
