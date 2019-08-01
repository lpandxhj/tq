import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      redirect: "/scheme"
    }, {
      path: '/scheme',          // 方案监测主页
      name: 'scheme',
      component: resolve => require(['../monitorScheme_Scheme.vue'], resolve)
    }
  ]
});








