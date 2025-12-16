# In-browser AI Web App：三个示例实现解析

本文基于当前仓库代码，梳理首页的三个示例（Confetti、Speech-to-Text、Face Landmarker）的实现方式、关键依赖、数据流与生命周期清理点。

## 0. 入口与路由

- 应用入口：`src/main.ts`
  - 创建 Vue App，并注册 Pinia、Vue Router、i18n。
  - Router 使用 `vue-router/auto-routes` 自动扫描 `src/pages/*` 生成路由。

- 路由定义：`src/router/index.ts`
  - 同样使用 `routes` 自动路由，并在 HMR 下调用 `handleHotUpdate(router)` 支持运行时更新。
  - 注意：仓库同时在 `src/main.ts` 里手动创建了 router（与 `src/router/index.ts` 功能重复）。实际运行时取决于 `main.ts` 的使用方式。

- 首页导航卡片：`src/pages/index.vue`
  - 三张 Card：
    1) `/confetti`（站内页面）
    2) `/speech2Text`（站内页面）
    3) 外链 MediaPipe Studio Face Landmarker demo（新标签打开）

## 1) Confetti Demo：手势识别触发彩带

对应页面：`src/pages/confetti.vue`

### 1.1 目标与交互

- 用户点击按钮开启摄像头。
- 页面用 MediaPipe 手势识别检测手部关键点与手势类别。
- 当识别到手势 `Victory`（比“✌️”）时触发 `canvas-confetti` 撒彩带。

### 1.2 关键依赖

- `@mediapipe/tasks-vision`
  - `FilesetResolver`：加载 WASM 运行时文件集
  - `GestureRecognizer`：加载手势识别模型并对视频帧推理
  - `DrawingUtils`：把手部 landmarks/连线画到 canvas

- `canvas-confetti`
  - 用于视觉彩带效果（纯前端 Canvas 粒子动画）。

### 1.3 数据流与生命周期

1. **加载模型**（`onMounted → loadModel()`）
   - `FilesetResolver.forVisionTasks(...)` 从 CDN 加载 wasm 文件。
   - `GestureRecognizer.createFromOptions(...)` 加载 gesture 模型（`.task` 文件），并设置：
     - `delegate: 'GPU'`
     - `runningMode: 'VIDEO'`
   - 成功后设置 `isModelLoaded = true`。

2. **开启摄像头**（`startCamera()`）
   - `navigator.mediaDevices.getUserMedia({ video: true })` 获取视频流。
   - 将 stream 赋给 `<video>`：`videoRef.value.srcObject = stream`。
   - 监听 `loadeddata` 事件后开始推理循环：`predictWebcam()`。

3. **视频推理循环**（`predictWebcam()` + `requestAnimationFrame`）
   - 用 `lastVideoTime` 避免在 `video.currentTime` 不变时重复推理。
   - 对每帧调用：`gestureRecognizer.recognizeForVideo(video, startTimeMs)`。
   - 绘制：
     - `ctx.clearRect(...)` 清屏
     - 如果有 `results.landmarks`：使用 `DrawingUtils` 画连接与点。
   - 解析结果：`results.gestures?.[0]?.[0]` 取最高置信手势
     - 展示 `detectedGesture` 与 `confidence`（百分比）。
     - 当 `categoryName === 'Victory'` 调用 `triggerConfetti()`。

4. **彩带触发节流**（`triggerConfetti()`）
   - 用 `lastConfettiTime` 做 2 秒节流，避免连续触发导致性能/视觉噪声。
   - 调用 `confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })`。

5. **停止摄像头与清理**（`stopCamera()` + `onUnmounted`）
   - stop tracks：`stream.getTracks().forEach(track => track.stop())`。
   - `cancelAnimationFrame(animationFrameId)` 停止循环。
   - 清空 overlay canvas。

### 1.4 UI 结构

- `<video>` 与 `<canvas>` 叠在一起，且都 `-scale-x-100` 镜像显示（符合自拍习惯）。
- 识别到手势时，左下角浮层显示手势名与置信度。
- 按钮根据状态切换：加载中（禁用）/开始/停止。

## 2) Speech-to-Text Demo：浏览器端 Whisper 实时/最终转写

对应页面：`src/pages/speech2Text.vue`

### 2.1 总体架构

- 主线程（Vue 页面）负责：
  - 麦克风采集（Web Audio）
  - UI 状态机（loading/recording/processing）
  - 把音频 Float32Array 发送给 Worker

- Worker（`src/lib/whisper.worker.ts`）负责：
  - 加载 ASR pipeline（Whisper）
  - 推理转写
  - 通过 `postMessage` 回传下载进度、设备类型、partial 文本与最终结果

### 2.2 Worker：模型加载与推理

文件：`src/lib/whisper.worker.ts`

- 使用 `@huggingface/transformers`：
  - `env.allowLocalModels = false`：强制走远端/缓存机制，不做本地模型检查。
  - `pipeline('automatic-speech-recognition', 'Xenova/whisper-base', options)` 创建转写 pipeline。

- **WebGPU 优先，失败回退 CPU**：
  - 先尝试 `options = { device: 'webgpu' }`
  - 失败后 `options = {}`（CPU）
  - 并通过消息 `type: 'device'` 通知主线程显示 `WebGPU/CPU`

- **加载阶段**（主线程发 `type: 'load'`）
  - `progress_callback` 被透传并以 `type: 'download'` 回给 UI：
    - `initiate/progress/done`（UI 会展示进度条和文字）。
  - 完成后发 `type: 'ready'`。

- **推理阶段**（主线程发 `type: 'generate'`）
  - 通过 `TextStreamer` 做“边生成边回传”：
    - 重写 `(streamer as any).print`，每次追加 `currentText` 并 `postMessage({ type: 'partial', data: currentText })`
  - 推理参数：
    - `chunk_length_s: 30`
    - `stride_length_s: 5`
    - `return_timestamps: true`
    - `language: language || undefined`（支持 zh/en 或自动识别）
  - 最终回传：`type: 'result', data: output, isFinal`。

### 2.3 主线程：音频采集与实时转写

文件：`src/pages/speech2Text.vue`

#### (1) 音频采集：AudioContext + AudioWorklet

- 创建 `AudioContext({ sampleRate: 16000 })`：
  - Whisper 这类 ASR 常用 16kHz 采样率；这里直接在 AudioContext 层指定。

- 加载 Worklet：
  - `audioContext.audioWorklet.addModule(new URL('@/lib/audio-processor.ts', import.meta.url))`

- 连接图：
  - `MediaStreamAudioSourceNode (mic) → AudioWorkletNode('audio-processor') → destination`

- Worklet 行为：`src/lib/audio-processor.ts`
  - 在 `process(inputs)` 中取第一路输入 `inputs[0][0]`（单声道），并通过 `this.port.postMessage({ type: 'audioData', data: channelData.slice(0) })` 把每个音频 buffer 发回主线程。

- 主线程累计 chunk：
  - `audioChunks: Float32Array[]`
  - `workletNode.port.onmessage` 收到 `audioData` 时 `push(new Float32Array(event.data.data))`
  - `getAudioData()` 会把所有 chunk 拼成一个大 `Float32Array`。

#### (2) 实时转写：定时器 + 去重并发

- 开始录音后设置 `realtimeInterval = setInterval(..., 1000)`：
  - 每 1 秒：
    - 若 `isTranscribing` 为 true，则跳过（避免并发请求堆叠）。
    - 否则取当前累计的 `audioData` 并发给 Worker：
      `postMessage({ type: 'generate', audio, language, isFinal: false })`

- Worker 回传 `partial` 时直接覆盖 `transcript`，实现“实时更新文本”。

#### (3) 停止录音：最终转写与资源释放

- 停止流程：
  - 清掉 interval
  - stop tracks（`mediaStream.getTracks().forEach(stop)`）
  - disconnect worklet/source，并 `workletNode.port.close()`
  - `audioContext.close()`

- 发送最终一次转写：
  - `postMessage({ type: 'generate', audio: getAudioData(), language, isFinal: true })`
  - UI 用 `isProcessing`/`isFinal` 控制“处理中→完成”。

### 2.4 UI 状态与消息协议

- 页面状态：
  - `isModelLoading`：等待 Worker `ready`
  - `isRecording`：录音中
  - `isProcessing`：停止后等待最终结果
  - `device`：Worker 告知 WebGPU/CPU

- Worker → 主线程消息：
  - `download`：模型下载进度
  - `ready`：可用
  - `device`：WebGPU/CPU
  - `partial`：流式文本
  - `result`：最终输出（含 timestamps 等）
  - `error`：错误信息

## 3) Face Landmarker Demo：嵌入官方在线 Demo（非本地推理）

对应页面：`src/pages/faceDetection.vue`

### 3.1 实现方式

- 本仓库不在本地做 face landmark 推理。
- 页面提供两种打开方式：
  1) 直接在页面内用 `<iframe>` 嵌入：`src = https://mediapipe-studio.webapps.google.com/demo/face_landmarker`
  2) 右上角按钮在新标签页打开同一 URL。

### 3.2 权限与安全属性

- iframe 允许能力：
  - `allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"`
- `referrerpolicy="no-referrer"`
- 新开页链接设置：`target="_blank"` + `rel="noreferrer"`

### 3.3 适用场景

- 适合作为“产品导航/能力展示”的快捷入口。
- 优点：零模型集成成本。
- 限制：不受你自己的应用状态管理控制、离线不可用、体验与功能完全由外部站点决定。

## 4) 共同点：组件与国际化

- UI 组件：三页都使用 `src/components/ui/*` 的 `Button`、`Card` 系列（外观一致）。
- 国际化：页面文案通过 `$t(...)` 从 `src/i18n.ts` 的词条中获取；`src/App.vue` 提供语言切换（EN/中文）。

---

## 附：三者对比（快速定位）

| 示例 | 是否本地推理 | 主要技术 | 计算负载 | 关键文件 |
|---|---:|---|---|---|
| Confetti | 是 | MediaPipe Tasks Vision（GestureRecognizer）+ Canvas overlay | 中（视频帧推理） | `src/pages/confetti.vue` |
| Speech-to-Text | 是 | Web Audio + AudioWorklet + Web Worker + transformers.js Whisper | 高（ASR 推理，WebGPU 优先） | `src/pages/speech2Text.vue`, `src/lib/whisper.worker.ts`, `src/lib/audio-processor.ts` |
| Face Landmarker | 否（外部） | iframe 嵌入官方 demo | 取决于外部站点 | `src/pages/faceDetection.vue` |
