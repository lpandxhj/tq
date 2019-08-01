<!-- 特勤监测模态框：派警 -->
<template>
    <el-dialog
      title="派警警员" custom-class="dialog-header-hasbg dialog-wh570" :show-close="true"
      :append-to-body="true" :close-on-press-escape='false' :close-on-click-modal='false' :visible.sync="showDialog" v-loading="showLoading">
      <!-- 警员过滤 -->
      <div>
        <el-row class="filter-police">
          <el-col :span="3" class="label">所属部门:</el-col>
          <el-col :span="7">
            <el-select size="mini" v-model="deptId" placeholder="请选择部门">
              <el-option label="全部" :value="deftDeptId"></el-option>
              <el-option v-for="item in deptList" :key="item.deptId" :label="item.deptName" :value="item.deptId"></el-option>
            </el-select>
          </el-col>
          <el-col :span="3" class="label">警员查询:</el-col>
          <el-col :span="7"><el-input size="mini" v-model="keywords" placeholder="请输入警员或警号" clearable></el-input>
          </el-col>
          <el-col :span="4">
            <el-button class="btn-reset-query" @click="reset" size="mini" title="重置搜索条件">重置</el-button>
            <i class="ic2 ic-search" title="搜索" @click="ajaxGetPoliceList(currentPage)"></i>
          </el-col>
        </el-row>
      </div>

      <!-- 警员列表 -->
      <template v-if="policeList.length">
        <ul class="list-border list-police">
          <li v-for="(item, idx) in policeList" :key="item.personId+'_'+idx" :class="{active: item.isChecked}" @click="checkedToggle(item)">
            <i class="police-num">{{item.num}}</i>
            <span class="police-name">
              {{item.personName}}
              <template v-if="item.personId"> ({{item.personId}}) </template>
            </span>
            <span class="police-call"><i>{{item.mobile || '-'}}</i></span>
            <span class="ellipsis police-dept">{{item.deptName}}</span>
          </li>
        </ul>
        <!-- 分页 -->
        <el-pagination class="pager-fixed-bottom" background layout="prev, pager, next, total"
                       v-show="policeList.length"
                       :current-page="currentPage"
                       :page-size="pageSize"
                       :total="totalCount"
                       @current-change="currentPageChange">
        </el-pagination>
      </template>
      <no-data style="padding-top:110px;" v-else></no-data>



      <!-- 按钮操作 -->
      <span slot="footer" class="dialog-footer">
         <el-button size="mini" round type="primary" @click="ajaxDispatchPolice">派警</el-button>
         <el-button size="mini" round @click="$emit('dialog-close')">取 消</el-button>
      </span>
    </el-dialog>
</template>

<script>
  import {mapState} from 'vuex'
  import common from '@tools/common';

  export default {
    props:['isShow', 'postId'],
    data() {
      return {
        showDialog:false,     // 是否显示对话框
        showLoading: false,

        deptList:[],          // 部门树list
        deftDeptId: '',       // 查询条件：已选部门id， 默认全部
        deptId: '',           // 查询条件：已选部门id
        keywords:'',          // 查询条件：警员查询关键字（警员、警号）
        pageSize: 10,         // 查询条件：每页分页条数
        currentPage: 1,       // 查询条件：当前页码
        totalCount: 0,        // 查询结果：总条数
        policeList: [],       // 查询结果：警员list

        checkedPoliceList:[], // 当前被选中需要被派警的警员们( 仅能批量当前页，不能跨页选取，否则高亮选中效果不太好做，需要遍历每一页去匹配当前选中项，极其容易出错)
      };
    },
    computed: {
      ...mapState([
        'taskId',
        'executeTaskId',
        'routeId'
      ])
    },
    watch: {
      isShow() {
        /**
         *  监听父组件显示dialog操作
         */
        this.showDialog = this.isShow;
      },
      showDialog() {
        /**
         * 监听当前dialog显隐
         */
        if(!this.showDialog){
          this.currentPage = 1;
          this.keywords = '';
          this.$emit('dialog-close');     // 关闭模态框
        }else{
          this.ajaxGetDeptList();         // 获取部门信息树list
          this.ajaxGetPoliceList();       // 查询警员信息list
        }
      },
    },
    methods: {
      // *** ajax start ***
      ajaxGetDeptList() {
        /**
         * 获取警员所属部门信息树list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getDeptTree_GET}`;
        const params = {
          deptId: this.deptId
        };
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
//              this.deptList = this.resultList.length && this.resultList[0].children;
//              this.deftDeptId = this.resultList.length && this.resultList[0].id;
              this.deptId = this.deftDeptId;
            }
          })
      },
      ajaxGetPoliceList(currentPage = 1) {
        /**
         *  获取警员信息List
         */
        this.currentPage = currentPage;
        this.showLoading = true;
        const apiName = `${config.baseUrl_HOST}${this.$api.getPersonInfoPage_GET}`;
        const params = {
          pageSize: this.pageSize,
          currentPage: currentPage,
          deptId: this.deptId,
          personKey: this.keywords
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              let policeList = res.resultList.result;
              policeList.forEach((i, idx) => {
                i.isChecked = false;
                i.num = this.$setPageNum(idx+1, this.pageSize, this.currentPage)
              });
              this.policeList = policeList;
              this.totalCount = res.resultList.totalCount;
            };
            this.showLoading = false;
          }).catch(rej => {
            this.showLoading = false;
            this.$message.error('抱歉，警员信息获取失败');
        })
      },
      ajaxDispatchPolice() {
        // 给执行任务或岗位派警（岗位需要传入post）
        this.showLoading = true;
        const apiName = `${config.baseUrl_HOST}${this.$api.addDispatchPolice_PUT}?executeTaskId=${this.executeTaskId}`;
        this.$http.put(apiName, this.checkedPoliceList)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('派警成功！');
              this.checkedPoliceList = [];
              this.showDialog = false;
              this.$emit('dispatch-complete');
            }else{
              this.$message.error('抱歉，派警失败！');
            }
            this.showLoading = false;
          }).catch(rej => {
            this.showLoading = false;
            this.$message.error('抱歉，派警失败！');
        })
      },
      // *** ajax end ***

      currentPageChange(currentPage){
        /**
         * 当前页码改变，重新请求分页数据
         * @param currentPage {Number}: 请求的页码
         */
        this.checkedPoliceList = [];                                          // 翻页时清空已选中的警员，避免跨页派警，导致后期维护不必要的麻烦
        this.ajaxGetPoliceList(currentPage)
      },
      checkedToggle(item) {
         /**
          * 切换当前警员的选中状态
          * item（Object）:  警员对象
          */
         item.isChecked = !item.isChecked;
         if(item.isChecked){
           // 推入数组
           this.checkedPoliceList.push({
             policeName: item.personName,
             policeId: item.personId,
             postId: this.postId
           })
         }else{
           // 从数组中移除
           this.checkedPoliceList.some((i, idx) => {
             if(i.policeId == item.policeId){
               this.checkedPoliceList.splice(idx, 1);
               return true;
             }
           })
         }
      },
      reset() {
        /**
         * 重置检索条件
         */
        this.deptId = this.deftDeptId;
        this.keywords = '';
        this.ajaxGetPoliceList(1);
      },
    }
  }
</script>

<style scoped>
  /* 查询过滤 */
  .filter-police{line-height:30px;color:#465461;margin-bottom:10px;}
  .filter-police .label{text-align:right;padding-right:10px;}
  .filter-police .ic-search{padding:6px 5px;cursor:pointer;margin:0;}
  .btn-reset-query{float:right;padding:4px 14px;border-radius:20px;margin:5px 10px 0 0;}
   /* 警员list */
  .list-border li::after{width:520px;left:36px;}
  .list-police li{padding:7px 25px;box-sizing:border-box;display:flex;position:relative;}
  .list-police .police-num{position:absolute;display:block;width:30px;left:6px;text-align:center;}
  .list-police .police-name{flex:7;margin-left:10px;}
  .list-police .police-dept{flex:9;}
  .list-police .police-call{flex:6;}
  .list-police .police-call i{display:inline-block;height:17px;width:100px;text-align:center;background:#d9eaff;color:#465461;border-radius:2px;}
  .pager-fixed-bottom{position:absolute;bottom:60px;left:0;right:0;}
</style>
