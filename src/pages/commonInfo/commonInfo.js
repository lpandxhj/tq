import Vue from 'vue';
import App from './commonInfo.vue';
import router from './router/index';
import store from '@store/store';
require('@js/lib.js');


/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
