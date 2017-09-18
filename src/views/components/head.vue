<template>
  <div class="head">
    <el-button size="small" @click="setActive(0)" :type="active(0)">会议转写</el-button>
    <el-button size="small" @click="setActive(1)" :type="active(1)">录音转写</el-button>
    <el-button size="small" @click="setActive(2)" :type="active(2)">历史会议</el-button>
    <el-button size="small" @click="setActive(3)" :type="active(3)">设置</el-button>
    <el-button size="small" @click="setActive(4)" :type="active(4)">帮助</el-button>
    <div class="pull-right server">
      <span>服务器: {{host}}</span>
      <span> 端口: {{port}}</span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapActions} from 'vuex';
  import {HEAD_TYPE, HEAD_CONFIG} from 'store/types';

  export default {
    computed: {
      ...mapGetters({
        type  : HEAD_TYPE,
        config: HEAD_CONFIG
      }),
      host() {
        return this.config.host.replace(/^https?:\/\//, '')
      },
      port() {
        return this.config.port || (/^https/.test(this.config.host) ? 443 : 80)
      }
    },
    methods : {
      ...mapActions({
        setActive: HEAD_TYPE
      }),
      active(type) {
        return this.type === type ? 'primary' : ''
      }
    }
  }
</script>
