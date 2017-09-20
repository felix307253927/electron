<template>
  <div class="meet">
    <div class="header">
      <el-row type="flex" align="middle">
        <el-col :span="9">
          <div @click="showSelectFile">
            <el-button type="primary">选择音频</el-button>
            <input @change="selectFile" type="file" multiple accept="audio/mpeg" class="el-upload__input">
          </div>
        </el-col>
        <el-col :span="5">
          <el-button :disabled="status===1" type="primary" @click="transform">{{transBtn}}</el-button>
        </el-col>
      </el-row>
      <div class="file-list">
        <el-button size="mini"
                   @click="switchVoice(f.name)"
                   :type="f.name===fileName?'primary':''"
                   v-for="f in files" :key="f.name">{{f.name}}
        </el-button>
      </div>
    </div>
    <div class="body" :class="files.length>0?'transfer':''">
      <recognition :data="showData" @edit="editRow"></recognition>
    </div>
    <footer class="footer">
      <el-button :disabled="status!==2" @click="saveMeetText">保存文本</el-button>
      <el-button :disabled="status!==2" @click="exportMeet">导出会议</el-button>
    </footer>
  </div>
</template>

<script type="text/ecmascript-6">
  import {ipcRenderer} from 'electron';
  import Vue from 'vue';
  import {mapGetters, mapActions} from 'vuex';
  import uuid from 'uuid/v4';
  import EvalSDK from 'js/EvalSDK';
  import recognition from 'views/components/recognition.vue';
  import {
    TRANS_VOICES,
    TRANS_STATUS,
    TRANS_ADD_RESULT,
    TRANS_MOD_RESULT,
    TRANS_END_RESULT,
    TRANS_RESET,
  } from 'store/types';
  import {
    TRANS_VOICE,
    TRANS_PCM,
    MEETING,
    MEETING_SAVE_TEXT
  } from 'main/util/types';
  import path from 'path';
  
  export default {
    data() {
      return {
        files   : [],
        fileName: ''
      }
    },
    components: {
      recognition
    },
    computed  : {
      ...mapGetters({
        voices: TRANS_VOICES,
        status: TRANS_STATUS,
      }),
      showData() {
        return this.voices[this.fileName] || []
      },
      transBtn() {
        switch (this.status) {
          case 0:
            return '开始转写'
          case 1:
            return '转写中...'
          default:
            return '开始转写'
        }
      }
    },
    methods   : {
      ...mapActions({
        setState: TRANS_STATUS,
        update  : TRANS_MOD_RESULT,
        add     : TRANS_ADD_RESULT,
        end     : TRANS_END_RESULT,
        reset   : TRANS_RESET
      }),
      showSelectFile(e) {
        let input = e.currentTarget.lastChild
        input && input.click()
      },
      selectFile(e) {
        let files = this.files = Array.from(e.target.files)
        if (files.length > 5) {
          this.$message('最多同时支持5个音频转写')
          files.splice(5)
        }
      },
      editRow(text, target) {
        clearTimeout(this.cgTime)
        this.cgTime = setTimeout(() => {
          this.update({
            target,
            text,
          })
        }, 300)
      },
      transform() {
        if (this.files.length) {
          this.reset()
          let files = this.files, firstMp3 = files[0];
          firstMp3 && (this.fileName = path.basename(firstMp3.path))
          this.sessions = {}
          this.setState(1);
          ipcRenderer.send(TRANS_VOICE, {
            type: TRANS_PCM,
            data: files.map((f) => {
              let name            = path.basename(f.path);
              this.sessions[name] = {
                sid    : uuid(),
                num    : 0,
                channel: name,
                end    : 0
              }
              this.add({channel: name})
              return f.path
            })
          })
        }
      },
      switchVoice(name) {
        this.fileName = name
      },
      saveMeetText() {
        ipcRenderer.send(MEETING, {
          type: MEETING_SAVE_TEXT,
          data: this.showData.map(r => r.text).join('\r\n'),
          name: this.fileName
        })
        ipcRenderer.once(MEETING_SAVE_TEXT, (e, msg) => {
          this.$message({
            type   : msg,
            message: 'success' ? '保存成功!' : '保存失败!'
          })
        })
      },
      exportMeet() {
        this.$message('未实现')
        /*let meeting = {
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
        })*/
      }
    },
    mounted() {
      if (!this.$trans_sdk) {
        Vue.use((Vue) => {
          Vue.prototype.$trans_sdk = new EvalSDK({}, this.$store)
        })
      }
      ipcRenderer.on(TRANS_PCM, (e, {name, chunk, end}) => {
        let session = this.sessions[name]
        if (!end) {
          this.$trans_sdk.asr(session, [chunk]).then(data => {
            if (data) {
              data.currResult.channel = session.channel
              this.add({data: data.currResult, channel: session.channel})
            }
          })
        } else {
          setTimeout(() => {
            this.$trans_sdk.asr(session, [chunk], end).then(data => {
              this.end({
                channel: session.channel,
                all    : data ? data.allResult : null
              })
              this.setState(2);
            }).catch(() => {
              this.setState(0);
              Vue.set(this.showData, 'asr', false)
            })
          }, 300)
        }
      })
    }
  }
</script>
