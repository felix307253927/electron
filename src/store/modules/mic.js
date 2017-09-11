/**
 * @author Created by felix on 17-9-7.
 * @email   307253927@qq.com
 */
'use strict';
import {MIC_FORM, MIC_ADD, MIC_DEL, MIC_MOD, MIC_NAME} from '../types'

export default {
  state    : {
    micForm: {
      name: '',
      mics: [{name: ''}]
    }
  },
  actions  : {
    [MIC_FORM]({commit}, form) {
      commit(MIC_FORM, form)
    },
    [MIC_NAME]({commit}, name) {
      commit(MIC_NAME, name)
    },
    [MIC_ADD]({commit}, mic) {
      commit(MIC_ADD, mic)
    },
    [MIC_DEL]({commit}, mic) {
      commit(MIC_DEL, mic)
    },
    [MIC_MOD]({commit}, payload) {
      commit(MIC_MOD, payload)
    }
  },
  getters  : {
    [MIC_FORM]: state => state.micForm
  },
  mutations: {
    [MIC_FORM](state, from) {
      state.micForm = from
    },
    [MIC_NAME](state, name) {
      state.micForm.name = name
    },
    [MIC_ADD](state, mic = {name: ''}) {
      if (state.micForm.mics.length < 32) {
        state.micForm.mics.push(mic)
      }
    },
    [MIC_DEL](state, mic) {
      if (state.micForm.mics.length > 1) {
        let mics = state.micForm.mics, idx = mics.indexOf(mic)
        idx > -1 && mics.splice(idx, 1)
      }
    },
    [MIC_MOD](_, payload) {
      payload.mic.name = payload.name
    }
  }
}