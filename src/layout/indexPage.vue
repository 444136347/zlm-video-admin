<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
      <nav-bar :logo="logo" />
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <head-bar @changeCollapse="changeCollapse" />
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '5px 5px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <app-main />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import headBar from "@/layout/components/headBar.vue";
import navBar from "@/layout/components/navBar.vue";
import appMain from "@/layout/components/appMain.vue";
export default {
  components: {
    headBar,
    navBar,
    appMain
  },
  data() {
    return {
      collapsed: false,
      logo: true
    };
  },
  methods: {
    changeCollapse(collapsed) {
      this.collapsed = collapsed;
      this.logo = collapsed ? false : true;
    }
  }
};
</script>

<style lang="less">
#header-bar {
  position: relative;
  .avatar {
    border: 1px solid #cccccc;
    cursor: pointer;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 24px;
  }
  .breadcrumb {
    position: absolute;
    top: 20px;
    left: 60px;
  }
}
#components-layout-demo-custom-trigger {
  height: 100vh;
  .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
    &:hover {
      color: #1890ff;
    }
  }
  .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
    text-align: center;
    line-height: 32px;
    color: #ffffff;
  }
}
</style>
