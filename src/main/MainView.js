/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';
const {BrowserWindow, ipcMain} = require('electron')
const path                     = require('path')
const SaveVoice                = require('./voice/dealVoice')
const Meeting                  = require('./meet/meeting')

class MainView {
  constructor() {
    this.init()
  }
  
  init() {
    this.win = new BrowserWindow({
      minWidth      : 1024,
      minHeight     : 600,
      center        : true,
      resizable     : true,
      title         : config.name,
      icon          : path.join(__dirname, '../resources/icon/icon.png'),
      webPreferences: {
        javascript     : true,
        plugins        : true,
        nodeIntegration: true,
        webSecurity    : false,
        preload        : path.join(__dirname, '../preload.js')
      }
    })
    this.win.loadURL(`file://${path.join(__dirname, '../index.html')}`)
    this.win.on('close', (e) => {
      if (this.win.isVisible()) {
        e.preventDefault()
        this.win.hide()
      }
    })
    new SaveVoice(this.win)
    new Meeting(this.win)
  }
  
  show() {
    this.win.show()
  }
  
  hide() {
    this.win.hide()
  }
  
  
}

module.exports = MainView