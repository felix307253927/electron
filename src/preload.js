/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';
const Config   = require('./main/util/manageConfig')
const config   = new Config().info

if (typeof window !== 'undefined') {
  window.config = config
}