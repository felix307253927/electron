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
        <el-button type="primary" :disabled="isRecord===null||isRecord===0" @click="record()">{{recordBtn}}</el-button>
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
      <!--<el-table :data="list" border height="100%" :row-key="getRowKeys">
        <el-table-column :filter-method="time" width="120" align="center" prop="time" label="音频时长">
          <template scope="scope">
            {{scope.row.mp3time | time(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="text" align="center" label="识别文本">
          <template scope="scope">
            &lt;!&ndash;<el-popover&ndash;&gt;
            &lt;!&ndash;title="识别结果:"&ndash;&gt;
            &lt;!&ndash;trigger="hover"&ndash;&gt;
            &lt;!&ndash;:content="scope.row.oText">&ndash;&gt;
            &lt;!&ndash;&ndash;&gt;
            &lt;!&ndash;</el-popover>&ndash;&gt;
            <div slot="reference"
                 class="edit-area"
                 @focus="beforeEdit($event, scope.row)"
                 @blur="afterEdit"
                 @keyup="change($event, scope.row)"
                 contenteditable="true">
              {{scope.row.text}}
            </div>
          </template>
        </el-table-column>
        <el-table-column width="180" prop="voice" align="center" label="音频">
          <template scope="scope">
            <voice
              :url="scope.row.url"
              :time="scope.row.mp3time"></voice>
          </template>
        </el-table-column>
      </el-table>-->
      <recognition :show-channel="true" :data="list" @edit="change"></recognition>
    </div>
    <footer class="footer">
      <el-button :disabled="!isEnd" @click="saveMp3()">导出原始录音</el-button>
      <el-button :disabled="!isEnd" @click="saveMeetText">保存文本</el-button>
      <el-button :disabled="!isEnd" @click="exportMeet">导出会议</el-button>
    </footer>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import {mapActions, mapGetters} from 'vuex';
  import recognition from 'views/components/recognition.vue';
  import EvalSDK from 'js/EvalSDK';
  import {
    MEET_ID,
    MEET_IS_RECORD,
    MEET_IS_END,
    MEET_NAME,
    MEET_START_TIME,
    MEET_TIMER,
    MEET_ADD_RESULT,
    MEET_MOD_RESULT,
    MEET_RESULT,
    MEET_MEMBERS,
    MEET_RESET
  } from 'store/types';

  const {MEETING, MEETING_SAVE, MEETING_SAVE_TEXT} = require('main/util/types')
  const {ipcRenderer}                              = require('electron')

  export default {
    computed  : {
      ...mapGetters({
        startTime: MEET_START_TIME,
        timer    : MEET_TIMER,
        list     : MEET_RESULT,
        members  : MEET_MEMBERS,
        sid      : MEET_ID
      }),
      meetingName: {
        get() {
          return this.$store.state.meet.meetingName
        },
        set(value) {
          this.$store.dispatch(MEET_NAME, value)
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
        switch (this.isRecord) {
          case false:
            return '开始录音'
          case null:
            return '启动录音'
          case true:
            return '停止录音'
          case 0:
            return '识别中..'
          default:
            return '开始录音'
        }
      }
    },
    components: {
      recognition
    },
    methods   : {
      ...mapActions({
        add      : MEET_ADD_RESULT,
        update   : MEET_MOD_RESULT,
        resetMeet: MEET_RESET
      }),
      change(text, target) {
        clearTimeout(this.cgTime)
        this.cgTime = setTimeout(() => {
          this.update({
            target,
            text
          })
        }, 500)
      },
      record() {
        if (this.isRecord === false) {
          this.isEnd && this.resetMeet()
          this.add(null)
          this.$sdk.start()
          this.isRecord = null
          this.$sdk.once('start', () => {
            this.isRecord = true
          })
          this.isEnd = false
        } else {
          this.$sdk.stop()
          this.isRecord = 0
          this.isEnd    = true
        }
      },
      saveMp3() {
        this.$sdk.saveMp3(this.meetingName)
      },
      saveMeetText() {
        ipcRenderer.send(MEETING, {
          type: MEETING_SAVE_TEXT,
          data: this.list.map(r => r.text).join('\r\n'),
          name: this.meetingName
        })
        ipcRenderer.once(MEETING_SAVE_TEXT, (e, msg) => {
          this.$message({
            type   : msg,
            message: 'success' ? '保存成功!' : '保存失败!'
          })
        })
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
      if (!this.$sdk || this.$sdk.__sid !== this.sid) {
        Vue.use((Vue) => {
          Vue.prototype.$sdk = new EvalSDK({
            channels: this.members.length || 1
          }, this.$store)
          this.$sdk.__sid    = this.sid
          this.$sdk.initRecorder()
        })
      }
    }
  }
</script>
