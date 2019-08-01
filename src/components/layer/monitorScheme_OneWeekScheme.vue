<!-- 特勤监测：一周待执行方案 -->
<template>
  <div class="slide-down one-week-scheme" :class="{active:isShow}" v-loading="showLoading">
      <div v-for="(day, idx) in schemeListOneWeek" class="everyday">
        <!-- 方案对应的日期及星期 -->
        <h1>
          {{day.executeDate}}
          <p>{{day.week}}</p>
        </h1>

        <el-scrollbar class="el-scrollbar-xhidden scheme-list-container">
          <!-- 对应日期下的方案list -->
          <ul class="scheme-list" v-for="(scheme, sidx) in day.schemeList" :key="idx+'_'+sidx">
            <!--<span class="scheme-name" :title="scheme.schemeName" >{{scheme.schemeName}}</span>-->
            <span class="scheme-name"
                  :title="scheme.schemeName"
                  @click="$pageJump('adminScheme.html', '/rlttask', {schemeId:scheme.schemeId, schemeName:scheme.schemeName, schemeRankId:scheme.schemeRankId})">{{scheme.schemeName}}</span>

            <!-- 对应方案下的任务list -->
            <li class="normal" v-for="item in scheme.taskDetailInfoList"
                :title="item.taskName"
                :class="{fast: item.taskTypeId == 'TASKTYPE02', deleted: !item.isWaitExecute}">
                {{item.taskName}}
                <i class="ic2 ic-del-x" title="删除" @click="ajaxEditSchemeWaitStatus(item.executeTaskId, 0, item)" v-if="item.isWaitExecute"></i>
                <i class="ic2 ic-recovery" title="恢复" @click="ajaxEditSchemeWaitStatus(item.executeTaskId, 1, item)" v-else></i>
            </li>
          </ul>
        </el-scrollbar>
      </div>

    <p class="no-data-oneweek" v-if="isNoData"><no-data :txt="'近一周暂无待执行方案'"></no-data></p>
  </div>
</template>

<script>
  import common from '@tools/common';
  export default {
    props: ['isShow'],
    data() {
      return {
        showLoading: false,

        schemeBeginDate:'',     // 方案开始时间（从明天开始算）
        schemeEndDate:'',       // 方案结束时间（推算至一周后）
        schemeListOneWeek:[],   // 一周待执行的所有方案（按开始日期分组）
        dateArr:[],             // 从明天开始的日期、星期数组（前端算，和后端无关，后端返回的数据带执行开始日期的需要和这个匹配来放入数组中）

      };
    },
    computed: {
      isNoData() {
        /**
         * 最近一周无方案
         */
        const len = this.schemeListOneWeek.length;
        for(let i=0; i<len; i++){
          if(len && this.schemeListOneWeek[i].schemeList.length) {
            return false;
          }
        }
        return true;
      }
    },
    watch: {
      isShow() {
        /**
         * 初始化查询日期（明天起往后推算一周）
         */
        if(this.isShow) {
          this.schemeBeginDate = common.lpdt.dateOperator();
          this.schemeEndDate = common.lpdt.dateOperator({countDays:7});
          this.ajaxGetSchemeOneWeek();
        }
      }
    },
    methods: {
      ajaxGetSchemeOneWeek() {
        /**
         *  获取一周待执行方案列表
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.getSchemeForWeek_GET}`;
        const params = {
          schemeBeginDate: this.schemeBeginDate,
          schemeEndDate: this.schemeEndDate,
        };
        this.showLoading = true;
        this.$http.get(apiName, params)
          .then(res => {
            this.showLoading = false;
            if(res.appCode ==0 ){
              this.schemeListOneWeek = res.resultList;
              this.schemeListOneWeek.forEach(i => {
                this.$set(i, 'week', common.lpdt.getWeekByDay(i.executeDate))
              })
            }
          }).catch(rej => {
          this.showLoading = false;
        })
      },
      ajaxEditSchemeWaitStatus(executeTaskId, isWaitExecute, item) {
        /**
         * 修改执行任务 待执行状态
         * @param executeTaskId(String):  执行任务编号
         * @param isWaitExecute(Number):  待执行状态（删除任务操作：0;  恢复操作：1）
         * @param item(Object):           当前任务
         */
        const apiName = `${config.baseUrl_HOST}${this.$api.editSchemeWaitStatus_PUT}?executeTaskId=${executeTaskId}&isWaitExecute=${isWaitExecute}`;
        this.showLoading = true;
        this.$http.put(apiName)
          .then(res => {
            this.showLoading = false;
            if(res.appCode == 0){
              item.isWaitExecute = isWaitExecute ? true : false;     // 不刷新直接更新状态
              console.log(item)
            }else{
              this.$message.error(res.dataBuffer)
            }
          }).catch(rej => {
            this.showLoading = false;
        })
      },
    }
  }
</script>

<style scoped>
  .one-week-scheme{background:#f4f4f4;width:1035px;height:320px;border:1px solid #e8ebed;box-shadow:1px 1px 6px #cdccca;display:flex;z-index:2;}
  .one-week-scheme.active{top:33px;}
  .one-week-scheme .everyday{flex:1;border-right:1px solid #e8ebed;}
  .one-week-scheme .everyday{flex:1;border-right:1px solid #e8ebed;}
  .one-week-scheme h1{height:50px;background:#fafafa;text-align:center;font-weight:normal;color:#727d86;box-sizing:border-box;padding-top:8px;}
  .scheme-list-container{height:269px;width:147px;}
  .scheme-list{margin:0 3px;width:140px;padding:7px 0 3px;}
  .scheme-list .scheme-name, .scheme-list li{box-sizing:border-box;display:block;height:24px;line-height:24px;overflow:hidden;background:#fff;box-shadow:1px 1px 5px #ccc;border-left:2px solid #fff;color:#465461;text-overflow:ellipsis;white-space:nowrap;}
  .scheme-list .scheme-name{padding-left:7px;border-radius:3px;}
  .scheme-list .scheme-name:hover{cursor:pointer;color:#5093e1;}
  .scheme-list li{margin-top:4px;padding:0 20px 0 6px;border-radius:0 4px 4px 0;border-left-color:#5093e1;position:relative;}
  .scheme-list li.fast{border-left-color:#f8ba40;}  /* 快速特勤任务 */
  .scheme-list i.ic2{position:absolute;right:3px;top:2px;z-index:4;}
  .scheme-list li i.ic-del-x{display:none;}
  .scheme-list li:hover i.ic-del-x{display:block;}
  .scheme-list i.ic2:hover{cursor:pointer;opacity:.85;}
  .scheme-list li.deleted{color:#c5c5c5;}           /* deleted (已删除的任务，可恢复) */
  .scheme-list li.deleted::before{content:'';position:absolute;left:0;right:0;top:12px;z-index:0;display:block;height:1px;background:#aab5c2;}
  .no-data-oneweek{position:absolute;top:35%;left:50%;transform:translateX(-50%)}
</style>

