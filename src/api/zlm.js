import axios from "axios";

export const globalParam = {
  // 这里目前直接指定http，后续可以直接修改，或者加到配置文件
  baseUrl: getBaseUrl(),
  vhost: '__defaultVhost__',
  apiUrlPrefix: '/index/api/',
  secret: process.env.VUE_APP_ZLMEDIAKIT_HTTP_SECRET
};

// 将 getHttpStr 定义为一个独立的函数，并导出
// type为1则为http(s)，type为2则为ws(s)

export function getBaseUrl(type = 1) {
  let prefix
  if (type === 2) {
    prefix = process.env.VUE_APP_ZLMEDIAKIT_IS_SSL === true ? 'wss://' : 'ws://'
  } else {
    prefix = process.env.VUE_APP_ZLMEDIAKIT_IS_SSL === true ? 'https://' : 'http://'
  }
  return prefix + process.env.VUE_APP_ZLMEDIAKIT_SERVICE_IP + ':' + process.env.VUE_APP_ZLMEDIAKIT_HTTP_PORT;
}

// 创建一个自定义的 Axios 实例
const customAxios = axios.create({
  baseURL: globalParam.baseUrl, // 设置特定请求的 baseURL
  timeout: 5000, // 请求超时时间
});

customAxios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

customAxios.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      console.error('错误返回数据:', error.response.data);
      console.error('错误返回数据状态:', error.response.status);
      console.error('错误返回Headers', error.response.headers);
    } else if (error.request) {
      console.error('错误请求数据:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
    console.error('错误配置:', error.config);
    return Promise.reject(error);
  }
);

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取流列表
export function getMediaList(params) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'getMediaList',
    method: 'post',
    params: {
      secret: globalParam.secret,
      vhost: globalParam.vhost,
      ...params
    }
  });
}

// 查看MP4录像文件接口
export function getMp4RecordFile(data) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'getMp4RecordFile',
    method: 'post',
    params: {
      app: 'live',
      secret: globalParam.secret,
      vhost: globalParam.vhost,
      stream: data.stream || '',
      period: data.period || getCurrentDate(),
    }
  });
}

// 流开始录制MP4
export function startRecordMp4(params) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'startRecord',
    method: 'post',
    params: {
      ...{max_second: 60, type: 1, secret: globalParam.secret, vhost: globalParam.vhost}, ...params
    }
  });
}

// 流停止录制MP4
export function stopRecordMp4(params) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'stopRecord',
    method: 'post',
    params: {
      ...{type: 1, secret: globalParam.secret, vhost: globalParam.vhost}, ...params
    }
  });
}

// 根据key删除拉流代理
export function delStreamProxyBack(key) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'delStreamProxy',
    method: 'post',
    params: {
      key: key,
      secret: globalParam.secret,
    }
  });
}

// 通过app关闭流
export function closeStreamsByApp(app) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'close_streams',
    method: 'post',
    params: {
      app: app,
      secret: globalParam.secret,
    }
  });
}

// 通过流ID关闭流
export function closeStreamsById(streamId) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'close_streams',
    method: 'post',
    params: {
      stream: streamId,
      secret: globalParam.secret,
    }
  });
}

// 拉流代理
export function addStreamProxy(params) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'addStreamProxy',
    method: 'post',
    params: {...{secret: globalParam.secret, vhost: globalParam.vhost}, ...params}
  });
}

// 回放拉流代理
export function addStreamProxyBack(data) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'addStreamProxy',
    method: 'post',
    params: {
      app: 'tracks',
      secret: globalParam.secret,
      vhost: globalParam.vhost,
      url: data.url || '',
      stream: data.key + '_tracks' || '',
      enable_rtmp: true,
      enable_rtsp: false,
      enable_hls: false,
      enable_mp4: false,
      enable_hls_fmp4: false,
      enable_ts: false,
      enable_fmp4: false,
      auto_close: true,
    }
  });
}

// 获取服务器配置
export function getServerConfig() {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'getServerConfig',
    method: 'get',
    params: {
      secret: globalParam.secret,
    }
  });
}

// 服务器配置
export function setServerConfig(params) {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'setServerConfig',
    method: 'post',
    params: {...{secret: globalParam.secret}, ...params}
  });
}

// 获取线程数据
export function getThreadsLoad() {
  return customAxios({
    url: globalParam.apiUrlPrefix + 'getThreadsLoad',
    method: 'get',
    params: {
      secret: globalParam.secret,
    }
  });
}

