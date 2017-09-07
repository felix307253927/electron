/**
 * @author Created by felix on 17-8-28.
 * @email   307253927@qq.com
 */
'use strict';

const {app, Menu, Tray, nativeImage} = require('electron')
const path                           = require('path')

class AppTray {
  constructor(mainView) {
    this.mainView = mainView
    this.createTray(config.name)
  }
  
  createTray(name) {
    let image = nativeImage.createFromPath(path.join(__dirname, '../resources/icon/icon.png'))
    image.setTemplateImage(true)
    this.tray = new Tray(image)
    this.tray.setToolTip(name)
    let contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: () => {
        this.mainView.show();
      }
    }, {
      label: 'Exit', click: () => {
        app.exit(0)
      }
    }])
    this.tray.setContextMenu(contextMenu)
    this.tray.on('click', (e) => {
      e.preventDefault();
      this.mainView.show();
    })
  }
}

module.exports = AppTray