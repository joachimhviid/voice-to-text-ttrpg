/**
 * useMediaRecorder
 *
 * Handles all browser MediaRecorder concerns:
 * - Requesting microphone access
 * - Accumulating audio chunks
 * - Start / pause / resume / stop controls
 * - Assembling the final Blob on stop
 *
 * Has no knowledge of sessions, routing, or uploads.
 */
export const useMediaRecorder = () => {
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const chunks = ref<Blob[]>([])
  const state = ref<RecordingState>('inactive')
  const error = ref<string | null>(null)

  /**
   * Initialises the MediaRecorder with microphone access.
   * Called lazily on first start so we don't prompt for permissions
   * before the user actually wants to record.
   */
  const init = async (): Promise<boolean> => {
    if (mediaRecorder.value) return true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Pick the best supported format, falling back to the browser default
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      )

      mediaRecorder.value = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

      mediaRecorder.value.ondataavailable = (e: BlobEvent) => {
        // The very first chunk contains codec headers — it must never be dropped
        if (e.data.size > 0) {
          chunks.value.push(e.data)
        }
      }

      mediaRecorder.value.onpause = () => {
        state.value = 'paused'
      }

      mediaRecorder.value.onresume = () => {
        state.value = 'recording'
      }

      error.value = null
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Microphone access denied'
      return false
    }
  }

  /**
   * Starts recording. Resets chunks so each recording session is fresh.
   * Uses a 5-second timeslice so data is available progressively
   * rather than only on stop — important for longer sessions.
   */
  const start = async (): Promise<boolean> => {
    const ready = await init()
    if (!ready || !mediaRecorder.value) return false

    chunks.value = []
    mediaRecorder.value.start(5_000)
    state.value = 'recording'
    return true
  }

  const pause = () => {
    if (mediaRecorder.value?.state === 'recording') {
      mediaRecorder.value.pause()
      // state is updated via the onpause handler
    }
  }

  const resume = () => {
    if (mediaRecorder.value?.state === 'paused') {
      mediaRecorder.value.resume()
      // state is updated via the onresume handler
    }
  }

  /**
   * Stops recording and returns the assembled audio Blob.
   * Resolves once the MediaRecorder has flushed all remaining chunks.
   */
  const stop = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        resolve(new Blob([], { type: 'audio/webm' }))
        return
      }

      mediaRecorder.value.onstop = () => {
        const mimeType = mediaRecorder.value?.mimeType ?? 'audio/webm'
        const blob = new Blob(chunks.value, { type: mimeType })
        state.value = 'inactive'
        resolve(blob)
      }

      mediaRecorder.value.stop()
    })
  }

  /**
   * Releases the microphone stream entirely.
   * Call this when leaving the session page.
   */
  const release = () => {
    if (mediaRecorder.value) {
      mediaRecorder.value.stream.getTracks().forEach((track) => track.stop())
      mediaRecorder.value = null
    }
    chunks.value = []
    state.value = 'inactive'
  }

  return {
    error,
    pause,
    release,
    resume,
    start,
    state,
    stop,
  }
}
