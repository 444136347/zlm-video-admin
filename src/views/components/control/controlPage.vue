<template>
  <div class="control-div">
    <a-row :gutter="10">
      <a-col :span="12">
        <h4>ZLMediaKit线程延迟率</h4>
        <div class="control-table" ref="threadsLoad"/>
      </a-col>
      <a-col :span="12">
        <h4>ZLMediaKit线程负载率</h4>
        <div class="control-table" ref="workThreadsLoad"/>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getThreadsLoad } from '@/api/zlm';

export default {
  data() {
    return {
      chartOptions: {
        toolbox: { feature: { saveAsImage: {} } },
        legend: { data: [] },
        xAxis: {
          type: 'category',
          data: [],
          name: '时间',
          nameTextStyle: { fontWeight: 300, fontSize: 15 }
        },
        yAxis: {
          type: 'value',
          name: '',
          boundaryGap: [0, '100%'],
          max: 100,
          axisLabel: { show: true, interval: 'auto', formatter: '{value} %' },
          nameTextStyle: { fontWeight: 300, fontSize: 15 }
        },
        dataZoom: [{ show: true, start: 0, end: 100 }],
        series: []
      },
      maxDataCount: 6, // 控制最大显示的数据点数
      delayChart: null,
      loadChart: null,
      chartInterval: null,
      initResize: false,
      allData: [], // 存储所有数据，用于支持拖动查看历史数据
      retryCount: 0, // 重试计数器
      maxRetries: 3, // 最大重试次数
      retryDelay: 60000 // 重试延迟时间（毫秒）
    };
  },
  mounted() {
    this.initCharts();
    this.startDataFetch();
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeDestroy() {
    clearInterval(this.chartInterval);
    window.removeEventListener('resize', this.resizeCharts);
  },
  methods: {
    startDataFetch() {
      this.updateData();
      this.chartInterval = setInterval(this.updateData, 3000);
    },
    stopDataFetch() {
      clearInterval(this.chartInterval);
      this.chartInterval = null;
    },
    updateData() {
      this.fetchThreadsLoadData();
    },
    fetchThreadsLoadData() {
      getThreadsLoad()
          .then(res => {
            this.resizeCharts()
            if (res.code === 0) {
              const time = new Date().toLocaleTimeString();
              this.allData.push({ time: time, data: res.data });
              if (this.allData.length > this.maxDataCount) {
                this.allData.shift(); // 只保留最新的 maxDataCount 条数据
              }
              this.updateChart(this.delayChart, res.data, 'delay', time);
              this.updateChart(this.loadChart, res.data, 'load', time);
              this.retryCount = 0; // 重置重试计数器
            } else {
              this.handleRequestError();
            }
          })
          .catch(err => {
            this.resizeCharts()
            console.log(err.message || "获取线程信息失败");
          });
    },
    handleRequestError() {
      this.retryCount += 1;
      if (this.retryCount >= this.maxRetries) {
        this.stopDataFetch();
        setTimeout(() => {
          this.retryCount = 0;
          this.startDataFetch();
        }, this.retryDelay);
      }
    },
    updateChart(chart, data, key, time) {
      const options = chart.getOption();
      options.xAxis[0].data.push(time);

      while (options.series.length < data.length) {
        options.series.push({
          name: "线程" + (options.series.length + 1),
          data: [],
          type: 'line',
          stack: 'total',
          areaStyle: {}
        });
      }

      data.forEach((item, index) => {
        options.series[index].data.push(item[key]);
        if (!options.legend[0].data.includes("线程" + (index + 1))) {
          options.legend[0].data.push("线程" + (index + 1));
        }
      });

      const xAxisDataLength = options.xAxis[0].data.length;
      options.dataZoom[0].end = (xAxisDataLength / (xAxisDataLength + 1)) * 100;

      chart.setOption(options);
    },
    initCharts() {
      this.delayChart = echarts.init(this.$refs.threadsLoad);
      this.loadChart = echarts.init(this.$refs.workThreadsLoad);
      const delayOptions = JSON.parse(JSON.stringify(this.chartOptions));
      const initialTime = new Date().toLocaleTimeString();
      delayOptions.xAxis.data.push(initialTime); // 添加初始数据点
      this.delayChart.setOption(delayOptions);
      this.delayChart.on('dataZoom', this.handleDataZoom.bind(this, this.delayChart));

      const loadOptions = JSON.parse(JSON.stringify(this.chartOptions));
      loadOptions.xAxis.data.push(initialTime); // 添加初始数据点
      this.loadChart.setOption(loadOptions);
      this.loadChart.on('dataZoom', this.handleDataZoom.bind(this, this.loadChart));
    },
    handleDataZoom(chart, event) {
      const { start, end } = event.batch ? event.batch[0] : event;
      const options = chart.getOption();
      options.dataZoom[0].start = start;
      options.dataZoom[0].end = end;
      chart.setOption(options);
    },
    resizeCharts() {
      if (this.delayChart) this.delayChart.resize();
      if (this.loadChart) this.loadChart.resize();
      if (!this.initResize) this.initResize = true;
    }
  }
}
</script>

<style lang="less" scoped>
.control-div {
  margin-top: 10px;
  padding: 12px;
  background: #f0f2f5;
  overflow: auto;
}

.control-table {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  min-height: 25rem;
  overflow: hidden;
}
</style>
