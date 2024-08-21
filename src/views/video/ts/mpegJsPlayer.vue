<template>
  <div class="container">
    <a-alert message="温馨提示!" type="info" closable class="alert-info">
      <span slot="description" v-html="alertDescription"/>
    </a-alert>
    <a-card title="mpegts.js+Video原生" class="video-card">
      <video class="video-container" :ref="videoData.key" :id="videoData.key" controls/>
    </a-card>
  </div>
</template>

<script>
import mpegts from 'mpegts.js';
import {getBaseUrl} from "@/api/zlm";

export default {
  data() {
    return {
      alertDescription: '（1）该页面是使用开源的mpegts.js+Video原生标签实现DEMO。' +
          '<br>（2）支持http-ts和wesocket-ts，当前页面使用的是wesocket-ts。' +
          '<br>（3）实现了追帧，但是追帧可能会导致视频时常loading，体验不佳，多路播放更甚。',
      videoData: {
        key: "stream1",
        title: "直播1",
        type: "ts",
        url: getBaseUrl(2) + '/live/stream1.live.ts',
      },
      player: null,
      isPlaying: true,
    };
  },
  mounted() {
    this.initializePlayer();
  },
  beforeDestroy() {
    if (this.player) {
      this.player.destroy();
    }
  },
  methods: {
    initializePlayer() {
      if (mpegts.getFeatureList().mseLivePlayback) {
        const videoElement = this.$refs[this.videoData.key];

        const player = mpegts.createPlayer({
          type: 'mse',
          url: this.videoData.url,
          isLive: true,
          stashInitialSize: 64 * 1024, // 设置初始缓存大小
          enableWorker: true, // 启用worker，提升解码效率
          liveBufferLatencyChasing: true, // 启用低延迟直播模式
          liveBufferLatencyChasingOnPaused: true, // 启用低延迟直播模式
        });

        player.attachMediaElement(videoElement);
        player.load();

        videoElement.addEventListener('pause', this.onPause);
        videoElement.addEventListener('play', this.onPlay);
        // videoElement.addEventListener('timeupdate', this.checkAndAdjustLatency);

        this.player = player;
        this.player.play();
      } else {
        console.error('此浏览器不支持MPEG-TS实时播放。');
      }
    },
    onPause() {
      if (this.isPlaying) {
        this.player.pause();
        this.isPlaying = false;
      }
    },
    onPlay() {
      if (!this.isPlaying) {
        this.player.play();
        this.isPlaying = true;
      }
    },
    checkAndAdjustLatency() {
      const videoElement = this.$refs[this.videoData.key];

      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const currentTime = videoElement.currentTime;
        const maxAllowedDelay = 2; // 允许的最大延迟，单位为秒

        if (bufferedEnd - currentTime > maxAllowedDelay) {
          console.warn(`延迟超过 ${maxAllowedDelay} 秒。正在调整到最新帧...`);
          videoElement.currentTime = bufferedEnd;
        }
      }
    },
  },
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
