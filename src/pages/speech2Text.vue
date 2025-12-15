<script setup lang="ts">
import { Loader2, Mic, Square } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const worker = ref<Worker | null>(null)
const isModelLoading = ref(true)
const isRecording = ref(false)
const isProcessing = ref(false)
const progress = ref<number>(0)
const progressText = ref<string>('')
const transcript = ref<string>('')
const audioContext = ref<AudioContext | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const audioInput = ref<MediaStreamAudioSourceNode | null>(null)
const workletNode = ref<AudioWorkletNode | null>(null)
const audioChunks = ref<Float32Array[]>([])

const isTranscribing = ref(false)
const device = ref<string>('CPU')
let realtimeInterval: number | null = null

// Initialize worker
function initWorker() {
  worker.value = new Worker(new URL('@/lib/whisper.worker.ts', import.meta.url), { type: 'module' })

  worker.value.onmessage = (event) => {
    const { type, data, isFinal } = event.data

    if (type === 'download') {
      if (data.status === 'progress') {
        progress.value = data.progress
        progressText.value = `Downloading ${data.file} (${Math.round(data.progress)}%)`
      }
      else if (data.status === 'done') {
        progressText.value = 'Model loaded!'
      }
      else if (data.status === 'initiate') {
        progressText.value = 'Initiating download...'
      }
    }
    else if (type === 'ready') {
      isModelLoading.value = false
      progressText.value = 'Ready'
    }
    else if (type === 'device') {
      device.value = data
    }
    else if (type === 'partial') {
      transcript.value = data
    }
    else if (type === 'result') {
      transcript.value = data.text
      if (isFinal) {
        isProcessing.value = false
      }
      isTranscribing.value = false
    }
    else if (type === 'error') {
      console.error('Worker error:', data)
      isProcessing.value = false
      isTranscribing.value = false
      progressText.value = `Error: ${data}`
    }
  }

  worker.value.postMessage({ type: 'load' })
}

function getAudioData() {
  const totalLength = audioChunks.value.reduce((acc, chunk) => acc + chunk.length, 0)
  const audioData = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of audioChunks.value) {
    audioData.set(chunk, offset)
    offset += chunk.length
  }
  return audioData
}

async function startRecording() {
  try {
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Load the audio worklet module
    await audioContext.value.audioWorklet.addModule(new URL('@/lib/audio-processor.ts', import.meta.url))

    audioInput.value = audioContext.value.createMediaStreamSource(mediaStream.value)
    workletNode.value = new AudioWorkletNode(audioContext.value, 'audio-processor')

    audioChunks.value = []

    // Listen for audio data from the worklet
    workletNode.value.port.onmessage = (event) => {
      if (event.data.type === 'audioData') {
        audioChunks.value.push(new Float32Array(event.data.data))
      }
    }

    audioInput.value.connect(workletNode.value)
    workletNode.value.connect(audioContext.value.destination)

    isRecording.value = true
    transcript.value = ''

    // Start real-time transcription loop
    realtimeInterval = window.setInterval(() => {
      if (isTranscribing.value)
        return

      const audioData = getAudioData()
      if (audioData.length > 0) {
        isTranscribing.value = true
        worker.value?.postMessage({
          type: 'generate',
          audio: audioData,
          isFinal: false,
        })
      }
    }, 1000)
  }
  catch (error) {
    console.error('Error starting recording:', error)
  }
}

function stopRecording() {
  if (!isRecording.value)
    return

  if (realtimeInterval) {
    clearInterval(realtimeInterval)
    realtimeInterval = null
  }

  isRecording.value = false
  isProcessing.value = true

  // Stop recording
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
  }
  if (workletNode.value && audioInput.value) {
    audioInput.value.disconnect()
    workletNode.value.disconnect()
    workletNode.value.port.close()
  }
  if (audioContext.value) {
    audioContext.value.close()
  }

  // Final transcription
  const audioData = getAudioData()
  if (worker.value) {
    worker.value.postMessage({
      type: 'generate',
      audio: audioData,
      isFinal: true,
    })
  }
}

onMounted(() => {
  initWorker()
})

onUnmounted(() => {
  if (worker.value) {
    worker.value.terminate()
  }
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<template>
  <div class="container mx-auto py-8 px-4 max-w-4xl">
    <div class="flex flex-col gap-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">
          In-Browser Speech to Text
        </h1>
        <p class="text-muted-foreground">
          Powered by Transformers.js and Whisper (running locally on {{ device }}!)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span>Transcriber</span>
            <div v-if="isModelLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>{{ progressText || 'Loading model...' }}</span>
            </div>
            <div v-else class="flex items-center gap-2 text-sm text-green-600 font-medium">
              <div class="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              Model Ready
            </div>
          </CardTitle>
          <CardDescription>
            Record your voice to transcribe it to text.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Progress Bar for Model Loading -->
          <div v-if="isModelLoading" class="space-y-2">
            <div class="h-2 bg-secondary rounded-full overflow-hidden">
              <div class="h-full bg-primary transition-all duration-300 ease-out" :style="{ width: `${progress}%` }" />
            </div>
            <p class="text-xs text-center text-muted-foreground">
              {{ progressText }}
            </p>
          </div>

          <!-- Main Interaction Area -->
          <div class="flex flex-col items-center justify-center gap-6 py-8">
            <div
              class="relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300"
              :class="isRecording ? 'bg-red-100 text-red-600 scale-110' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
            >
              <div
                v-if="isRecording"
                class="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"
              />
              <Mic v-if="!isRecording" class="w-12 h-12" />
              <div v-else class="flex flex-col items-center">
                <div class="w-12 h-12 flex items-center justify-center">
                  <div class="w-3 h-3 bg-red-600 rounded-sm animate-pulse" />
                  <div class="w-1 h-6 bg-red-600 mx-1 animate-[bounce_1s_infinite]" />
                  <div class="w-3 h-3 bg-red-600 rounded-sm animate-pulse" />
                </div>
                <span class="text-xs font-medium mt-2">Listening...</span>
              </div>
            </div>

            <Button
              size="lg" :variant="isRecording ? 'destructive' : 'default'" class="min-w-[200px]"
              :disabled="isModelLoading || isProcessing" @click="isRecording ? stopRecording() : startRecording()"
            >
              <template v-if="isProcessing">
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </template>
              <template v-else-if="isRecording">
                <Square class="w-4 h-4 mr-2 fill-current" />
                Stop Recording
              </template>
              <template v-else>
                <Mic class="w-4 h-4 mr-2" />
                Start Recording
              </template>
            </Button>
          </div>

          <!-- Output Area -->
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Transcript
            </label>
            <div
              class="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p v-if="transcript" class="whitespace-pre-wrap">
                {{ transcript }}
              </p>
              <p v-else-if="isProcessing" class="text-muted-foreground italic flex items-center gap-2">
                <Loader2 class="w-3 h-3 animate-spin" />
                Transcribing audio...
              </p>
              <p v-else class="text-muted-foreground italic">
                Transcript will appear here...
              </p>
            </div>
          </div>

          <!-- Tips Section -->
          <div class="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
            <h3 class="font-semibold mb-2 text-foreground">
              Tips for Best Results:
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Use a high-quality microphone close to your mouth</li>
              <li>Minimize background noise and echo</li>
              <li>Speak clearly and at a moderate pace</li>
              <li>For faster processing, ensure your browser supports WebGPU</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
