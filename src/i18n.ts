import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    app: {
      title: 'In-Browser AI Demos',
      subtitle: 'Explore the capabilities of local AI running directly in your browser.',
      nav: {
        confetti: 'Gesture Confetti',
        speech: 'Speech to Text',
        faceLandmarker: 'Face Landmarker',
        coming: 'Coming Soon',
        try: 'Try Demo',
      },
      confetti: {
        desc: 'Recognize hand gestures to trigger visual effects.',
        body: 'Uses MediaPipe Gesture Recognizer to detect a "Victory" hand sign and launch a confetti celebration.',
      },
      speech: {
        desc: 'Convert your voice to text locally.',
        body: 'Uses Transformers.js and Whisper to transcribe audio directly in your browser without sending data to a server.',
      },
      faceLandmarker: {
        desc: 'Official MediaPipe Studio demo.',
        body: 'Opens the official Face Landmarker demo in a new tab.',
      },
      coming: {
        desc: 'More AI demos are on the way.',
        body: 'Stay tuned for Object Detection, Face Landmarks, and LLM integration demos.',
        button: 'Coming Soon',
      },
      langSwitcher: 'Language',
    },
    confetti: {
      pageTitle: 'Peace Sign Confetti Demo',
      description: 'Show a "Peace" (Victory) sign to the camera to trigger a celebration!',
      livePreview: 'Live Preview',
      poweredBy: 'Powered by MediaPipe Gesture Recognizer',
      cameraOff: 'Camera is turned off',
      confidence: 'confidence',
      loadingModel: 'Loading Model...',
      stopCamera: 'Stop Camera',
      startCamera: 'Start Camera',
    },
    speech: {
      pageTitle: 'In-Browser Speech to Text',
      poweredBy: 'Powered by Transformers.js and Whisper (running locally on {device}!)',
      cardTitle: 'Transcriber',
      cardDescription: 'Record your voice to transcribe it to text.',
      modelReady: 'Model Ready',
      loadingFallback: 'Loading model...',
      controls: {
        language: 'Language',
        languageHelp: 'Select recognition language (cannot change while recording)',
        zh: 'Chinese',
        en: 'English',
      },
      listening: 'Listening...',
      processing: 'Processing...',
      start: 'Start Recording',
      stop: 'Stop Recording',
      transcriptLabel: 'Transcript',
      transcribing: 'Transcribing audio...',
      transcriptEmpty: 'Transcript will appear here...',
      tipsTitle: 'Tips for Best Results:',
      tips: {
        mic: 'Use a high-quality microphone close to your mouth',
        noise: 'Minimize background noise and echo',
        pace: 'Speak clearly and at a moderate pace',
        webgpu: 'For faster processing, ensure your browser supports WebGPU',
      },
    },
    faceDetection: {
      pageTitle: 'Face Landmarker (Embedded)',
      subtitle: 'This page embeds the official MediaPipe Studio demo via iframe.',
      cardTitle: 'MediaPipe Studio: Face Landmarker',
      openNewTab: 'Open in new tab',
      permissionHint: 'If camera permission doesn’t work inside the iframe, open in a new tab.',
    },
    ui: {
      zh: '中文',
      en: 'English',
    },
  },
  zh: {
    app: {
      title: '浏览器内 AI Web 应用',
      subtitle: '探索直接在浏览器本地运行的 AI 能力。',
      nav: {
        confetti: '手势礼花',
        speech: '语音转文字',
        faceLandmarker: '人脸关键点',
        coming: '敬请期待',
        try: '立即体验',
      },
      confetti: {
        desc: '识别手势并触发炫酷特效。',
        body: '使用 MediaPipe 手势识别器检测“胜利手势”，并释放礼花动画。',
      },
      speech: {
        desc: '在本地将你的语音转换为文字。',
        body: '通过 Transformers.js 与 Whisper，在你的浏览器中直接转写音频，无需上传到服务器。',
      },
      faceLandmarker: {
        desc: '官方 MediaPipe Studio 演示。',
        body: '在新窗口打开官方 Face Landmarker 示例。',
      },
      coming: {
        desc: '更多演示即将上线。',
        body: '敬请期待目标检测、人脸关键点和 LLM 集成等演示。',
        button: '敬请期待',
      },
      langSwitcher: '界面语言',
    },
    confetti: {
      pageTitle: '胜利手势礼花演示',
      description: '对着摄像头比出“胜利手势”即可触发庆祝动画！',
      livePreview: '实时预览',
      poweredBy: '由 MediaPipe 手势识别器提供支持',
      cameraOff: '摄像头已关闭',
      confidence: '置信度',
      loadingModel: '正在加载模型…',
      stopCamera: '关闭摄像头',
      startCamera: '开启摄像头',
    },
    speech: {
      pageTitle: '浏览器内语音转文字',
      poweredBy: '由 Transformers.js 和 Whisper 提供支持（在 {device} 本地运行！）',
      cardTitle: '转写器',
      cardDescription: '录制你的声音并转写为文字。',
      modelReady: '模型已就绪',
      loadingFallback: '正在加载模型…',
      controls: {
        language: '识别语言',
        languageHelp: '选择识别语言（录音中不可切换）',
        zh: '中文',
        en: '英文',
      },
      listening: '正在聆听…',
      processing: '处理中…',
      start: '开始录音',
      stop: '停止录音',
      transcriptLabel: '转写结果',
      transcribing: '正在转写音频…',
      transcriptEmpty: '转写结果将显示在这里…',
      tipsTitle: '使用建议：',
      tips: {
        mic: '使用高品质麦克风并尽量靠近嘴部',
        noise: '降低背景噪声与回声',
        pace: '清晰发音并保持适中语速',
        webgpu: '若需更快速度，请确保浏览器支持 WebGPU',
      },
    },
    faceDetection: {
      pageTitle: '人脸关键点（内嵌）',
      subtitle: '本页面通过 iframe 嵌入官方 MediaPipe Studio 示例。',
      cardTitle: 'MediaPipe Studio：Face Landmarker',
      openNewTab: '新窗口打开',
      permissionHint: '若 iframe 内无法获取摄像头权限，请点击“新窗口打开”。',
    },
    ui: {
      zh: '中文',
      en: 'English',
    },
  },
}

function detectLocale(): 'en' | 'zh' {
  const saved = localStorage.getItem('locale')
  if (saved === 'zh' || saved === 'en') {
    return saved
  }
  const nav = navigator.language || (navigator as any).userLanguage || 'en'
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
})

export type AppLocale = 'en' | 'zh'
