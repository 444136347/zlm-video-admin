<template>
  <div>
    <div class="logo">
      <span v-show="logo">zlm流媒体管理后台</span>
      <span v-show="!logo">Z</span>
    </div>
    <a-menu theme="dark" :selectedKeys="[$route.path]" @click="handelClick" mode="inline" v-for="item in list" :key="item.name">

      <a-menu-item v-if="!item.children" :key="item.path">
        <a-icon :type="item.meta.icon" />
        <span>{{ item.meta.title }}</span>
      </a-menu-item>
      <a-sub-menu v-else :key="item.path">
        <span slot="title">
          <a-icon :type="item.meta.icon" />
          <span>{{item.meta.title }}</span>
        </span>
        <a-menu-item v-for="citem in item.children" :key="citem.path">{{ citem.meta.title }}</a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
export default {
  props: {
    logo: {
      type: Boolean,
      return: true,
      list: []
    }
  },
  created() {
    this.list = this.$router.options.routes[2].children;
  },
  methods: {
    handelClick(item) {
      this.$router.push(item.key);
    }
  }
};
</script>
