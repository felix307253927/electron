/**
 * Created by Zhongyi on 5/1/16.
 */
'use strict';

const path            = require('path');
const {BrowserWindow} = require('electron');

class SplashWindow {
  constructor() {
    this.splashWindow = new BrowserWindow({
      width          : 380,
      height         : 125,
      title          : "unisound",
      resizable      : false,
      center         : true,
      show           : true,
      frame          : false,
      autoHideMenuBar: true,
      alwaysOnTop    : true,
      icon           : '../resources/icon.png',
      titleBarStyle  : 'hidden',
    });
    
    this.splashWindow.loadURL('file://' + path.join(__dirname, '../splash.html'));
  }
  
  show() {
    this.splashWindow.show();
  }
  
  hide() {
    this.splashWindow.hide();
  }
}

module.exports = SplashWindow;
