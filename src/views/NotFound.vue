<template>
  <a-result status="404" title="404" sub-title="很抱歉，您访问的页面不存在。">
    <template #extra>
      <a-button type="primary" @click="toHome">
        返回首页
      </a-button>
    </template>
  </a-result>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    toHome () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
