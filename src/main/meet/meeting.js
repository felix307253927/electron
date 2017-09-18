/**
 * @author Created by felix on 17-9-7.
 * @email   307253927@qq.com
 */
'use strict';

const {ipcMain, dialog} = require('electron');
const fs                = require('fs')
const path              = require('path')
const {
        MEETING,
        MEETING_CREATE,
        MEETING_SAVE,
        MEETING_SAVE_TEXT
      }                 = require('../util/types');

class Meeting {
  constructor(win) {
    this.win = win
    this.register()
  }
  
  register() {
    //创建会议
    ipcMain.on(MEETING, (e, data) => {
      switch (data.type) {
        case MEETING_CREATE:
          this.createMeeting(data.data, e)
          break;
        case MEETING_SAVE:
          this.exportMeeting(data.data, e)
          break;
        case MEETING_SAVE_TEXT:
          this.saveMeetingText(data.name, data.data, e)
          break;
      }
    })
  }
  
  createMeeting(meet, e) {
    this.meetingInfo = Object.assign({
      meetingTopic  : '',
      meetingSummary: '',
      createTime    : Date.now(),
      startTime     : '',
      endTime       : '',
      place         : '',
      members       : [],
      absentMembers : [],
      department    : [],
      moderator     : '',
      tags          : [],
      issues        : [],
    }, meet);
    e.sender.send(MEETING_CREATE, this.meetingInfo)
  }
  
  exportMeeting(meet, e) {
    meet         = Object.assign(this.meetingInfo, meet)
    let fileName = path.join(global.recentlyUsedPath, meet.meetingTopic + meet.createTime + '.uni')
    dialog.showSaveDialog(this.win, {
      title      : "导出会议",
      defaultPath: fileName,
      filters    : [{
        name: "会议", extensions: ['uni']
      }]
    }, (filename) => {
      if (filename) {
        global.recentlyUsedPath = path.dirname(filename)
        fs.writeFile(filename,
          JSON.stringify(meet, null, 2),
          (err) => {
            if (err) {
              console.error(err);
              e.sender.send(MEETING_SAVE, 'error')
            } else {
              e.sender.send(MEETING_SAVE, 'success')
            }
          })
      }
    })
  }
  
  saveMeetingText(name, text, e) {
    let fileName = path.join(global.recentlyUsedPath, name + this.meetingInfo.createTime + '.txt')
    dialog.showSaveDialog(this.win, {
      title      : "保存会议内容",
      defaultPath: fileName,
      filters    : [{
        name: "会议内容", extensions: ['txt']
      }]
    }, (filename) => {
      if (filename) {
        global.recentlyUsedPath = path.dirname(filename)
        fs.writeFile(filename,
          text,
          (err) => {
            if (err) {
              console.error(err);
              e.sender.send(MEETING_SAVE_TEXT, 'error')
            } else {
              e.sender.send(MEETING_SAVE_TEXT, 'success')
            }
          })
      }
    })
  }
  
  importMeeting() {
  
  }
}

module.exports = Meeting