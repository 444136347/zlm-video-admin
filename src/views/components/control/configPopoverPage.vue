<template>
  <div>
    <a-popover v-model="serveConfigVisible" title="配置表格" trigger="click" placement="rightBottom">
      <template slot="content">
        <div class="table-popover">
          <a-input v-model="searchKeyword" placeholder="输入搜索关键字" style="margin-bottom: 10px;" @input="filterServerConfig" />
          <table class="table-main" cellspacing="0">
            <tr v-for="(value, key) in filteredServerConfig" :key="key">
              <td class="table-main-right">{{ key }}</td>
              <td class="table-main-left">{{ value }}</td>
            </tr>
          </table>
        </div>
      </template>
      <a-button type="primary" @click="fetchServerConfig">
        查看ZLMediaKit服务配置
      </a-button>
    </a-popover>
  </div>
</template>

<script>
import { getServerConfig } from '@/api/zlm';

export default {
  data() {
    return {
      serverConfig: {},
      serveConfigVisible: false,
      searchKeyword: '',
      filteredServerConfig: {} // 过滤后的服务器配置数据
    };
  },
  methods: {
    fetchServerConfig() {
      getServerConfig()
          .then(res => {
            this.serverConfig = res.data[0] || {};
            this.filteredServerConfig = { ...this.serverConfig }; // 初始化时显示全部配置
          })
          .catch(err => {
            this.$message.error(err.message || "请求错误");
          });
    },
    filterServerConfig() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      if (!keyword) {
        this.filteredServerConfig = { ...this.serverConfig };
        return;
      }
      const filtered = {};
      Object.keys(this.serverConfig).forEach(key => {
        const value = this.serverConfig[key].toString().toLowerCase();
        if (key.toLowerCase().includes(keyword) || value.includes(keyword)) {
          filtered[key] = this.serverConfig[key];
        }
      });
      this.filteredServerConfig = filtered;
    }
  }
};
</script>

<style lang="less" scoped>
.control-div {
  margin-top: 10px;
  padding: 12px;
  background: #f0f2f5;
  overflow: auto;
}
.table-popover {
  height: 300px;
  overflow: auto;
}
.table-main {
  border: 1px solid #dcdcdc;
  border-collapse: collapse;
}
.table-main td {
  border: 1px solid #dcdcdc;
  padding: 0.2rem;
}
.table-main-right {
  width: 18rem;
  text-align: right;
}
.table-main-left {
  width: 33rem;
  text-align: left;
}
.control-table {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  min-height: 25rem;
  overflow: hidden;
}
</style>
