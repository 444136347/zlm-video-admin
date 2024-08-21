#!/bin/bash

# ======================脚本描述=========================
# 这个脚本会遍历位于 src/assets/videos 目录下的所有视频文件，并将它们推送到 ZLMediaKit 服务器。
# 每个视频文件的 RTMP 推流地址如下：
# rtmp://127.0.0.1:1935/live/stream1 对应 video1.mp4
# rtmp://127.0.0.1:1935/live/stream2 对应 video2.mp4
# 依此类推...
# 你可以通过 RTSP 协议获取这些流（我们容器设置rtsp是8554端口）：
# rtsp://127.0.0.1:8554/live/stream1
# rtsp://127.0.0.1:8554/live/stream2
# 依此类推...
# http://127.0.0.1:8088/live/stream1.live.flv
# ======================推送自己的桌面为直播流=========================
# MAC上推到ZLMediakit
# ffmpeg -f avfoundation -probesize 50M -pix_fmt uyvy422 -i "1" -vcodec libx264 -preset ultrafast -acodec libfaac -f flv rtmp://127.0.0.1:1935/live/myDesk1
# Windows上推到ZLMediakit
# ffmpeg -f gdigrab -framerate 30 -i desktop -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -f flv rtmp://127.0.0.1:1935/live/myDesk1

# 读取 .env 文件并导出环境变量
if [ "$NODE_ENV" == "production" ]; then
  ENV_FILE=".env.production"
else
  ENV_FILE=".env.development"
fi

# 解析 .env 文件并导出变量
if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "找不到环境文件: $ENV_FILE"
  exit 1
fi

# 从环境变量中读取 ZLMediaKit 配置
RTMP_SERVER_URL="rtmp://${VUE_APP_ZLMEDIAKIT_SERVICE_IP}:${VUE_APP_ZLMEDIAKIT_RTMP_PORT}/live"
API_BASE_URL="http://${VUE_APP_ZLMEDIAKIT_SERVICE_IP}:${VUE_APP_ZLMEDIAKIT_HTTP_PORT}"
API_SECRET="${VUE_APP_ZLMEDIAKIT_HTTP_SECRET}"

# 视频文件的路径
VIDEO_PATH="src/assets/videos"

# 检查视频文件路径是否存在
if [ ! -d "$VIDEO_PATH" ]; then
  echo "视频文件路径不存在: $VIDEO_PATH"
  exit 1
fi

# 获取视频文件列表
videos=($(ls "$VIDEO_PATH"/*.mp4))

# 检查是否有视频文件
if [ ${#videos[@]} -eq 0 ]; then
  echo "没有找到任何视频文件在路径: $VIDEO_PATH"
  exit 1
fi

# 指定要读取的视频个数
NUM_VIDEOS=9 # 设置为想要的视频个数

# 循环推流每个视频文件，最多循环 NUM_VIDEOS 次
for i in "${!videos[@]}"; do
  if [ $i -ge $NUM_VIDEOS ]; then
    break
  fi

  stream_number=$((i + 1))
  ffmpeg -re -stream_loop -1 -i "${videos[$i]}" -vf "scale=1280:720" -r 30 -c:v libx264 -preset veryfast -c:a aac -b:a 128k -f flv "$RTMP_SERVER_URL/stream$stream_number" &
done

# 等待所有 FFmpeg 进程结束
wait
