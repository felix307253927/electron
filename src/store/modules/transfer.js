/**
 * @author Created by felix on 17-9-11.
 * @email   307253927@qq.com
 */
'use strict';
import {
  TRANS_STATUS,
  TRANS_VOICES,
  TRANS_ADD_RESULT,
  TRANS_MOD_RESULT,
  TRANS_RESET
} from '../types';

export default {
  state    : {
    voices: [],
    status: 0
  },
  actions  : {
    [TRANS_ADD_RESULT]({commit}, data) {
      commit(TRANS_ADD_RESULT, data)
    },
    [TRANS_MOD_RESULT]({commit}, data) {
      commit(TRANS_MOD_RESULT, data)
    },
    [TRANS_RESET](commit) {
      commit(TRANS_RESET)
    }
  },
  getters  : {
    [TRANS_VOICES]: state => state.voices,
    [TRANS_STATUS]: state => state.status
  },
  mutations: {
    [TRANS_ADD_RESULT]({voices}, {data, channel}) {
      data.hasMod  = false;
      data.oText   = data.text
      data.url     = `${config.mp3host}:${config.mp3port}/WebAudio-1.0-SNAPSHOT/audio/play/${data.sid}/${data.time}/${data.area}`
      data.mp3time = Math.round((data.endTime - data.startTime) / 1000)
      if (voices[channel]) {
        voices[channel].push(data)
      } else {
        voices[channel] = [data]
      }
    },
    [TRANS_MOD_RESULT](_, {target, text}) {
      target.hasMod = true
      target.text   = text
    },
    [TRANS_RESET](state) {
      state.voices = [];
      state.status = 0
    }
  }
}