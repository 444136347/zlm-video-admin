<template>
  <div id="components-form-demo-advanced-search">
    <a-form class="ant-advanced-search-form" type="line" @submit="fetchMediaList">
      <a-row type="flex" justify="start">
        <a-col :span="6" :style="{ height: 'auto', minHeight: '0' }">
          <a-form-item label="流名称">
            <a-input v-model="searchParam.stream" placeholder="请填写流名称" class="custom-form-width"/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :style="{ height: 'auto', minHeight: '0' }">
          <a-form-item label="应用">
            <a-input v-model="searchParam.app" placeholder="请填写应用" class="custom-form-width"/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :style="{ height: 'auto', minHeight: '0' }">
          <a-form-item label="协议">
            <a-select v-model="searchParam.schema" placeholder="请选择协议" class="custom-form-width">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="rtmp">rtmp</a-select-option>
              <a-select-option value="rtsp">rtsp</a-select-option>
              <a-select-option value="hls">hls</a-select-option>
              <a-select-option value="fmp4">fmp4</a-select-option>
              <a-select-option value="ts">ts</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6" :style="{ textAlign: 'right', height: 'auto', minHeight: '0' }">
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button :style="{ marginLeft: '8px' }" type="info" @click="resetSearch">重置</a-button>
        </a-col>
      </a-row>
    </a-form>
    <div class="operate-div">
      <a-button type="primary" @click="clickPullStream">
        <a-icon type="vertical-align-bottom"/>
        拉流
      </a-button>
    </div>
    <div class="search-result-list">
      <a-table :columns="columns" :data-source="mediaList" :loading="loading" ref="table">
        <div slot="videoInfo" slot-scope="videoInfo">
          <div v-if="videoInfo">
            <p>视频类型: {{ videoInfo.videoCodec }}</p>
            <p>音频类型: {{ videoInfo.audioCodec }}</p>
            <p>视频声音: {{ videoInfo.hasAudio ? '有' : '无' }}</p>
            <p>分辨率: {{ videoInfo.resolution }}</p>
            <p>FPS（每秒帧率）: {{ videoInfo.fps }}</p>
          </div>
          <div v-else>
            暂无视频信息
          </div>
        </div>
        <div slot="generateOriginUrl" slot-scope="generateOriginUrl">
          <a-button type="link" @click="openPlayerDialog(generateOriginUrl)" icon="link">流媒体源列表</a-button>
        </div>
        <div slot="originType" slot-scope="originType">
          <p>{{ getOriginTypeText(originType) }}</p>
        </div>
        <div slot="isRecordingMP4" slot-scope="isRecordingMP4">
          <a-tag color="green" v-if="isRecordingMP4">开启</a-tag>
          <a-tag color="red" v-else>关闭</a-tag>
        </div>
        <div slot="action" slot-scope="text, record">
        <span v-if="!record.isRecordingMP4">
          <a @click="openMp4Back(text, record)"><a-icon type="poweroff"/>开启MP4录像</a>
          <a-divider type="vertical"/>
        </span>
          <span v-else>
          <a @click="previewMp4Back(text, record)"><a-icon type="eye"/>预览MP4录像</a>
        <a-divider type="vertical"/>
        </span>
          <a @click="deleteStream(text, record)">
            <a-icon type="delete"/>
            关闭流</a>
        </div>
      </a-table>
    </div>
    <zlm-pull-dialog :show-modal.sync="visiblePullDialog" @submit="submitPull"/>
    <zlm-play-dialog :current-data="playDialog.currentData" :show-modal.sync="playDialog.visible" />
    <zlm-mp4-back-dialog :current-stream="backDialog.currentStream" :show-modal.sync="backDialog.visible"/>
  </div>
</template>

<script>
import zlmPullDialog from "@/views/components/dialog/zlmPullDialog";
import zlmMp4BackDialog from "@/views/components/dialog/zlmMp4BackDialog";
import zlmPlayDialog from "@/views/components/dialog/zlmPlayDialog";
import {getMediaList, closeStreamsById, startRecordMp4} from "@/api/zlm";

export default {
  components: {
    zlmPullDialog,
    zlmMp4BackDialog,
    zlmPlayDialog,
  },
  data() {
    return {
      mediaList: [],
      columns: [
        {title: '流名称', dataIndex: 'stream', key: 'stream'},
        {title: '应用名', dataIndex: 'app', key: 'app'},
        {title: '协议', dataIndex: 'schema', key: 'schema'},
        {title: '源URL', dataIndex: 'originUrl', key: 'originUrl'},
        {
          title: '流媒体源列表',
          dataIndex: 'generateOriginUrl',
          key: 'generateOriginUrl',
          scopedSlots: {customRender: 'generateOriginUrl'}
        },
        {title: '视频信息', dataIndex: 'videoInfo', key: 'videoInfo', scopedSlots: {customRender: 'videoInfo'}},
        {
          title: '是否开启MP4录像',
          dataIndex: 'isRecordingMP4',
          key: 'isRecordingMP4',
          scopedSlots: {customRender: 'isRecordingMP4'}
        },
        {title: '产生源类型', dataIndex: 'originType', key: 'originType', scopedSlots: {customRender: 'originType'}},
        {title: '创建时间', dataIndex: 'createStamp', key: 'createStamp'},
        {title: '操作', key: 'action', scopedSlots: {customRender: 'action'}},
      ],
      searchParam: {
        stream: '',
        schema: 'rtmp',
        app: 'live',
      },
      loading: false,
      playDialog: {
        visible: false,
        currentData: []
      },
      backDialog: {
        visible: false,
        currentStream: ''
      },
      visiblePullDialog: false,
    };
  },
  created() {
    this.fetchMediaList();
  },
  methods: {
    async fetchMediaList() {
      this.loading = true;
      try {
        const response = await getMediaList(this.getSearchParam());
        if (response.code === 0 && !Object.hasOwnProperty.call(response, 'data')) {
          this.mediaList = [];
          return;
        }
        this.mediaList = response.data.map((item, index) => ({
          ...item,
          key: `${item.app}-${item.stream}-${index}`, // 组合 app 和 stream 生成唯一 key
          createStamp: this.formatTimestamp(item.createStamp),
          generateOriginUrl: this.generateUrls(item),
          videoInfo: this.getVideoInfo(item.tracks),
        }));
      } catch (error) {
        console.error('获取媒体列表出错:', error);
      } finally {
        this.loading = false;
      }
    },
    resetSearch() {
      this.searchParam = {
        stream: '',
        schema: 'rtmp',
        app: 'live',
      };
      this.fetchMediaList();
    },
    getSearchParam() {
      const params = {};
      for (const key in this.searchParam) {
        if (this.searchParam[key].trim() !== '') {
          params[key] = this.searchParam[key];
        }
      }
      return params;
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: false});
    },
    getVideoInfo(tracks) {
      const videoTrack = tracks.find(track => track.codec_type === 0);
      const audioTrack = tracks.find(track => track.codec_type === 1);

      return {
        resolution: videoTrack ? `${videoTrack.width}x${videoTrack.height}` : '无',
        fps: videoTrack ? videoTrack.fps : '无',
        audioCodec: audioTrack ? audioTrack.codec_id_name : '无',
        videoCodec: videoTrack ? videoTrack.codec_id_name : '无',
        hasAudio: !!audioTrack,
      };
    },
    clickPullStream() {
      this.visiblePullDialog = true;
    },
    submitPull() {
      this.fetchMediaListTimeout();
    },
    fetchMediaListTimeout() {
      this.loading = true;
      setTimeout(() => {
        this.fetchMediaList()
      }, 1000);
    },
    openPlayerDialog(records) {
      this.playDialog.currentData = records
      this.playDialog.visible = true
    },
    previewMp4Back(text, record) {
      this.backDialog.currentStream = record.stream
      this.backDialog.visible = true
    },
    openMp4Back(text, record) {
      startRecordMp4({app: record.app, stream: record.stream}).then(res => {
        if (parseInt(res.code) === 0 && res.result) {
          this.$message.success("流开启录制MP4成功");
          this.fetchMediaListTimeout();
        } else {
          this.$message.warning("流开启录制MP4失败，请稍后重试");
        }
      }).catch(err => {
        this.$message.error(err.message || "流开启录制MP4失败");
      });
    },
    deleteStream(text, record) {
      closeStreamsById(record.stream).then(res => {
        if (parseInt(res.code) === 0 && parseInt(res.count_closed) > 0) {
          this.$message.success("关闭拉流代理成功");
          this.fetchMediaListTimeout();
        } else {
          this.$message.warning("关闭拉流代理失败，请稍后重试");
        }
      }).catch(err => {
        this.$message.error(err.message || "关闭拉流代理失败");
      });
    },
    getOriginTypeText(type) {
      let typeText = "未知";
      switch (type) {
        case 1:
          typeText = "RTMP推流";
          break;
        case 2:
          typeText = "RTSP推流";
          break;
        case 3:
          typeText = "RTP推流";
          break;
        case 4:
          typeText = "拉流代理";
          break;
        case 5:
          typeText = "FFmpeg拉流";
          break;
        case 6:
          typeText = "MP4视频点播";
          break;
        case 7:
          typeText = "设备通道";
          break;
      }
      return typeText;
    },
    generateUrls(item) {
      const schema = item.schema; // 获取协议
      const app = item.app; // 获取协议
      const host = item.vhost; // 获取虚拟主机
      const streamId = item.stream; // 获取虚拟主机
      const port = process.env.VUE_APP_ZLMEDIAKIT_HTTP_PORT ? (':' + process.env.VUE_APP_ZLMEDIAKIT_HTTP_PORT) : ''; // 获取端口号
      // 基础URL
      const baseUrls = {
        rtsp: [
          `rtsp://${host}/${app}/${streamId}`,
          `rtsps://${host}/${app}/${streamId}`,
          `rtsp://127.0.0.1/${app}/${streamId}?vhost=${host}`,
          `rtsps://127.0.0.1/${app}/${streamId}?vhost=${host}`
        ],
        rtmp: [
          `rtmp://${host}/${app}/${streamId}`,
          `rtmps://${host}/${app}/${streamId}`,
          `rtmp://127.0.0.1/${app}/${streamId}?vhost=${host}`,
          `rtmps://127.0.0.1/${app}/${streamId}?vhost=${host}`,
          `http://${host}/${app}/${streamId}.live.flv`,
          `https://${host}/${app}/${streamId}.live.flv`,
          `http://127.0.0.1${port}/${app}/${streamId}.live.flv?vhost=${host}`,
          `https://127.0.0.1${port}/${app}/${streamId}.live.flv?vhost=${host}`,
          `ws://${host}/${app}/${streamId}.live.flv`,
          `wss://${host}/${app}/${streamId}.live.flv`,
          `ws://127.0.0.1/${app}/${streamId}.live.flv?vhost=${host}`,
          `wss://127.0.0.1/${app}/${streamId}.live.flv?vhost=${host}`
        ],
        hls: [
          `http://${host}/${app}/${streamId}/hls.m3u8`,
          `https://${host}/${app}/${streamId}/hls.m3u8`,
          `http://127.0.0.1${port}/${app}/${streamId}/hls.m3u8?vhost=${host}`,
          `https://127.0.0.1${port}/${app}/${streamId}/hls.m3u8?vhost=${host}`,
          `http://${host}/${app}/${streamId}/hls.fmp4.m3u8`,
          `https://${host}/${app}/${streamId}/hls.fmp4.m3u8`,
          `http://127.0.0.1${port}/${app}/${streamId}/hls.fmp4.m3u8?vhost=${host}`,
          `https://127.0.0.1${port}/${app}/${streamId}/hls.fmp4.m3u8?vhost=${host}`
        ],
        ts: [
          `http://${host}/${app}/${streamId}.live.ts`,
          `https://${host}/${app}/${streamId}.live.ts`,
          `http://127.0.0.1${port}/${app}/${streamId}.live.ts?vhost=${host}`,
          `https://127.0.0.1${port}/${app}/${streamId}.live.ts?vhost=${host}`,
          `ws://${host}/${app}/${streamId}.live.ts`,
          `wss://${host}/${app}/${streamId}.live.ts`,
          `ws://127.0.0.1/${app}/${streamId}.live.ts?vhost=${host}`,
          `wss://127.0.0.1/${app}/${streamId}.live.ts?vhost=${host}`
        ],
        fmp4: [
          `http://${host}/${app}/${streamId}.live.mp4`,
          `https://${host}/${app}/${streamId}.live.mp4`,
          `http://127.0.0.1${port}/${app}/${streamId}.live.mp4?vhost=${host}`,
          `https://127.0.0.1${port}/${app}/${streamId}.live.mp4?vhost=${host}`,
          `ws://${host}/${app}/${streamId}.live.mp4`,
          `wss://${host}/${app}/${streamId}.live.mp4`,
          `ws://127.0.0.1/${app}/${streamId}.live.mp4?vhost=${host}`,
          `wss://127.0.0.1/${app}/${streamId}.live.mp4?vhost=${host}`
        ]
      };
      // 获取该流源支持的URL类型
      const supportedUrls = [];
      supportedUrls.push(...baseUrls[schema]);
      return supportedUrls;
    }
  },
}
;
</script>

<style scoped>
.ant-advanced-search-form {
  padding: 16px;
  background: #fbfbfb;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.ant-advanced-search-form .ant-form-item {
  display: flex;
}

.ant-advanced-search-form .ant-form-item-control-wrapper {
  flex: 1;
}

#components-form-demo-advanced-search .ant-form {
  max-width: none;
}

#components-form-demo-advanced-search .search-result-list {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
}
.operate-div {
  padding-top: 16px;
}
.custom-form-width {
  width: 200px;
}
.ant-advanced-search-form .ant-col {
  min-height: 0; /* 如果默认有 min-height，重置为 0 */
  height: auto; /* 确保高度根据内容调整 */
}
</style>
