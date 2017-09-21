<template>
  <el-table :data="data" border height="100%" :empty-text="!data.asr?'暂无数据':'识别中...'" :row-key="getRowKeys"
            :row-class-name="rowClass">
    <el-table-column v-if="showChannel" :filter-method="time" width="100" align="center" prop="channel" label="演讲人">
      <template scope="scope">
        {{scope.row.member || scope.row.channel}}
      </template>
    </el-table-column>
    <el-table-column :filter-method="time" width="100" align="center" prop="mp3time" label="音频时长">
      <template scope="scope">
        {{scope.row.mp3time | time(2)}}
      </template>
    </el-table-column>
    <el-table-column prop="text" align="center" label="识别文本">
      <template scope="scope">
        <!--<el-popover-->
        <!--title="识别结果:"-->
        <!--trigger="hover"-->
        <!--:content="scope.row.oText">-->
        <!---->
        <!--</el-popover>-->
        <pre slot="reference"
             class="edit-area"
             @focus="beforeEdit($event, scope.row)"
             @blur="afterEdit"
             @keyup="editRow($event, scope.row)"
             contenteditable="true">{{scope.row.text}}</pre>
      </template>
    </el-table-column>
    <el-table-column width="180" prop="voice" align="center" label="音频">
      <template scope="scope">
        <voice
          :url="scope.row.url"
          :time="scope.row.mp3time"></voice>
      </template>
    </el-table-column>
  </el-table>
</template>

<script type="text/ecmascript-6">
  import voice from 'views/components/voice.vue';

  export default {
    props     : {
      showChannel: Boolean,
      data       : Array,
      edit       : Function
    },
    components: {
      voice
    },
    watch     : {
      data(n) {
        if (!this._isEdit && n.length && this._scrollBox) {
          this.$nextTick(() => {
            this._scrollBox.scrollTop = this._scrollBox.scrollHeight
          })
        }
      }
    },
    methods   : {
      getRowKeys(row) {
        return row.channel + '-' + row.number
      },
      rowClass(row) {
        return row.text === row.oText ? '' : 'edited'
      },
      beforeEdit(e, res) {
        e.target.innerHTML = ''
        e.target.innerText = res.text
        this._isEdit       = true
      },
      afterEdit(e) {
        this._isEdit = false
      },
      editRow(e, target) {
        this.$emit('edit', e.target.innerText, target)
      }
    },
    mounted() {
      this._scrollBox = document.querySelector('.meet .body .el-table .el-table__body-wrapper')
    }
  }
</script>
