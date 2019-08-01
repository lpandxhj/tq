<!-- 方案管理：任务新增（编辑） -->
<template>
  <el-dialog
    custom-class="dialog-wh480" :title="title" :show-close="true" v-loading="showLoading"
    :close-on-press-escape='false' :close-on-click-modal='false' :visible.sync="showLayer">
    <el-scrollbar class="el-scrollbar-xhidden scroll-list-edit-task" :class="{ht470: !isFast}">
      <!-- ***isEdit:true  可编辑状态*** -->
      <div class="form-wrap" v-if="isEdit">
        <el-row class="form-item" v-if="!isFast">
          <el-col :span="4" class="label ic-request">起始位置：</el-col>
          <el-col :span="7"><el-input style="width:100%;" size="mini" :title="info.startPlace" v-model="info.startPlace" clearable></el-input></el-col>
          <el-col :span="6" class="label ic-request">到达位置：</el-col>
          <el-col :span="7"><el-input size="mini" :title="info.targetPlace" v-model="info.targetPlace" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item" id="edit-scheme-date">
          <el-col :span="4" class="label ic-request">任务名称：</el-col>
          <el-col :span="20"><el-input size="mini" :title="info.taskName" v-model="info.taskName"  placeholder="请确保输入最大长度为30个字符，超出将自动截断" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">任务等级：</el-col>
          <el-col :span="7">
            <el-select v-model="info.taskRankId" placeholder="请选择" class="flex-item" size="mini" @change="rankChange">
              <el-option
                v-for="item in rankList"
                :key="item.dicCode"
                :label="item.dicName"
                :value="item.dicCode">
              </el-option>
            </el-select>
          </el-col>
          <template v-if="!isFast">
            <el-col :span="6" class="label">所属方案：</el-col>
            <el-col :span="7"><el-input size="mini" disabled :title="schemeName" v-model="schemeName"></el-input></el-col>
          </template>
        </el-row>

        <el-row class="form-item" v-if="!isFast">
          <el-col :span="4" class="label ic-request">特勤单位：</el-col>
          <el-col :span="20" class="flex-wrap"><el-input size="mini" :title="info.dutyDeptName" v-model="info.dutyDeptName" clearable></el-input></el-col>
        </el-row>

        <el-row class="form-item" v-if="!isFast">
          <el-col :span="4" class="label ic-request">任务内容：</el-col>
          <el-col :span="20" class="flex-wrap">
            <el-input size="mini" :title="info.taskContent" v-model="info.taskContent"  placeholder="请确保输入最大长度为150字符，超出将自动截断" clearable></el-input>
          </el-col>
        </el-row>

        <el-row class="form-item date-edit-task" id="date__edit_task">
          <el-col :span="4" class="label ic-request">有效时间：</el-col>
          <el-col :span="7">
            <el-date-picker type="datetime" size="mini" placeholder="选择日期" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" default-time="00:00:00"
                            :picker-options="validDate" :title="info.taskBeginDate" v-model="info.taskBeginDate" @change="validDateChange"></el-date-picker>
          </el-col>
          <el-col :span="6" class="label date-to">至</el-col>
          <el-col :span="7">
            <el-date-picker type="datetime" size="mini" placeholder="选择日期" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"  default-time="00:00:00"
                            :picker-options="validDate" :title="info.taskEndDate" v-model="info.taskEndDate"  @change="validDateChange"></el-date-picker>
          </el-col>
        </el-row>

        <template v-if="!isFast">
        <el-row class="form-item">
          <el-col :span="4" class="label ic-request">任务性质：</el-col>
          <el-col :span="7">
            <el-select v-model="info.taskClassId" placeholder="请选择" class="flex-item" size="mini" @change="taskClassChange">
              <el-option
                v-for="item in taskClassList"
                :key="item.dicCode"
                :label="item.dicName"
                :value="item.dicCode">
              </el-option>
            </el-select>
          </el-col>

          <!-- 只有日常任务有执行周期，单次任务没有周期（根据任务性质来联动） -->
          <template v-if="info.taskClassId == 'TASKCLASS01'">
            <el-col :span="6" class="label ic-request">执行周期：</el-col>
            <el-col :span="7">
              <el-select v-model="info.taskPeriodId" placeholder="请选择" class="flex-item" size="mini" @change="taskPeriodChange">
                <!-- 自定义选项需要填写任务起止时间后才可用 -->
                <el-option v-for="item in taskPeriodList"  :key="item.dicCode" :label="item.dicName" :value="item.dicCode"
                           :disabled="item.dicName == '自定义' && (!info.taskBeginDate || !info.taskEndDate)"
                           :title="(item.dicName == '自定义' && (!info.taskBeginDate || !info.taskEndDate)) ? '自定义选项需填写任务起止时间' :''">
                </el-option>
              </el-select>
            </el-col>
          </template>
          <el-col v-else :span="13"></el-col>
        </el-row>

        <!-- 自定义时间周期时 时间可自由添加（根据任务周期联动，仅为自定义选项时显示时间添加） -->
        <div>
          <el-row class="form-item date-edit-task" v-for="(item, idx) in info.rltTimeList" style="margin-bottom:10px;" :key="'rltTime'+idx">
            <el-col :span="4" class="label">
              <i class="ic2 ic-del" title="删除" @click="relativeTimeChange('-', idx)" v-if="idx != 0"></i>
              <i class="ic2 ic-add" title="添加" @click="relativeTimeChange('+')" v-if="idx == 0 && info.taskClassName == '日常任务' && info.taskPeriodName == '自定义'"></i>
            </el-col>
            <el-col :span="7">
              <el-date-picker type="datetime" size="mini" placeholder="选择日期" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"
                              v-if="info.taskClassName == '单次任务' || info.taskPeriodName == '自定义'"  :picker-options="validDate" v-model="item.beginTime"
                              :class="{invalid: item.beginInvalid}" @focus="$set(item, 'beginInvalid', false)" :title="item.beginInvalid"></el-date-picker>
              <el-time-picker v-else type="datetime" size="mini" placeholder="选择时间"
                              format="HH:mm" value-format="HH:mm" v-model="item.beginTime" default-time="00:00"></el-time-picker>
            </el-col>
            <el-col :span="6" class="label date-to">至</el-col>
            <el-col :span="7">
              <el-date-picker type="datetime" size="mini" placeholder="选择日期"  format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"
                              v-if="info.taskClassName == '单次任务' || info.taskPeriodName == '自定义'"  :picker-options="validDate"  v-model="item.endTime"
                              :class="{invalid: item.endInvalid}" @focus="$set(item, 'endInvalid', false)"></el-date-picker>
              <el-time-picker v-else type="datetime" size="mini" placeholder="选择时间"
                              format="HH:mm" value-format="HH:mm" v-model="item.endTime" default-time="00:00"></el-time-picker>
            </el-col>
          </el-row>
        </div>
        </template>

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
          <el-col :span="4" class="label">定位设备：</el-col>
          <el-col :span="7">
            <el-input size="mini" :title="info.positionDeviceName" v-model="info.positionDeviceName" clearable></el-input>
          </el-col>
          <el-col :span="6" class="label">前导车牌：</el-col>
          <el-col :span="7">
            <el-input size="mini" :title="info.beforeLicensePlate" v-model="info.beforeLicensePlate" @change="checkLicensePlate" clearable></el-input>
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

      <!-- ***isEdit:false  只读状态*** -->
      <div class="form-wrap form-wrap-theme2" v-else>
        <el-row class="form-item" type="flex" align="middle" v-if="!isFast">
          <el-col :span="4" class="label">起始位置：</el-col>
          <el-col :span="7">{{info.startPlace}}</el-col>
          <el-col :span="6" class="label">到达位置：</el-col>
          <el-col :span="7">{{info.targetPlace}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">任务名称：</el-col>
          <el-col :span="20">{{info.taskName}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">任务等级：</el-col>
          <el-col :span="7">{{info.taskRankName}}</el-col>
          <template v-if="!isFast">
          <el-col :span="6" class="label">所属方案：</el-col>
          <el-col :span="7">{{schemeName}}</el-col>
          </template>
        </el-row>

        <el-row class="form-item" type="flex" align="middle" v-if="!isFast">
          <el-col :span="4" class="label">特勤单位：</el-col>
          <el-col :span="20" class="flex-wrap">{{info.dutyDeptName}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle" v-if="!isFast">
          <el-col :span="4" class="label">任务内容：</el-col>
          <el-col :span="20" class="flex-wrap">{{info.taskContent}}</el-col>
        </el-row>

        <el-row class="form-item date-edit-task"  type="flex" align="middle">
          <el-col :span="4" class="label">有效时间：</el-col>
          <el-col :span="20">{{info.taskBeginDate}} - {{info.taskEndDate}}</el-col>
        </el-row>

        <template v-if="!isFast">
        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">任务性质：</el-col>
          <el-col :span="7">{{info.taskClassName}}</el-col>
          <!-- 只有日常任务有执行周期，单次任务没有周期 -->
          <el-col :span="6" class="label">执行周期：</el-col>
          <el-col :span="7">{{info.taskPeriodName}}</el-col>
        </el-row>

        <!-- 自定义时间周期时 时间可自由添加（根据任务周期联动，仅为自定义选项时显示时间添加） -->
        <el-row class="list-rlt-time" v-for="(item, idx) in info.rltTimeList" :key="'rltTime'+idx" >
            <el-col :span="4"></el-col>
            <el-col :span="20">{{item.beginTime}} - {{item.endTime}}</el-col>
        </el-row>
        </template>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">车队长度：</el-col>
          <el-col :span="7" class="ic-suffix-mi">{{info.fleetLength}}</el-col>
          <el-col :span="6" class="label">提前放行距离：</el-col>
          <el-col :span="7" class="ic-suffix-mi">{{info.advanceReleaseDistance}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">定位设备：</el-col>
          <el-col :span="7">{{info.positionDeviceName}}</el-col>
          <el-col :span="6" class="label">前导车牌：</el-col>
          <el-col :span="7">{{info.beforeLicensePlate}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">驾驶员：</el-col>
          <el-col :span="7">{{info.beforeDriver}}</el-col>
          <el-col :span="6" class="label">联络员：</el-col>
          <el-col :span="7">{{info.dutyPolice}}</el-col>
        </el-row>

        <el-row class="form-item" type="flex" align="middle">
          <el-col :span="4" class="label">备注：</el-col>
          <el-col :span="20">{{info.taskMemo}}</el-col>
        </el-row>
      </div>
    </el-scrollbar>


    <!-- 按钮操作 -->
    <span slot="footer" class="dialog-footer">
      <!-- ***isEdit:true  可编辑状态*** -->
      <template v-if="isEdit">
          <el-button size="mini" round type="primary" @click="saveInfo">保 存</el-button>
          <el-button size="mini" round @click="$emit('close')">取 消</el-button>
      </template>
      <!-- ***isEdit:false  只读状态*** -->
      <el-button size="mini" round @click="$emit('close')" v-else>关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import common from "@tools/common";
  import { mapState, mapMutations } from 'vuex';

  export default {
    props:[
      'isEdit',
      'isShow',
      'schemeId',
      'schemeName',
      'schemeRankId',
    ],
    data() {
      return {
        value4: '',
        showLoading: false,                    // 是否显示loading
        showLayer: false,                      // 是否显示当前组件

        schemeStartDate: '',                   // 方案开始日期（方案开始、结束日期用来限制关联任务的有效日期）
        schemeEndDate: '',                     // 方案结束日期

        title: '任务添加',                      // 任务添加/编辑
        rankList: [],                          // 等级选项list
        taskClassList: [],                     // 任务性质list
        taskPeriodList: [],                    // 任务周期list
        info:{                                 // *任务制作 基本信息
          taskName: '',                        // *任务名称
          taskRankId: '',                      // *任务等级编号
          taskRankName: '',                    // *任务等级名称
          taskContent: '',                     // *任务内容
          taskClassId: '',                     // *任务类别(1为单次任务，2为日常任务)
          taskClassName: '',                   // *任务类别名称(1为单次任务，2为日常任务)
          taskBeginDate: '',                   // *任务开始时间(报错提示 日期组件 没有getHours方法时尝试用该方法替代)
          taskEndDate: '',                     // *任务结束时间
          startPlace: '',                      // *起始位置
          targetPlace: '',                     // *到达位置
          advanceReleaseDistance: 200,         // *提前放行距离
          fleetLength: 20,                     // *车队长度
          dutyDeptName: '',                    // *特（执）勤单位
          rltTimeList: [                       // *自定义周期时 关联的时间段集合，没有值则为空数组 []
            {
              beginTime: '',
              endTime: ''
            }
          ],
          positionDeviceId: '',                // 定位设备编号
          positionDeviceName: '',              // 定位设备名称
          beforeLicensePlate: '',              // 前导车牌
          dutyPolice: '',                      // 前导车联络员
          beforeDriver: '',                    // 前导车驾驶员
          taskMemo: ''                         // 任务备注
        },
        validDate: {
        /**
         * 任务有效日期 在 方案有效期内
         * disabledDate：禁用区间段的日期
         */
          disabledDate: (time) => {
              return (time.getTime() < new Date(this.schemeStartDate)) || (time.getTime() > new Date(this.schemeEndDate));
          }
        }
      };
    },
    computed: {
      ...mapState([
        'taskId',
        'taskInfo'
      ]),
      isFast() {
        /**
         * 当前任务是否为快速特勤任务（不隶属于某方案）
         */
        return this.$route.query.isFast ? true : false;                  // 从路由对象上截取当前任务是否为快速特勤任务
      },
    },
    watch: {
      isShow() {
        /**
         *  若直接用isShow,由于el-dialog 自带的关闭 :visible.sync="isShow" 直接设置 isShow 的，如果不重新赋值给showLayer的话，会导致父子组件都在修改isShow这个值而冲突
         *  故赋值给新的变量，又让父组件赋值过来设置这个变量，又可以在子组件重置这个变量，符合vue单向传值的宗旨
         */
        this.showLayer = this.isShow;
      },
      showLayer() {
        /**
         *  监听当前组件层显隐
         */
        if(!this.showLayer){
          this.$emit('close');
        }else{
          if(this.isEdit) {
            // 编辑状态允许切换下拉选项
            if(!this.isFast) {
              this.ajaxGetPublicDic('TASKPERIOD', 'taskPeriodList');     // 获取任务周期下拉选项list
              this.ajaxGetPublicDic('TASKCLASS', 'taskClassList');       // 获取任务性质下拉选项list
            }
            this.ajaxGetPublicDic('SCHEMERANK', 'rankList')              // 获取等级下拉选项list（taskRankName需要通过schemeRankId对应rankList去获取，故需要在获取到rankList后初始化info）
              .then(res => {
                this.setInfo();
              })
          }else this.setInfo();                                          // 只读查看状态无需获取下拉项
        }
      }
    },
    mounted() {
      // 取方案有效期作为任务有效期的临界值（用户判断任务有效期在方案有效期内）
      this.schemeStartDate = this.$route.query.startDate;
      this.schemeEndDate = this.$route.query.endDate;
    },
    methods: {
      ...mapMutations([
        'setVuex_taskListChange',                                        // 触发主动更新任务list
        'setVuex_taskId',                                                // 设置当前激活的任务id
      ]),
      // *** ajax start ***
      ajaxGetPublicDic(ParentCode, keyName) {
        /**
         * 获取公用字典数据
         * @param ParentCode {String}: 根据该参数获取不同的公用字典数据（具体参照数据库字典信息文档）
         * @param keyName {String}:    返回的list存放的变量key, 值为一个list
         */
        const apiName = `${config.ubms_HOST}${this.$api.getPublicDic_GET}`;
        const params = {
          data: JSON.stringify({parentCode: ParentCode})
        };
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) this[keyName] = res.resultList;
          })
      },
      ajaxAddTask () {
        /**
         * 新增任务 (taskId为空)
         */
        const apiName = `${config.baseUrl_HOST}${this.isFast ? this.$api.addFastTaskInfo_POST : this.$api.addTaskInfo_POST}`;
        const params = Object.assign(this.info, {schemeId: this.schemeId});
        this.showLoading = true;
        this.$http.post(apiName, params)
          .then(res => {
            this.showLoading = false;
            if(res.appCode == 0){
              this.setVuex_taskId({taskId: res.resultList});
              this.setVuex_taskListChange();
              this.$message.success('任务添加成功！');
              this.$emit('close');
              // 快速特勤新增任务需重置路由taskId参数，否则一刷新拿到的taskId还是新增前的空的
              if(this.isFast) {
                this.$router.push({
                  name:'rlttask',
                  query: {
                    isFast: 1,
                    taskId: res.resultList
                  }
                });
              }
            }else{
              this.$message.error('任务添加失败！');
            }
          }).catch(rej => {
            this.showLoading = false;
        })
      },
      ajaxEditTask () {
        /**
         * 编辑任务（传入taskId）
         */
        const apiName = `${config.baseUrl_HOST}${this.isFast ? this.$api.editFastTaskInfo_PUT : this.$api.editTaskInfo_PUT}`;
        // 删除无用的参数
        delete this.info.routeInfoList;                         // 扔掉线路信息保存 更纯粹（主要是带上这参数接口报错400，和方案的基础信息一样，不要的就先丢弃）
        delete this.info.showPopoverType1;
        delete this.info.showPopoverType2;
        const params = Object.assign(this.info, {schemeId: this.schemeId, taskId: this.taskId});
        this.showLoading = true;
        this.$http.put(apiName, params)
          .then(res => {
            this.showLoading = false;
            if(res.appCode == 0){
              this.setVuex_taskId({taskId: this.taskId});
              this.setVuex_taskListChange();
              this.$message.success('任务编辑成功！');
              this.$emit('close');
            }else{
              this.$message.error('任务编辑失败！');
            }
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      // *** ajax end ***

      setInfo() {
        /**
         * 判断当前是编辑还是新增，编辑的根据taskId获取任务信息
         */
        if(this.taskId){
          // 任务编辑
          this.title = this.isFast ? '快速特勤任务信息' : '任务信息';
          this.info = this.taskInfo;            // 任务基本信息可以从列表中带过来
        }else{
          // 任务添加 清空表单
          this.title = this.isFast ? '快速特勤任务添加' : '任务添加';
          const taskRankName = this.getKeyNameVal(this.rankList, 'dicCode', 'dicName', this.schemeRankId);
          this.info = {
            taskName:'',                        // *任务名称
            taskRankId: this.schemeRankId,      // *任务等级编号(默认继承方案的等级)
            taskRankName: taskRankName,         // *任务等级名称
            taskContent:'',                     // *任务内容
            taskClassId:'',                     // *任务类别(1为单次任务，2为日常任务)
            taskClassName:'',                   // *任务类别名称(1为单次任务，2为日常任务)
            taskBeginDate: '',                  // *任务开始时间
            taskEndDate: '',                    // *任务结束时间
            startPlace:'',                      // *起始位置
            targetPlace:'',                     // *到达位置
            advanceReleaseDistance: 200,        // *提前放行距离
            fleetLength:20,                     // *车队长度
            dutyDeptName:'',                    // *特（执）勤单位
            rltTimeList:[                       // *自定义周期时 关联的时间段集合，没有值则为空数组 []
              {
                beginTime:'',
                endTime:''
              }
            ],
            positionDeviceId:'',                // 定位设备编号
            positionDeviceName:'',              // 定位设备名称
            beforeLicensePlate:'',              // 前导车牌
            dutyPolice:'',                      // 前导车联络员
            beforeDriver:'',                    // 前导车驾驶员
            taskMemo:''                         // 任务备注
          }
        }
      },
      saveInfo() {
        /**
         * 根据任务id来判断当前操作是新增还是编辑（新增任务taskId为空）
         */
        if(!this.isFast) {
          if(this.info.taskClassName == '单次任务' || this.info.taskPeriodName == '自定义'){
            if(!this.checkDateValid()) return;    // 执行周期是日期格式时需要判断日期范围，时间格式不用判断
          }
        }
        if(!this.checkNull()) return;
        if(this.taskId){
          this.ajaxEditTask();                    // 编辑任务
        }else{
          this.ajaxAddTask();                     // 新增任务
        }
      },
      getKeyNameVal(data, keyId, keyName, keyIdVal) {
        /**
         * 根据 keyId 值keyIdVal 对应 keyName, 获取到 keyNameVal
         * @param data {Array}:      遍历匹配的原始数组
         * @param keyId {String}:    参照的key
         * @param keyIdVal {String}: 参照的key value
         * @param keyName {String}:  结果字段名
         */
        for(let i=0; i<data.length; i++){
          if(data[i][keyId] == keyIdVal){
            const keyNameVal = data[i][keyName];
            return keyNameVal;
          }
        }
      },
      rankChange(val) {
        /**
         * 切换任务等级时,根据等级id设置等级name
         * @param val {String}: 任务等级id
         */
        this.info.taskRankName = this.getKeyNameVal(this.rankList, 'dicCode', 'dicName', val)
      },
      taskClassChange(val) {
        /**
         * 切换任务性质时,根据等级id设置等级name
         * @param val {String}: 任务性质id
         */
        this.info.taskClassName = this.getKeyNameVal(this.taskClassList, 'dicCode', 'dicName', val);
        if(this.info.taskClassName == '日常任务') {
          // 日常任务周期默认每天
          this.info.taskPeriodId = 'TASKPERIOD01';
          this.info.taskPeriodName = '每天';
        }else {
          // 常规任务无周期的概念
          this.info.taskPeriodId = '';
          this.info.taskPeriodName = '';
        };
      },
      taskPeriodChange(val) {
        /**
         * 切换任务周期时,根据等级id设置等级name
         * @param val {String}: 任务周期id
         */
        this.info.taskPeriodName = this.getKeyNameVal(this.taskPeriodList, 'dicCode', 'dicName', val);
      },
      relativeTimeChange(type, idx = 0) {
        /**
         * 自定义周期时 关联日期数组修改
         * @param  type {String}: +/-
         * @param  idx {Number}:  删除时对应数组中索引
         */
        if(type == '+'){
          // 新增
          this.info.rltTimeList.push({
            beginTime:'',
            endTime:''
          })
        }else{
          // 删除
          this.info.rltTimeList.splice(idx, 1);
        };
      },
      validDateChange() {
        /**
         * 任务有效期改变时，重置状态(清空先前的周期时间段 红框 错误提示)
         */
        this.info.rltTimeList.forEach(i => {
          this.$set(i, 'beginInvalid', false);
          this.$set(i, 'endInvalid', false);
        });
      },
      checkDateValid() {
        /**
         * 验证可执行任务周期日期是否在任务有效期范围内
         */
        let flag = true;
        this.info.rltTimeList.forEach(i => {
          // 日期转时间戳后 比较大小（注意：任务有效期若不添加 HH:mm 会导致和带HH:mm的有8小时的时差，故在任务有效期的日期组件中加了HH:mm）
          let beginTime_timestamp = common.lpdt.dateToTimestamp(i.beginTime);                                                               // 周期开始日期
          let endTime_timestamp = common.lpdt.dateToTimestamp(i.endTime);                                                                   // 周期结束日期
          let taskBegin_timestamp = common.lpdt.dateToTimestamp(this.info.taskBeginDate);                                                   // 任务开始日期
          let taskEnd_timestamp = common.lpdt.dateToTimestamp(this.info.taskEndDate);                                                       // 任务结束日期
          let beginTimeIsValid =  (beginTime_timestamp > taskBegin_timestamp || beginTime_timestamp == taskBegin_timestamp) && (beginTime_timestamp < taskEnd_timestamp || beginTime_timestamp == taskEnd_timestamp);   // 周期开始日期是否合理（在有效期内）
          let endTimeIsValid = (endTime_timestamp < taskEnd_timestamp || endTime_timestamp == taskEnd_timestamp) && (endTime_timestamp > taskBegin_timestamp || endTime_timestamp == taskBegin_timestamp);              // 周期结束日期是否合理（在有效期内）

          // 重置状态
          this.$set(i, 'beginInvalid', false);
          this.$set(i, 'endInvalid', false);

          if(!beginTimeIsValid){
            this.$message.error('抱歉，时间段必须在任务有效期内');
            this.$set(i, 'beginInvalid', true);
            flag = false;
          };
          if(!endTimeIsValid){
            this.$message.error('抱歉，时间段必须在任务有效期内');
            this.$set(i, 'endInvalid', true);
            flag = false;
          };
        });
        return flag;
      },
      checkLicensePlate() {
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
         * 必填项非空验证(区分快速特勤和普通任务的必填项不同)
         */
        let flag =  this.info.taskName && this.info.taskRankName && this.info.taskRankId && this.info.taskBeginDate && this.info.taskEndDate && this.info.advanceReleaseDistance && this.info.fleetLength;
        if(!this.isFast) {
          flag =  this.info.taskName && this.info.taskRankName && this.info.taskRankId && this.info.taskBeginDate && this.info.taskEndDate && this.info.taskContent && this.info.taskClassId;
          flag = flag && this.info.taskClassName && this.info.startPlace && this.info.targetPlace && this.info.advanceReleaseDistance  && this.info.dutyDeptName && this.info.fleetLength;
          if(this.info.taskClassName == '日常任务') {
            // 日常任务时周期不能为空
            flag = flag && this.info.taskPeriodId && this.info.taskPeriodName;
          }
        }

        if(!flag){
          this.$message.error('抱歉，必填项不能为空!');
          return false;
        };

        this.info.taskName = this.info.taskName.substring(0, 30);                                                                           // 任务名称长度<30个字符

        if(!this.isFast) {
          this.info.taskContent = this.info.taskContent.substring(0, 150);                                                                  // 任务内容长度<150个字符
          for(let i=0; i<this.info.rltTimeList.length; i++){                                                                                // 关联时间段验证
            const item = this.info.rltTimeList[i];
            if(!item.beginTime || !item.endTime){
              this.$message.error('时间段请填写完整!');
              return false;
            }
          }
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
  .scroll-list-edit-task{min-height:270px;width:478px;}
  .scroll-list-edit-task.ht470{height:470px;}
  .ic-del,.ic-add{text-align:right;position:relative;top:4px;right:6px;}             /* 新增、删除 自定义时间段 */
  .ic-suffix-mi{position:relative;}
  .ic-suffix-mi::after{content:'米';display:inline-block;background:#fff;height:28px;width:28px;text-align:center;line-height:28px;position:absolute;right:2px;top:1px;}
  .form-wrap-theme2 .list-rlt-time{padding-bottom:7px;}
  .form-wrap-theme2 .ic-suffix-mi::after{position:static;}
</style>
<style>
  /* 覆盖elementui样式 */
  .date-edit-task .el-input--mini .el-input__inner,
  .date-edit-task .el-date-editor.el-input,
  .date-edit-task .el-date-editor.el-input__inner{width:135px;}
  .date-edit-task .invalid .el-input__inner{border-color:#f00;}
  .date-edit-task .el-input--prefix .el-input__inner {padding-left:26px;}
</style>
