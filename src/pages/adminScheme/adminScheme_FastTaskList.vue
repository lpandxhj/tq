<!-- 方案管理：快速特勤（快速特勤任务） -->
<template>
  <div v-loading.fullscreen.lock="showLoading">
    <!-- *** 快速特勤任务查询 *** -->
    <ul class="list-filters list-filters-border clrfix">
      <li class="flex-wrap-c">
        <label>任务名称：</label>
        <el-input class="flex-item" size="mini" v-model="taskName" clearable></el-input>
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
        <el-button type="primary" style="margin-top:3px;" size="mini" round @click="ajaxGetTaskList(1)">查询</el-button>
      </li>
    </ul>

    <!-- *** 快速特勤列表 *** -->
    <div class="pd-side20">
      <!-- btn group -->
      <div class="btn-group">
        <span class="btn-primary" title="制作" @click="routeJump({name:'rlttask',  query: {isFast: 1, taskId: ''}})">制作</span>
      </div>

      <!-- list -->
      <ul class="list-background">
        <!-- head -->
        <li class="li-head">
          <el-row>
            <el-col :span="1">序号</el-col>
            <el-col :span="7">任务名称</el-col>
            <el-col :span="3">任务等级</el-col>
            <el-col :span="4">开始时间</el-col>
            <el-col :span="4">结束时间</el-col>
            <el-col :span="2">前导车牌</el-col>
            <el-col :span="3"></el-col>
          </el-row>
        </li>

        <!-- body -->
        <template v-if="tableData.length">
          <li class="li-body" v-for="(item, idx) in tableData" :class="{active:item.taskId == activeTaskId}" @click="checkTask(item)">
            <el-row>
              <el-col :span="1">{{item.num}}</el-col>
              <el-col :span="7">{{item.taskName}}</el-col>
              <el-col :span="3">{{item.taskRankName}}</el-col>
              <el-col :span="4">{{item.taskBeginDate}}</el-col>
              <el-col :span="4">{{item.taskEndDate}}</el-col>
              <el-col :span="2">{{item.beforeLicensePlate || '--'}}</el-col>
              <el-col :span="3" class="position-r">
                <div class="btn-group">
                  <span title="编辑" class="ic1 ic-edit-active"
                        @click.stop="routeJump({name:'rlttask',  query: {isFast: 1, taskId: item.taskId}})"></span>
                  <span title="查看详情" class="ic1 ic-scan-active"
                        @click="routeJump({name:'schemeinfo', params: { id: 'scan'}, query: {isFast: 1, taskId: item.taskId}})"></span>
                  <span title="删除" class="ic2 ic-del-x-active"
                        @click.stop="confirmBeforeTaskDelete(item.taskId, item.taskName)"></span>
                </div>
              </el-col>
            </el-row>
          </li>
        </template>

        <!--暂无数据-->
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

    <!-- *** 确认框：删除快速特勤任务前二次确认*** -->
    <confirm :isShow="showConfirmDelTask"
             :content="'确认要删除该任务：\''+ delTaskName +'\' 吗?'"
             @ok="ajaxDeleteTask"
             @close="showConfirmDelTask = false"></confirm>

  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  export default {
    components: {
    },
    data() {
      return {
        showLoading: true,                                        // 是否显示loading
        showConfirmDelTask: false,                                // 是否显示任务删除二次确认框
        showLayerEditTask: false,                                 // 是否显示任务编辑模态框（新增和修改公用一个，修改传入选中的任务id）

        startTime: '',                                            // 查询：开始时间
        endTime: '',                                              // 查询：结束时间
        taskName: '',                                             // 查询：任务名称
        selectedTaskRank: '',                                     // 查询：任务等级
        rankList: [],                                             // 查询：任务等级选项list

        activeTaskId:'',                                          // 列表：选中的任务id
        activeTaskName:'',                                        // 列表：选中的任务name
        activeTaskRankId:'',                                      // 列表：选中的任务rank
        tableData: '',                                            // 列表：列表数据
        totalCount: 0,                                            // 共几条
        currentPage: 1,                                           // 当前页码
        pageSize: 10,                                             // 每页显示几条

        delTaskId:'',                                             // 确认删除的 任务id
        delTaskName:'',                                           // 确认删除的 任务name
      };
    },
    mounted() {
      this.ajaxGetPublicDic('SCHEMERANK', 'rankList');            // 获取等级下拉选项list
      this.setPageSize().then(res =>{                             // 设置分页条数后再请求分页数据
        this.ajaxGetTaskList(1)
      });
    },
    methods: {
      ...mapMutations([
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
      ajaxGetTaskList(currentPage = 1) {
        /**
         * 获取快速特勤列表
         * @param currentPage {Number}：            请求的页码
         */
        this.currentPage = currentPage;
        const apiName = `${config.baseUrl_HOST}${this.$api.selectFastTaskInfoPage_GET}`;
        const params = {
          pageSize: this.pageSize,                                // *每页显示条数
          currentPage: this.currentPage,                          // *当前页码
          taskName: this.taskName,                                // 任务名称
          taskBeginTime: this.startTime,                          // 任务开始时间
          taskEndTime: this.endTime,                              // 任务结束时间
          taskRankId: this.selectedTaskRank,                      // 任务等级id
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
              this.$message.error('快速特勤信息获取失败！');
            }
            this.showLoading = false;
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxDeleteTask() {
        /**
         * 删除快速特勤任务，成功后更新list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.deleteFastTaskInfo_DELETE}`;
        const params = {
          taskId:this.delTaskId                               // *确定删除的快速特勤任务id
        };
        this.$http.delete(apiName, params).then(res => {
          if(res.appCode == 0){
            this.$message.success('删除成功！');
            if(this.activeTaskId === this.delTaskId) this.activeTaskId = '';
            this.ajaxGetTaskList(this.currentPage);
          }else{
            this.$message.error('删除失败！');
          }
          this.showConfirmDelTask = false;
        }).catch(rej => {
          this.showConfirmDelTask = false;
        })
      },
      // *** ajax end ***

      confirmBeforeTaskDelete(taskId, taskName) {
        /**
         * 方案删除前二次确认
         * @param taskId {String}:    需要删除的快速特勤任务id
         * @param taskName {String}:  需要删除的快速特勤任务name(用于提示用户删除的是哪条)
         */
        this.showConfirmDelTask = true;
        this.delTaskId = taskId;
        this.delTaskName = taskName;
      },
      currentPageChange(currentPage){
        /**
         * 当前页码改变，重新请求分页数据
         * @param currentPage {Number}: 请求的页码
         */
        this.ajaxGetTaskList(currentPage)
      },
      checkTask(checkedTask) {
        /**
         * 是否选中列表中某条数据
         * @param checkedTask {Object}: 任务
         */
        if(this.activeTaskId == checkedTask.taskId){
          // 取消选中
          this.activeTaskId = '';
          this.activeTaskName = '';
          this.activeTaskRankId = '';
        }else{
          // 选中
          this.activeTaskId = checkedTask.taskId;
          this.activeTaskName = checkedTask.taskName;
          this.activeTaskRankId = checkedTask.taskRankId;
        }
      },
      routeJump(routeTo) {
        // 路由跳转
        this.$router.push(routeTo);
        this.setVuex_taskId({
          taskId: routeTo.query.taskId
        })
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
  .btn-group{padding:15px 0;}
  li.li-body:hover{cursor:pointer;}
  .list-background .el-row .btn-group{padding:3px 10px 0 0;float:right;display:none;}
  .list-background li.li-body:hover .btn-group,
  .list-background li.li-body.active .btn-group{display:block;}
  .ic-del-x-active::before,.ic-edit-active::before, .ic-scan-active::before{width:15px;height:15px;margin-right:10px;}
</style>

<style>
  /* 覆盖element-ui 样式 */
  .list-filters .el-input--mini .el-input__inner{width:180px;}
  .list-filters .el-date-editor.el-input,
  .list-filters .el-date-editor.el-input__inner{width:180px;}
</style>
