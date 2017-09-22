<template>
  <div class="create">
    <el-form :model="micForm" ref="micForm" :rules="rules" label-width="80px">
      <el-form-item label="会议名称" prop="name">
        <el-input :value="micForm.name" @input="modMeetingName($event)"></el-input>
      </el-form-item>
      <div class="mics">
        <el-form-item
          v-for="(mic, index) in micForm.mics"
          :label="'麦克风' + (index+1)"
          :key="mic.key"
          :rules="[{ max: 20, message: '请输入20位以内的名称'}]"
          :prop="'mics.' + index + '.name'"
        >
          <el-row>
            <el-col span="20">
              <span class="mic-status" :style="{height:'36px'}">
                <span class="bar" :style="{transform: vols[index]}"></span>
              </span>
              <el-input :value="mic.name" @input="modMic($event, mic)"></el-input>
            </el-col>
            <el-col span="4" class="del-mic">
              <el-button v-show="micCount>1" @click.prevent="removeMic(mic)">删除</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </div>
      <el-form-item>
        <el-button @click="testMic()">{{testBtn}}</el-button>
        <el-button @click="addMic">新增麦克风</el-button>
        <el-button type="primary" @click="submitForm(micForm)">创建会议</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script type="text/ecmascript-6">
  import {ipcRenderer} from 'electron';
  import {mapGetters} from 'vuex';
  import uuid from 'uuid/v4';
  import {MEETING, MEETING_CREATE} from 'main/util/types';
  import {MIC_ADD, MIC_DEL, MIC_MOD, MIC_FORM, MIC_NAME, MEET_NAME, MEET_MEMBERS} from 'store/types';
  import MicTest from 'js/micTest';

  export default {
    data() {
      return {
        rules  : {
          name: [
            {required: true, message: '请输入会议名称'},
            {max: 50, message: '请输入1-50位会议名称'}
          ]
        },
        tester : null,
        vols   : {},
        testBtn: '测试麦克风'
      }
    },
    computed: {
      ...mapGetters({
        micForm: MIC_FORM
      }),
      micCount() {
        return this.micForm.mics.length
      }
    },
    methods : {
      modMeetingName(value) {
        this.$store.dispatch(MIC_NAME, value)
      },
      addMic() {
        if (this.micCount < 32) {
          this.testMic(true)
          this.$store.dispatch(MIC_ADD)
        } else {
          this.$message({
            message: '最大支持32个麦克风!',
            type   : 'warning'
          })
        }
      },
      modMic(name, mic) {
        this.$store.dispatch(MIC_MOD, {mic, name})
      },
      removeMic(mic) {
        if (this.micCount > 1) {
          this.testMic(true)
          this.$store.dispatch(MIC_DEL, mic)
        }
      },
      submitForm() {
        this.testMic(true)
        this.$refs['micForm'].validate(valid => {
          if (valid) {
            let members = this.micForm.mics.map(m => m.name)
            ipcRenderer.send(MEETING, {
              type: MEETING_CREATE,
              data: {
                meetingTopic: this.micForm.name,
                members
              }
            })
            ipcRenderer.once(MEETING_CREATE, (_, meeting) => {
              if (meeting) {
                this.$store.dispatch(MEET_MEMBERS, members)
                this.$store.dispatch(MEET_NAME, meeting.meetingTopic).then(() => {
                  this.$router.push('/meet/trans')
                })
              }
            })
          }
        })
      },
      testMic(stop) {
        let channels = this.micForm.mics.length || 1
        if (stop) {
          if (this.tester && this.tester.isRunning) {
            this.tester.stop()
          }
          this.testBtn = '测试麦克风'
          return this.tester = null
        }
        if (!this.tester) {
          this.tester  = new MicTest(channels)
          this.testBtn = '停止麦克风'
          for (let i = 0; i < channels; i++) {
            this.$set(this.vols, i, 0)
          }
          this.tester.onVoice = (vol) => {
            for (let i = 0; i < channels; i++) {
              let v        = Math.abs(vol[i] >> 0)
              v            = v > 5 && v < 80 ? v + 10 : v < 100 ? v : 100
              this.vols[i] = `translate3d(0,${100 - v}%,0)`
            }
          }

        } else {
          if (this.tester.isRunning) {
            this.tester.stop()
            this.testBtn = '测试麦克风'
          } else {
            this.tester.start()
            this.testBtn = '停止麦克风'
          }
          for (let i = 0; i < channels; i++) {
            this.vols[i] = `translate3d(0,100%,0)`
          }
        }
      },
    }
  }
</script>
