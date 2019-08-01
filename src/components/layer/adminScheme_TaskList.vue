<!-- 任务list模块 -->
<template>
  <div>
    <el-scrollbar ref="taskListScroll" class="el-scrollbar-xhidden task-list-scroller"
                  :class="{'el-scrollbar-yhidden':taskList.length<5}"
                  :style="{height: scrollerHt, top: (isEdit ? '40px' : '10px')}"
                  v-loading.fullscreen="showLoadingTask">

      <ul class="task-list" v-if="taskList.length">
        <li class="box-memo" v-for="(item, idx) in taskList"
                  :key="item.taskId+'_'+idx"
                  :class="['status-'+item.executeStatusId, {active: activeTaskId === item.taskId}]"
                  @click="taskChange(item)">
          <div class="clrfix flex-wrap">
              <span class="task-name ellipsis flex-item" :title="item.taskName">{{item.taskName}}</span>
              <!-- 主备线路添加 -->
              <span class="btn-task" v-if="isEdit">
                 <el-popover placement="right" width="100" trigger="click" :visible-arrow="false" popper-class="popper-add" v-model="item.showPopoverType1">
                    <p @click="$emit('add-route', {taskInfo: item, routeType: '主', isBaseOnNet: false})">手动添加</p>
                    <p @click="$emit('add-route', {taskInfo: item, routeType: '主', isBaseOnNet: false, isByCommonRoute: true})">常备线路</p>
                    <p @click="$emit('add-route', {taskInfo: item, routeType: '主', isBaseOnNet: true})">智能规划</p>
                    <i slot="reference" class="ic1 ic-add-route-main" :class="{'ic-add-route-main-active': activeTaskId === item.taskId}" title="添加执行线路"></i>
                  </el-popover>

                  <el-popover placement="right" width="100" trigger="click" :visible-arrow="false" popper-class="popper-add" v-model="item.showPopoverType2">
                      <p @click="$emit('add-route', {taskInfo: item, routeType: '备', isBaseOnNet: false})">手动添加</p>
                      <p @click="$emit('add-route', {taskInfo: item, routeType: '备', isBaseOnNet: false, isByCommonRoute: true})">常备线路</p>
                      <p @click="$emit('add-route', {taskInfo: item, routeType: '备', isBaseOnNet: true})">智能规划</p>
                   <i slot="reference" class="ic1 ic-add-route-spare" :class="{'ic-add-route-spare-active': activeTaskId === item.taskId}" title="添加备用线路"></i>
                  </el-popover>
              </span>
          </div>
          <p class="ellipsis blank-ht20" :title="item.dutyDeptName">{{item.dutyDeptName}}</p>

          <p class="pd-b1">
            <!-- 按钮：删除任务、存预案库 -->
            <span class="btn-task">
               <template v-if="isEdit">
                  <i class="ic1 ic-edit" :class="{'ic-edit-active': activeTaskId === item.taskId}"  title="编辑" @click="taskEdit(item)"></i>
                  <i v-if="!isFast" class="ic1 ic-dustbin" :class="{'ic-dustbin-active': activeTaskId === item.taskId}" title="删除" @click="confirmBeforeTaskDelete(item.taskId, item.taskName)"></i>
                  <i class="ic1 ic-saveto-lib" :class="{'ic-saveto-lib-active': activeTaskId === item.taskId}" title="存预案库" @click="ajaxSaveToCommonLib(item.taskId)"></i>
               </template>
                <i class="ic1 ic-scan" :class="{'ic-scan-active':activeTaskId === item.taskId}" title="查看" @click="taskEdit(item)" v-else></i>
            </span>
            <span class="time">{{item.taskBeginDate.substr(0, 10)}} ~ {{item.taskEndDate.substr(0, 10)}}</span>
          </p>
        </li>
      </ul>
    </el-scrollbar>

    <!-- ***确认框：删除任务前二次确认*** -->
    <confirm :isShow="showConfirmDelTask"
             :content="'确认要删除任务：'+ delTaskName +'吗?'"
             @ok="ajaxDeleteTask"
             @close="showConfirmDelTask = false"></confirm>
  </div>
</template>

<script>
  import common from '@tools/common';
  import filters from '@js/filters';
  import { mapState, mapMutations } from 'vuex';

  export default {
    props: {
      isEdit: {
        type: Boolean,                                       // 是否为编辑状态
        default: true
      },
    },
    data() {
      return {
        showLoadingTask: false,
        showConfirmDelTask: false,                           // 是否显示任务删除二次确认框
        isFast: false,                                       // 当前是否为快速特勤任务
        isLowResolution: false,                              // 是否为低分辨率屏幕（需要设置任务列表滚动条容器高度）
        scrollerHt:'',                                       // taskList滚动容器高度

        taskList: [],                                        // 当前任务list
        activeTaskId: '',                                    // 当前高亮激活的任务id

        delTaskId: '',                                       // 确认删除的任务id
        delTaskName: '',                                     // 确认删除的任务name
      }
    },
    computed: {
      ...mapState([
        'mapLoaded',
        'schemeId',
        'countTaskListChange',
        'taskId',
      ]),
    },
    filters: {
      getShortTime: filters.getShortTime                     // 取 hh:mm (eg:2018-08-05 12:00:00 -> 12:00)
    },
    watch: {
      'taskList.length'() {
        /**
         * 根据任务个数判断快速特勤下是否已绑定了任务（快速特勤仅允许单任务）
         */
        if(this.isFast) {
          const isCanAddTask = this.taskList.length ? true : false;
          this.setVuex_taskId({
            taskId: isCanAddTask ? '' : this.$route.query.taskId // 设置taskId(避免从关联任务页路由跳转到特勤任务页导致加载的还是上一个关联任务taskId下的线路）
          });
          this.$emit('fast-can-add-task', isCanAddTask);
        }
      },
      countTaskListChange() {
        /**
         * 其余组件触发刷新taskList
         */
        this.activeTaskId = this.taskId;
        this.ajaxGetTaskList(this.activeTaskId)
      },
    },
    mounted() {
      this.init_module();                                    // 模块初始化
    },
    methods: {
      ...mapMutations ([
        'setVuex_taskId',                                    // 设置选中任务id
        'setVuex_taskInfo',                                  // 设置选中的任务（用于任务编辑时赋值）
        'setVuex_mapLoaded',                                 // 设置地图加载状态
        'setVuex_routeListChange'
      ]),
      // *** ajax start ***
      ajaxGetTaskList(activeTaskId = '') {
        /**
         * 获取当前方案下任务list
         */
        const apiName = `${config.baseUrl_HOST}${this.isFast ? this.$api.selectFastTaskInfoList_GET : this.$api.selectTaskInfoList_GET}`;
        const params = this.isFast ? {taskId: activeTaskId || this.$route.query.taskId} : {schemeId: this.$route.query.schemeId};
        this.showLoadingTask = true;
        return this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.taskList = res.resultList || [];
              if(this.taskList.length) {
                this.setCheckedTaskId(activeTaskId);
              }else{
                if(!this.isFast) this.$message.warning('当前方案还未关联任务');
              }
            }else {
              this.$message.error('任务信息获取失败！');
            };
            this.setScrollHt();
            this.showLoadingTask = false;
          }).catch(rej => {
            this.$message.error('任务信息获取失败！');
            this.showLoadingTask = false;
          })
      },

      ajaxDeleteTask () {
        /**
         * 删除任务（成功后刷新任务list，并默认选中第一个任务）
         */
        const apiName = `${config.baseUrl_HOST}${this.isFast ? this.$api.deleteFastTaskInfo_DELETE : this.$api.deleteTaskInfo_DELETE}`;
        const params = {
          taskId: this.delTaskId
        };
        this.$http.delete(apiName, params)
          .then(res => {
            if(res.appCode == 0){
              this.$message.success('任务删除成功！');
              if(this.isFast) {
                // 快速特勤删除任务需重置路由参数taskId，否则一刷新又去请求未删除前的taskId了
                this.$router.push({
                  name:'rlttask',
                  query: {
                    isFast: 1,
                    taskId: ''
                  }
                });
                this.setVuex_taskId({taskId: ''});
                this.setVuex_routeListChange();
              }
              this.ajaxGetTaskList(this.delTaskId);

            }else{
              this.$message.error('任务删除失败！');
            }
            this.showConfirmDelTask = false;
          }).catch(rej => {
          this.showConfirmDelTask = false;
        })
      },
      ajaxSaveToCommonLib(taskId) {
        /**
         * 任务存预案库
         */
        this.activeTaskId = taskId;
        this.setVuex_taskId({
            taskId: this.activeTaskId
        });
//        console.log('任务存预案库,接口还未对接')
      },
      // *** ajax end ***

      init_module() {
        /**
         * 模块初始化
         */
        this.isFast = this.$route.query.isFast ? true : false;        // 当前是否为快速特勤
        if(this.isFast && !this.$route.query.taskId) return false;    // 快速特勤新增：taskList为空，无需请求接口（只有编辑查看时需要请求）
        if(this.mapLoaded){
          this.ajaxGetTaskList();                                     // 地图已加载完，直接模块初始化
        }else{
          this.$mapLoaded().then(res => {                             // 地图未加载完，待加载完再进行初始化
            this.setVuex_mapLoaded(true);
             this.ajaxGetTaskList();
          })
        }
      },
      taskEdit(item) {
        /**
         * 编辑任务基础直接传递任务信息给兄弟组件（注意赋值，不能直接把对象指针赋过去，否则在任务编辑修改内容会直接改该任务信息，造成不必要的联动，具体看setVuex_taskInfo数据处理）
         * @param item {Object} ： 正在编辑的任务信息
         */
        this.$emit('edit-task', 'edit');
        this.setVuex_taskInfo(item);
        this.setVuex_taskId({
          taskId: item.taskId
        });
      },
      taskChange(task) {
        /**
         * 切换任务时
         * @param task {Object}: 任务id
         */
        this.activeTaskId = task.taskId;
        this.setVuex_taskId({
          taskId: task.taskId,
        });
      },
      confirmBeforeTaskDelete(taskId, taskName) {
        /**
         * 任务删除前二次确认
         * @param taskId {String}:    确认删除的任务id
         * @param taskName {String}:  确认删除的任务name
         */
        this.showConfirmDelTask = true;
        this.delTaskId = taskId;
        this.delTaskName = taskName;
      },
      setTaskScrollY(activeTaskId) {
        /**
         * 根据当前选中的taskId获取当前在taskList中第几个,计算scrollY
         * @param activeTaskId {String} : 当前选中的taskId
         */
        let order = 0;
        for(let i = 0; i < this.taskList.length; i++) {
          if(this.taskList[i].taskId == activeTaskId){
            order = i;
            break;
          }
        }
        let scrollY = order*80;
        this.$refs.taskListScroll.$refs.wrap.scrollTop = scrollY;
      },
      setCheckedTaskId(activeTaskId = '') {
       /**
        * 设置选中的任务（若传入指定选中任务id，则直接选中并赋值为指定任务id，未指定的默认选中第一个任务，没有的则不选中）
        * @param activeTaskId {String} :  当前选中的任务
        */
       if(this.taskList.length){
         this.activeTaskId =  activeTaskId ? activeTaskId : this.taskList[0].taskId;  // 新增、修改任务后选中当前编辑的任务( 删除任务后，则默认选中第一项)
         this.setTaskScrollY(this.activeTaskId);                                      // 若多人同时在新增任务，可能导致新增任务会被挤到滚动条下方视觉上被隐藏，该方法可直接定位到自己刚新增的那条任务
       }else {
         this.activeTaskId = '';
       }
        this.setVuex_taskId({
          taskId: this.activeTaskId,
        });
     },
      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         */
        const ht = document.documentElement.offsetHeight;
        const minHt = 720;                                                            // 能显示5条的最小高度，高度临界点最小值
        this.isLowResolution = ht < minHt  ? true : false;                            // 是否为低分辨率显示（左侧任务列表正常显示5条就滚动, 小分辨率的4条即滚动）
        const taskLen = this.taskList.length;
        if(this.isLowResolution) {
          // 低分辨显示时，4条即滚动，<4条的滚动容易高度根据当前条数设置
          this.scrollerHt = taskLen < 4 ? (taskLen * 90 + 10+ 'px') : '354px';
        }else {
          // 高分辨显示时，5条即滚动，<5条的滚动容易高度根据当前条数设置
          this.scrollerHt = taskLen < 5 ? (taskLen * 90 + 10+ 'px') : '443px';
        }
      },
    }
  }
</script>

<style scoped>
</style>

