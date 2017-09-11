/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';

const {app}    = require('electron')
const MainView = require('./MainView')
const AppTray  = require('./AppTray')
const Config   = require('./util/manageConfig')

global.recentlyUsedPath = app.getPath('documents')

class App {
  constructor() {
    this.initApp()
  }
  
  initApp() {
    app.on('ready', () => {
      let cf        = new Config()
      global.config = cf.info
      this.main     = new MainView(this.main)
      this.tray     = new AppTray(this.main)
      cf.register()
    })
    
    app.on('activate', () => {
      // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他
      // 窗口打开
      if (!this.main) {
        let cf        = new Config()
        global.config = cf.info
        this.main     = new MainView()
        this.tray     = new AppTray(this.main)
      }
      this.main.show();
    })
  }
}

new App()