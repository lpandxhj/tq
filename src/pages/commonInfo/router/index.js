import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      redirect: "/placelist"
    }, {
      path: '/placelist',
      name: 'placelist',
      meta: {
        title: '常备单位'
      },
      component: resolve => require(['../commonInfo_PlaceList.vue'], resolve)                  // 基础信息管理--常备单位
    }, {
      path: '/routelist',
      name: 'routelist',
      meta: {
        title: '常备线路'
      },
      component: resolve => require(['../commonInfo_RouteList.vue'], resolve)                  // 基础信息管理--常备线路
    }
  ]
});





