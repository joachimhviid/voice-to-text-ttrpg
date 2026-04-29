export const useRecordingSession = () => {
  const isHostCookie = useCookie('isHost', { default: () => false })

  const loading = ref(false)

  const speech = useSpeechRecognition({
    lang: 'en-US',
  })

  watch(speech.isListening, (value) => (recordingState.value = value ? 'recording' : 'inactive'))

  const recordingState = useState<RecordingState>('recording-state', () => 'inactive')

  const startRecording = () => {
    speech.start()
  }

  const pauseRecording = () => {
    speech.stop()
  }

  const stopRecording = () => {
    speech.stop()
  }

  const createSession = async (nickname: string, campaignId: number) => {
    loading.value = true

    try {
      const res = await $fetch('/api/sessions/create', {
        body: {
          campaignId,
          nickname,
        },
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

  const closeSession = () => {
    // isHostCookie.value = false
    console.log('closing session')
  }

  const joinSession = async (inviteCode: string, nickname: string) => {
    loading.value = true
    try {
      const res = await $fetch('/api/sessions/join', {
        body: {
          inviteCode,
          nickname,
        },
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
    isRecordingSupported: speech.isSupported,
    joinSession,
    loading,
    pauseRecording,
    recordingState,
    speech,
    startRecording,
    stopRecording,
  }
}
