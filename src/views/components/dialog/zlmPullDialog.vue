<template>
  <a-modal
      v-model="localShowModal"
      width="1000px"
      title="添加拉流代理"
      :ok-text="submitIng ? '提交中...' : '确认'"
      :cancel-text="'取消'"
      @ok="handleSubmit"
      @cancel="handleCancel"
  >
    <a-form :model="form" ref="form">
      <a-row :gutter="16">
        <template v-for="(item, index) in formItems">
          <a-col :span="8" v-if="!collapsed || index < 6" :key="index">
            <a-form-item :label="item.label" :prop="item.prop" :required="item.required">
              <component
                  :is="item.component"
                  v-model="form[item.prop]"
                  v-bind="item.attrs"
              >
                <template v-if="item.prop === 'rtp_type'">
                  <a-select-option :value="0">TCP</a-select-option>
                  <a-select-option :value="1">UDP</a-select-option>
                  <a-select-option :value="2">组播</a-select-option>
                </template>
                <template v-if="item.prop === 'modify_stamp'">
                  <a-radio :value="0">绝对时间戳</a-radio>
                  <a-radio :value="1">系统时间戳</a-radio>
                  <a-radio :value="2">相对时间戳</a-radio>
                </template>
              </component>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
      <a-row>
        <a-col :span="24">
          <a-button type="link" @click="toggleCollapse">
            <span v-if="collapsed">展开更多 <a-icon type="down" /> </span>
            <span v-else>收起 <a-icon type="up" /></span>
          </a-button>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import {addStreamProxy} from '@/api/zlm';

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
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
  data() {
    return {
      submitIng: false,
      collapsed: true,
      form: {
        app: '',
        stream: '',
        url: '',
        retry_count: 3,
        rtp_type: 0,
        timeout_sec: 15,
        enable_hls: false,
        enable_hls_fmp4: false,
        enable_mp4: false,
        enable_rtsp: true,
        enable_rtmp: true,
        enable_ts: true,
        enable_fmp4: true,
        hls_demand: false,
        rtsp_demand: false,
        rtmp_demand: false,
        ts_demand: false,
        fmp4_demand: false,
        enable_audio: false,
        add_mute_audio: false,
        mp4_save_path: './www',
        mp4_max_second: 3600,
        mp4_as_player: false,
        hls_save_path: '',
        modify_stamp: 2,
        auto_close: false,
      },
      formItems: [
        { label: '应用名', prop: 'app', required: true, component: 'a-input', attrs: { placeholder: '请输入应用名，如live' } },
        { label: '流ID名', prop: 'stream', required: true, component: 'a-input', attrs: { placeholder: '请输入流ID名' } },
        { label: '拉流地址', prop: 'url', required: true, component: 'a-input', attrs: { placeholder: '请输入拉流地址' } },
        { label: 'RTSP拉流方式', prop: 'rtp_type', component: 'a-select', attrs: {} },
        { label: '拉流重试次数', prop: 'retry_count', component: 'a-input-number', attrs: { min: -1, style: {width: '100%'}} },
        { label: '拉流超时时间（秒）', prop: 'timeout_sec', component: 'a-input-number', attrs: { step: 0.1, style: {width: '100%'}} },
        { label: '是否转换成hls-mpegts协议', prop: 'enable_hls', component: 'a-switch', attrs: {} },
        { label: '是否转换成hls-fmp4协议', prop: 'enable_hls_fmp4', component: 'a-switch', attrs: {} },
        { label: '是否允许mp4录制', prop: 'enable_mp4', component: 'a-switch', attrs: {} },
        { label: '是否转rtsp协议', prop: 'enable_rtsp', component: 'a-switch', attrs: {} },
        { label: '是否转rtmp/flv协议', prop: 'enable_rtmp', component: 'a-switch', attrs: {} },
        { label: '是否转http-ts/ws-ts协议', prop: 'enable_ts', component: 'a-switch', attrs: {} },
        { label: '是否转http-fmp4/ws-fmp4协议', prop: 'enable_fmp4', component: 'a-switch', attrs: {} },
        { label: 'hls协议是否有人观看才生成', prop: 'hls_demand', component: 'a-switch', attrs: {} },
        { label: 'rtsp协议是否有人观看才生成', prop: 'rtsp_demand', component: 'a-switch', attrs: {} },
        { label: 'rtmp协议是否有人观看才生成', prop: 'rtmp_demand', component: 'a-switch', attrs: {} },
        { label: 'http-ts/ws-ts协议是否有人观看才生成', prop: 'ts_demand', component: 'a-switch', attrs: {} },
        { label: 'http-fmp4/ws-fmp4协议是否有人观看才生成', prop: 'fmp4_demand', component: 'a-switch', attrs: {} },
        { label: '转协议时是否开启音频', prop: 'enable_audio', component: 'a-switch', attrs: {} },
        { label: '转协议时，无音频是否添加静音aac音频', prop: 'add_mute_audio', component: 'a-switch', attrs: {} },
        { label: 'MP4录制文件保存根目录', prop: 'mp4_save_path', component: 'a-input', attrs: {} },
        { label: 'MP4录制切片大小（秒）', prop: 'mp4_max_second', component: 'a-input-number', attrs: { min: 0, style: {width: '100%'} } },
        { label: 'MP4录制是否当作观看者参与播放人数计数', prop: 'mp4_as_player', component: 'a-switch', attrs: {} },
        { label: 'HLS文件保存根目录', prop: 'hls_save_path', component: 'a-input', attrs: {} },
        { label: '流时间戳覆盖方式', prop: 'modify_stamp', component: 'a-radio-group', attrs: {} },
        { label: '无人观看是否自动关闭流', prop: 'auto_close', component: 'a-switch', attrs: {} },
      ]
    };
  },
  methods: {
    handleSubmit() {
      this.submitIng = true
      addStreamProxy(this.form).then(()=> {
        this.$emit('submit');
        this.submitIng = false
        this.$emit('update:showModal', false);
        this.$message.success("添加拉流代理成功");
      }).catch(err=> {
        this.$message.error(err.message || "添加拉流代理失败");
      })
    },
    handleCancel() {
      this.$emit('update:showModal', false);
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
  },
};
</script>

<style scoped>
/* Add custom styles as needed */
</style>
