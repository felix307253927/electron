/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';

const {app, BrowserWindow, ipcMain} = require('electron')
const MainView                      = require('./MainView')
const AppTray                       = require('./AppTray')
const Splash                        = require('./Splash')
const Config                        = require('./util/manageConfig')

global.recentlyUsedPath = app.getPath('documents')

class App {
  constructor() {
    this.initApp()
  }
  
  initApp() {
    app.on('ready', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('addDevToolsExtension...')
        BrowserWindow.addDevToolsExtension("/home/felix/.config/chromium/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/3.1.6_0");
        console.log(BrowserWindow.getDevToolsExtensions())
      }
      let cf        = new Config()
      global.config = cf.info
      this.main     = new MainView()
      this.splash   = new Splash(this.main)
      this.tray     = new AppTray(this.main)
      cf.register()
      ipcMain.once('app-render', () => {
        setTimeout(() => {
          this.splash.hide()
          this.main.show()
        }, 1000)
      })
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
      this.main.show()
    })
  }
}

new App()