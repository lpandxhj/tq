<!-- 预演/监测页 视频、信号机查看 -->
<template>
  <div class="layers-device slide-left" :class="{active: isShow}">
    <!-- 显示视频（可进行预置位切换）、信号机相位 -->
    <div class="device-preview">
      <!-- 视频（当前视频、下一视频） -->
      <ul class="device-video clrfix" v-show="deviceVideoShow">
        <li v-for="(item, idx) in videoList" :key="idx+'_video_'+item.deviceId">
           <!-- 标题 -->
           <h2 class="flex-wrap">
             <span class="flex-item ellipsis" :title="item.deviceName || '暂无视频'">{{item.deviceName || '暂无视频'}}</span>
             <!-- 关闭、巡检等操作放在第一个视频右上角 -->
             <template v-if="idx == 0">
               <i class="ic2 ic-more-active" title="设备巡检（功能暂缓）"></i>
               <i class="ic-close-active" title="关闭" @click="deviceVideoShow = false"></i>
             </template>
           </h2>

           <!-- 视频信息 -->
          <template>
           <div class="video-resource">
             <iframe v-if="item.deviceName || item.deviceId" :src="setDeviceUrl(item.manageId, 'video')" frameborder="0" scrolling="no"  border="0"></iframe>
           </div>
         </template>
        </li>
      </ul>

      <!-- 信号机（前四个信号机、后四个信号机） -->
      <div class="box-shadow device-sign" :class="{mt:deviceVideoShow}" v-show="deviceSignShow">
        <!-- 标题 -->
        <h2 class="primary-title clrfix">
          信号机
          <i class="fr ic-close" title="关闭" @click="deviceSignShow = false"></i>
          <i class="fr ic2 ic-more" title="设备巡检（功能暂缓）"></i>
          <i class="fr ic2 btn-page-change" :class="{active:isDefaultPage}" :title="isDefaultPage ? '后翻页' : '前翻页'"
             @click="isDefaultPage = !isDefaultPage"></i>
        </h2>

        <div class="device-sign-container">
          <ul class="device-sign-list clrfix" :class="{active: !isDefaultPage}">
            <!-- 信号机信息 -->
            <li v-for="(item, idx) in signList" :key="idx+'_sign_'+item.deviceId">
              <template v-if="item.deviceName || item.deviceId">
                <div class="sign-resource">
                  <iframe :src="setDeviceUrl(item.manageId, 'sign')" frameborder="0" scrolling="no"  border="0"></iframe>
                </div>
                <div class="sign-info">
                  <p class="ellipsis sign-name" :title="item.deviceName">{{item.deviceName}}</p>
                  <!--<p class="sign-direct">东西直行<i class="ic2 btn-lock-disabled btn-lock"></i></p>-->
                  <p class="sign-direct"><i class="ic2 btn-lock-disabled btn-lock"></i></p>
                </div>
              </template>

              <template v-else>
                <div class="sign-resource"></div>
                <div class="sign-info">暂无信号控制</div>
              </template>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <!-- 控制视频、信号机是否收起的按钮 -->
    <p class="btn-preview">
      <i v-show="!deviceVideoShow" class="ic2 btn-preview-video" title="视频查看" @click="deviceVideoShow = true"></i>
      <i v-show="!deviceSignShow" class="ic2 btn-preview-sign" title="信号机查看" @click="deviceSignShow = true"></i>
    </p>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  export default {
    props: [
      'isShow',
      'serverPush_videoList',
      'serverPush_signList'
    ],
    data() {
      return {
        videoList: [],
        signList: [],
        deviceVideoShow: true,                          // 是否显示视频
        deviceSignShow: true,                           // 是否显示信号机
        isDefaultPage: true,                            // 当前信号机页是否是默认页（第一页）
      }
    },
    computed: {
      ...mapState([
        'routeId',
      ]),
    },
    watch: {
      routeId() {
        /**
         * 线路改变
         */
        if(this.routeId){
           this.deviceVideoShow = true;
           this.deviceSignShow = true;
        }
      },
      serverPush_videoList: {
        /**
         * 视频推送结果
         */
        handler() {
          this.videoList = this.serverPush_videoList;
        },
        immediate: true
      },
      serverPush_signList: {
        /**
         * 信号机推送结果
         */
        handler() {
          this.signList = this.serverPush_signList;
        },
        immediate: true
      }
    },
    methods: {
      setDeviceUrl(manageId, type='video') {
        /**
         * 拼接引入外部页面src（分视频、信号机类型）
         * @manageId {String} : 设备id(视频是manageId, 信号机是SSID，目前在缓冲绑定时均赋值给别名为manageId的字段上了)
         * @type {String}     : 设备类型 video or sign（default:video）
         */
        const videoUrl = `${config.video_URL}/videoBox.htm?videoid=${manageId}&noctrl=1`;
        const signUrl = `${config.sign_URL}/smallplay.html?id=${manageId}`;
        let deviceUrl = type == 'video' ? videoUrl : signUrl;
        return deviceUrl;
      },
    }
  }
</script>

<style scoped>
  .layers-device{top:10px;bottom:0;width:300px;color:#727d86;}
  .ic-close, .ic-close-active{display:inline-block;height:20px;width:20px;}
  .ic-close-active{display:inline-block;height:24px;}
  .ic-more-active::before{margin-top:3px;}
  .ic-close:hover, .ic-close-active:hover, .ic-more:hover, ic-more-active:hover{cursor:pointer;}
  .btn-preview{margin:10px 10px 0 0;float:right;}
  .btn-preview .ic2{display:block;height:40px;width:40px;border-radius:4px;background:#aab5c2;cursor:pointer;margin-bottom:15px;box-shadow:3px 5px 12px #b6b9bb}
  .btn-preview .ic2:hover{background:#5093e1;}
  .btn-preview .ic2::before{float:left;margin:10px 0 0 10px;}
  .btn-preview-video::before{background-position:-160px 0;}
  .btn-preview-sign::before{background-position:-180px 0;}

  /* 视频 */
  .device-video li{height:160px;margin-bottom:5px;float:left;width:100%;position:relative;}
  .device-video li:last-child{margin-bottom:0;}
  .device-video h2{display:flex;height:24px;line-height:24px;color:#fff;padding:0 10px;font-weight:normal;position:absolute;top:0;left:0;right:0;z-index:1;}
  .device-video h2::before{content:'';position:absolute;display:block;top:0;left:0;right:0;bottom:0;background:#96a5b3;opacity:.7;z-index:-1;}
  .device-video h2 i{position:relative;z-index:1;line-height:inherit;width:20px;height:24px;}
  .device-video .video-resource{width:300px;height:160px;position:relative;z-index:0;background:url(../../assets/images/bg-video.png) no-repeat;background-size:100% 100%;}
  .device-video .video-resource iframe{width:300px;height:160px;}

  /* 信号机 */
  .device-sign{width:100%;margin-bottom:0;}
  .device-sign.mt{margin-top:6px;}
  .device-sign .primary-title{margin-bottom:8px;}
  i.btn-page-change:before{background-position:-240px -20px;transition:all .2s;}
  i.btn-page-change.active:before{background-position:-240px 0;}
  .device-sign-container{height:439px;overflow:hidden;}
  .device-sign-list{counter-reset: signCounter;position:relative;top:0;transition:top .4s;}
  .device-sign-list.active{top:-440px;}
  .device-sign-list li{border:1px solid #e8ebed;height:100px;background:#fff;border-radius:4px;margin-top:10px;float:left;width:100%;box-sizing:border-box;position:relative;}
  .device-sign-list li:first-child{margin-top:0;}
  .device-sign-list li::before{content:'';position:absolute;right:0;top:0;display:block;height:18px;line-height:18px;width:18px;text-align:center;border-radius:0 4px 0 0;background:#f4f4f4;counter-increment: signCounter;  content: counter(signCounter); color: #9aa0a6;}
  .device-sign-list .sign-resource{float:left;height:100px;width:100px;border-radius:4px;background:#f4f4f4;}
  .device-sign-list .sign-resource iframe{height:100px;width:100px;border-radius:4px;}
  .device-sign-list .sign-info{margin:10px 10px 10px 110px;}
  .device-sign-list .sign-name{color:#465461;}
  .device-sign-list .sign-name:hover{cursor:default;color:#5093e1;}
  .device-sign-list .sign-direct{color:#727d86;}
  .device-sign-list .ic2{position:relative;top:5px;}
  .device-sign-list .btn-lock:hover{cursor:pointer;}
  .device-sign-list .btn-lock::before{background-position:-200px -20px;}
  .device-sign-list .btn-lock-disabled::before{background-position:-200px 0;}

</style>
<style>
</style>

