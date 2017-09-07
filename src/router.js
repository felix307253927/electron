/**
 * @author Created by felix on 17-9-6.
 * @email   307253927@qq.com
 */
'use strict';

import VueRouter from 'vue-router'
import Meet from 'views/meeting.vue';
import Transfer from 'views/transfer.vue';
import History from 'views/history.vue';
import Setting from 'views/setting.vue';
import Help from 'views/help.vue';

const routes = [
  {path: '/meet', component: Meet},
  {path: '/transfer', component: Transfer},
  {path: '/history', component: History},
  {path: '/setting', component: Setting},
  {path: '/help', component: Help},
  {path: '*', redirect: '/meet'},
]

export default new VueRouter({
  // mode: 'history',
  mode: 'hash', // default
  base: __dirname,
  routes
})