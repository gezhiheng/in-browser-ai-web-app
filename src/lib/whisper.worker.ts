import { env, pipeline } from '@huggingface/transformers'

// Skip local model checks
env.allowLocalModels = false

class AutomaticSpeechRecognitionPipeline {
  static task = 'automatic-speech-recognition'
  static model = 'Xenova/whisper-tiny.en'
  static instance = null

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback })
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
      const output = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
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
