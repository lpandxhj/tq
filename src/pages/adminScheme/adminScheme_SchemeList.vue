<!-- 方案管理：方案管理（方案列表） -->
<template>
  <div v-loading.fullscreen.lock="showLoading">
    <!-- *** 方案查询 *** -->
    <ul class="list-filters clrfix">
      <li class="flex-wrap-c">
        <label>方案名称：</label>
        <el-input class="flex-item" size="mini" v-model="schemeName" clearable></el-input>
      </li>
      <li>
        <label>开始时间：</label>
        <el-date-picker size="mini"  type="date"  placeholder="选择日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="startTime">
        </el-date-picker>
      </li>
      <li>
        <label>结束时间：</label>
        <el-date-picker size="mini"  type="date"  placeholder="结束时间" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="endTime">
        </el-date-picker>
      </li>
      <li>
        <el-button type="primary" style="margin-top:3px;" size="mini" round @click="ajaxGetSchemeList(1)">查询</el-button>
      </li>
    </ul>
    <ul class="list-filters list-filters-border clrfix pd-t0">
        <li class="flex-wrap-c">
          <label>方案等级：</label>
          <el-select v-model="selectedSchemeRank" placeholder="请选择" class="flex-item" size="mini" clearable>
            <el-option
              v-for="item in rankList"
              :key="item.dicCode"
              :label="item.dicName"
              :value="item.dicCode">
            </el-option>
          </el-select>
        </li>
        <li>
          <label>方案状态：</label>
          <el-select v-model="selectedSchemeStatus" placeholder="请选择" class="flex-item" size="mini" clearable>
            <el-option
              v-for="item in schemeStatusList"
              :key="item.dicCode"
              :label="item.dicName"
              :value="item.dicCode">
            </el-option>
          </el-select>
        </li>
      </ul>

    <!-- *** 方案列表 *** -->
    <div class="pd-side20">
      <!-- btn group -->
      <div class="btn-group">
        <!-- 任何情况都可以进行的操作 -->
        <span class="btn-primary" title="制作" @click="editScheme('')">制作</span>

        <!-- 选中方案后才可操作-->
        <template v-if="activeSchemeId !== ''">
          <!-- 待提交状态 -->
          <template v-if="activeSchemeStatusName == '待提交' || activeSchemeStatusName == '审核不通过'">
            <span title="关联任务" class="btn-warning"
                  @click="routeJump({name:'rlttask', query: {schemeId: activeSchemeId, schemeName: activeSchemeName, schemeRankId: activeSchemeRankId, startDate:activeSchemeStartDate, endDate:activeSchemeEndDate}})">关联任务</span>
            <span title="提交" class="btn-success"
                  @click="routeJump({name:'schemeinfo',params: { id: 'submit'}, query: {schemeId: activeSchemeId}})">提交</span>
            <span class="btn-disabled">审核</span>
          </template>

          <!-- 待审核状态 -->
          <template v-else-if="activeSchemeStatusName == '待审核'">
            <span class="btn-disabled">关联任务</span>
            <span class="btn-disabled">提交</span>
            <span title="审核" class="btn-info"
                  @click="routeJump({name:'schemeinfo',params: { id: 'examine'}, query: {schemeId: activeSchemeId}})">审核</span>
          </template>

          <!-- 审核通过状态 -->
          <template v-else="activeSchemeStatusName == '审核通过'">
            <span class="btn-disabled">关联任务</span>
            <span class="btn-disabled">提交</span>
            <span class="btn-disabled">审核</span>
          </template>
        </template>

        <!-- 未选中方案则禁用操作-->
        <template v-else>
          <span class="btn-disabled">关联任务</span>
          <span class="btn-disabled">提交</span>
          <span class="btn-disabled">审核</span>
        </template>

        <!-- 任何情况都可以进行的操作 -->
        <router-link tag="span"  title="预演" class="btn-highlight"
                     :to="{name:'preview', query: {startDate:activeSchemeStartDate, endDate:activeSchemeEndDate}}">预演</router-link>
      </div>

      <!-- list -->
      <ul class="list-background">
        <!-- head -->
        <li class="li-head">
          <el-row>
            <el-col :span="1">序号</el-col>
            <el-col :span="5">方案编号</el-col>
            <el-col :span="3">方案来源</el-col>
            <el-col :span="4">方案名称</el-col>
            <el-col :span="2">方案等级</el-col>
            <el-col :span="2">开始时间</el-col>
            <el-col :span="2">结束时间</el-col>
            <el-col :span="2">方案状态</el-col>
            <el-col :span="3"></el-col>
          </el-row>
        </li>

        <!-- body -->
        <template v-if="tableData.length">
          <li class="li-body" v-for="(item, idx) in tableData" :class="{active:item.schemeId == activeSchemeId}" @click="checkScheme(item)">
            <el-row>
              <!--<el-col :span="1">{{idx+1}}</el-col>-->
              <el-col :span="1">{{item.num}}</el-col>
              <el-col :span="5">{{item.schemeId}}</el-col>
              <el-col :span="3">{{item.schemeSource}}</el-col>
              <el-col :span="4">{{item.schemeName}}</el-col>
              <el-col :span="2">{{item.schemeRankName}}</el-col>
              <el-col :span="2">{{item.schemeBeginDate}}</el-col>
              <el-col :span="2">{{item.schemeEndDate}}</el-col>
              <el-col :span="2" :class="'scheme-status scheme-status-' + item.schemeStatusId">{{item.schemeStatusName}}</el-col>
              <el-col :span="3" class="position-r">
                <div class="btn-group">
                  <span title="方案编辑" class="ic1 ic-edit-active"
                        :class="{hidden:item.schemeStatusName == '审核通过' || item.schemeStatusName == '待审核'}"
                        @click.stop="editScheme(item.schemeId)"></span>
                  <span title="查看详情" class="ic1 ic-scan-active"
                        @click="routeJump({name:'schemeinfo', params: { id: 'scan'}, query: {schemeId: item.schemeId}})"></span>
                  <span title="删除" class="ic2 ic-del-x-active"
                        :class="{hidden:item.schemeStatusName == '审核通过'}"
                        @click.stop="confirmBeforeSchemeDelete(item.schemeId, item.schemeName)"></span>
                  <!--<span title="删除已审核通过的方案" class="ic2 ic-del-x-active"-->
                  <!--@click.stop="confirmBeforeSchemeDelete(item.schemeId, item.schemeName)"></span>-->
                </div>
              </el-col>
            </el-row>
          </li>
        </template>

        <!-- 暂无数据 -->
        <li v-if="tableData && !tableData.length"><no-data style="padding:100px 0;"></no-data></li>
      </ul>

      <!-- 分页 -->
      <el-pagination background layout="prev, pager, next, total"
                     v-if="tableData.length"
                     :current-page="currentPage"
                     :total="totalCount"
                     :page-size="pageSize"
                     @current-change="currentPageChange"></el-pagination>
    </div>

    <!-- *** 确认框：删除方案前二次确认*** -->
    <confirm :isShow="showConfirmDelScheme"
             :content="'确认要删除该方案：\''+ delSchemeName +'\' 吗?'"
             @ok="ajaxDeleteScheme"
             @close="showConfirmDelScheme = false"></confirm>

    <!-- *** 浮层:方案制作、修改 *** -->
    <layer-edit-scheme
                  :isShow="showLayerEditScheme"
                  :schemeId="activeSchemeId"
                  :rankList="rankList"
                  @dialog-close="showLayerEditScheme = false"
                  @edit-complete="editSchemeComplete"></layer-edit-scheme>
  </div>
</template>

<script>
  import LayerEditScheme from '@components/layer/adminScheme_EditScheme';
  import { mapMutations } from 'vuex';
  export default {
    components: {
      LayerEditScheme                                             // 方案新增/编辑模态框
    },
    data() {
      return {
        showLoading: true,                                        // 是否显示loading
        showConfirmDelScheme: false,                              // 是否显示方案删除二次确认框
        showLayerEditScheme: false,                               // 是否显示方案编辑模态框（新增和修改公用一个，修改传入选中的方案id）

        startTime: '',                                            // 方案查询：开始时间
        endTime: '',                                              // 方案查询：结束时间
        schemeName: '',                                           // 方案查询：方案名称
        selectedSchemeRank: '',                                   // 方案查询：方案等级
        rankList: [],                                             // 方案查询：方案等级选项list
        selectedSchemeStatus: '',                                 // 方案查询：方案状态
        schemeStatusList: [],                                     // 方案查询：方案状态选项列表

        activeSchemeId:'',                                        // 方案列表：选中的方案id
        activeSchemeName:'',                                      // 方案列表：选中的方案name
        activeSchemeRankId:'',                                    // 方案列表：选中的方案rank
        activeSchemeStatusName:'',                                // 方案列表：选中的方案status
        activeSchemeStartDate:'',                                 // 方案列表：选中方案开始日期
        activeSchemeEndDate:'',                                   // 方案列表：选中方案结束日期
        tableData: '',                                            // 方案列表：列表数据
        totalCount: 0,                                            // 共几条
        currentPage: 1,                                           // 当前页码
        pageSize: 10,                                             // 每页显示几条

        delSchemeId:'',                                           // 确认删除的 方案id
        delSchemeName:'',                                         // 确认删除的 方案name
      };
    },
    mounted() {
      this.ajaxGetPublicDic('SCHEMERANK', 'rankList');            // 获取等级下拉选项list
      this.ajaxGetPublicDic('SCHEMESTATUS', 'schemeStatusList');  // 获取方案状态下拉选项list
      this.setPageSize().then(res =>{                             // 设置分页条数后再请求分页数据
           this.ajaxGetSchemeList(1)
      });
    },
    methods: {
      ...mapMutations([
        'setVuex_schemeId',                                       // 设置方案id
        'setVuex_taskId'                                          // 设置任务id
      ]),
      // *** ajax start ***
      ajaxGetPublicDic(ParentCode, keyName) {
        /**
         * 获取公用字典数据
         * @param ParentCode {String}: 根据该参数获取不同的公用字典数据（具体参照数据库字典信息文档）
         * @param keyName {Array}:     返回的list存放的变量名
         */
        const apiName = `${config.ubms_HOST}${this.$api.getPublicDic_GET}`;
        const params = {
          data: JSON.stringify({parentCode: ParentCode})
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this[keyName] = res.resultList;
            }
          })

      },
      ajaxGetSchemeList(currentPage = 1) {
        /**
         * 获取方案列表
         * @param currentPage {Number}：            请求的页码
         */
        this.currentPage = currentPage;
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeInfoPage_GET}`;
        const params = {
          pageSize: this.pageSize,                                // *每页显示条数
          currentPage: this.currentPage,                          // *当前页码
          schemeId: '',                                           // 方案id
          schemeName: this.schemeName,                            // 方案名称
          schemeBeginDate: this.startTime,                        // 方案开始时间
          schemeEndDate: this.endTime,                            // 方案结束时间
          schemeRankId: this.selectedSchemeRank,                  // 方案等级id
          schemeStatusId: this.selectedSchemeStatus               // 方案状态id
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              let tableData = res.resultList && res.resultList.result;
              tableData.forEach((i, idx) => {                     // 数据行序号
                i.num = this.$setPageNum(idx+1, this.pageSize, this.currentPage);
              });
              this.tableData = tableData;
              this.totalCount = res.resultList.totalCount;
            }else{
              this.$message.error('方案信息获取失败！');
            }
            this.showLoading = false;
          }).catch(rej => {
            this.showLoading = false;
          })
      },
      ajaxDeleteScheme() {
        /**
         * 删除方案，成功后更新方案list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.deleteSchemeInfo_DELETE}`;
        const params = {
          schemeId:this.delSchemeId                               // *确定删除的方案id
        };
        this.$http.delete(apiName, params).then(res => {
          if(res.appCode == 0){
            this.$message.success('方案删除成功！');
            if(this.activeSchemeId === this.delSchemeId) this.activeSchemeId = '';
            this.ajaxGetSchemeList(this.currentPage);
          }else{
            this.$message.error('方案删除失败！');
          }
          this.showConfirmDelScheme = false;
        }).catch(rej => {
          this.showConfirmDelScheme = false;
        })
      },
      // *** ajax end ***

      confirmBeforeSchemeDelete(schemeId, schemeName) {
        /**
         * 方案删除前二次确认
         * @param schemeId {String}:    需要删除的方案id
         * @param schemeName {String}:  需要删除的方案name(用于提示用户删除的是哪个方案)
         */
        this.showConfirmDelScheme = true;
        this.delSchemeId = schemeId;
        this.delSchemeName = schemeName;
      },
      currentPageChange(currentPage){
        /**
         * 当前页码改变，重新请求分页数据
         * @param currentPage {Number}: 请求的页码
         */
        this.ajaxGetSchemeList(currentPage)
      },
      checkScheme(checkedScheme) {
        /**
         * 是否选中列表中某个方案
         * @param checkedScheme {Object}: 方案
         */
        if(this.activeSchemeId == checkedScheme.schemeId){
          // 取消选中
          this.activeSchemeId = '';
          this.activeSchemeName = '';
          this.activeSchemeRankId = '';
          this.activeSchemeStatusName = '';
          this.activeSchemeStartDate = '';
          this.activeSchemeEndDate = '';
        }else{
          // 选中方案
          this.activeSchemeId = checkedScheme.schemeId;
          this.activeSchemeName = checkedScheme.schemeName;
          this.activeSchemeRankId = checkedScheme.schemeRankId;
          this.activeSchemeStatusName = checkedScheme.schemeStatusName;
          this.activeSchemeStartDate = checkedScheme.schemeBeginDate;
          this.activeSchemeEndDate = checkedScheme.schemeEndDate;
        }
      },
      editScheme(schemeId) {
        /**
         * 方案新增/修改
         * @param schemeId {String}:    需要编辑的方案id（新增时为空）
         */
        this.activeSchemeId = schemeId;
        this.showLayerEditScheme = true;                          // 显示方案编辑模态框
      },
      routeJump(routeTo) {
        // 路由跳转
        this.$router.push(routeTo);
        this.setVuex_schemeId(routeTo.query.schemeId);
        this.setVuex_taskId({
          taskId: ''
        })

      },
      editSchemeComplete(type) {
        /**
         * 方案编辑/制作完成后，需要清空下当前正在编辑的方案id，并更新方案列表
         * @param type {String} : 操作类型（当前完成动作是新增方案触发的还是编辑方案触发的）
         */
         this.activeSchemeId = '';
        if(type == 'add') this.currentPage = 1;                   // 新增方案的，由于新增的数据在第一页显示，故需要设置下当前页码，请求数据也请求第一页
        this.ajaxGetSchemeList(this.currentPage);
      },
      setPageSize() {
        /**
         * 设置方案容器高度，从而控制分页条数，高度需要配合条数高度的倍数来
         */
        const winHt = document.documentElement.offsetHeight;
        this.pageSize = Math.floor((winHt-200-90)/46);
        return new Promise((resolve, reject) => {
          resolve('设置分页条数成功，分页条数='+this.pageSize)
        })
      },
    }
  }
</script>

<style scoped>
  /* 组件私有样式 */
  .pd-t0{padding-top:0;}
  .btn-group{padding:15px 0;}
  .scheme-status-SCHEMESTATUS01{color:#39b2a9;}                   /* 方案状态：待提交 */
  .scheme-status-SCHEMESTATUS02{color:#39b2a9;}                   /* 方案状态：待审核 */
  .scheme-status-SCHEMESTATUS03{color:#50c14e;}                   /* 方案状态：审核通过 */
  .scheme-status-SCHEMESTATUS04{color:#ff6c60;}                   /* 方案状态：审核不通过 */
   li.li-body:hover{cursor:pointer;}
  .list-background .el-row .btn-group{padding:3px 10px 0 0;float:right;display:none;}
  .list-background li.li-body:hover .btn-group,
  .list-background li.li-body.active .btn-group{display:block;}
  .list-background li.li-body:hover .scheme-status,.list-background li.li-body.active .scheme-status{color:#fff;}
  .ic-del-x-active::before,.ic-edit-active::before, .ic-scan-active::before{width:15px;height:15px;margin-right:10px;}
</style>

<style>
  /* 覆盖element-ui 样式 */
  .list-filters .el-input--mini .el-input__inner{width:180px;}
  .list-filters .el-date-editor.el-input,
  .list-filters .el-date-editor.el-input__inner{width:180px;}
</style>
