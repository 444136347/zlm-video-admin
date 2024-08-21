<template>
  <a-modal v-model="localShowModal"
           title="录像回放"
           cancelText="关闭"
           okText="确定"
  >
    <template slot="footer">
      <a-button key="back" @click="handleCancel">
        关闭
      </a-button>
    </template>
    <a-form layout="inline">
      <a-alert message="温馨提示!" type="info" closable description="当前录像默认取今日的录像数据" class="alert-info"/>
      <a-form-item label="选择录像日期">
        <a-date-picker @change="changeReplayDate"
                       :default-value="moment(getCurrentDate(), dateFormat)"
                       :format="dateFormat"/>
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="fetchMp4Record">
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <a-table :columns="columns" :data-source="replayList">
      <span slot="action" slot-scope="text, record">
        <a :href="record.path" target="_blank">播放</a>
      </span>
    </a-table>
  </a-modal>
</template>

<script>
import moment from 'moment';
import {getMp4RecordFile, globalParam} from '@/api/zlm';

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
    currentStream: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      columns: [
        {
          title: 'URL',
          dataIndex: 'path',
          key: 'path',
        },
        {
          title: '操作',
          key: 'action',
          width: 80,
          scopedSlots: {customRender: 'action'},
        },
      ],
      replayList: [],
      dateFormat: 'YYYY-MM-DD',
      period: '',
    };
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
      if (newVal) this.fetchMp4Record();
    }
  },
  methods: {
    moment,
    getCurrentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    changeReplayDate(date, dateString) {
      this.period = dateString;
    },
    fetchMp4Record() {
      this.replayList = [];
      getMp4RecordFile({stream: this.currentStream, period: this.period}).then(res => {
        if (parseInt(res.code) === 0) {
          if (res.data.paths.length > 0) {
            let sortedArray = res.data.paths.sort(function (a, b) {
              let leftPartA = a.split('.')[0];
              let leftPartB = b.split('.')[0];
              let partsA = leftPartA.split('-');
              let partsB = leftPartB.split('-');
              let lastNumA = parseInt(partsA[partsA.length - 1], 10);
              let lastNumB = parseInt(partsB[partsB.length - 1], 10);

              if (lastNumA < lastNumB) {
                return 1;
              }
              if (lastNumA > lastNumB) {
                return -1;
              }
              return 0;
            });
            sortedArray.forEach((item, index) => {
              const startIndex = res.data.rootPath.indexOf("www") + "www".length;
              const result = startIndex !== -1 ? res.data.rootPath.substring(startIndex) : "";
              this.replayList.push({
                key: `${item}-${index}`,  // 确保 key 唯一
                name: item,
                path: globalParam.baseUrl + result + item
              });
            });
          }
        }
      }).catch(err => {
        console.log(err);
      });
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
