/**
 * @author Created by felix on 17-8-30.
 * @email   307253927@qq.com
 */
'use strict';
const {Transform}            = require('stream')
const {app, ipcMain, dialog} = require('electron')
const fs                     = require('fs')
const path                   = require('path')
const {Encoder, Decoder}     = require('lame')
const {
        RECORDER_SAVE,
        RECORDER,
        RECORDER_RECEIVE,
        RECORDER_END,
        RECORDER_INIT,
        RECORDER_MAIN_ERR,
        RECORDER_MAIN_READY,
        TRANS_VOICE,
        TRANS_PCM
      }                      = require('../util/types')

class Pcm2Buf extends Transform {
  constructor(options) {
    super(options)
  }
  
  _transform(chunk, enc, next) {
    this.push(Buffer.from(chunk.buffer))
    next()
  }
  
  _flush(cb) {
    cb()
  }
}

class Mp32Pcm extends Transform {
  constructor(opt) {
    super(opt)
    this.sender  = opt.sender
    this.mp3name = opt.mp3name
    this.on('finish', () => {
      setTimeout(() => {
        this.sender.send(TRANS_PCM, {
          name : this.mp3name,
          chunk: new Uint8Array(),
          end  : true
        })
      }, 300)
    })
  }
  
  _transform(chunk, enc, next) {
    this.push(chunk)
    next()
  }
  
  _write(chunk, encoding, callback) {
    setTimeout(() => {
      this.sender.send(TRANS_PCM, {
        name: this.mp3name,
        chunk
      })
      callback()
    }, chunk.length / 128)
  }
  
}

function autoZero(num) {
  return num < 10 ? '0' + num : '' + num
}

class SaveVoice {
  constructor(win) {
    this.win     = win
    this.streams = []
    this.register()
  }
  
  createStream(channels, e) {
    for (let i = 0; i < channels; i++) {
      let stream = fs.createWriteStream(path.join(app.getPath('temp'), `temp_${i}.pcm`))
      stream.on('error', (err) => {
        e.sender.send(RECORDER_MAIN_ERR, err)
      })
      stream.on('finish', () => {
        stream.isEnd = true
      })
      this.streams[i] = {stream, buf: []}
    }
  }
  
  register() {
    ipcMain.on(RECORDER, (e, data) => {
      switch (data.type) {
        case RECORDER_RECEIVE:
          this.write(data.buf, data.channel)
          break;
        case RECORDER_INIT:
          this.streams = []
          this.createStream(data.channels, e)
          e.sender.send(RECORDER_MAIN_READY)
          break;
        case RECORDER_END:
          this.write(data.buf, data.channel, (stream) => {
            stream.end()
          })
          break;
        case RECORDER_SAVE:
          this.save(data.name)
      }
    })
    ipcMain.on(TRANS_VOICE, (e, data) => {
      if (data.data) {
        data.data.forEach(p => {
          fs.createReadStream(p)
            .pipe(new Decoder())
            .pipe(new Mp32Pcm({
              sender : e.sender,
              mp3name: path.basename(p)
            }))
          // .pipe(fs.createWriteStream('/home/felix/音乐/asr/test_201709111421_0_.pcm'))
        })
      }
    })
  }
  
  save(name) {
    let d = new Date()
    name += `_${d.getFullYear()}${autoZero(d.getMonth() + 1)}${autoZero(d.getDate())}${autoZero(d.getHours())}${autoZero(d.getMinutes())}`
    dialog.showSaveDialog(this.win, {
      title      : "保存音频",
      defaultPath: path.join(recentlyUsedPath, name + '.mp3'),
      filters    : [{
        name: "music", extensions: ['mp3']
      }]
    }, (filename) => {
      if (filename) {
        global.recentlyUsedPath = path.dirname(filename)
        for (let i = 0, len = this.streams.length; i < len; i++) {
          if (this.streams[i]) {
            let pcmStream = fs.createReadStream(path.join(app.getPath('temp'), `temp_${i}.pcm`))
            let mp3Stream = fs.createWriteStream(filename.replace(/\.(mp3|MP3|Mp3|mP3)$/, `_${i}.mp3`))
            pcmStream.pipe(new Pcm2Buf()).pipe(new Encoder({
              channels  : 1,
              bitDepth  : 16,
              sampleRate: 16000,
            })).pipe(mp3Stream)
          }
        }
      }
    })
  }
  
  write(arr, channel, cb) {
    let {stream, buf} = this.streams[channel]
    if (!stream.isEnd) {
      buf.push.apply(buf, arr)
      arr     = buf
      let len = arr.length, ok = true, i = 0
      while (ok && i < len) {
        ok = stream.write(arr.shift())
        i++
      }
      if (!ok && i < len) {
        stream.once('drain', () => {
          this.write([], channel)
        })
        return
      }
    }
    cb && cb(stream)
  }
}

module.exports = SaveVoice