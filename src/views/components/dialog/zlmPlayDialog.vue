<template>
  <a-modal v-model="localShowModal"
           title="流媒体源URL列表"
           cancelText="关闭"
           okText="确定"
  >
    <template slot="footer">
      <a-button key="back" @click="handleCancel">
        关闭
      </a-button>
    </template>
    <a-form layout="inline">
      <a-alert message="温馨提示!" type="info" closable class="alert-info">
        <span slot="description" v-html="alertDescription" />
      </a-alert>
    </a-form>
    <a-table :columns="columns" :data-source="playList">
      <span slot="action" slot-scope="text, record">
        <a-button type="link" class="copy-btn" :data-clipboard-text="record.url">复制</a-button>
      </span>
    </a-table>
  </a-modal>
</template>

<script>
import ClipboardJS from 'clipboard';

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
    currentData: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      alertDescription: '【__defaultVhost__】为虚拟主机' +
          '<br>流媒体源的使用，具体可以看<a href="https://github.com/zlmediakit/ZLMediaKit/wiki/%E6%92%AD%E6%94%BEurl%E8%A7%84%E5%88%99">播放url规则</a>',
      columns: [
        {
          title: 'URL',
          dataIndex: 'url',
          key: 'url',
        },
        {
          title: '操作',
          key: 'action',
          width: 80,
          scopedSlots: {customRender: 'action'},
        },
      ],
      playList: [],
    };
  },
  mounted() {
    this.clipboard = new ClipboardJS('.copy-btn');
    this.clipboard.on('success', () => {
      this.$message.destroy();
      this.$message.success('复制成功');
    });
    this.clipboard.on('error', () => {
      this.$message.destroy();
      this.$message.error('复制失败');
    });
  },
  computed: {
    localShowModal: {
      get() {
        return this.showModal;
      },
      set(value) {
        this.$emit('update:showModal', value);
      }
    }
  },
  watch: {
    showModal(newVal) {
      if (newVal) this.fetchList();
    }
  },
  methods: {
    fetchList() {
      this.playList = this.currentData.map((item, index) => ({
        key: index,
        url: item,
      }));
    },
    handleOk() {
      this.$emit('update:showModal', false);
    },
    handleCancel() {
      this.$emit('update:showModal', false);
    }
  },
};
</script>

<style scoped>
.alert-info {
  margin-bottom: 10px;
}
</style>
