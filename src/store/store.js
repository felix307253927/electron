/**
 * @author Created by felix on 17-8-31.
 * @email   307253927@qq.com
 */
'use strict';
import Vuex from 'vuex';
import head from './modules/head';
import meet from './modules/meet';
import mic from './modules/mic';
import trans from './modules/transfer';

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state  : {},
  modules: {
    head,
    meet,
    mic,
    trans
  },
  strict : debug,
})