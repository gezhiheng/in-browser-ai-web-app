import { env, pipeline, TextStreamer } from '@huggingface/transformers'

// Skip local model checks
env.allowLocalModels = false

class AutomaticSpeechRecognitionPipeline {
  static task = 'automatic-speech-recognition'
  static model = 'Xenova/whisper-base.en'
  static instance = null

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        this.instance = await pipeline(this.task, this.model, {
          progress_callback,
          device: 'webgpu',
        })
        self.postMessage({ type: 'device', data: 'WebGPU' })
      }
      catch (e) {
        console.warn('WebGPU not supported or failed, falling back to CPU', e)
        this.instance = await pipeline(this.task, this.model, {
          progress_callback,
        })
        self.postMessage({ type: 'device', data: 'CPU' })
      }
    }
    return this.instance
  }
}

self.addEventListener('message', async (event) => {
  const { type, audio } = event.data

  if (type === 'load') {
    try {
      await AutomaticSpeechRecognitionPipeline.getInstance((data) => {
        self.postMessage({
          type: 'download',
          data,
        })
      })
      self.postMessage({ type: 'ready' })
    }
    catch (error) {
      self.postMessage({ type: 'error', data: error.message })
    }
    return
  }

  if (type === 'generate') {
    try {
      const transcriber = await AutomaticSpeechRecognitionPipeline.getInstance()

      const streamer = new TextStreamer(transcriber.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
      })

      let currentText = ''
      streamer.print = (text) => {
        currentText += text
        self.postMessage({
          type: 'partial',
          data: currentText,
        })
      }

      const output = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        streamer,
      })

      self.postMessage({
        type: 'result',
        data: output,
        isFinal: event.data.isFinal,
      })
    }
    catch (error) {
      self.postMessage({ type: 'error', data: error.message })
    }
  }
})
