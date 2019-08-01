<template>
  <!-- 基础信息管理 -->
  <div id="app">
    <!-- header -->
    <page-head id="head"></page-head>

    <!-- main -->
    <div id="main" class="flex-wrap">
      <!-- menu -->
      <page-menu id="menu" :firstActiveId="firstActiveId" :secondAcitveId="secondAcitveId"></page-menu>

      <!-- content -->
      <div id="content" class="flex-item">
        <!-- 顶部操作条：面包屑、添加任务等 -->
        <div class="top-bar">
          <ul class="list-breadcrumb">
              <li>基础信息管理<i class="el-icon-arrow-right"></i></li>
              <router-link tag="li" :to="{ name: secondPage.name}">
                {{secondPage.title}}
              </router-link>
          </ul>
        </div>

        <!-- 路由视图 -->
        <router-view class="router-con"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import common from '@tools/common'
  import PageHead from '@components/Head';
  import PageMenu from '@components/Menu';
  export default {
    components: {
      PageHead,
      PageMenu,
    },
    data() {
      return {
        firstPage: {name: 'commoninfo',title: '基础信息管理'},
        secondPage: {name: '',title: '', id: ''},
        firstActiveId: 'menu_4',
        secondAcitveId: 'menu_4_1',
        routeName:'',
      };
    },
    computed: {
      ...mapState([
        'routePath'
      ])
    },
    watch: {
      $route(to, from) {
        // 父组件监听路由变化
        this.setVuex_routePath(to.path);
        if(to.path == '/routelist'){
          this.secondAcitveId = 'menu_4_2';
        }else{
          this.secondAcitveId = 'menu_4_1';
        }

        // 设置二级页面面包屑
        this.secondPage = {
          name: to.name,
          title:  to.meta.title,
        }
      }
    },
    mounted() {
      // 解析url, 获取secondAcitveId， 获取routeName, 赋值，路由跳转
      const routePath = common.lpobj.urlParamsToJson().routePath;
      if(routePath){
        this.$router.replace({
          path: routePath,
        })
      };
    },
    methods: {
      ...mapMutations([
        'setVuex_routePath'
      ])
    }
  }
</script>

<style scoped>
  .top-bar{background:#f6f7fb;}
</style>
