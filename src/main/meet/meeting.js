/**
 * @author Created by felix on 17-9-7.
 * @email   307253927@qq.com
 */
'use strict';

class Meeting {
  constructor(win) {
    this.win = win
  }
  
  createMeeting() {
    
    let meet = {
      meetingTopic:'',
      meetingSummary:'',
      startTime:'',
      endTime:'',
      place:'',
      members:'',
      absentMembers:'',
      department:'',
      moderator:'',
      tags:'',
      issues:'',
      
    }
  }
  
  exportMeeting(meet) {
    let stream = fs
  }
  
  importMeeting() {
  
  }
}

module.exports = Meeting