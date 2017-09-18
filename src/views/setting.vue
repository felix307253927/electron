<template>
  <div class="setting">
    <el-form :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="服务器地址:" prop="host">
        <el-input type="text" placeholder="例如: http://enasr.edu.hivoice.cn" v-model.trim="formData.host"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器端口:" prop="port">
        <el-input type="number" placeholder="默认80或443" v-model.trim.number="formData.port"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="mp3服务地址:" prop="mp3host">
        <el-input type="text" placeholder="例如: http://enasr.edu.hivoice.cn" v-model.trim="formData.mp3host"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="mp3服务端口:" prop="mp3port">
        <el-input type="number" placeholder="默认80或443" v-model.trim.number="formData.mp3port"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item class="text-center">
        <el-button @click="cancel()">重置</el-button>
        <el-button type="primary" @click="submitForm()">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script type="text/ecmascript-6">
  import {ipcRenderer, remote} from 'electron';
  import {CONFIG} from 'main/util/types';
  import {HEAD_CONFIG} from 'store/types';

  export default {
    data() {
      let validateHost = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入服务地址'))
        } else if (!/^https?:\/\/[\w.]+.\w+$/.test(value)) {
          callback(new Error('请输入正确的服务地址'))
        } else {
          callback()
        }
      }
      let validatePort = (rule, value, callback) => {
        if (value && (value < 1 || value >= 65535)) {
          return callback(new Error('请输入正确的端口号'))
        }
        callback()
      }
      return {
        formData: {
          host   : config.host,
          port   : config.port,
          mp3host: config.mp3host,
          mp3port: config.mp3port
        },
        rules   : {
          host   : validateHost,
          port   : validatePort,
          mp3host: validateHost,
          mp3port: validatePort
        }
      }
    },
    methods: {
      submitForm() {
        ipcRenderer.send(CONFIG, {
          host   : this.formData.host,
          port   : this.formData.port,
          mp3host: this.formData.mp3host,
          mp3port: this.formData.mp3port,
        })
        ipcRenderer.once(CONFIG, (e, res) => {
          if (res === 'success') {
            config.host    = this.formData.host
            config.port    = this.formData.port
            config.mp3host = this.formData.mp3host
            config.mp3port = this.formData.mp3port
            this.$store.dispatch(HEAD_CONFIG, config)
          }
          this.$message({
            message: res === 'success' ? '保存成功!' : '保存失败!',
            type   : res
          })
        })
      },
      cancel() {
        this.formData.host    = config.host
        this.formData.port    = config.port
        this.formData.mp3host = config.mp3host
        this.formData.mp3port = config.mp3port
      }
    }
  }
</script>
