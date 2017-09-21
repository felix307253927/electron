/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';

const axios       = require('axios')
const CancelToken = axios.CancelToken
const uuid        = require('uuid/v4')
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
  MEET_END_RESULT,
} from 'store/types';
import err from 'js/errmsg';
import {ipcRenderer} from 'electron';

let appkey = config.appkey

function EvalSDK(conf, store) {
  if (!(this instanceof EvalSDK)) {
    return new EvalSDK(conf, store)
  }
  conf            = conf || {}
  conf.sampleRate = conf.sampleRate || 16000;
  conf.bitRate    = conf.bitRate || 32;
  this.channels   = conf.channels || 1;
  this.$store     = store
  var _this       = this
  var hasBuf      = false
  var _events     = {}
  
  //判断是否有MP3
  this.hasMp3 = function () {
    return hasBuf
  }
  
  this.emit = function (event, args) {
    var _event = _events[event]
    if (_event) {
      for (var i = 0, len = _event.length; i < len; i++) {
        var hd = _event[i];
        hd(args)
        if (hd._destroy) {
          len--
          _event.splice(i--, 1)
          if (!_event.length) {
            delete _events[event]
          }
        }
      }
    }
  }
  
  this.on = function (event, handle, destroy) {
    var _event      = _events[event]
    handle._destroy = destroy
    if (_event) {
      _event.push(handle)
    } else {
      _events[event] = [handle]
    }
  }
  
  this.once = function (event, handle) {
    this.on(event, handle, true)
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
          for (let i = 0; i < _this.channels; i++) {
            if (pcmWorkers[i]) {
              pcmWorkers[i].postMessage({cmd: 'encode', pcm: event.inputBuffer.getChannelData(i)})
            }
          }
        }
        
        //监听音频处理程序
        ipcRenderer.on(RECORDER_MAIN_READY, () => {
          mic.connect(processor);
          processor.connect(context.destination)
          sessions.forEach(s => {
            s.endTimer && clearTimeout(s.endTimer)
            s._cancel && s._cancel('cancel')
          })
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
        ipcRenderer.on(RECORDER_MAIN_ERR, (e, error) => {
          _this.emit('error', err.MIC_START_ERROR)
        })
        //开始录音
        _this.start = function () {
          if (processor && mic) {
            hasBuf = false
            ipcRenderer.send(RECORDER, {type: RECORDER_INIT, channels: _this.channels})
          }
        }
        //结束录音
        _this.stop  = function (error) {
          if (processor && mic) {
            mic.disconnect();
            processor.disconnect();
            if (!error) {
              for (let i = 0; i < _this.channels; i++) {
                if (pcmWorkers[i]) {
                  pcmWorkers[i].postMessage({cmd: 'finish'})
                }
              }
            }
          }
          _this.emit('stop')
        }
        
        let _mp3IsReady = [], _init = []
        let flush       = (buf, i) => {
          let session = sessions[i]
          _this.asr(session, buf).then(data => {
            if (data) {
              data.currResult.channel = session.channel
              store.dispatch(MEET_ADD_RESULT, data.currResult)
            }
          })
          ipcRenderer.send(RECORDER, {type: RECORDER_RECEIVE, channel: i, buf})
        }
        for (let i = 0; i < _this.channels; i++) {
          let pcmWorker       = new Worker('./js/opus_encoder.js')
          pcmWorkers[i]       = pcmWorker
          pcmWorker.onmessage = function (e) {
            switch (e.data.cmd) {
              case 'flush':
                flush(e.data.buf, i)
                break;
              case 'end':
                flush(e.data.buf, i)
                sessions[i].endTimer = setTimeout(() => {
                  _this.asr(sessions[i], [], true).then(data => {
                    store.dispatch(MEET_END_RESULT, {
                      channel: sessions[i].channel,
                      all    : data ? data.allResult : null
                    })
                  })
                }, 300)
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
                console.error(e.data.buf)
                _this.emit('error', err.ENCODE_ERROR)
                break;
            }
          }
          pcmWorker.postMessage({
            cmd   : 'init',
            config: {
              sampleRate      : conf.sampleRate,
              bitRate         : conf.bitRate,
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
            msg = err.MIC_PROCTRL_ERROR;
            break;
          case 'PermissionDeniedError':
          case 'PERMISSION_DENIED':
          case 'NotAllowedError':
            msg = err.MIC_REFUSE;
            break;
          case 'MANDATORY_UNSATISFIED_ERROR':
          case 'MandatoryUnsatisfiedError':
            msg = err.MIC_NO_DEVICE;
            break;
          case 'NOT_SUPPORTED_ERROR':
          case 'NotSupportedError':
          default:
            msg = err.MIC_OPEN_ERROR
            break;
        }
        _this.emit('error', msg)
      })
  }
  
  _this.on('error', function (error) {
    _this.stop(error)
  })
  
  /**
   * 识别
   * @param session  单声道信息
   * @param buf      编码后的音频Uint8Array数组
   * @param end      是否结束
   */
  _this.asr = function (session, buf, end) {
    let body = null, cfg = {
      headers: {
        "X-EngineType": "asr.en_US",
        "X-Number"    : !end ? session.num : session.num + '$',
        "session-id"  : session.sid,
        "appkey"      : appkey
      }
    }
    if (!end) {
      body = new FormData()
      body.append('voice', new Blob(buf))
      session.tryTimes = 0
      session._cancel  = null
    } else {
      session.end     = session.num
      cfg.cancelToken = new CancelToken((cancel) => {
        session._cancel = cancel
      })
    }
    let ajax = axios.post(`${config.host}:${config.port}/asr/pcm`, body, cfg).then(res => {
      if (res.data && !res.data.errcode) {
        return res.data
      }
    }).catch(error => {
      console.error(error)
      if (error.message === 'cancel') {
        console.log('http is cancel')
      } else if (!error.status || error.status === 500) {
        _this.emit('error', err.SERVICE_CONNECT_ERROR)
      } else if (end) {
        if (++session.tryTimes < 3) {
          console.log(`第${session.tryTimes}重试...`)
          _this.asr(session, buf, end)
        } else {
          _this.emit('error', err.SERVICE_ASR_ERROR)
        }
      }
    })
    !end && session.num++
    return ajax
  }
}

export default EvalSDK