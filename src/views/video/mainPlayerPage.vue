<template>
  <div style="overflow-y: auto">
    <a-row type="flex" justify="space-around">
      <a-col :span="5">
        <!-- 左侧树形菜单 -->
        <a-tree
            v-if="treeData && treeData.length > 0"
            :tree-data="treeData"
            show-icon
            :default-expand-all="true"
        >
          <a-icon slot="switcherIcon" type="down"/>
          <a-icon slot="box" type="inbox"/>
          <a-icon slot="video" type="video-camera"/>
          <template #title="{ title, dataRef }">
            <span>{{ title }}</span>
            <!-- 播放/暂停图标 -->
            <a-icon
                v-if="dataRef.slots.icon === 'video'"
                :type="isPlaying(dataRef.key) ? 'pause-circle' : 'play-circle'"
                style="margin-left: 10px; margin-right: 10px"
                @click="handleTogglePlayPause(dataRef.key, dataRef.url)"
            />
          </template>
        </a-tree>
      </a-col>
      <a-col :span="19">
        <div>
          <!-- 控制按钮区域 -->
          <div class="btn-contain">
            <a-button class="btn-control" type="default" :disabled="displayCount === 1" @click="setDisplayCount(1)">
              1路
            </a-button>
            <a-button class="btn-control" type="default" :disabled="displayCount === 4" @click="setDisplayCount(4)">
              4路
            </a-button>
            <a-button class="btn-control" type="default" :disabled="displayCount === 9" @click="setDisplayCount(9)">
              9路
            </a-button>
            <a-button class="btn-control" type="primary" @click="handlePlayAll">
              全部播放
            </a-button>
            <a-button type="danger" @click="handlePauseAll">
              全部暂停
            </a-button>
          </div>
          <!-- 右侧播放器区域 -->
          <div class="scrollable">
            <!-- 播放器网格区域 -->
            <div
                class="player-grid"
                :style="{ gridTemplateColumns: gridTemplateColumns, gridTemplateRows: gridTemplateRows }"
            >
              <div v-for="(item, index) in displayedLives" :key="index" class="player-container">
                <!-- 播放器容器 -->
                <div class="container" :id="item.key" :ref="item.key" v-if="item.url"></div>
                <p v-else>{{ `第${index + 1}路` }}</p>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {getBaseUrl} from "@/api/zlm";

export default {
  data() {
    return {
      alertDescription: '（1）该页面是基于Jessibuca播放器实现DEMO。' +
          '<br>（2）实现一、四、九路同页面播放，支持全部播放和全部暂停。' +
          '<br>（3）支持http-flv和wesocket-flv，当前页面使用的是websocket-flv。',
      treeData: [], // 树形菜单数据
      streams: [
        // 模拟的流数据
        {
          title: "直播列表-1",
          key: "box-1",
          iconType: "box",
          lives: [
            {
              iconType: "video",
              key: "stream1",
              title: "直播-1",
              url: getBaseUrl(2) + "/live/stream1.live.flv",
            },
            {
              iconType: "video",
              key: "stream2",
              title: "直播-2",
              url: getBaseUrl(2) + "/live/stream2.live.flv",
            },
            {
              iconType: "video",
              key: "stream3",
              title: "直播-3",
              url: getBaseUrl(2) + "/live/stream3.live.flv",
            },
            {
              iconType: "video",
              key: "stream4",
              title: "直播-4",
              url: getBaseUrl(2) + "/live/stream4.live.flv",
            },
            {
              iconType: "video",
              key: "stream5",
              title: "直播-5",
              url: getBaseUrl(2) + "/live/stream5.live.flv",
            },
            {
              iconType: "video",
              key: "stream6",
              title: "直播-6",
              url: getBaseUrl(2) + "/live/stream6.live.flv",
            },
            {
              iconType: "video",
              key: "stream7",
              title: "直播-7",
              url: getBaseUrl(2) + "/live/stream7.live.flv",
            },
            {
              iconType: "video",
              key: "stream8",
              title: "直播-8",
              url: getBaseUrl(2) + "/live/stream8.live.flv",
            },
            {
              iconType: "video",
              key: "stream9",
              title: "直播-9",
              url: getBaseUrl(2) + "/live/stream9.live.flv",
            },
          ],
        },
      ],
      players: {}, // 播放器实例
      playingStreams: [], // 正在播放的流
      displayCount: 1, // 显示的播放器数量
      gridTemplateColumns: "repeat(1, 1fr)", // 播放器网格布局列数
      gridTemplateRows: "", // 播放器网格布局行数
    };
  },
  computed: {
    displayedLives() {
      // 根据显示数量截取流列表
      const lives = this.streams[0].lives.slice(0, this.displayCount);
      while (lives.length < this.displayCount) {
        lives.push({key: `placeholder-${lives.length}`, title: "", url: ""});
      }
      return lives;
    },
  },
  mounted() {
    // 设置播放器
    this.setupPlayers();
    // 计算播放器网格行数
    this.computeGridTemplateRows();
  },
  methods: {
    setupPlayers() {
      // 设置左侧树形菜单数据
      this.streams.forEach((box) => {
        let tree = {
          key: box.key,
          title: box.title,
          slots: {icon: "box"},
          children: [],
        };
        box.lives.forEach((live) => {
          tree.children.push({
            key: live.key,
            title: live.title,
            slots: {icon: "video"},
            url: live.url,
          });
        });
        this.treeData.push(tree);
        this.createPlayer();
      });
    },
    createPlayer() {
      let addCount = 0;
      // 确保数据准备好后设置默认值
      this.$nextTick(() => {
        this.displayedLives.forEach((live) => {
          if (live.url && addCount < this.displayCount) {
            const refElement = document.getElementById(live.key);
            if (this.players[live.key]) {
              this.players[live.key].destroy();
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
                text: "",
                loadingText: "疯狂加载中...",
                debug: true,
                supportDblclickFullscreen: true,
                showBandwidth: false, // 显示网速
                operateBtns: {
                  fullscreen: true,
                  screenshot: true,
                  play: true,
                  audio: true,
                },
                forceNoOffscreen: true,
                isNotMute: true,
                timeout: 30
              });

              // 监听播放和暂停事件
              player.on("play", () => {
                this.handlePlay(live.key);
              });
              player.on("pause", () => {
                this.handlePause(live.key);
              });

              // 存储播放器实例
              this.players[live.key] = player;
              addCount++;
            }
          }
        });
      });
    },
    handlePlay(currentKey) {
      // 处理播放事件
      if (!this.playingStreams.includes(currentKey)) {
        this.playingStreams.push(currentKey);
      }
    },
    handlePause(currentKey) {
      // 处理暂停事件
      const index = this.playingStreams.indexOf(currentKey);
      if (index > -1) {
        this.playingStreams.splice(index, 1);
      }
    },
    handleTogglePlayPause(key, url) {
      // 切换播放/暂停
      if (this.playingStreams.includes(key)) {
        this.players[key].pause();
      } else {
        this.players[key].play(url);
      }
    },
    handlePlayAll() {
      // 播放当前显示的所有流
      this.displayedLives.forEach((live) => {
        if (live.url) {
          const player = this.players[live.key];
          if (player) {
            player.play(live.url);
          }
        }
      });
    },
    handlePauseAll() {
      // 暂停当前显示的所有流
      this.displayedLives.forEach((live) => {
        if (live.url) {
          const player = this.players[live.key];
          if (this.playingStreams.includes(live.key)) {
            player.pause();
          }
        }
      });
    },
    isPlaying(key) {
      // 检查是否正在播放
      return this.playingStreams.includes(key);
    },
    setDisplayCount(count) {
      // 设置显示的播放器数量
      this.displayCount = count;
      this.computeGridTemplateColumns(count); // 更新网格布局列数
      this.computeGridTemplateRows(); // 更新网格布局行数
      this.createPlayer();
    },
    computeGridTemplateColumns(count) {
      // 更新网格布局列数
      if (count === 1) {
        this.gridTemplateColumns = "repeat(1, 1fr)";
      } else if (count <= 4) {
        this.gridTemplateColumns = "repeat(2, 1fr)";
      } else {
        this.gridTemplateColumns = "repeat(3, 1fr)";
      }
    },
    computeGridTemplateRows() {
      // 更新网格布局行数
      const rowCount = Math.ceil(
          this.displayedLives.length / Math.ceil(this.displayCount / 3)
      );
      this.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
    },
  },
  beforeDestroy() {
    // 销毁前暂停所有流
    this.handlePauseAll();
  },
};
</script>

<style lang="less" scoped>
.scrollable {
  max-height: 85vh;
  overflow-y: auto;
}

.player-grid {
  display: grid;
  grid-gap: 10px;
}

.player-container {
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.container {
  width: 100%;
  height: 0;
  /*padding-bottom: 56.25%; !* 16:9 Aspect Ratio *!*/
  padding-bottom: 50%;
}

.btn-contain{
  text-align: center;
  margin-bottom: 10px;
  margin-top: 10px;
  .btn-control{
    margin-right: 10px
  }
}
</style>
