const router = [
  {
    path: "/dashboard",
    name: "dashboard",
    component: "/dashboard/indexPage",
    meta: {
      title: "仪表盘",
      icon: "dashboard",
    },
  },
  {
    path: "/zlm",
    name: "zlm",
    redirect: '/zlm/setPage',
    component: "/zlm/zlmPage",
    meta: {
      title: "流服务管理",
      icon: "tool",
    },
    children: [
      {
        path: "/zlm/setPage",
        name: "ZlmSetPage",
        component: "/zlm/set/setPage",
        hidden: true,
        meta: {
          title: "ZLMediaKit配置",
          icon: "",
        },
      },
      {
        path: "/zlm/streamPage",
        name: "ZlmStreamPage",
        component: "/zlm/stream/streamPage",
        meta: {
          title: "ZLMediaKit流管理",
          icon: "",
        },
      },
    ],
  },
  {
    path: "/videoList",
    name: "videoList",
    redirect: '/zlmMp4Page',
    component: "/video/videoPage",
    meta: {
      title: "直播广场",
      icon: "video-camera",
    },
    children: [
      {
        path: "/videoJessbuca",
        name: "videoJessbuca",
        component: "/video/mainPlayerPage",
        hidden: true,
        meta: {
          title: "Jessbuca多路直播",
          icon: "",
        },
      },
      {
        path: "/videoFlvDp",
        name: "VideoFlvDp",
        component: "/video/flv/dPlayerPage",
        hidden: true,
        meta: {
          title: "FLV.JS+DPlayer直播",
          icon: "",
        },
      },
      {
        path: "/videoFmp4",
        name: "VideoFmp4",
        component: "/video/fmp4/webSocketPage",
        hidden: true,
        meta: {
          title: "FMp4直播",
          icon: "",
        },
      },
      {
        path: "/videoTs",
        name: "VideoTs",
        component: "/video/ts/mpegJsPlayer",
        hidden: true,
        meta: {
          title: "TS直播",
          icon: "",
        },
      },
    ],
  },
  {
    path: "/videoBack",
    name: "VideoBack",
    redirect: '/zlmMp4Page',
    component: "/video/videoPage",
    meta: {
      title: "直播回放",
      icon: "monitor",
    },
    children: [
      {
        path: "/videoBoxBack",
        name: "videoBoxBack",
        component: "/video/back/boxBackPlayerPage",
        meta: {
          title: "硬盘录像机回放",
          icon: "",
        },
      },
    ],
  },
];

module.exports = [
  {
    url: "/routerList",
    type: "get",
    response: () => {
        return {
          code: 20000,
          data: router,
        };
    },
  },
];
