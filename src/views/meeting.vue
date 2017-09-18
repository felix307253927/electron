<template>
  <div class="meet">
    <el-row class="header" type="flex" align="middle">
      <el-col :span="9">
        <el-row type="flex" align="middle">
          <label for="meetingName">会议名称:&emsp;</label>
          <el-col :span="15">
            <el-input label="会议名称:" id="meetingName" v-model="meetingName" placeholder="请输入会议名称"></el-input>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="record()">{{recordBtn}}</el-button>
      </el-col>
      <el-col :span="5">
        <label>
          开始时间: <span>{{startTime | date('HH:mm:ss')}}</span>
        </label>
      </el-col>
      <el-col :span="5">
        {{timer | time(3)}}
      </el-col>
    </el-row>
    <div class="body">
      <el-table :data="list" border height="100%">
        <el-table-column :filter-method="time" width="120" align="center" prop="time" label="音频时长">
          <template scope="scope">
            {{((scope.row.endTime - scope.row.startTime) / 1000) >> 0 | time(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="text" align="center" label="识别文本">
          <template scope="scope">
            <el-popover
              title="识别结果:"
              trigger="hover"
              :content="scope.row.oText">
              <div slot="reference"
                   class="read-write-plaintext-only"
                   @focus="beforeEdit($event, scope.row)"
                   @keyup="change($event, scope.row)"
                   contenteditable="true">
                {{scope.row.text}}
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column width="180" prop="voice" align="center" label="音频">
          <template scope="scope">

          </template>
        </el-table-column>
      </el-table>
    </div>
    <footer class="footer">
      <div>
        <el-button :disabled="!isEnd" @click="saveMp3()">导出原始录音</el-button>
        <el-button :disabled="!isEnd" @click="saveMeetText">保存文本</el-button>
        <el-button :disabled="!isEnd" @click="exportMeet">导出会议</el-button>
      </div>
    </footer>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import {mapActions, mapGetters} from 'vuex';
  import EvalSDK from 'js/EvalSDK';
  import {
    MEET_IS_RECORD,
    MEET_IS_END,
    MEET_NAME,
    MEET_START_TIME,
    MEET_TIMER,
    MEET_ADD_RESULT,
    MEET_MOD_RESULT,
    MEET_RESULT,
    MEET_RESET,
    MEET_MEMBERS
  } from 'store/types';

  const {MEETING, MEETING_SAVE} = require('main/util/types')
  const {ipcRenderer}           = require('electron')

  export default {
    computed: {
      ...mapGetters({
        startTime: MEET_START_TIME,
        timer    : MEET_TIMER,
        list     : MEET_RESULT,
        members  : MEET_MEMBERS
      }),
      meetingName: {
        get() {
          return this.$store.state.meet.meetingName
        },
        set(value) {
          this.$store.commit(MEET_NAME, value)
        }
      },
      isRecord   : {
        get() {
          return this.$store.state.meet.isRecord
        },
        set(value) {
          this.$store.dispatch(MEET_IS_RECORD, value)
        }
      },
      isEnd      : {
        get() {
          return this.$store.state.meet.isEnd
        },
        set(value) {
          this.$store.dispatch(MEET_IS_END, value)
        }
      },
      recordBtn() {
        return !this.isRecord ? '开始录音' : '停止录音'
      }
    },
    methods : {
      ...mapActions({
        update: MEET_MOD_RESULT,
        reset : MEET_RESET,
      }),
      beforeEdit(e, res) {
        console.log(res.text)
        e.target.innerHTML = res.text.replace('\r\n', '<br/>')
      },
      change(e, target) {
        clearTimeout(this.cgTime)
        this.cgTime = setTimeout(() => {
          let nodes = e.target.childNodes

          this.update({
            target,
            text,
          })
        }, 500)
      },
      record() {
        if (!this.isRecord) {
          this.$sdk.start()
          this.isRecord = true
          this.isEnd    = false
        } else {
          this.$sdk.stop()
          this.isRecord = false
          this.isEnd    = true
        }
      },
      saveMp3() {
        this.$sdk.saveMp3(this.meetingName)
      },
      saveMeetText() {
        console.log(this.list.map(r => r.text).join(' '))
      },
      exportMeet() {
        let meeting = {
          meetingTopic: this.meetingName,
          startTime   : this.startTime,
          endTime     : this.startTime + this.timer * 1000,
          result      : this.list,
          members     : this.members,
        }
        ipcRenderer.send(MEETING, {
          type: MEETING_SAVE,
          data: meeting
        })
        ipcRenderer.once(MEETING_SAVE, (e, msg) => {
          this.$message({
            type   : msg,
            message: 'success' ? '导出成功!' : '导出失败!'
          })
        })
      }
    },
    mounted() {
      //加载SDK
      if (!this.$sdk || this.$sdk.channels !== this.members.length) {
        Vue.use((Vue) => {
          Vue.prototype.$sdk = new EvalSDK({
            channels: this.members.length || 1
          }, this.$store)
          this.$sdk.initRecorder()
        })
      }
    }
  }
</script>
