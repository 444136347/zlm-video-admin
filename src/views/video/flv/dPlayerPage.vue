<template>
  <div class="container">
    <a-alert message="温馨提示!" type="info" closable class="alert-info">
      <span slot="description" v-html="alertDescription" />
    </a-alert>
    <a-card title="flv.js+DPlayer" class="video-card">
      <div :ref="videoData.key" class="video-container"></div>
    </a-card>
  </div>
</template>

<script>
import flvjs from 'flv.js';
import DPlayer from 'dplayer';
import { getBaseUrl } from '@/api/zlm';

export default {
  data() {
    return {
      alertDescription: '（1）该页面是使用哔哩哔哩开源的FLV.JS+DPlayer播放器实现DEMO。' +
          '<br>（2）支持http-flv和websocket-flv，当前使用的是websocket-flv' +
          '<br>（3）DPlayer播放器会出现缓存视频，当前如果直接暂停，重新播放没有从最新时间点开始。也就是没有自带追帧。',
      player: null,
      videoData: {
        key: "stream1",
        title: "直播1",
        type: "flv",
        url: getBaseUrl() + '/live/stream1.live.flv',
      },
    };
  },
  mounted() {
    this.initializePlayer();
  },
  methods: {
    initializePlayer() {
      this.$nextTick(() => {
        this.player = new DPlayer({
          container: this.$refs[this.videoData.key],
          video: {
            url: this.videoData.url,
            type: 'customFlv',
            customType: {
              customFlv: (video) => {
                const flvPlayer = flvjs.createPlayer({
                  type: 'flv',
                  url: video.src,
                  isLive: true,
                  cors: true,
                  enableWorker: true,
                  lazyLoad: true,
                  stashInitialSize: 128,
                  enableStashBuffer: false,
                });
                flvPlayer.attachMediaElement(video);
                flvPlayer.load();

                setInterval(() => {
                  if (video.buffered.length > 0) {
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                    const currentTime = video.currentTime;
                    const maxAllowedDelay = 2;
                    if (bufferedEnd - currentTime > maxAllowedDelay) {
                      video.currentTime = bufferedEnd;
                    }
                  }
                }, 1000);
              },
            },
          },
        });
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
