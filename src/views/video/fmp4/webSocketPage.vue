<template>
  <div class="container">
    <a-alert message="温馨提示!" type="info" closable class="alert-info">
      <span slot="description" v-html="alertDescription"/>
    </a-alert>
    <a-card title="wsPlayer" class="video-card">
      <video
          class="video-container"
          controls
          muted
          autoplay
          :id="videoData.key"
          :ref="videoData.key"
      ></video>
    </a-card>
  </div>
</template>
<script>
import {getBaseUrl} from '@/api/zlm';

export default {
  data() {
    return {
      alertDescription: '（1）该页面是使用wsPlayer播放器开发实现DEMO。' +
          '<br>（2）支持http-fmp4和wesocket-fmp4，当前页面使用的是wesocket-ts。'+
          '<br>（3）自带追帧。',
      player: null,
      videoData: {
        key: "stream1",
        title: "直播1",
        type: "fmp4",
        url: getBaseUrl(2) + '/live/stream1.live.mp4',
      },
    };
  },
  mounted() {
    this.initializePlayer()
  },
  methods: {
    initializePlayer() {
      this.$nextTick(() => {
        const videoElement = this.$refs[this.videoData.key];
        this.player = new window.wsPlayer(videoElement.id, this.videoData.url);
        this.player.open();
      });
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  .alert-info {
    margin-bottom: 10px;
  }
}

.video-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  .video-container {
    background-color: #000000;
    flex: 1;
    width: 100%;
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;

    // Video Element Custom Style
    video {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>
