/**
 * @author Created by felix on 17-8-31.
 * @email   307253927@qq.com
 */
'use strict';
import Vuex from 'vuex';
import head from './modules/head';
import meet from './modules/meet';

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state  : {},
  modules: {
    head,
    meet
  },
  strict : debug,
})