/**
 * @author Created by felix on 17-8-31.
 * @email   307253927@qq.com
 */
'use strict';
import {HEAD_TYPE} from '../types';
import router from 'router'

export default {
  state    : {type: 0},
  actions  : {
    [HEAD_TYPE]({commit}, type) {
      commit(HEAD_TYPE, type)
      router.push(router.options.routes[type].path)
    }
  },
  getters  : {
    [HEAD_TYPE](state) {
      return state.type
    }
  },
  mutations: {
    [HEAD_TYPE](state, type) {
      state.type = type
    }
  }
}

