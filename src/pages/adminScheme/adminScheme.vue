<template>
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
        <div class="top-bar" :class="$route.path != '/preview' ? 'full-width' : 'half-width'" v-if="$route.path != '/rlttask'">
          <ul class="list-breadcrumb">
              <router-link tag="li" :to="{ name: firstPage.name}">{{firstPage.title}}<i v-if="secondPage" class="el-icon-arrow-right"></i></router-link>
              <router-link tag="li" :to="{ name: secondPage.name,  params: { id: secondPage.id}}">{{secondPage.title}}</router-link>
          </ul>
        </div>

        <!-- 路由视图 -->
        <router-view class="router-con"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
  import PageHead from '@components/Head';
  import PageMenu from '@components/Menu';
  import { mapState, mapMutations } from 'vuex';
  import common from '@tools/common'
  export default {
    components: {
      PageHead,
      PageMenu,
    },
    data() {
      return {
        showLayerCalendar: false,
        firstPage: '',
        secondPage: '',
        firstActiveId: 'menu_2',
        secondAcitveId: 'menu_2_1',
      };
    },
    computed: {
      ...mapState([
        'routePath'
      ]),
      date() {
        /**
         * 预演日期(日期存在时可进行任务进度查看)
         */
        return this.$route.query.startDate;
      }
    },
    beforeRouteEnter (to, from, next) {
      /**
       * 路由跳转时不会触发子组件mounted方法，故用路由钩子解决,这里需要延迟下等待map加载
       */
      next(vm => {
        if(to.query.isFast) vm.secondAcitveId = 'menu_2_2';     // 快速特勤模块-特勤任务新增
      })
    },
    watch: {
      $route(to, from) {
        /**
         * 父组件监听路由变化
         */
        // menu菜单高亮项控制
        this.setVuex_routePath(to.path);
        if(to.path == '/fasttasklist' || to.query.isFast){

          this.secondAcitveId = 'menu_2_2';                     // 快速特勤模块
        }else{
          this.secondAcitveId = 'menu_2_1';                     // 方案管理模块
        }

        // 控制顶部导航菜单(面包屑)名称及跳转url
        switch (to.name) {
          case 'schemelist':
            // 方案列表页
            this.firstPage = {
              name: to.name,
              title: '方案管理'
            };
            this.secondPage = '';
            break;

          case 'fasttasklist':
            // 快速特勤列表页
            this.firstPage = {
              name: to.name,
              title: '快速特勤'
            };
            this.secondPage = '';
            break;

          case 'preview':
            // 方案预演页
            this.firstPage = {
              name: to.name,
              title: '方案管理'
            };
            this.secondPage = {
              name: to.name,
              title: '方案预演'
            };
            this.setVuex_resetPreview();                             // 停预演
            break;

          default:
            // 详情查看、提交、审核页：需要设置二级导航菜单（通过id判断页面）
            const isFast = to.query.isFast;
            let title = '';
            const id = to.params.id;
            switch (id) {
              case 'scan':
                title = isFast ? '任务信息' : '方案信息';
                break;
              case 'submit':
                title = '方案提交';
                break;
              case 'examine':
                title = '方案审核';
                break;
              default:
                title = '';
                break;
                break;
            }
            title = id ? title : to.meta.title;
            this.firstPage = {
              name: isFast ? 'fasttasklist' : 'schemelist',          // 快速特勤的详情页和方案的任务详情是公用的路由页，故需要重新指定一级菜单
              title: isFast ? '快速特勤' : '方案管理'
            };
            this.secondPage = {
              name: to.name,
              title: title,
              id: id
            };
        }
      },
    },
    methods: {
      ...mapMutations([
        'setVuex_routePath',                                         // 设置路由路径
        'setVuex_resetPreview'                                       // 停预演
      ])
    }
  }
</script>

<style scoped>
  .full-width{background:#f6f7fb;}
  .half-width{right:464px;}
</style>
