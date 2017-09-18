/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';

const axios = require('axios')
const uuid  = require('uuid/v4')
import {
  RECORDER_SAVE,
  RECORDER,
  RECORDER_RECEIVE,
  RECORDER_END,
  RECORDER_INIT,
  RECORDER_MAIN_READY,
  RECORDER_MAIN_ERR
} from 'main/util/types';
import {
  MEET_ADD_RESULT,
  MEET_END_RESULT
} from 'store/types';
import {ipcRenderer} from 'electron';

let host    = config.host
let port    = config.port
let mp3host = config.mp3host
let mp3port = config.mp3port
let appkey  = config.appkey

function EvalSDK(config, store) {
  if (!(this instanceof EvalSDK)) {
    return new EvalSDK(config, store)
  }
  config            = config || {}
  config.sampleRate = config.sampleRate || 16000;
  config.bitRate    = config.bitRate || 32;
  this.channels     = config.channels || 1;
  this.$store       = store
  var _this         = this
  var hasBuf        = false
  var _events       = {}
  
  //判断是否有MP3
  this.hasMp3 = function () {
    return hasBuf
  }
  
  this.emit = function (event, args) {
    event = _events[event]
    if (event) {
      event.forEach(hd => {
        hd(args)
      })
    }
  }
  
  this.on = function (event, handle) {
    event = _events[event]
    if (event) {
      event.push(handle)
    } else {
      _events[event] = [handle]
    }
  }
  
  this.removeListener = function (event, handle) {
    var _event = _events[event]
    if (_event) {
      var idx = _event.indexOf(handle)
      if (idx !== -1) {
        _events.splice(idx, 1)
      } else {
        delete _events[event]
      }
    }
  }
  
  _this.stop = _this.start = function () {
  }
  //保存MP3
  _this.saveMp3      = function (name) {
    if (_this.hasMp3()) {
      ipcRenderer.send(RECORDER, {
        type: RECORDER_SAVE,
        name
      })
    }
  }
  _this.initRecorder = function () {
    navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: "default",
        // deviceId  : "6099b0c21e278ee33fa0a322629aab5cb9d2a394bcb76c98b11c99da14adf6e3",
        // groupId   : "a370f021288d0a86e0294160a5f1e2d93a6ed478025eb6ffba9b4b6683568083",
      }
    })
      .then(function (stream) {
        ipcRenderer.send('recorder', {type: RECORDER_INIT})
        var context    = new AudioContext(),
            mic        = context.createMediaStreamSource(stream),
            processor  = context.createScriptProcessor(4096, _this.channels, 1),
            pcmWorkers = [],
            sessions   = []
        
        processor.onaudioprocess = function (event) {
          //监听音频录制过程
          for (var i = 0; i < _this.channels; i++) {
            if (pcmWorkers[i]) {
              var data = event.inputBuffer.getChannelData(i)
              pcmWorkers[i].postMessage({cmd: 'encode', pcm: data})
            }
          }
        }
        
        //监听音频处理程序
        ipcRenderer.on(RECORDER_MAIN_READY, () => {
          mic.connect(processor);
          processor.connect(context.destination)
          sessions = []
          for (let i = 0; i < _this.channels; i++) {
            sessions[i] = {
              sid    : uuid(),
              num    : 0,
              channel: i,
              end    : 0,
            }
          }
          _this.emit('start')
        })
        ipcRenderer.on(RECORDER_MAIN_ERR, (e, err) => {
          _this.emit('error', err)
        })
        //开始录音
        _this.start = function () {
          if (processor && mic) {
            hasBuf = false
            ipcRenderer.send(RECORDER, {type: RECORDER_INIT, channels: _this.channels})
          }
        }
        //结束录音
        _this.stop  = function () {
          if (processor && mic) {
            mic.disconnect();
            processor.disconnect();
            for (let i = 0; i < _this.channels; i++) {
              if (pcmWorkers[i]) {
                pcmWorkers[i].postMessage({cmd: 'finish'})
              }
            }
          }
          _this.emit('stop')
        }
        
        let _mp3IsReady = [], _init = []
        for (let i = 0; i < _this.channels; i++) {
          var pcmWorker       = new Worker('./js/opus_encoder.js')
          pcmWorkers[i]       = pcmWorker
          pcmWorker.onmessage = function (e) {
            switch (e.data.cmd) {
              case 'flush':
                _this.asr(sessions[i], e.data.buf)
                ipcRenderer.send(RECORDER, {type: RECORDER_RECEIVE, channel: i, buf: e.data.buf})
                break;
              case 'end':
                _this.asr(sessions[i], e.data.buf, true)
                ipcRenderer.send(RECORDER, {type: RECORDER_END, channel: i, buf: e.data.buf})
                hasBuf = true
                _mp3IsReady.push(i)
                if (_mp3IsReady.length === _this.channels) {
                  _this.emit('mp3IsReady')
                }
                break;
              case 'init':
                _init.push(i)
                if (_init.length === _this.channels) {
                  _this.emit('init')
                }
                break;
              case 'error':
                _this.emit('error', {code: -1001, msg: e.data.buf})
                break;
            }
          }
          pcmWorker.postMessage({
            cmd   : 'init',
            config: {
              sampleRate      : config.sampleRate,
              bitRate         : config.bitRate,
              originSampleRate: context.sampleRate,
              flush           : true,
              usePcm          : true
            }
          })
        }
      })
      .catch(function (error) {
        var msg;
        switch (error.code || error.name) {
          case 9:
            msg = {
              code: 1011,
              msg : "无法打开麦克风,请使用https协议. Only secure origins are allowed (see: https://goo.gl/Y0ZkNV)."
            };
            break;
          case 'PermissionDeniedError':
          case 'PERMISSION_DENIED':
          case 'NotAllowedError':
            msg = {code: 1012, msg: "用户拒绝访问麦克风"};
            break;
          case 'NOT_SUPPORTED_ERROR':
          case 'NotSupportedError':
            msg = {code: 1013, msg: "浏览器不支持录音"};
            break;
          case 'MANDATORY_UNSATISFIED_ERROR':
          case 'MandatoryUnsatisfiedError':
            msg = {code: 1014, msg: "找不到麦克风设备"};
            break;
          default:
            msg = {code: 1015, msg: '无法打开麦克风 Error: ' + (error.code || error.name)};
            break;
        }
        _this.emit('error', msg)
      })
  }
  
  _this.on('error', function () {
    _this.stop && _this.stop()
  })
  
  /**
   * 识别
   * @param session  单声道信息
   * @param buf      编码后的音频Uint8Array数组
   * @param end      是否结束
   */
  _this.asr = function (session, buf, end) {
    if (session) {
      let body = null
      if (!end) {
        body = new FormData()
        body.append('voice', new Blob(buf))
        _this.asr.tryTimes = 0
      } else {
        session.end = session.num
      }
      axios.post(`${host}:${port}/asr/pcm`, body, {
        headers: {
          "X-EngineType": "asr.en_US",
          "X-Number"    : !end ? session.num : session.num + '$',
          "session-id"  : session.sid,
          "appkey"      : appkey
        }
      }).then(res => {
        if (res.data && !res.data.errcode) {
          if (!end) {
            res.data.currResult.channel = session.channel
            store.dispatch(MEET_ADD_RESULT, res.data.currResult)
          } else {
            store.dispatch(MEET_END_RESULT, {
              channel: session.channel,
              all    : res.data.allResult
            })
          }
        }
      }).catch(err => {
        console.error(err)
        if (end) {
          if (++_this.asr.tryTimes < 3) {
            console.log(`第${_this.asr.tryTimes}重试...`)
            _this.asr(session, buf, end)
          } else {
            _this.emit('error', '识别失败!')
          }
        }
      })
      !end && session.num++
    }
  }
}

export default EvalSDK