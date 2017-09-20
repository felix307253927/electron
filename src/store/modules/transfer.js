/**
 * @author Created by felix on 17-9-11.
 * @email   307253927@qq.com
 */
'use strict';
import Vue from 'vue';
import {
  TRANS_STATUS,
  TRANS_VOICES,
  TRANS_ADD_RESULT,
  TRANS_MOD_RESULT,
  TRANS_END_RESULT,
  TRANS_RESET
} from '../types';
import {sortResult} from 'js/utils';

export default {
  state    : {
    voices: {},
    status: 0
  },
  actions  : {
    [TRANS_ADD_RESULT]({commit}, data) {
      commit(TRANS_ADD_RESULT, data)
    },
    [TRANS_MOD_RESULT]({commit}, data) {
      commit(TRANS_MOD_RESULT, data)
    },
    [TRANS_RESET]({commit}) {
      commit(TRANS_RESET)
    },
    [TRANS_STATUS]({commit}, status) {
      commit(TRANS_STATUS, status)
    },
    [TRANS_END_RESULT]({commit}, data) {
      commit(TRANS_END_RESULT, data)
    }
  },
  getters  : {
    [TRANS_VOICES]: state => state.voices,
    [TRANS_STATUS]: state => state.status
  },
  mutations: {
    [TRANS_ADD_RESULT]({voices}, {data, channel}) {
      if (data) {
        data.hasMod  = false;
        data.oText   = data.text
        data.url     = `${config.mp3host}:${config.mp3port}/WebAudio-1.0-SNAPSHOT/audio/play/${data.sid}/${data.time}/${data.area}`
        data.mp3time = Math.round((data.endTime - data.startTime) / 1000)
        let ch;
        if (ch = voices[channel]) {
          ch.push(data)
          sortResult(ch)
        } else {
          Vue.set(voices, channel, (ch = [data]))
          Vue.set(ch, 'asr', true)
        }
      } else {
        let ch;
        Vue.set(voices, channel, (ch = []))
        Vue.set(ch, 'asr', true)
      }
    },
    [TRANS_MOD_RESULT](_, {target, text}) {
      target.hasMod = true
      target.text   = text
    },
    [TRANS_RESET](state) {
      state.voices = {};
      state.status = 0
    },
    [TRANS_STATUS](state, status) {
      state.status = status
    },
    [TRANS_END_RESULT]({voices}, {all, channel}) {
      if (all) {
        let ch = voices[channel];
        if (!ch) {
          Vue.set(voices, channel, (ch = []));
        }
        all.forEach((res, i) => {
          let ret = ch[i]
          if (ret) {
            ret.channel = channel
            ret.oText   = res.text
            if (!ret.hasMod) {
              ret.text = res.text
            }
          } else {
            res.hasMod  = false
            res.oText   = res.text
            res.channel = channel
            res.url     = `${config.mp3host}:${config.mp3port}/WebAudio-1.0-SNAPSHOT/audio/play/${res.sid}/${res.time}/${res.area}`
            res.mp3time = Math.round((res.endTime - res.startTime) / 1000)
            ch.push(res)
          }
        })
        sortResult(ch)
      }
      voices[channel] && Vue.set(voices[channel], 'asr', false)
    }
  }
}