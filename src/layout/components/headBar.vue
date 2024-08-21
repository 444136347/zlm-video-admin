<template>
  <div id="header-bar">
    <a-icon
      class="trigger"
      :type="collapsed ? 'menu-unfold' : 'menu-fold'"
      @click="changeCollapse"
    />
    <a-breadcrumb
      :routes="routes"
      class="breadcrumb"
      separator=">"
    >
      <template slot="itemRender" slot-scope="{ route, routes }">
        <span v-if="routes.length === 1">{{ route.meta.title }}</span>
        <router-link v-else :to="`${route.path}`">{{ route.meta.title }}</router-link>
      </template>
    </a-breadcrumb>
    <a-dropdown placement="bottomRight">
      <a-avatar class="avatar" shape="square" :size="50" :src="avatar" />
      <a-menu slot="overlay" class="head-menu">
        <a-menu-item>
          <router-link to="/">首页</router-link>
        </a-menu-item>
        <a-menu-item>
          <a href="javascript:;" @click="toLogout">退出</a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  data() {
    return {
      collapsed: false,
      routes: []
    };
  },
  created() {
    this.routes = this.$route.matched.filter(item => item.meta.title);
  },
  watch:{
		// 监听路由变化
		$route(e){
			this.routes = e.matched.filter(items => items.meta.title);
		}
	},
  computed: {
    ...mapGetters(["token", "avatar"])
  },
  methods: {
    ...mapActions({
      logout: "user/logout"
    }),
    changeCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit("changeCollapse", this.collapsed);
    },
    toLogout() {
      this.logout().then(() => {
        this.$router.push({ path: `/login?redirect=${this.$route.fullPath}` });
      });
    }
  }
};
</script>
<style lang="less" scoped>
  .head-menu{
    width:100px;
    text-align: center;
  }
</style>
