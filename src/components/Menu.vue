<!-- 菜单组件 -->
<template>
  <div class="menu" :class="{open: isOpen}">
    <i class="ic-open" @click="menuToggle" :title="isOpen?'点击收缩':'点击展开'"></i>
    <ul class="first-menu">
      <!-- 一级菜单 -->
      <li v-for="first in menu"
          :key="first.name"
          :class="{active: fActiveId == first.id}"
          @click="fActiveId = fActiveId === first.id ? '' : first.id">
        <i :class="'ic-first_menu ic-first_' + first.id"></i>
        <span class="first-menu-title">{{first.name}}</span>

        <!-- 二级菜单 -->
        <ol class="second-menu">
          <span class="second-menu-title">{{first.name}}</span>
          <li v-for="second in first.list" :class="{active:sActiveId == second.id}" :key="second.name" @click="pageJump(second, second.routePath)">{{second.name}}</li>
        </ol>
      </li>
    </ul>
  </div>
</template>

<script>
  import common from '@tools/common'
  export default {
    // 父组件需要传递选中一二级菜单的索引(不传默认选中第一个一级、第一个一级的二级)
    props:[
      'firstActiveId',
      'secondAcitveId',
      'menuIsOpen'
    ],
    data() {
      return {
        fActiveId:'',                                                   // first active id   一级id
        fActiveIdx:0,                                                   // first active idx  一级索引
        sActiveId:'',                                                   // second active id  二级id
        sActiveIdx:0,                                                   // second active idx 二级索引
        isOpen: false,                                                  // 菜单是否左右展开，默认false
        menu: [
          {
            name: '特勤监测',
            id:'menu_1',
            list: [
              {
                name: '特勤监测',
                id:'menu_1_1',
                url: 'monitorScheme.html'
//              }, {
//                name: '活动监测',
//                id:'menu_1_2',
//                url: 'monitorAct.html'
              }
            ]
          }, {
            name: '特勤方案',
            id:'menu_2',
            list: [
              {
                name: '方案管理',
                id: 'menu_2_1',
                url: 'adminScheme.html',
                path: '/schemelist',
              },{
                name: '快速特勤',
                id:'menu_2_2',
                url: 'adminScheme.html',
                routePath: '/fasttasklist'
//              }, {
//                name: '活动管理',
//                id:'menu_2_3',
//                url: 'adminAct.html'
              }
            ]
          }, {
            name: '特勤评价',
            id:'menu_3',
            list: [
              {
                name: '特勤评价',
                id:'menu_3_2',
                url: 'commentScheme.html'
              }, {
                name: '任务评价',
                id:'menu_3_2',
                url: 'commentTask.html'
              }
            ]
          }, {
            name: '基础信息管理',
            id:'menu_4',
            list: [
              {
                name: '常备单位',
                id:'menu_4_1',
                url: 'commonInfo.html',
                routePath: '/placelist'
              }, {
                name: '常备线路',
                id:'menu_4_2',
                url: 'commonInfo.html',
                routePath: '/routelist'
              }
            ]
          }
        ]
      }
    },
    watch: {
      secondAcitveId: {
        handler(){
          /**
           * 监听二级菜单变化（有些二级时路由页面跳转，不会触发mounted,所以需要监听路由跳转后的id）
           */
          this.menuAcitveInit();
        },
        immediate: true
      }
    },
    mounted() {
      // 菜单保持上一次的伸缩状态
      this.isOpen = false;
      if(localStorage.getItem('menuIsOpen') && localStorage.getItem('menuIsOpen') == 'true') {
          this.isOpen = true;
      }
    },
    methods: {
      menuAcitveInit() {
        /**
         * 菜单高亮初始化(根据父组件传入的参数是否有效来判断高亮的项)
         */
        this.fActiveIdx = this.getIdxByMenuId('first', this.firstActiveId);   // 根据父组件传入的id找到对应的索引，找不到的默认索引为0
        this.sActiveIdx = this.getIdxByMenuId('second', this.secondAcitveId);
        this.fActiveId = this.menu[this.fActiveIdx].id;                       // 设置高亮菜单的id
        this.sActiveId = this.menu[this.fActiveIdx].list[this.sActiveIdx].id;
        if(this.menuIsOpen != undefined) this.isOpen = this.menuIsOpen;       // 控制菜单宽度左右收缩
      },
      pageJump(item, routePath) {
        /**
         * 多页面间跳转（务必带上绝对路径）
         * @param item(Number)  当前二级菜单对象
         */
        this.sActiveId = item.id;
        this.$pageJump(item.url, routePath)
      },
      menuToggle() {
        /**
         * 菜单收缩
         */
        this.isOpen = !this.isOpen;
        this.$emit('toggle', this.isOpen);
        localStorage.setItem('menuIsOpen', this.isOpen);
      },
      getIdxByMenuId(menuType, id) {
        /**
         * 根据菜单id找到菜单所在索引
         * @param  menuType(String)   需要查询索引的菜单类型（一级 or 二级）
         * @param id(String)          需要查询索引的菜单id
         */
        let idx = 0;                  // 匹配不到默认选中第一项
        if(menuType == 'first'){
          // 匹配高亮的一级菜单idx
          for(let i in this.menu){
            if(this.menu[i].id == id) {
              idx = i;
              break;
            }
          }
        }else{
          // 匹配高亮的二级菜单idx
          let arr = this.menu[this.fActiveIdx].list;
          for(let i in arr){
            if(arr[i].id == id) {
              idx = i;
              break;
            }
          }
        }
        return idx;
      }
    }
  }
</script>

<style scoped>
  .menu {background: #e2eaf2; border-right: none; box-shadow: 1px 1px 4px #e6e5e7;width:50px;height:100%;transition:width .2s;}
  .menu li:hover{cursor:pointer;}
  .ic-open{display:block;padding:6px 0 5px; text-align:center;border-bottom:1px solid #f5f5f7;background:#e4ebf1;cursor:pointer;}
  .ic-open::before{content:'';display:inline-block;height:18px;width:18px;background:url(../assets/images/ic-menu.png) no-repeat;}
  .ic-open:hover::before{background-position:-30px 0;}

   /* 宽度收拢状态 */
  .first-menu-title{line-height:50px;float:left;padding-left:7px;display:none;}
  .first-menu>li{position:relative;float:left;width:100%;white-space:nowrap;}
  .first-menu .ic-first_menu{float:left;height:50px;width:50px;}
  .first-menu .ic-first_menu::before{content:'';float:left;height:30px;width:30px;background:url(../assets/images/ic-menu.png) no-repeat;margin:15px 0 0 15px;}
  .first-menu .ic-first_menu_1::before{background-position:0 -30px;}
  .first-menu .ic-first_menu_2::before{background-position:0 -60px;}
  .first-menu .ic-first_menu_3::before{background-position:0 -90px;}
  .first-menu .ic-first_menu_4::before{background-position:0 -120px;}
  .first-menu>li:hover{color:#5093e1;}
  .first-menu>li:hover .ic-first_menu::before{background-position-x:-30px;}
  .first-menu>li.active .ic-first_menu::before{background-position-x:-30px;}
  .first-menu>li:hover .second-menu{position:absolute;left:48px;background:#fff;display:block;padding-left:15px;border-radius:4px;}
  .second-menu-title{display:block;padding:5px 0 5px 15px;background:#5093e1;color:#fff;margin:10px 0 0 -15px;}
  .second-menu{width:100px;display:none;padding-bottom:10px;box-shadow:0 2px 4px #bdbcba;}
  .second-menu li{line-height:28px;margin-bottom:1px;color:#606266;}
  .second-menu li::before{content:'';float:left;height:4px;width:4px;background:#606266;margin:12px 10px 0 0;transition:all .3s;}
  .second-menu li:hover,.second-menu li.active{color:#5093e1;}
  .second-menu li:hover::before,.second-menu li.active::before{transform:rotate(135deg);background:#5093e1;}


  /* 宽度展开状态 */
  .menu.open{width:150px;min-width:150px;}
  .menu.open .first-menu>li:hover{color:#5093e1;background:none;}
  .menu.open .first-menu>li:hover .ic-first_menu::before{background-position-x:-30px;}
  .menu.open .first-menu-title{display:block}
  .menu.open .first-menu>li .second-menu{box-shadow:none;}
  .menu.open .first-menu>li:hover .second-menu{display:none;}
  .menu.open .first-menu>li.active .second-menu{position:static;clear:both;display:block;background:none;padding-left:0;width:100%;}
  .menu.open .first-menu>li.active .second-menu>li{color:#757986;padding-left:50px;}
  .menu.open .first-menu>li.active .second-menu>li::before{background:#757986;}
  .menu.open .first-menu>li.active .second-menu>li:hover,.menu.open .first-menu>li.active .second-menu>li.active{color:#fff;background:#5093e1;}
  .menu.open .first-menu>li.active .second-menu>li:hover::before,.menu.open .first-menu>li.active .second-menu>li.active::before{transform:rotate(135deg);background:#fff;}
  .menu.open .second-menu-title{display:none;}
</style>
