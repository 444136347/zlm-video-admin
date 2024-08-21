<template>
  <div class="server-config">
    <div>
      <a-button type="primary" class="refresh-config" :loading="loadingConfig" @click="fetchServerConfig" size="large">
        <a-icon type="redo"/>
        重新获取配置
      </a-button>
      <a-input v-model="searchKeyword" placeholder="输入搜索关键字" class="refresh-config"
               @input="filterServerConfig"/>
    </div>
    <div class="server-config-list">
      <a-list bordered>
        <a-list-item v-for="(value, key) in filteredServerConfigWithDescriptions" :key="key">
          <a slot="actions" @click="editConfig(key, value)">编辑</a>
          <a-list-item-meta :title="key" :description="value.description"/>
          <div>{{ value.value }}</div>
        </a-list-item>
      </a-list>
    </div>
    <a-modal
        title="修改配置项"
        :visible="visibleConfigDialog"
        :confirm-loading="confirmConfigLoading"
        @ok="handleConfigOk"
        @cancel="handleConfigCancel"
    >
      <a-alert
          :message="`原始${ configData.key }值为：${configData.originValue}`"
          :description="`描述：${ configData.description }`"
          type="info"
          show-icon
          closeable
          class="refresh-config"
      />
      <a-form :form="configData" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
        <a-form-item label="配置项" required>
          <a-input
              :disabled="true"
              v-model="configData.key"
              placeholder="请输入配置项"
          />
        </a-form-item>
        <a-form-item label="配置值" required>
          <a-input
              v-model="configData.value"
              placeholder="请输入配置值"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {getServerConfig, setServerConfig} from '@/api/zlm';
import configDescriptions from '@/utils/configDescriptions';

export default {
  data() {
    return {
      configData: {
        key: '',
        originValue: '',
        value: '',
        description: '',
      },
      confirmConfigLoading: false,
      visibleConfigDialog: false,
      loadingConfig: false,
      serverConfig: {},
      searchKeyword: '',
      filteredServerConfig: {}, // 过滤后的服务器配置数据
      configDescriptions: configDescriptions
    };
  },
  mounted() {
    this.fetchServerConfig();
  },
  computed: {
    filteredServerConfigWithDescriptions() {
      return Object.keys(this.filteredServerConfig).reduce((acc, key) => {
        acc[key] = {
          value: this.filteredServerConfig[key],
          description: this.configDescriptions[key] || key
        };
        return acc;
      }, {});
    }
  },
  methods: {
    fetchServerConfig() {
      this.loadingConfig = true;
      getServerConfig()
          .then(res => {
            this.serverConfig = res.data[0] || {};
            this.filteredServerConfig = {...this.serverConfig}; // 初始化时显示全部配置
            this.loadingConfig = false;
          })
          .catch(err => {
            this.loadingConfig = false;
            this.$message.error(err.message || "获取服务器配置失败");
          });
    },
    filterServerConfig() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      if (!keyword) {
        this.filteredServerConfig = {...this.serverConfig};
        return;
      }
      const filtered = {};
      Object.keys(this.serverConfig).forEach(key => {
        const value = this.serverConfig[key].toString().toLowerCase();
        const description = this.configDescriptions[key] ? this.configDescriptions[key].toLowerCase() : '';
        if (key.toLowerCase().includes(keyword) || value.includes(keyword) || description.includes(keyword)) {
          filtered[key] = this.serverConfig[key];
        }
      });
      this.filteredServerConfig = filtered;
    },
    handleConfigOk() {
      let key = this.configData.key
      let value = this.configData.value
      let params = {}
      params[key] = value
      if (!value) return this.$message.error("配置值不能为空");
      this.confirmConfigLoading = true
      setServerConfig(params).then(res => {
        if (parseInt(res.code) === 0 && parseInt(res.changed) > 0) {
          this.$message.success("设置服务器配置成功");
          this.visibleConfigDialog = false
          this.fetchServerConfig()
        } else if(parseInt(res.code) === 0 && parseInt(res.changed) === 0) {
          this.$message.warning("设置服务器配置无效");
        } else {
          this.$message.error("设置服务器配置异常");
        }
        this.confirmConfigLoading = false
      }).catch(err => {
        this.confirmConfigLoading = false
        this.$message.error(err.message || "设置服务器配置失败");
      })
    },
    handleConfigCancel() {
      this.visibleConfigDialog = false
    },
    editConfig(key, value) {
      this.configData.key = key
      this.configData.value = ''
      this.configData.originValue = value.value
      this.configData.description = value.description
      this.visibleConfigDialog = true
    }
  }
};
</script>

<style lang="less" scoped>
.server-config {
  padding: 20px;
  max-height: 85vh; /* 设置一个最大高度，例如视窗高度的85% */
  overflow-y: auto; /* 当内容溢出时显示垂直滚动条 */
}
.refresh-config {
  margin-bottom: 10px
}

</style>
