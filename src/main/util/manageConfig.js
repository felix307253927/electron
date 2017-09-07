/**
 * @author Created by felix on 17-9-6.
 * @email   307253927@qq.com
 */
'use strict';

let {app, remote, ipcMain, ipcRenderer} = require('electron')
const {CONFIG}                          = require('./types')
const fs                                = require('fs')
const path                              = require('path')
const ipc                               = ipcMain || ipcRenderer
app                                     = app || remote.app

class MangeConfig {
  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'config.json')
    try {
      this.info = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
    } catch (e) {
      this.info = {
        name   : 'h5_asr',
        version: '0.1.1',
        host   : 'http://enasr.edu.hivoice.cn',
        port   : 5858,
        mp3host: '',
        mp3port: 80,
        appkey : 'qkcwbvgdobduan6mdmhwxde465ekvzgwphh4eiyc'
      }
      this.update({})
    }
    Object.assign(this, this.info)
  }
  
  register() {
    ipc.on(CONFIG, (e, data) => {
      try {
        this.update(data)
        e.sender.send(CONFIG, 'success')
      } catch (err) {
        e.sender.send(CONFIG, 'error')
      }
    })
  }
  
  update(config) {
    if (!config.port) {
      config.port = /^https/.test(config.host) ? 443 : 80
    }
    if (!config.mp3port) {
      config.mp3port = /^https/.test(config.mp3host) ? 443 : 80
    }
    this.info = Object.assign(this.info, config)
    fs.writeFileSync(this.filePath, JSON.stringify(this.info, null, 2))
  }
}

module.exports = MangeConfig