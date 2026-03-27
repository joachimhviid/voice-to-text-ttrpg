export const useRecordingSession = () => {
  const isHostCookie = useCookie('isHost', { default: () => false })

  const loading = ref(false)

  // TODO: @Casper hook up media recorder state here
  const recordingState = useState<RecordingState>('recording-state', () => 'inactive')

  const startRecording = () => {
    recordingState.value = 'recording'
  }

  const pauseRecording = () => {
    recordingState.value = 'paused'
  }

  const stopRecording = () => {
    recordingState.value = 'inactive'
  }

  const createSession = async (nickname: string) => {
    loading.value = true

    try {
      const res = await $fetch('/api/sessions/create', {
        body: {
          nickname,
        },
        method: 'POST',
      })
      isHostCookie.value = true

      navigateTo(`/session/${res.id}`)
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

      navigateTo(`/session/${res.id}`)
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
    pauseRecording,
    recordingState,
    startRecording,
    stopRecording,
  }
}
