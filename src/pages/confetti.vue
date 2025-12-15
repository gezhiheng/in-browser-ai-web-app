<script setup lang="ts">
import { DrawingUtils, FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import confetti from 'canvas-confetti'
import { Camera, CameraOff, Loader2 } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isCameraRunning = ref(false)
const isModelLoaded = ref(false)
const detectedGesture = ref<string>('')
const confidence = ref<number>(0)

let gestureRecognizer: GestureRecognizer | null = null
const runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO'
let lastVideoTime = -1
let animationFrameId: number

// Load the MediaPipe model
async function loadModel() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
    )
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode,
    })
    isModelLoaded.value = true
  }
  catch (error) {
    console.error('Error loading MediaPipe model:', error)
  }
}

// Toggle camera
async function toggleCamera() {
  if (isCameraRunning.value) {
    stopCamera()
  }
  else {
    await startCamera()
  }
}

async function startCamera() {
  if (!gestureRecognizer)
    return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.addEventListener('loadeddata', predictWebcam)
      isCameraRunning.value = true
    }
  }
  catch (error) {
    console.error('Error accessing camera:', error)
  }
}

function stopCamera() {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    const tracks = stream.getTracks()
    tracks.forEach(track => track.stop())
    videoRef.value.srcObject = null
    isCameraRunning.value = false
    cancelAnimationFrame(animationFrameId)

    // Clear canvas
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      if (ctx)
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
    detectedGesture.value = ''
  }
}

async function predictWebcam() {
  if (!videoRef.value || !canvasRef.value || !gestureRecognizer)
    return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  if (!ctx)
    return

  // Resize canvas to match video
  if (video.videoWidth !== canvas.width || video.videoHeight !== canvas.height) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }

  const startTimeMs = performance.now()

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime
    const results = gestureRecognizer.recognizeForVideo(video, startTimeMs)

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.landmarks) {
      const drawingUtils = new DrawingUtils(ctx)
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
          color: 'rgba(255, 255, 255, 0.8)',
          lineWidth: 4,
        })
        drawingUtils.drawLandmarks(landmarks, {
          color: '#3b82f6',
          lineWidth: 2,
          radius: 4,
        })
      }
    }

    const gesture = results.gestures?.[0]?.[0]
    if (gesture) {
      detectedGesture.value = gesture.categoryName
      confidence.value = Math.round((gesture.score || 0) * 100)

      if (gesture.categoryName === 'Victory') {
        triggerConfetti()
      }
    }
    else {
      detectedGesture.value = ''
    }

    ctx.restore()
  }

  if (isCameraRunning.value) {
    animationFrameId = requestAnimationFrame(predictWebcam)
  }
}

let lastConfettiTime = 0

function triggerConfetti() {
  // Throttle confetti to avoid spamming
  const now = Date.now()
  if (now - lastConfettiTime < 2000)
    return
  lastConfettiTime = now

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}

onMounted(() => {
  loadModel()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <div class="container mx-auto py-8 px-4 max-w-4xl">
    <div class="flex flex-col gap-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('confetti.pageTitle') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('confetti.description') }}
        </p>
      </div>

      <Card class="overflow-hidden">
        <CardHeader>
          <CardTitle>{{ $t('confetti.livePreview') }}</CardTitle>
          <CardDescription>
            {{ $t('confetti.poweredBy') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            class="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border"
          >
            <div v-if="!isCameraRunning" class="text-center p-6">
              <CameraOff class="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p class="text-muted-foreground">
                {{ $t('confetti.cameraOff') }}
              </p>
            </div>

            <video
              ref="videoRef" class="absolute inset-0 w-full h-full object-cover -scale-x-100"
              :class="{ 'opacity-0': !isCameraRunning }" autoplay playsinline
            />
            <canvas
              ref="canvasRef"
              class="absolute inset-0 w-full h-full object-cover pointer-events-none -scale-x-100"
            />

            <div
              v-if="isCameraRunning && detectedGesture"
              class="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-2"
            >
              <span class="font-medium text-lg">{{ detectedGesture }}</span>
              <div class="h-4 w-px bg-white/30" />
              <span class="text-sm text-white/80">{{ confidence }}% {{ $t('confetti.confidence') }}</span>
            </div>
          </div>

          <div class="mt-6 flex justify-center">
            <Button
              :disabled="!isModelLoaded" :variant="isCameraRunning ? 'destructive' : 'default'" size="lg"
              class="w-full sm:w-auto min-w-50" @click="toggleCamera"
            >
              <template v-if="!isModelLoaded">
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                {{ $t('confetti.loadingModel') }}
              </template>
              <template v-else-if="isCameraRunning">
                <CameraOff class="w-4 h-4 mr-2" />
                {{ $t('confetti.stopCamera') }}
              </template>
              <template v-else>
                <Camera class="w-4 h-4 mr-2" />
                {{ $t('confetti.startCamera') }}
              </template>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
