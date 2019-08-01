<template>
  <div id="app">
    <!-- header -->
    <page-head id="head"></page-head>

    <!-- main -->
    <div id="main" class="flex-wrap">
      <!-- menu -->
      <page-menu id="menu"
                 :firstActiveId="firstActiveId"
                 :secondAcitveId="secondAcitveId"></page-menu>

      <!-- content -->
      <div id="content" class="flex-item">
        <!-- 路由视图 -->
        <transition name="fade">
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  import PageHead from '@components/Head';
  import PageMenu from '@components/Menu';

  import { mapState, mapMutations } from 'vuex';

  export default {
    components: {
      PageHead,
      PageMenu,
    },
    data() {
      return {
        firstActiveId:'',               // 默认选中的一级菜单
        secondAcitveId:'',
      };
    },
    computed: {
      ...mapState(['mapLoaded'])
    },
    watch: {
      $route(to, from) {
        // 父组件监听路由变化
        this.setVuex_routePath(to.path)
      }
    },
    methods: {
      ...mapMutations([
        'setVuex_routePath',
      ]),
    }
  }
</script>

<style scoped>
</style>
