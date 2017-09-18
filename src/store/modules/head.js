/**
 * @author Created by felix on 17-8-31.
 * @email   307253927@qq.com
 */
'use strict';
import {HEAD_TYPE, HEAD_CONFIG} from '../types';
import router from 'router'

export default {
  state    : {
    type  : 0,
    config: {
      host   : config.host,
      port   : config.port,
      mp3host: config.mp3host,
      mp3port: config.mp3port,
    }
  },
  actions  : {
    [HEAD_TYPE]({commit}, type) {
      commit(HEAD_TYPE, type)
      router.push(router.options.routes[type].path)
    },
    [HEAD_CONFIG]({commit}, config) {
      commit(HEAD_CONFIG, config)
    }
  },
  getters  : {
    [HEAD_TYPE](state) {
      return state.type
    },
    [HEAD_CONFIG](state) {
      return state.config
    },
  },
  mutations: {
    [HEAD_TYPE](state, type) {
      state.type = type
    },
    [HEAD_CONFIG](state, config) {
      state.config = {...state.config, ...config}
    }
  }
}

