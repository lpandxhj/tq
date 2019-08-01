<!-- 方案管理：方案制作（添加方案） -->
<template>
  <el-dialog custom-class="dialog-wh655"
             :title="title"
             :show-close="true"
             :append-to-body="true" :close-on-press-escape='false'
             :close-on-click-modal='false'
             :visible.sync="showDialog"
             v-loading="showLoading">
    <el-scrollbar class="el-scrollbar-xhidden scroll-list-edit-scheme">
      <div class="form-wrap">
        <el-row class="form-item">
          <el-col :span="3" class="label ic-request">方案名称：</el-col>
          <el-col :span="13"><el-input style="width:100%;" size="mini" :title="info.schemeName" v-model="info.schemeName" clearable></el-input></el-col>
          <el-col :span="3" class="label ic-request">方案编号：</el-col>
          <el-col :span="5">
            <!-- 编辑时schemeId不可修改 -->
            <el-input v-if="!schemeId" size="mini" :title="info.schemeId" v-model="info.schemeId" clearable></el-input>
            <el-input v-else size="mini" :title="info.schemeId" v-model="info.schemeId" disabled clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="3" class="label ic-request">方案等级：</el-col>
          <el-col :span="5">
            <el-select v-model="info.schemeRankId" placeholder="请选择" class="flex-item" size="mini" @change="rankChange">
              <el-option
                v-for="item in rankList"
                :key="item.dicCode"
                :label="item.dicName"
                :value="item.dicCode">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3" class="label">方案来源：</el-col>
          <el-col :span="5"><el-input size="mini" :title="info.schemeSource" v-model="info.schemeSource" clearable></el-input></el-col>
          <el-col :span="3" class="label">负责人：</el-col>
          <el-col :span="5"><el-input size="mini" :title="info.schemePersonName" v-model="info.schemePersonName" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item" id="date__edit_scheme">
          <el-col :span="3" class="label ic-request">开始时间：</el-col>
          <el-col :span="5">
            <el-date-picker size="mini"  type="date"  placeholder="选择日期" value-format="yyyy-MM-dd" :title="info.schemeBeginDate" v-model="info.schemeBeginDate"></el-date-picker>
          </el-col>
          <el-col :span="3" class="label ic-request">结束时间：</el-col>
          <el-col :span="5">
            <el-date-picker size="mini"  type="date"  placeholder="选择日期" value-format="yyyy-MM-dd" :title="info.schemeEndDate" v-model="info.schemeEndDate"></el-date-picker>
          </el-col>
          <el-col :span="3" class="label">联系方式：</el-col>
          <el-col :span="5"><el-input size="mini" :title="info.schemePhone" v-model="info.schemePhone" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="3" class="label ic-request">方案内容：</el-col>
          <el-col :span="21">
            <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="info.schemeContent"></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="3" class="label ic-request">备注：</el-col>
          <el-col :span="21">
              <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model="info.schemeMemo"></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="3" class="label">方案附件：</el-col>
          <el-col :span="21">
            <!-- 上传附件 -->
            <upload-file
              :isEdit="true"
              :schemeFileList="info.schemeFileList"
              @file-update="funFileUpdate"></upload-file>
          </el-col>
        </el-row>
      </div>
    </el-scrollbar>

    <!-- 按钮操作 -->
    <span slot="footer" class="dialog-footer">
         <el-button size="mini" round type="primary" @click="saveInfo">保 存</el-button>
         <el-button size="mini" round @click="$emit('dialog-close')">取 消</el-button>
      </span>
  </el-dialog>
</template>

<script>
  import UploadFile from '@components/parts/UploadFile'
  import common from "../../tools/common";
  export default {
    props:['isShow', 'schemeId', 'rankList'],
    components: {
      UploadFile
    },
    data() {
      return {
        showLoading: false,
        showDialog: false,              // 是否显示对话框

        title: '方案制作',                // 制作or编辑
        info:{                          // 方案制作 基本信息
          schemeName :'',                // 方案名称
          schemeId: '',                  // 方案编号
          schemeSource: '',              // 方案来源
          schemeRankId: '',              // 方案等级id
          schemeRankName: '',            // 方案等级name
          schemeBeginDate: '',           // 开始时间
          schemeEndDate: '',             // 结束时间
          schemePersonName: '',          // 负责人
          schemePhone: '',               // 负责人联系电话
          schemeContent: '',             // 方案内容
          schemeMemo: '',                // 备注
          schemeFileList: []             // 附件列表
        }
      };
    },
    watch: {
      isShow() {
        // 监听父组件显示dialog操作
        this.showDialog = this.isShow;
      },
      showDialog() {
        // 监听当前dialog显隐
        if(!this.showDialog){
          this.$emit('dialog-close');                            // 关闭模态框
        }else{
          this.setInfo();                                        // 打开模态框时设置方案信息 info
        }
      }
    },
    methods: {
      // *** ajax start ***
      ajaxGetSchemeInfo() {
        /**
         * 根据方案id获取方案基本信息
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeBaseInfoList_GET}`;
        const params = {
          schemeId: this.schemeId                               // 方案id
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) this.info = res.resultList[0]; // 该接口返回是个list, 方案id对应的方案是唯一的，拿到list[0]
            this.showLoading = false;
          }).catch(rej => {
            this.showLoading = false;
        })
      },
      ajaxAddScheme() {
       /**
        * 方案制作(新增)
        */
        if(!this.checkNull()) return;
        const apiName = `${config.baseUrl_HOST}${this.$api.addSchemeInfo_POST}`;
        const params = this.info;
        this.showLoading = true;
        this.$http.post(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('方案新增成功！');
              this.$emit('edit-complete', 'add');                 // 通知父组件更新列表
              this.$emit('dialog-close');                         // 关闭模态框
            }else{
              this.$message.error('方案新增失败！'+res.dataBuffer);
            };
            this.showLoading = false;
          }).catch(rej => {
            this.$message.error('方案新增失败!');
            this.showLoading = false;
        })
      },
      ajaxEditScheme() {
        /**
         * 方案编辑
         */
        if(!this.checkNull()) return;
        const apiName = `${config.baseUrl_HOST}${this.$api.editSchemeInfo_PUT}`;
        delete this.info.taskInfoList;                            // 扔掉不要的参数（方案基础信息保存时不考虑任务详情，直接扔掉，让方案参数变得更纯粹）
        this.showLoading = true;
        this.$http.put(apiName, this.info)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('方案编辑成功！');
              this.$emit('edit-complete', 'edit');                // 通知父组件更新列表
              this.$emit('dialog-close');                         // 关闭模态框
            }else{
              this.$message.error('方案编辑失败！');
            };
            this.showLoading = false;
          }).catch(rej => {
            this.$message.error('方案编辑失败！');
            this.showLoading = false;
        })
      },
      // *** ajax end ***

      setInfo() {
        if(this.schemeId){
          // 方案编辑
          this.title = '方案编辑';
          this.ajaxGetSchemeInfo();
        }else{
          // 新增方案 清空表单
          this.title = '方案制作';
          this.info = {
            schemeName:'',
            schemeId:'',
            schemeSource:'',
            schemeRankId:'',
            schemeRankName:'',
            schemeBeginDate:'',
            schemeEndDate:'',
            schemePersonName:'',
            schemePhone:'',
            schemeContent:'',
            schemeMemo:'',
            schemeFileList:[]
          };
        }
      },
      saveInfo() {
        /**
         * 根据方案id来判断当前操作是新增还是编辑（新增方案schemeId为空）
         */
        if(this.schemeId){
          this.ajaxEditScheme(this.schemeId);                  // 编辑方案
        }else{
          this.ajaxAddScheme();                                // 新增方案
        }
      },
      funFileUpdate(fileList) {
        /**
         * 文件上传列表有更新
         * @param fileList { Array }:  当前文件列表数组
         */
        const list = [];
        fileList.forEach( i => {
            list.push({
              fileName: i.fileName,
              fileSize: i.fileSize / 1024,
              fileUrl: i.fileUrl
            })
        })
        this.info.schemeFileList = list;
      },
      rankChange(rankId) {
        /**
         * 切换方案等级时,根据等级id设置等级name
         * @param rankId { String } : 方案等级id
         */
        this.rankList.some(i => {
          if(rankId == i.dicCode){
            this.info.schemeRankName = i.dicName;
            return true;
          }
        })
      },
      checkNull() {
        /**
         * 必填项非空验证
         */
        const flag = this.info.schemeName && this.info.schemeId && this.info.schemeRankId && this.info.schemeBeginDate && this.info.schemeEndDate && this.info.schemeContent && this.info.schemeMemo;
        if(!flag) this.$message.error('抱歉，必填项不能为空!');
        return flag;
      }
    }
  }
</script>

<style scoped>
  /* 组件私有样式 */
  .scroll-list-edit-scheme{height:410px;width:653px;}

</style>
<style>
  /* 覆盖elementui样式 */
   .el-upload{width:100%;text-align:left;}
  #date__edit_scheme .el-input--mini .el-input__inner,
  #date__edit_scheme .el-date-editor.el-input,
  #date__edit_scheme .el-date-editor.el-input__inner{width:128px;}
</style>
