/**
 * @author Created by felix on 17-9-21.
 * @email   307253927@qq.com
 */
'use strict';

export default {
  SERVICE_CONNECT_ERROR: {
    code: 1000,
    msg : '服务器连接失败!'
  },
  SERVICE_ASR_ERROR    : {code: 1001, msg: "识别失败"},
  
  MIC_PROCTRL_ERROR: {
    code: 1011,
    msg : "无法打开麦克风,请使用https协议. Only secure origins are allowed (see: https://goo.gl/Y0ZkNV)."
  },
  MIC_REFUSE       : {code: 1012, msg: "用户拒绝访问麦克风"},
  MIC_NO_DEVICE    : {code: 1013, msg: "找不到麦克风设备"},
  MIC_OPEN_ERROR   : {code: 1014, msg: '无法打开麦克风'},
  MIC_START_ERROR  : {code: 1015, msg: "启动录音缓存失败"},
  
  ENCODE_ERROR: {code: 1021, msg: "音频编码失败"},
  
  
}