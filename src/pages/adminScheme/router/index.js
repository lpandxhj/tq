import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
import RltTask from '../adminScheme_RltTask.vue'    // 为了引入方式和组件内的引入方式保持一致，避免多处引入同意组件引入方式不同造成的警告出现

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      redirect: "/schemelist"
    }, {
      path: '/schemelist',
      name: 'schemelist',
      meta: {
        title: '方案管理'
      },
      component: resolve => require(['../adminScheme_SchemeList.vue'], resolve)                  // 方案管理（带方案列表）
    }, {
      path: '/schemeinfo/:id',                                                                   // 方案 查看、提交、审核 ，使用动态路由（id可以是scan、submit、examine）
      name: 'schemeinfo',
      meta: {
        title: '方案管理'
      },
      component: resolve => require(['../adminScheme_SchemeInfo.vue'], resolve)                  // 方案信息（查看、提交、审核）
    }, {
      path: '/fasttasklist',
      name: 'fasttasklist',
      meta: {
        title: '快速特勤'
      },
      component: resolve => require(['../adminScheme_FastTaskList.vue'], resolve)                    // 快速特勤
    }, {
      path: '/preview',
      name: 'preview',
      meta: {
        title: '方案预演'
      },
      component: resolve => require(['../adminScheme_Preview.vue'], resolve)                     // 方案预演
    }, {
      path: '/rlttask',
      name: 'rlttask',
      meta: {
        title: '关联任务'
      },                                                                                         // 关联任务
      component: RltTask
    }
  ]
});





