/**
 * @author Created by felix on 17-8-30.
 * @email   307253927@qq.com
 */
'use strict';

import Vue from 'vue';
import Head from 'views/components/head.vue';
import EvalSDK from 'js/EvalSDK';
import store from 'store/store';
import router from 'router';
import {HEAD_TYPE} from 'store/types';
import 'js/filter';
import 'scss/style.scss'

//加载SDK
Vue.use(function (Vue) {
  Vue.prototype.$sdk = new EvalSDK({
    channels: 2
  }, store)
})

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
  }
})

