/**
 * @author Created by felix on 17-9-5.
 * @email   307253927@qq.com
 */
'use strict';

import Vue from 'vue';

Vue.filter('date', (value, fmt) => {
  if (!value) {
    return '--:--:--'
  }
  let d    = value instanceof Date ? value : new Date(value)
  let o    = {
    "M+": d.getMonth() + 1, //月份
    "d+": d.getDate(), //日
    "h+": d.getHours() % 12 === 0 ? 12 : d.getHours() % 12, //小时
    "H+": d.getHours(), //小时
    "m+": d.getMinutes(), //分
    "s+": d.getSeconds(), //秒
    "q+": Math.floor((d.getMonth() + 3) / 3), //季度
    "S" : d.getMilliseconds() //毫秒
  };
  var week = {
    "0": "/u65e5",
    "1": "/u4e00",
    "2": "/u4e8c",
    "3": "/u4e09",
    "4": "/u56db",
    "5": "/u4e94",
    "6": "/u516d"
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[d.getDay() + ""]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
})

/**
 * value 单位 秒
 * type  1秒  2分  3时
 */
Vue.filter('time', (value = 0, type = 2) => {
  let s = ''
  if (type > 2) {
    if (value > 3600) {
      s += ((value / 3600) >> 0) + ':'
      value = value % 3600
    } else {
      s += '00:'
    }
  }
  if (type > 1) {
    if (value > 60) {
      let m = (value / 60) >> 0
      s += ((m > 9 ? m : ('0' + m))) + ':'
      value = value % 60
    } else {
      s += '00:'
    }
  }
  s += (value > 9 ? value : ('0' + value))
  return s
})

/**
 * 获取音频url
 * value 服务器返回的sessionId
 */
Vue.filter('mp3url', (value) => {
  if (value) {
    let [area, time, sid] = value.split(':')
    return `http://${Vue.mp3host}:${Vue.mp3port}/WebAudio-1.0-SNAPSHOT/audio/play/${sid}/${time}/${area}`
  }
  return ''
})