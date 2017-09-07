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
  export default {

  }
</script>
