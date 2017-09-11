<template>
  <div class="meet">
    <el-row class="header" type="flex" align="middle">
      <el-col :span="9">
        <el-row type="flex" align="middle">
          <el-col :span="15" label="选择音频">
            <el-input v-model="meetingName" placeholder="请输入会议名称"></el-input>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="record()">{{transBtn}}</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import {mapGetters, mapActions} from 'vuex';
  import uuid from 'uuid/v4';
  import EvalSDK from 'js/EvalSDK';
  import {
    TRANS_VOICES,
    TRANS_STATUS
  } from 'store/types';

  export default {
    computed: {
      ...mapGetters({
        voices: TRANS_VOICES,
        status: TRANS_STATUS
      }),
      transBtn() {
        return this.status === 0 ? '开始转写' : '转写中...'
      }
    },
    methods : {
      ...mapGetters({})
    },
    mounted() {
      if (!this.$trans_sdk) {
        Vue.use((Vue) => {
          Vue.prototype.$trans_sdk = new EvalSDK({}, this.$store)
        })
      }
    }
  }
</script>
