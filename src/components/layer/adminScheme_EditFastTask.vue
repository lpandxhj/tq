<!-- 方案管理：快速特勤任务新增（编辑） -->
<template>
  <el-dialog
    title="快速特勤任务信息" custom-class="dialog-wh480" :show-close="true"
    :append-to-body="true" :close-on-press-escape='false' :close-on-click-modal='false' :visible.sync="showDialog">
      <div class="form-wrap">
        <el-row class="form-item" id="edit-scheme-date">
          <el-col :span="4" class="label ic-request">任务名称：</el-col>
          <el-col :span="20">
            <el-input size="mini" :title="info.taskName" v-model="info.taskName" clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">任务等级：</el-col>
          <el-col :span="7" :offset="13">
            <el-select v-model="selectedRank" placeholder="请选择" class="flex-item" size="mini">
              <el-option
                v-for="item in rankList"
                :key="item.dicCode"
                :label="item.dicName"
                :value="item.dicCode">
              </el-option>
            </el-select>
          </el-col>
        </el-row>

        <el-row class="form-item date-edit-task" id="date__edit_task">
          <el-col :span="4" class="label ic-request">有效时间：</el-col>
          <el-col :span="7">
            <el-date-picker type="datetime" size="mini" placeholder="选择日期" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" :title="info.schemeBeginDate" v-model="info.schemeBeginDate" default-time="00:00"></el-date-picker>
          </el-col>
          <el-col :span="6" class="label date-to">至</el-col>
          <el-col :span="7">
            <el-date-picker type="datetime" size="mini" placeholder="选择日期" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" :title="info.schemeBeginDate" v-model="info.schemeBeginDate" default-time="00:00"></el-date-picker>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">车队长度：</el-col>
          <el-col :span="7" class="add-suffix-m">
            <el-input size="mini" :title="info.fleetLength" v-model="info.fleetLength" clearable></el-input>
          </el-col>
          <el-col :span="6" class="label ic-request">提前放行距离：</el-col>
          <el-col :span="7" class="add-suffix-m">
            <el-input size="mini" :title="info.advanceReleaseDistance" v-model="info.advanceReleaseDistance" clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label">驾驶员：</el-col>
          <el-col :span="7">
            <el-input size="mini" :title="info.beforeDriver" v-model="info.beforeDriver" clearable></el-input>
          </el-col>
          <el-col :span="6" class="label">联络员：</el-col>
          <el-col :span="7">
            <el-input size="mini" :title="info.dutyPolice" v-model="info.dutyPolice" clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label">备注：</el-col>
          <el-col :span="20">
            <el-input size="mini" :title="info.taskMemo" v-model="info.taskMemo" clearable></el-input>
          </el-col>
        </el-row>
      </div>

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
    props:['isShow', 'schemeId', 'schemeName'],
    components: {
      UploadFile
    },
    data() {
      return {
        showDialog: false,                    // 是否显示对话框
        selectedRank:'',                      // 选中的等级
        rankList: [                            // 等级选项list
          {
            "dicCode":"SCHEMERANK01",
            "dicName":"保畅"
          },
          {
            "dicCode":"SCHEMERANK02",
            "dicName":"三级"
          },
          {
            "dicCode":"SCHEMERANK03",
            "dicName":"二级"
          },
          {
            "dicCode":"SCHEMERANK04",
            "dicName":"二级加强"
          },
          {
            "dicCode":"SCHEMERANK05",
            "dicName":"一级"
          },
          {
            "dicCode":"SCHEMERANK06",
            "dicName":"一级加强"
          }
        ],                      // 等级list
        info:{                                // *任务制作 基本信息
          schemeId:'',                        // *方案编号
          taskName:'',                        // *任务名称
          taskRankId:'',                      // *任务等级编号
          taskRankName:'',                    // *任务等级名称
          taskContent:'',                     // *任务内容
          taskClassId:'',                     // *任务类别(1为单次任务，2为日常任务)
          taskClassName:'',                   // *任务类别名称(1为单次任务，2为日常任务)
          taskBeginDate:'',                   // *任务开始时间
          taskEndDate:'',                     // *任务结束时间
          startPlace:'',                      // *起始位置
          targetPalce:'',                     // *到达位置
          advanceReleaseDistance:'',          // *提前放行距离
          dutyDeptName:'',                    // *特（执）勤单位

          positionDeviceId:'',                // 定位设备编号
          positionDeviceName:'',              // 定位设备名称
          beforeLicensePlate:'',              // 前导车牌
          dutyPolice:'',                      // 前导车联络员
          beforeDriver:'',                    // 前导车驾驶员
          fleetLength:'',                     // 车队长度
          taskMemo:''                         // 任务备注
        },
      };
    },
    watch: {
      isShow() {
        // 监听父组件显示dialog操作
        this.showDialog = this.isShow;
        console.log(this.showDialog)
      },
      showDialog() {
        // 监听当前dialog显隐
        if(!this.showDialog){
          this.$emit('dialog-close');                            // 关闭模态框
        }
      }
    },
    mounted() {
      this.ajaxgetPublicDic('SCHEMERANK', 'rankList');             // 获取等级下拉选项list
    },
    methods: {
      // *** ajax start ***
      ajaxgetPublicDic(ParentCode, keyName) {
        /**
         * 获取公用字典数据
         * @param ParentCode {String}: 根据该参数获取不同的公用字典数据（具体参照数据库字典信息文档）
         * @param keyName {String}:    返回的list存放的变量key, 值为一个list
         */
        const apiName = `${config.ubms_HOST}${this.$api.getPublicDic_GET}`;
        const params = {
          data: JSON.stringify({parentCode: ParentCode})
        }
        this.$http.get(apiName, params)
          .then(res => {
            this[keyName] = res.resultList;
          })
      },
      ajaxEditTask () {
        /**
         * 编辑任务 put
         */
      },
      ajaxAddTask () {
        /**
         * 新增任务 post
         */
      },
      saveInfo() {
        /**
         * 根据任务id来判断当前操作是新增还是修改（新增任务taskId为空）
         */
        if(this.taskId){
          this.ajaxEditTask();                               // 修改任务
        }else{
          this.ajaxAddTask();                                // 新增任务
        }
      },
      rankChange(rankId) {
        /**
         * 切换任务等级时,根据等级id设置等级name
         * @param rankId { String } : 任务等级id
         */
        this.rankList.some(i => {
          if(rankId == i.dicCode){
            this.info.taskRankName = i.dicName;
            return true;
          }
        })
      },
      checkFormat() {
        /**
         * 车牌号验证
         */
        if(!this.info.beforeLicensePlate) return;
        const isLegal = common.lpreg.checkVehiclePlate(this.info.beforeLicensePlate.toUpperCase());
        if(!isLegal){
          this.$message.error('车牌号码格式不正确');
        }
      },
      checkNull() {
        /**
         * 必填项非空验证
         */
        const flag = this.info.schemeName && this.info.schemeId && this.info.schemeRankId && this.info.schemeBeginDate && this.info.schemeEndDate && this.info.schemeContent && this.info.schemeMemo;
        if(!flag){
            this.$message.error('抱歉，必填项不能为空!');
        }
        return flag;
      }
    }
  }
</script>

<style scoped>
  /* 组件私有样式 */
  .form-wrap{padding:0 15px 0 0;}
  .date-to{padding-right:22px;}
  .ic-add-date{display:inline-block;}
  .ic-add-date:hover{cursor:pointer;}
  .ic-add-date::before{background-position:-520px 0;position:relative;top:4px;margin-right:10px;}
  .ic-add-date:hover::before{background-position:-520px -20px;}
  .add-suffix-m{position:relative;}
  .add-suffix-m::after{content:'米';display:block;background:#fff;height:28px;width:28px;text-align:center;line-height:28px;position:absolute;right:2px;top:1px;}

</style>
<style>
  /* 覆盖elementui样式 */
  .date-edit-task .el-input--mini .el-input__inner,
  .date-edit-task .el-date-editor.el-input,
  .date-edit-task .el-date-editor.el-input__inner{width:135px;}
  .date-edit-task .el-input--prefix .el-input__inner {padding-left:26px;}
</style>
