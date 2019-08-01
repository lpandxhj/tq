<!-- 方案管理：方案信息（查看、提交、审核） -->
<template>
  <div :class="{'map-full-screen': isFast || mapIsFull}">
    <!-- 方案基本信息 -->
    <div class="scheme-baseinfo">
      <el-scrollbar class="el-scrollbar-xhidden scroll-list-scan-scheme" :style="{height:scrollerHt}">
        <!-- 基本信息 -->
        <h2 class="title-info">方案信息</h2>
        <div class="form-wrap form-wrap-theme2">
          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">方案名称：</el-col>
            <el-col :span="18">{{info && info.schemeName}}</el-col>
          </el-row>
          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">方案编号：</el-col>
            <el-col :span="18">{{info && info.schemeId}}</el-col>
          </el-row>

          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">方案等级：</el-col>
            <el-col :span="18">{{info && info.schemeRankName}}</el-col>
          </el-row>

          <el-row class="form-item" id="edit-scheme-date" type="flex" align="middle">
            <el-col :span="6" class="label">开始时间：</el-col>
            <el-col :span="18">{{info && info.schemeBeginDate}} 至 {{info && info.schemeEndDate}}</el-col>
          </el-row>

          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">方案来源：</el-col>
            <el-col :span="18">{{info && info.schemeSource || '无'}}</el-col>
          </el-row>

          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">负责人：</el-col>
            <el-col :span="18">{{info && info.schemePersonName  || '无' }}  {{info && info.schemePhone}}</el-col>
          </el-row>

          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">方案内容：</el-col>
            <el-col :span="18">{{info && info.schemeContent}}</el-col>
          </el-row>

          <el-row class="form-item" type="flex" align="middle">
            <el-col :span="6" class="label">备注：</el-col>
            <el-col :span="18">{{info && info.schemeMemo}}</el-col>
          </el-row>

          <el-row class="form-item">
            <el-col :span="6" class="label">方案附件：</el-col>
            <el-col :span="18">
              <!-- 上传附件 -->
              <upload-file class="show-file-list" v-if="info && info.schemeFileList && info.schemeFileList.length" :isEdit="false" :schemeFileList="info.schemeFileList"></upload-file>
            </el-col>
          </el-row>
        </div>

        <!-- 提交 -->
        <p class="align-c" v-if="routePath == '/schemeinfo/submit'"><span class="btn-primary btn-round" @click="ajaxSubmit" title="提交">提交</span></p>

        <!-- 查看 -->
        <template v-else-if="routePath == '/schemeinfo/scan'">
          <h2 class="title-info">审核信息</h2>
          <div class="form-wrap form-wrap-theme2">
            <el-row class="form-item" type="flex" align="middle">
              <el-col :span="6" class="label">审核结果：</el-col>
              <el-col :span="18">{{checkInfo && checkInfo.checkStatusName  || '无'}}</el-col>
            </el-row>
            <el-row class="form-item" type="flex" align="middle">
              <el-col :span="6" class="label">审核说明：</el-col>
              <el-col :span="18">{{checkInfo && checkInfo.checkIdea  || '无'}}</el-col>
            </el-row>
            <el-row class="form-item" type="flex" align="middle">
              <el-col :span="6" class="label">已审核信息：</el-col>
              <el-col :span="18" class="examine-history">
                <template v-if="checkInfo">
                  <p>{{checkInfo.checkStatusName}}</p>
                  <p>{{checkInfo.checkPerson}}  {{checkInfo.checkTime}}</p>
                </template>
               <p class="vertical-align-middle" v-else>无</p>
              </el-col>
            </el-row>
          </div>
        </template>


        <!-- 审核 -->
        <template v-else>
          <h2 class="title-info">审核信息</h2>
          <div class="form-wrap">
            <el-row class="form-item" type="flex" align="middle">
              <el-col :span="6" class="label ic-request">审核结果：</el-col>
              <el-col :span="18">
                <el-radio-group v-model="schemeStatusId">
                  <el-radio label="SCHEMESTATUS03">审核通过</el-radio>
                  <el-radio label="SCHEMESTATUS04">审核不通过</el-radio>
                </el-radio-group>
              </el-col>
            </el-row>
            <el-row class="form-item">
              <el-col :span="6" class="label">审核说明：</el-col>
              <el-col :span="18">
                <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="checkIdea"></el-input>
              </el-col>
            </el-row>

            <el-row class="form-item" >
              <el-col :span="6" class="label">已审核信息：</el-col>
              <el-col :span="18" class="examine-history">
                <template v-if="checkInfo">
                  <p>{{checkInfo.checkStatusName}}，{{checkInfo.checkIdea}}</p>
                  <p>{{checkInfo.checkPerson}}  {{checkInfo.checkTime}}</p>
                </template>
                <p class="vertical-align-middle">无</p>
              </el-col>
            </el-row>

            <p class="btn-group">
              <el-button type="primary" round size="mini" @click="ajaxExamine">保 存</el-button>
              <el-button round size="mini" @click="pageJumpToList">取 消</el-button>
            </p>
          </div>
        </template>
      </el-scrollbar>
    </div>

    <!-- 方案任务信息(仅查看，不可编辑) -->
    <div class="scheme-taskinfo">
      <i v-if="!isFast" class="ic2 ic-arrow-left" :class="{'ic-arrow-right': mapIsFull}" :title="mapIsFull ? '展开' : '收起'" @click="mapIsFull = !mapIsFull"></i>
      <rlt-task :isEdit="false"></rlt-task>
    </div>
  </div>
</template>

<script>
  import UploadFile from '@components/parts/UploadFile'
  import RltTask from './adminScheme_RltTask.vue'
  import { mapState } from 'vuex';
  export default {
    components: {
      UploadFile,
      RltTask,
    },
    data() {
      return {
        isFast: false,                                      // 当前是否为快速特勤详情查看
        mapIsFull: false,                                   // 右侧地图区域是否满屏显示
        scrollerHt:'800px',                                 // 左侧详请滚动容器高度
        info:'',                                            // 方案详细信息
        schemeStatusId:'SCHEMESTATUS03',                    // 当前审核状态id
        checkIdea:'',                                       // 当前审核说明
      };
    },
    computed: {
      ...mapState([
        'routePath',
      ]),
      checkInfo() {
        /**
         * 获取最近的一次审核记录
         */
        let checkInfo = '';
        if(this.info && this.info.schemeCheckList && this.info.schemeCheckList){
          checkInfo =  this.info.schemeCheckList[0];
        }
        return checkInfo;
      }
    },
    mounted() {
      this.isFast = this.$route.query.isFast ? true : false;// 当前是否为快速特勤
      this.schemeId = this.$route.query.schemeId;           // 从路由对象上截取方案id
      this.setScrollerHt();                                 // 动态设置滚动容器高度
      (!this.isFast && this.ajaxGetSchemeInfo());           // 获取当前方案详情
    },
    methods: {
      // *** ajax start ***
      ajaxGetSchemeInfo() {
        /**
         * 根据方案id获取方案详情
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeBaseInfoList_GET}`;
        const params = {
          schemeId: this.schemeId                               // 方案id
        };
        this.$http.get(apiName, params)
          .then(res => {
            this.info = res.resultList[0];                      // 该接口返回是个list, 方案id对应的方案是唯一的，拿到list[0]
          })
      },
      ajaxSubmit() {
        /**
         * 方案提交
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.submitSchemeInfo_PUT}?schemeId=${this.schemeId}`;
        this.$http.put(apiName)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('提交成功，等待审核!');
              this.pageJumpToList();
            }else{
              this.$message.success('提交失败!失败原因：'+ res.resultList);
            }
          })
      },
      ajaxExamine() {
        /**
         * 方案审核
          */
        const apiName = `${config.baseUrl_HOST}${this.$api.checkSchemeInfo_PUT}?schemeId=${this.schemeId}&schemeStatusId=${this.schemeStatusId}&checkIdea=${this.checkIdea}`;
        this.$http.put(apiName)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('审核成功!');
              this.pageJumpToList();
            }else{
              this.$message.success('审核失败!失败原因：'+ res.resultList);
            }
          })
      },
      // *** ajax end ***

      setScrollerHt() {
        // 根据页面高度动态设置滚动容器高度
        const winHt = document.documentElement.offsetHeight;
        this.scrollerHt = `${winHt-100}px`;
      },
      pageJumpToList() {
        /**
         * 跳转到方案管理（schemelist页）
         */
        this.$router.push({
          name: "schemelist"
        });
      }
    }
  }
</script>

<style scoped>
  /* 组件私有样式 */
  .scheme-baseinfo{width:380px;background:#fff;position:absolute;left:0;top:0;bottom:0;box-sizing:border-box;transition:left .4s;}
  .scheme-baseinfo .form-wrap{padding-left:0;}
  .scheme-taskinfo{position:absolute;left:380px;right:0;top:0;bottom:0;transition:left .4s;}
  .scroll-list-scan-scheme{width:375px;}
  .btn-group{text-align:center;padding-top:15px;}
  .examine-history{line-height:1.5;color:#f96868;}
  .examine-history .vertical-align-middle{line-height:30px;}

  .map-full-screen .scheme-baseinfo{left:-380px;}
  .map-full-screen .scheme-taskinfo{left:0;}
</style>
<style>
  /* 覆盖elementui样式 */
  .show-file-list .list-uploadfile-item{width:32%!important;}
</style>
