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
  MEET_END_RESULT,
  MEET_MEMBERS
} from '../types';

const _state = {
  isRecord   : false,
  isEnd      : false,
  meetingName: '',
  startTime  : '',
  timer      : 0,
  resultList : [{text: 'hello', oText: '你好'}],
  members    : []
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
    [MEET_MEMBERS]({commit}, members) {
      commit(MEET_MEMBERS, members)
    },
    [MEET_ADD_RESULT]({commit}, res) {
      commit(MEET_ADD_RESULT, res || {})
    },
    [MEET_MOD_RESULT]({commit}, payload) {
      commit(MEET_MOD_RESULT, payload || {})
    },
    [MEET_END_RESULT]({commit}, payload) {
      commit(MEET_END_RESULT, payload)
    }
  },
  getters  : {
    [MEET_IS_RECORD] : state => state.isRecord,
    [MEET_IS_END]    : state => state.isEnd,
    [MEET_NAME]      : state => state.meetingName,
    [MEET_START_TIME]: state => state.startTime,
    [MEET_TIMER]     : state => state.timer,
    [MEET_RESULT]    : state => state.resultList,
    [MEET_MEMBERS]   : state => state.members,
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
    [MEET_MEMBERS](state, members) {
      state.members = members
    },
    [MEET_ADD_RESULT]({resultList}, res) {
      res.hasMod = false
      res.oText  = res.text
      resultList.push(res)
      resultList.sort((a, b) => a.number - b.number)
    },
    [MEET_END_RESULT]({resultList}, payload) {
      if (payload && payload.all) {
        payload.all.forEach((res, i) => {
          let ret = resultList[i]
          if (ret) {
            ret.channel = payload.channel
            ret.oText   = res.text
            if (!ret.hasMod) {
              ret.text = res.text
            }
          } else {
            res.hasMod    = false
            res.oText     = res.text
            res.channel   = payload.channel
            resultList[i] = res
          }
        })
      }
      resultList.sort((a, b) => a.number - b.number)
    },
    [MEET_MOD_RESULT](_, payload) {
      payload.target.hasMod = true
      payload.target.text   = payload.text
    }
  }
}