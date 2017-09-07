/**
 * @author Created by felix on 17-9-1.
 * @email   307253927@qq.com
 */
'use strict';
import {
  MEET_IS_RECORD,
  MEET_IS_END,
  MEET_RESET,
  MEET_NAME,
  MEET_START_TIME,
  MEET_TIMER,
  MEET_ADD_RESULT,
  MEET_MOD_RESULT,
  MEET_RESULT,
  MEET_ORIGIN
} from '../types';

const _state = {
  isRecord   : false,
  isEnd      : false,
  meetingName: '',
  startTime  : '',
  timer      : 0,
  resultList : [],
  originList : [],
}
let _timer;

export default {
  state    : {..._state},
  actions  : {
    [MEET_IS_RECORD]({commit, state}, isRecord) {
      commit(MEET_IS_RECORD, isRecord)
      if (isRecord) {
        commit(MEET_START_TIME)
        clearInterval(_timer)
        _timer = setInterval(() => {
          commit(MEET_TIMER, state.timer + 1)
        }, 1000)
      }
    },
    [MEET_IS_END]({commit}, isEnd) {
      commit(MEET_IS_END, isEnd)
    },
    [MEET_RESET]({commit}) {
      clearInterval(_timer)
      commit(MEET_RESET)
    },
    [MEET_NAME]({commit}, name) {
      commit(MEET_NAME, name)
    },
    [MEET_ADD_RESULT]({commit}, res) {
      commit(MEET_ADD_RESULT, res)
    },
  },
  getters  : {
    [MEET_IS_RECORD] : state => state.isRecord,
    [MEET_IS_END]    : state => state.isEnd,
    [MEET_NAME]      : state => state.meetingName,
    [MEET_START_TIME]: state => state.startTime,
    [MEET_TIMER]     : state => state.timer,
    [MEET_RESULT]    : state => state.resultList,
    [MEET_ORIGIN]    : state => state.originList,
  },
  mutations: {
    [MEET_IS_RECORD](state, isRecord) {
      if (isRecord) {
        state.timer = 0
      }
      state.isRecord = isRecord
    },
    [MEET_IS_END](state, end) {
      if (state.isEnd = end) {
        clearInterval(_timer)
      }
    },
    [MEET_RESET](state) {
      Object.assign(state, _state, {meetingName: state.meetingName})
    },
    [MEET_NAME](state, name) {
      state.meetingName = name
    },
    [MEET_START_TIME](state) {
      state.startTime = Date.now()
    },
    [MEET_TIMER](state, timer) {
      state.timer = timer
    },
    [MEET_ADD_RESULT](state, res) {
      state.resultList.push(res)
      state.originList.push(res)
    },
    [MEET_MOD_RESULT]({resultList}, res) {
      for (let i = 0, ret, len = resultList.length; i < len; i++) {
        ret = resultList[i]
        if (ret.sessionId === res.sessionId) {
          return ret.text = res.text
        }
      }
    }
  }
}