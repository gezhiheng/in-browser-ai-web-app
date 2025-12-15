import { env, pipeline, TextStreamer } from '@huggingface/transformers'

// Skip local model checks
env.allowLocalModels = false

const TASK = 'automatic-speech-recognition' as const

class AutomaticSpeechRecognitionPipeline {
  static task = TASK
  static model = 'Xenova/whisper-base'
  static instance: any = null

  static async getInstance(progress_callback?: (data: any) => void) {
    if (this.instance === null) {
      try {
        const options: any = { device: 'webgpu' }
        if (progress_callback)
          options.progress_callback = progress_callback

        this.instance = await pipeline(this.task, this.model, options)
        globalThis.postMessage({ type: 'device', data: 'WebGPU' })
      }
      catch (e) {
        console.warn('WebGPU not supported or failed, falling back to CPU', e)
        const options: any = {}
        if (progress_callback)
          options.progress_callback = progress_callback
        this.instance = await pipeline(this.task, this.model, options)
        globalThis.postMessage({ type: 'device', data: 'CPU' })
      }
    }
    return this.instance
  }
}

globalThis.addEventListener('message', async (event: MessageEvent) => {
  const { type, audio, language } = event.data

  if (type === 'load') {
    try {
      await AutomaticSpeechRecognitionPipeline.getInstance((data: any) => {
        globalThis.postMessage({
          type: 'download',
          data,
        })
      })
      globalThis.postMessage({ type: 'ready' })
    }
    catch (error: any) {
      globalThis.postMessage({ type: 'error', data: error?.message || String(error) })
    }
    return
  }

  if (type === 'generate') {
    try {
      const transcriber: any = await AutomaticSpeechRecognitionPipeline.getInstance()

      const streamer = new TextStreamer(transcriber.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
      })

      let currentText = ''
      ;(streamer as any).print = (text: string) => {
        currentText += text
        globalThis.postMessage({
          type: 'partial',
          data: currentText,
        })
      }

      const output = await (transcriber as any)(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        // If a language is provided (e.g., 'zh'), use it; otherwise allow autodetect
        language: language || undefined,
        streamer,
      })

      globalThis.postMessage({
        type: 'result',
        data: output,
        isFinal: event.data.isFinal,
      })
    }
    catch (error: any) {
      globalThis.postMessage({ type: 'error', data: error?.message || String(error) })
    }
  }
})
