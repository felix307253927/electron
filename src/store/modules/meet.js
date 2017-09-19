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

function sortResult(list) {
  return list.sort((a, b) => {
    if (a.number === b.number) {
      return a.channel - b.channel
    } else {
      return a.number - b.number
    }
  })
}

const _state = {
  isRecord   : false,
  isEnd      : false,
  meetingName: '',
  startTime  : '',
  timer      : 0,
}
let _timer;

export default {
  state    : {
    ..._state,
    resultList: [],
    channels  : [],
    members   : []
  },
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
      Object.assign(state, _state, {
        meetingName: state.meetingName,
        resultList : [],
        channels   : [],
        members    : []
      })
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
    [MEET_ADD_RESULT]({resultList, channels = {}}, res) {
      res.hasMod  = false
      res.oText   = res.text
      res.url     = `${config.mp3host}:${config.mp3port}/WebAudio-1.0-SNAPSHOT/audio/play/${res.sid}/${res.time}/${res.area}`
      res.mp3time = Math.round((res.endTime - res.startTime) / 1000)
      let ch;
      if (ch = channels[res.channel]) {
        // 去重
        if (!ch[res.number] || ch[res.number].number !== res.number) {
          resultList.push(res)
          ch.push(res)
        }
      } else {
        channels[res.channel] = [res]
      }
      sortResult(resultList)
    },
    [MEET_END_RESULT](state, payload) {
      if (payload && payload.all) {
        let resultList = state.channels[payload.channel] || (state.channels[payload.channel] = [])
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
            res.url       = `${config.mp3host}:${config.mp3port}/WebAudio-1.0-SNAPSHOT/audio/play/${res.sid}/${res.time}/${res.area}`
            res.mp3time   = Math.round((res.endTime - res.startTime) / 1000)
            resultList[i] = res
          }
        })
        let list = []
        state.channels.forEach(r => {
          if (r) {
            list.push.apply(list, r)
          }
        })
        sortResult(list);
        state.resultList = list;
      }
    },
    [MEET_MOD_RESULT](_, {target, text}) {
      target.hasMod = true
      target.text   = text
    }
  }
}