class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
    const input = inputs[0]

    if (input && input.length > 0) {
      const channelData = input[0]

      if (channelData && channelData.length > 0) {
        // Send the audio data to the main thread
        this.port.postMessage({
          type: 'audioData',
          data: channelData.slice(0), // Create a copy
        })
      }
    }

    // Return true to keep the processor alive
    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)
