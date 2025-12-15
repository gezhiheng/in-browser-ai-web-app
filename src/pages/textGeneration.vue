<script setup lang="ts">
import type { MLCEngine } from '@mlc-ai/web-llm'
import { CreateMLCEngine } from '@mlc-ai/web-llm'
import { Bot, Loader2, Send, User } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const SELECTED_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const messages = ref<Message[]>([
  { role: 'system', content: 'You are a helpful AI assistant.' },
])
const input = ref('')
const isLoading = ref(false)
const isModelLoading = ref(false)
const loadingProgress = ref('')
const engine = ref<MLCEngine | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function initEngine() {
  isModelLoading.value = true
  try {
    engine.value = await CreateMLCEngine(
      SELECTED_MODEL,
      {
        initProgressCallback: (initProgress) => {
          loadingProgress.value = initProgress.text
        },
        // Use a Web Worker to isolate WASM and avoid Tokenizer binding issues
        appConfig: {
          useWebWorker: true,
        },
      },
    )
    isModelLoading.value = false
  }
  catch (error) {
    console.error('Failed to load model:', error)
    loadingProgress.value = `Failed to load model: ${(error as Error).message}`
    // Keep isModelLoading true to show error state or handle differently
  }
}

async function sendMessage() {
  if (!input.value.trim() || !engine.value || isLoading.value)
    return

  const userMessage = input.value.trim()
  input.value = ''
  messages.value.push({ role: 'user', content: userMessage })
  isLoading.value = true
  await scrollToBottom()

  try {
    const chunks = await engine.value.chat.completions.create({
      messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      stream: true,
    })

    let assistantMessage = ''
    messages.value.push({ role: 'assistant', content: '' })

    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || ''
      assistantMessage += content
      messages.value[messages.value.length - 1].content = assistantMessage
      scrollToBottom()
    }
  }
  catch (error) {
    console.error('Generation failed:', error)
    messages.value.push({ role: 'assistant', content: 'Sorry, something went wrong.' })
  }
  finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-3xl h-[calc(100vh-2rem)] flex flex-col">
    <Card class="flex-1 flex flex-col overflow-hidden h-full">
      <CardHeader>
        <CardTitle>In-Browser Text Generation</CardTitle>
        <CardDescription>
          Running {{ SELECTED_MODEL }} entirely in your browser using WebLLM.
          <span class="block text-xs text-muted-foreground mt-1">Requires a WebGPU-compatible browser (Chrome, Edge,
            etc).</span>
        </CardDescription>
      </CardHeader>

      <CardContent class="flex-1 overflow-hidden flex flex-col relative p-0">
        <!-- Initial Load State -->
        <div v-if="!engine" class="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div class="text-center space-y-2">
            <p class="text-muted-foreground">
              The model needs to be loaded into your browser memory (approx. 1-2GB).
            </p>
            <p class="text-xs text-muted-foreground">
              This happens once and is cached.
            </p>
          </div>
          <Button :disabled="isModelLoading" @click="initEngine">
            <Loader2 v-if="isModelLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isModelLoading ? 'Loading Model...' : 'Load Model' }}
          </Button>
          <p v-if="isModelLoading" class="text-sm text-muted-foreground animate-pulse text-center max-w-md">
            {{ loadingProgress }}
          </p>
        </div>

        <!-- Chat Area -->
        <div v-else ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div
            v-for="(msg, index) in messages.filter(m => m.role !== 'system')" :key="index" class="flex gap-3"
            :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              :class="msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
            >
              <User v-if="msg.role === 'user'" class="w-5 h-5" />
              <Bot v-else class="w-5 h-5" />
            </div>
            <div
              class="rounded-lg p-3 max-w-[80%] text-sm"
              :class="msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
            >
              <p class="whitespace-pre-wrap">
                {{ msg.content }}
              </p>
            </div>
          </div>
          <div v-if="isLoading && messages[messages.length - 1].role === 'user'" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot class="w-5 h-5" />
            </div>
            <div class="bg-muted rounded-lg p-3">
              <Loader2 class="h-4 w-4 animate-spin" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter v-if="engine" class="p-4 border-t">
        <form class="flex w-full gap-2" @submit.prevent="sendMessage">
          <input
            v-model="input" placeholder="Type a message..."
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
          >
          <Button type="submit" :disabled="isLoading || !input.trim()">
            <Send class="h-4 w-4" />
            <span class="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  </div>
</template>
