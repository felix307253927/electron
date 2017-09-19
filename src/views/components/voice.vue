<template>
  <div class="voice">
    <!--<span>{{time}}</span>-->
    <span>{{playTime}}</span>&emsp;
    <el-button size="mini" v-if="url" @click="play()" class="am-fr  mouse-pointer">
      {{!isPlaying ? '播放' : '停止'}}
    </el-button>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props  : {
      time: String,
      url : String
    },
    data() {
      this._time = this.format(this.time);
      return {
        playTime : this._time,
        isPlaying: false
      }
    },
    methods: {
      play() {
        let audio = document.getElementById('voice-component-player');
        if (this.isPlaying) {
          this.stop();
        } else {
          let notPlay = true;
          if (audio.state) {
            audio.state.stop();
//            audio.state.$refs.iState && (audio.state.$refs.iState.className = 'fa fa-play-circle');
          }
          audio.state    = this;
          this.isPlaying = !this.isPlaying;
          let _play      = () => {
            setTimeout(() => {
              try {
                notPlay && audio.play();
                notPlay = false;
              } catch (e) {
                this.isPlaying = false;
              }
            }, 150);
          };
          if (this.url) {
            audio.src = this.url;
            _play();
          } else {
            alert('Error: 音频服务未找到!');
            this.isPlaying = false;
          }
          this.init(audio);
        }
      },
      stop() {
        this.isPlaying = false;
        this.playTime  = this._time;
        let audio      = document.getElementById('voice-component-player');
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {
          console.log(e);
        }
      },
      init(audio) {
        audio.onpause      = () => {
          this.stop();
        };
        audio.onended      = () => {
          this.stop();
        };
        audio.onerror      = this.stop;
        audio.onplaying    = () => {
          if (audio.state === this) {
            this.isPlaying = true;
          }
        };
        audio.ontimeupdate = () => {
          if (audio.state === this) {
            this.playTime = this.format(audio.currentTime);
          }
        }
      },
      format(time) {
        if (time > 60) {
          let s = Math.round(time % 60);
          return Math.floor(time / 60) + ':' + (s > 9 ? s : '0' + s);
        }
        let s = Math.round(time);
        return '00:' + (s > 9 ? s : '0' + s);
      }
    },
    mounted() {
      let audio = document.getElementById('voice-component-player');
      if (!audio) {
        audio = document.createElement('audio');
        audio.setAttribute('id', 'voice-component-player');
        document.body.appendChild(audio);
      }
    },
    destroyed() {
      if (this.isPlaying) {
        this.stop();
      }
    }
  }
</script>
