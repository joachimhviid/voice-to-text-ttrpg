/**
 * useRecordingSession
 *
 * Session-level recording orchestration. Owns:
 * - Session creation / joining / closing
 * - Wiring useMediaRecorder controls to the UI
 * - Uploading the finished audio Blob to the server
 * - isHost state
 *
 * sessionId is stored in shared useState so Controls.vue can call
 * startRecording / stopRecording without needing to receive it as a prop.
 * The session page calls setSessionId() on mount to register it.
 */
export const useRecordingSession = () => {
  const isHostCookie = useCookie('isHost', { default: () => false })
  const loading = ref(false)

  // Shared across all composable instances — set once by the session page
  const sessionId = useState<string | null>('session-id', () => null)

  const { error: micError, pause, release, resume, start, state: recordingState, stop } = useMediaRecorder()

  /** Called by the session page on mount so Controls.vue can upload without knowing the route */
  const setSessionId = (id: string) => {
    sessionId.value = id
  }

  const startRecording = async () => {
    await start()
  }

  const pauseRecording = () => {
    if (recordingState.value === 'paused') {
      resume()
    } else {
      pause()
    }
  }

  /**
   * Stops the MediaRecorder, assembles the Blob, and POSTs it to the server.
   * The server authenticates via the participantSession cookie automatically.
   */
  const stopRecording = async () => {
    if (!sessionId.value) {
      console.error('stopRecording called without a sessionId')
      return
    }

    const blob = await stop()

    if (blob.size === 0) {
      console.warn('Recording produced an empty blob — skipping upload')
      return
    }

    const formData = new FormData()
    formData.append('audio', blob, `recording-${Date.now()}.webm`)

    try {
      await $fetch(`/api/sessions/${sessionId.value}/recordings`, {
        body: formData,
        method: 'POST',
      })
    } catch (e) {
      console.error('Failed to upload recording', e)
    }
  }

  const createSession = async (nickname: string, campaignId: number) => {
    loading.value = true

    try {
      const res = await $fetch('/api/sessions/create', {
        body: { campaignId, nickname },
        method: 'POST',
      })
      isHostCookie.value = true
      navigateTo(`/campaigns/${campaignId}/sessions/${res.id}`)
    } catch (error) {
      console.error(error)
      isHostCookie.value = false
    } finally {
      loading.value = false
    }
  }

  const closeSession = async () => {
    await stopRecording()
    release()
    isHostCookie.value = false
    // TODO: send closeSession action over WebSocket and navigate away
    console.log('closing session')
  }

  const joinSession = async (inviteCode: string, nickname: string) => {
    loading.value = true
    try {
      const res = await $fetch('/api/sessions/join', {
        body: { inviteCode, nickname },
        method: 'POST',
      })
      navigateTo(`/campaigns/${res.campaignId}/sessions/${res.id}`)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const isHost = computed(() => isHostCookie.value)

  return {
    closeSession,
    createSession,
    isHost,
    joinSession,
    loading,
    micError,
    pauseRecording,
    recordingState,
    release,
    setSessionId,
    startRecording,
    stopRecording,
  }
}
