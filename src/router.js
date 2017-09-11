/**
 * @author Created by felix on 17-9-6.
 * @email   307253927@qq.com
 */
'use strict';

import VueRouter from 'vue-router'
import store from 'store/store';
import Meet from 'views/meet.vue';
import Create from 'views/create.vue';
import Meeting from 'views/meeting.vue';
import Transfer from 'views/transfer.vue';
import History from 'views/history.vue';
import Setting from 'views/setting.vue';
import Help from 'views/help.vue';

function beforeMeet(to, from, next) {
  console.log(to, from)
  if (store.state.meet.meetingName) {
    next('/meet/trans')
  } else {
    next('/meet/create')
  }
}

const routes = [
  {
    path    : '/meet', component: Meet,
    children: [{
      path     : 'create',
      component: Create,
      beforeEnter(to, from, next) {
        if (store.state.meet.meetingName) {
          next('/meet/trans')
        } else {
          next()
        }
      },
    }, {
      path     : 'trans',
      component: Meeting,
      beforeEnter(to, from, next) {
        if (!store.state.meet.meetingName) {
          next('/meet/create')
        } else {
          next()
        }
      },
    }, {
      path: '', redirect: '/meet/create'
    }]
  },
  {path: '/transfer', component: Transfer},
  {path: '/history', component: History},
  {path: '/setting', component: Setting},
  {path: '/help', component: Help},
  {path: '*', redirect: '/meet/create'},
]

export default new VueRouter({
  // mode: 'history',
  mode: 'hash', // default
  base: __dirname,
  routes
})