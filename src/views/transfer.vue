<template>
  <div class="meet">
    <el-row class="header" type="flex" align="middle">
      <el-col :span="9">
        <div @click="showSelectFile">
          <el-button type="primary">选择音频</el-button>
          <input @change="selectFile" type="file" multiple accept="audio/mpeg" class="el-upload__input">
        </div>
      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="transform()">{{transBtn}}</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script type="text/ecmascript-6">
  import {ipcRenderer} from 'electron';
  import Vue from 'vue';
  import {mapGetters, mapActions} from 'vuex';
  import uuid from 'uuid/v4';
  import EvalSDK from 'js/EvalSDK';
  import {
    TRANS_VOICES,
    TRANS_STATUS,
    MEET_RESULT
  } from 'store/types';
  import {
    TRANS_VOICE,
    TRANS_PCM
  } from 'main/util/types';
  import path from 'path';
  
  export default {
    data() {
      return {
        files: []
      }
    },
    computed: {
      ...mapGetters({
        voices: TRANS_VOICES,
        status: TRANS_STATUS,
        result: MEET_RESULT
      }),
      transBtn() {
        return this.status === 0 ? '开始转写' : '转写中...'
      }
    },
    methods : {
      showSelectFile(e) {
        let input = e.currentTarget.lastChild
        input && input.click()
      },
      selectFile(e) {
        this.files = e.target.files
      },
      transform() {
        if (this.files.length) {
          let sessions  = {}, files = this.files
          this.sessions = sessions
          files         = Array.from(files).map((f, i) => {
            sessions[path.basename(f.path)] = {
              sid    : uuid(),
              num    : 0,
              channel: i,
              end    : 0
            }
            return f.path
          })
          ipcRenderer.send(TRANS_VOICE, {
            type: TRANS_PCM,
            data: files
          })
        }
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
          this.$trans_sdk.asr(session, [chunk], end)
        } else {
          setTimeout(() => {
            this.$trans_sdk.asr(session, [chunk], end)
          }, 800)
        }
      })
    }
  }
</script>
