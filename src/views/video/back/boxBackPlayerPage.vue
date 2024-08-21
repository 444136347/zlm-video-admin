<template>
  <div>
    <a-row type="flex" justify="space-around">
      <a-col :span="5">
        <!-- 左侧树形菜单 -->
        <a-tree
            v-if="treeData && treeData.length > 0"
            :tree-data="treeData"
            show-icon
            :default-expand-all="true"
            @select="selectTree"
        >
          <a-icon slot="switcherIcon" type="down" />
          <a-icon slot="box" type="inbox" />
          <a-icon slot="video" type="video-camera" />
          <template #title="{ title }">
            <span>{{ title }}</span>
          </template>
        </a-tree>
      </a-col>
      <a-col :span="19">
        <div class="content">
          <!-- 控制按钮区域 -->
          <div class="back-div">
            <a-form layout="inline">
              <a-form-item label="选择回放区间">
                <a-range-picker
                    :ranges="{ '今日': [moment(), moment()], '当月': [moment(), moment().endOf('month')] }"
                    show-time
                    format="YYYY/MM/DD HH:mm:ss"
                    :placeholder="['开始日期时间', '结束日期时间']"
                    @change="changeReplayDate"
                />
              </a-form-item>
              <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                <a-button type="primary" @click="fetchUrl">
                  查询
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <!-- 右侧播放器区域 -->
          <div class="player-wrapper">
            <div
                class="player-container"
                id="player-container"
                v-if="currentLive.url && currentLive.originRtsp"
            ></div>
            <p class="container" v-else>请选择左侧播放树</p>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import moment from 'moment';
import 'moment/locale/zh-cn'; // 引入中文语言包
moment.locale('zh-cn'); // 设置 moment 的语言环境为中文
import { message } from 'ant-design-vue';
import { addStreamProxyBack, closeStreamsByApp } from '@/api/zlm';

/**
 * 代码内的ws://xx.xx.xx.xx，ws表示websocket,xx.xx.xx.xx是流IP
 * （1）这里的硬盘录像机回放功能获取的是硬盘录像机的回放RTSP流，通过ZLMediaKit的拉流（接口）能力拉取回放RTSP流以实现硬盘录像机回放。
 * （2）这个功能相对于ZLMediaKit本身的MP4回放能力来说，可以相对节省存储开支，但是对于硬盘录像机来说，需要进行个性化的操作。我试过了海康威视硬盘录像机可正常拉流，需要有一个硬盘录像机来自己测试这个页面，主要是提供一个思路。
 * （3）或者通过国标GB28181接入，也是可以实现硬盘录像机的回放RTSP流的使用.
 */
export default {
  data() {
    return {
      treeData: [], // 树形菜单数据
      streams: [ // 模拟的流数据
        {
          title: '海康威视4路硬盘录像机',
          key: 'box',
          iconType: 'box',
          lives: [
            {
              // 字段url解释
              // （1）url是将硬盘录像机的四路监控rtsp通过ZLMediaKit拉流（addStreamProxy拉流代理接口）后，获取到的websocket-flv流地址
              // （2）用于在左侧树点击监控的时候播放
              // 字段originRtsp解释
              // （1）账号:密码，这里填写的是硬盘录像机的账号、密码
              // （2）IP，这里填写的是硬盘录像机地址IP
              iconType: 'video',
              key: 'monitor1',
              title: '监控1',
              url: 'ws://xx.xx.xx.xx/live/monitor1.live.flv',
              originRtsp: 'rtsp://账号:密码@IP:554/Streaming/tracks/101'
            },
            {
              iconType: 'video',
              key: 'monitor2',
              title: '监控2',
              url: 'ws://xx.xx.xx.xx/live/monitor2.live.flv',
              originRtsp: 'rtsp://账号:密码@IP:554/Streaming/tracks/201'
            },
            {
              iconType: 'video',
              key: 'monitor3',
              title: '监控3',
              url: 'ws://xx.xx.xx.xx/live/monitor3.live.flv',
              originRtsp: 'rtsp://账号:密码@IP:554/Streaming/tracks/301'
            },
            {
              iconType: 'video',
              key: 'monitor4',
              title: '监控4',
              url: 'ws://xx.xx.xx.xx/live/monitor4.live.flv',
              originRtsp: 'rtsp://账号:密码@IP:554/Streaming/tracks/401'
            }
          ]
        }
      ],
      currentLive: {
        key: '',
        title: '',
        url: '',
        originRtsp: ''
      },
      currentPlayer: null,
      checkedTreeKey: null,
      replay: {
        dateFormat: 'YYYY-MM-DD'
      }
    };
  },
  mounted() {
    // 设置播放器
    this.setupPlayers();
  },
  methods: {
    moment,
    setupPlayers() {
      // 设置左侧树形菜单数据
      this.streams.forEach(box => {
        let tree = {
          key: box.key,
          title: box.title,
          slots: { icon: 'box' },
          children: []
        };
        box.lives.forEach(live => {
          tree.children.push({
            key: live.key,
            title: live.title,
            slots: { icon: 'video' },
            url: live.url,
            originRtsp: live.originRtsp
          });
        });
        this.treeData.push(tree);
      });
    },
    createPlayer(createUrl = null) {
      // 确保数据准备好后设置默认值
      this.$nextTick(() => {
        if (this.currentLive.url) {
          const refElement = document.getElementById('player-container');
          if (this.currentPlayer) {
            this.currentPlayer.destroy();
          }
          if (refElement) {
            const player = new window.Jessibuca({
              container: refElement, // 获取正确的DOM元素
              isFlv: true,
              videoBuffer: 0.2, // 缓存时长
              isResize: false,
              useWCS: false,
              useMSE: true,
              hasAudio: false,
              text: '',
              loadingText: '疯狂加载中...',
              debug: true,
              supportDblclickFullscreen: true,
              showBandwidth: false, // 显示网速
              operateBtns: {
                fullscreen: true,
                screenshot: true,
                play: true,
                audio: true
              },
              forceNoOffscreen: true,
              isNotMute: true,
              timeout: 10
            });

            // 监听播放和暂停事件
            player.on('play', player => {
              console.log('play', player);
            });
            player.on('pause', player => {
              console.log('pause', player);
            });
            let url = !createUrl ? this.getCurrentBackUrl() : createUrl;
            addStreamProxyBack({ key: this.currentLive.key, url: url })
                .then(res => {
                  if (parseInt(res.code) === 0) {
                    player.play(this.getReplacedString(res.data.key));
                  } else if (parseInt(res.code) === -1) {
                    let key = '__defaultVhost__/tracks/' + this.currentLive.key + '_tracks';
                    if (res.msg == 'This stream already exists') {
                      if (!createUrl) {
                        let url = this.getReplacedString(key);
                        player.play(url);
                      } else {
                        this.closeStreams(createUrl);
                      }
                    } else if (res.msg == 'DESCRIBE:453 Not Enough Bandwidth') {
                      this.closeStreams();
                    }
                  }
                })
                .catch(err => {
                  this.$message.error(err.message || '添加回放拉流代理失败');
                });
            // 存储播放器实例
            this.currentPlayer = player;
          }
        }
      });
    },
    closeStreams(createUrl = null) {
      let app = 'tracks';
      closeStreamsByApp(app)
          .then(res => {
            if (parseInt(res.code) === 0) {
              this.createPlayer(createUrl);
            }
          })
          .catch(err => {
            console.log(err);
          });
    },
    convertToISOFormat(dateTime) {
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
      const day = String(dateTime.getDate()).padStart(2, '0');
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      const seconds = String(dateTime.getSeconds()).padStart(2, '0');

      return `${year}${month}${day}t${hours}${minutes}${seconds}z`;
    },
    getReplacedString(input) {
      const baseUrl = 'ws://xx.xx.xx.xx';
      const suffix = '.live.flv';
      return input.replace('__defaultVhost__', baseUrl) + suffix;
    },
    getCurrentBackUrl() {
      if (this.currentLive.url && this.currentLive.originRtsp) {
        return this.currentLive.originRtsp + this.getCurrentDateBw();
      }
      return '';
    },
    getCurrentDateBw() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      return `?starttime=${year}${month}${day}t000000z&endtime=${year}${month}${day}t${hours}${minutes}${seconds}z`;
    },
    changeReplayDate(date) {
      this.replay.period = date;
    },
    fetchUrl() {
      if (!this.replay.period || this.replay.period.length !== 2) {
        message.error('请选择一个有效的日期范围！');
        return;
      }
      if (this.checkedTreeKey && this.currentLive.url && this.currentLive.originRtsp) {
        const startTime = this.convertToISOFormat(this.replay.period[0].toDate());
        const endTime = this.convertToISOFormat(this.replay.period[1].toDate());
        let backStr = this.currentLive.originRtsp + `?starttime=${startTime}&endtime=${endTime}`;
        console.log('backStr', backStr)
        this.createPlayer(backStr);
      }
    },
    selectTree(checkedKeys) {
      this.checkedTreeKey = checkedKeys[0];
      if (this.currentLive.key !== checkedKeys[0]) {
        Object.values(this.streams[0].lives).forEach(live => {
          if (live.key === checkedKeys[0]) {
            this.currentLive = live;
            this.createPlayer();
          }
        });
      }
    }
  },
  beforeDestroy() {
    if (this.currentPlayer) {
      this.currentPlayer.destroy();
    }
  }
};
</script>

<style>
.player-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 70vh;
  background-color: black;
  position: relative;
}

.player-container {
  width: 100%;
  height: 100%;
}

.container {
  width: 100%;
  height: 100%;
  background-color: black;
  color: white;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.back-div {
  text-align: center;
  margin-bottom: 10px;
  margin-top: 10px;
}

.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

</style>
