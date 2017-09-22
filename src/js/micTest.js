/**
 * @author Created by felix on 17-9-8.
 * @email   307253927@qq.com
 */
'use strict';

class MicTest {
  constructor(channels) {
    this.voices   = {}
    this.channels = channels
    navigator.mediaDevices.enumerateDevices().then(devices => {
      console.log(devices)
    })
    navigator.mediaDevices.ondevicechange = (e) => {
      console.log('device change', e)
    }
    
    let ms = navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: channels,
      },
    }).then(stream => {
      let audioTracks = stream.getAudioTracks();
      console.log(audioTracks)
      console.log(ms)
      
      this.context                  = new AudioContext()
      this.mic                      = this.context.createMediaStreamSource(stream)
      this.processor                = this.context.createScriptProcessor(2048, channels, 1)
      this.processor.onaudioprocess = (event) => {
        //监听音频录制过程
        for (let i = 0; i < channels; i++) {
          this.voices[i] = event.inputBuffer.getChannelData(i).reduce((a, b) => a + b, 0)
        }
        this.onVoice(this.voices)
      }
      this.start()
    }).catch(err => {
      console.error(err)
      this.onError(err)
    })
  }
  
  start() {
    if (this.mic && this.processor) {
      this.mic.connect(this.processor)
      this.processor.connect(this.context.destination)
      this.isRunning = true
    }
  }
  
  stop() {
    if (this.mic && this.processor) {
      this.mic.disconnect();
      this.processor.disconnect();
      this.isRunning = false
      for (let i = 0; i < this.channels; i++) {
        this.voices[i] = 0
      }
    }
  }
  
  onVoice(vol) {
    console.log(vol)
  }
  
  onError(err) {
    console.log(err)
  }
}

export default MicTest