/**
 * @author Created by felix on 17-9-11.
 * @email   307253927@qq.com
 */
'use strict';
import {TRANS_STATUS, TRANS_VOICES} from '../types';

export default {
  state    : {
    voices: [],
    status: 0
  },
  actions  : {},
  getters  : {
    [TRANS_VOICES]: state => state.voices,
    [TRANS_STATUS]: state => state.status
  },
  mutations: {}
}