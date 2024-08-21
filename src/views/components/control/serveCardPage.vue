<template>
  <div class="control-div">
    <h3>服务信息</h3>
    <a-config-provider>
      <template #renderEmpty>
        <div style="text-align: center">
          <a-icon type="smile" style="font-size: 20px" />
          <p>ZLMediaKit服务未启动</p>
          <p><a @click="fetchZLMediaKitInfo">刷新</a></p>
        </div>
      </template>
      <div class="config-provider">
        <a-table :loading="loading" :columns="columns" bordered :data-source="data" size="small" :pagination="false">
          <span slot="action">
            <a @click="fetchZLMediaKitInfo">刷新</a>
          </span>
        </a-table>
      </div>
    </a-config-provider>
  </div>
</template>

<script>
import {getServerConfig} from '@/api/zlm';

export default {
  props: {
    reload: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    reload(newVal) {
      if (newVal) this.fetchZLMediaKitInfo()
    }
  },
  data() {
    return {
      loading: true, // 控制卡片加载状态
      columns:[
        {
          title: '服务IP',
          dataIndex: 'serverIp',
          width: 120,
        },
        {
          title: '流媒体ID',
          dataIndex: 'mediaServerId',
          width: 150,
        },
        {
          title: 'RTSP端口',
          dataIndex: 'rtspPort',
          width: 120,
        },
        {
          title: 'RTMP端口',
          dataIndex: 'rtmpPort',
          width: 120,
        },
        {
          title: 'HTTP端口',
          dataIndex: 'httpPort',
          width: 120,
        },
        {
          title: 'WebRTC端口',
          dataIndex: 'rtcPort',
          width: 120,
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
      zlmServerRunning: false, // 判断服务是否在运行
      zlmInfo: {}, // 存储ZLMediaKit服务信息
      env: process.env,
      data: []
    };
  },
  methods: {
    fetchZLMediaKitInfo() {
      this.loading = true; // 开始加载时设置 loading 为 true
      getServerConfig()
          .then(response => {
            if (response.code === 0) {
              // 服务正常运行
              this.zlmServerRunning = true;
              this.zlmInfo = response.data[0];
              this.data[0] = {
                key: 0,
                serverIp: this.env.VUE_APP_ZLMEDIAKIT_SERVICE_IP,
                mediaServerId: this.zlmInfo['general.mediaServerId'],
                rtspPort: this.zlmInfo['rtsp.port'],
                rtmpPort: this.zlmInfo['rtmp.port'],
                httpPort: this.zlmInfo['http.port'],
                rtcPort: this.zlmInfo['rtc.port'],
              };
            } else {
              this.zlmServerRunning = false;
            }
          })
          .catch(() => {
            this.data = []
            this.zlmServerRunning = false;
          })
          .finally(() => {
            this.loading = false; // 查询结束，停止加载
          });
    }
  },
  mounted() {
    // 在组件挂载时获取 ZLMediaKit 的信息
    this.fetchZLMediaKitInfo();
  }
};
</script>

<style scoped>
.control-div {
  padding: 12px;
  background: #f0f2f5;
}
.config-provider {
  background: #ffffff;
}
</style>
