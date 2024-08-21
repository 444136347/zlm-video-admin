<template>
  <div class="dashboard">
    <div>
      <h1>欢迎回来：{{ name }}</h1>
    </div>
    <div>
      <serve-card-page />
    </div>
    <div>
      <control-page />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import controlPage from "@/views/components/control/controlPage";
import serveCardPage from "@/views/components/control/serveCardPage";

export default {
  components: {
    controlPage,
    serveCardPage
  },
  computed: {
    ...mapGetters(['name'])
  }
}
</script>

<style scoped>
.dashboard {
  height: 85vh;
  overflow-y: auto;
}
</style>
