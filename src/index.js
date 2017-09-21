/**
 * @author Created by felix on 17-8-30.
 * @email   307253927@qq.com
 */
'use strict';
import {ipcRenderer} from 'electron';
import Vue from 'vue';
import Head from 'views/components/head.vue';
import store from 'store/store';
import router from 'router';
import {HEAD_TYPE} from 'store/types';
import 'js/filter';
import 'scss/style.scss'

function useNativeNotification() {
  if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      console.log('Notification permission is', permission)
    });
  }
}

//初始化 vuex 路由信息
router.onReady((r) => {
  let routes = router.options.routes
  for (let i = 0, len = routes.length; i < len; i++) {
    if (r.path === routes[i].path) {
      return store.dispatch(HEAD_TYPE, i)
    }
  }
})

new Vue({
  el        : "#app",
  store,
  router,
  template  : `
<div class="container">
  <Head></Head>
  <router-view class="container-view"></router-view>
</div>
  `,
  components: {
    Head
  },
  mounted() {
    ipcRenderer.send('app-render')
    // useNativeNotification()
  }
})

