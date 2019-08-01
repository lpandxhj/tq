<!-- 警员列表 -->
<template>
  <div class="box-shadow layer-rlt-police slide-left" :class="{active: isShow}" v-loading="showLoading">
      <h2 class="primary-title">
        执勤警员
        <i class="fr ic-close" title="关闭" @click="$emit('close')"></i>
        <i class="fr ic2 ic-set-police" title="派警" @click="dispatchPolice('')"></i>
      </h2>

      <el-scrollbar class="el-scrollbar-xhidden list-rlt-police-scroller" :style="{height:scrollerHt}">
        <ul class="list-border list-rlt-police" v-if="policeListGroupByPost.length">
          <li v-for="(item, idx) in policeListGroupByPost" :key="item.postId+'_'+idx" class="status-1">
            <p class="post" :title="item.postName">
              <span class="ellipsis post-name">{{item.postName || '默认岗位'}}</span>
              <i class="ic2 ic-set-police" title="岗位派警" @click="dispatchPolice(item.postId)"></i>
            </p>
            <div class="people clrfix">
              <el-dropdown trigger="click" placement="bottom-start" v-for="police in item.executeTaskDispatchList" :key="police.policeId">
                <span :class="'police status-'+police.isOnDuty">
                  {{police.policeName}}
                  <template v-if="police.policeCall">({{police.policeCall}})</template>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item><span @click="ajaxEditPoliceStatus(police, 1)">在岗</span></el-dropdown-item>
                  <el-dropdown-item><span @click="ajaxEditPoliceStatus(police, 0)">离岗</span></el-dropdown-item>
                  <el-dropdown-item><span @click="confirmBeforePoliceDelete(police)">移除</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </li>
        </ul>
        <!-- 暂无数据 -->
        <no-data v-else style="padding-top:150px;"></no-data>
      </el-scrollbar>

      <!-- 按钮操作 -->
      <div class="btn-group-bottom" style="background:none;">
        <el-button size="mini" round @click="$emit('close')">关 闭</el-button>
      </div>

      <!-- ***浮层：派警 *** -->
      <layer-dispatch-police
                  :isShow="showLayerDispatchPolice"
                  :postId="postId"
                  @dialog-close="showLayerDispatchPolice = false"
                  @dispatch-complete="ajaxGetRltPoliceList"></layer-dispatch-police>

      <!-- ***确认框：移除警员前二次确认*** -->
      <confirm :isShow="showConfirmDelPolice"
               :content="'确认移除警员：'+ delPoliceName +'吗?'"
               @ok="ajaxDeleteRltPolice"
               @close="showConfirmDelPolice = false"></confirm>
  </div>
</template>


<script>
  import LayerDispatchPolice from '@components/layer/monitorScheme_DispatchPolice';

  import common from '@tools/common';
  import { mapState } from 'vuex';

  export default {
    props: [
      'isEdit',
      'isShow'
    ],
    components: {
      LayerDispatchPolice
    },
    data() {
      return {
        showLoading: false,
        showConfirmDelPolice: false,                    // 是否要显示警员删除二次确认框
        showLayerDispatchPolice: false,                 // 是否显示派警模块

        scrollerHt:'',                                  // 警员list滚动容器高度
        policeListGroupByPost:[],                       // 当前执行任务下执勤警员List（按岗位分组）
        postId:'',                                      // 当前选中的岗位信息

        delDispatchId: '',                              // 确认删除的警员派警id
        delPoliceName: '',                              // 确认删除的警员name
      };
    },
    computed: {
      ...mapState([
        'taskId',
        'executeTaskId',
        'routeId',
      ]),
    },
    watch: {
      isShow() {
        if(this.isShow) this.ajaxGetRltPoliceList();
      }
    },
    mounted() {
      this.setScrollHt();
    },
    methods: {
      // *** ajax start ***
      ajaxGetRltPoliceList() {
        /**
         * 获取当前任务已派的警员list
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getPostPoliceDispatchList_GET}`;
        console.log('taskId='+this.taskId)
        console.log('executeTaskId='+this.executeTaskId)
        console.log('routeId='+this.routeId)

        const params = {
          taskId: this.taskId,
          executeTaskId: this.executeTaskId,
          routeId: this.routeId
        };

        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.policeListGroupByPost = res.resultList || [];
//              policeList = common.lpobj.removeTheSameByKey(policeList, 'policeId');    // 派警去重（这步明天在小江那实现,实现后可删除前端的此步操作）
//              this.policeListGroupByPost = common.lpobj.groupByKey(policeList, 'postId', ['postName']);
            }else {
              this.$message.error('抱歉，派警信息获取失败！')
            }
            this.showLoading = false;
          }).catch(rej => {
          this.$message.error('抱歉，派警信息获取失败！');
          this.showLoading = false;
        })
      },
      ajaxEditPoliceStatus(policeInfo, isOnline) {
        /**
         * 修改警员点名状态（在岗、离岗）
         * @param policeInfo {Object}: 警员信息
         * @param policeInfo.postId {String}: 岗位id
         * @param policeInfo.policeId {String}: 警员id
         * @param isOnline {Number}: 警员在岗状态（isOnline：1 在岗；  isOnline: 0 离岗）
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.addPoliceCallStatus_PUT}`;
        const params = {
          executeTaskId: this.executeTaskId,
          policeId: policeInfo.policeId,
          policeName: policeInfo.policeName,
          postId: policeInfo.postId,
          isPosting: isOnline
        };
        this.$http.put(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.$message.success('修改成功！')
            } else {
              this.$message.error('修改失败！')
            }
          }).catch(rej => {
          this.$message.error('修改失败！')
        })
      },
      ajaxDeleteRltPolice() {
        /**
         * 删除关联的警员（从派警list中删指定警员）
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.delExecuteTaskDispatch_DELETE}`;
        const params = {
          "dispatchId": this.delDispatchId,
        };
        this.$http.delete(apiName, params)
          .then(res => {
            if(res.appCode == 0) {
              this.$message.success('移除成功！');
              this.ajaxGetRltPoliceList();
            }else{
              this.$message.error('移除失败！')
            }
            this.showConfirmDelPolice = false;
          }).catch(rej => {
          this.$message.error('移除失败！');
          this.showConfirmDelPolice = false;
        })
      },
      // *** ajax end ***

      confirmBeforePoliceDelete(delPoliceInfo) {
        /**
         * 删除派警前二次确认提示
         * @param delPoliceInfo {Object}:            需要被删除的警员信息
         * @param delPoliceInfo.dispatchId {String}: 需要被删除的警员派警id
         * @param delPoliceInfo.policeName {String}: 需要被删除的警员name
         */
        this.delDispatchId = delPoliceInfo.dispatchId;
        this.delPoliceName = delPoliceInfo.policeName;
        this.showConfirmDelPolice = true;
      },
      dispatchPolice(postId = '') {
        /**
         * 对岗位或任务进行派警
         * @param postId (String):        需要派警的岗位id
         * @param idx (Number):           需要派警的岗位idx
         */
        this.showLayerDispatchPolice = true;
        this.postId = postId;
      },
      setScrollHt() {
        /**
         * layer 滚动容器高度自适应屏幕高度
         * @param dValue {number} : 差值
         */
        const winHt = document.documentElement.offsetHeight;
        this.scrollerHt = `${winHt-257}px`;
      },
    }
  }
</script>

<style scoped>
  /* 警员list */
  .layer-rlt-police{top:48px;bottom:15px;width:300px;margin-bottom:0;z-index:2;}
  .primary-title .ic-set-police{margin-right:5px;}
  .list-rlt-police-scroller{height:500px;width:298px;left:-10px;}
  .list-rlt-police{position:relative;width:300px;}
  .list-rlt-police .post{color:#5093e1;display:flex;}
  .list-rlt-police .people{color:#727d86;padding-top:5px;margin-left:-6px;}
  .list-rlt-police .police{float:left;padding:0 5px;height:20px;line-height:18px;border:1px solid transparent;border-radius:3px;box-sizing:border-box;margin:0 10px 2px 0;}
  .list-rlt-police .police:hover, .list-rlt-police .police.active{color:#f96868;border-color:#f96868;}
  .list-rlt-police li{padding:7px 10px 2px 15px;}
  .list-rlt-police li.status-0 .post{color:#f96868;}                                                                          /* 离岗 */
  .list-rlt-police li .post-name{flex:1;}
  .list-rlt-police li .ic-set-police{width:21px;height:16px;display:none;}
  .list-rlt-police li:hover .ic-set-police{display:block;}
  .list-rlt-police .police.status-0{border-color:#f96868;color:#f96868;padding-left:5px;}
</style>

<style>
  /* 覆盖elementui样式 */
  /* 岗位在岗、离岗等操作 */
</style>
