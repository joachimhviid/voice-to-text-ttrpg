<script setup lang="ts">
import { sessionEventSchema } from '#imports'
import { match } from 'ts-pattern'

const { params } = useRoute('session-id')
const { isHost, recordingState } = useRecordingSession()

const { data } = await useFetch(`/api/sessions/${params.id}` as '/api/sessions/:id')
const { copied, copy } = useClipboard()

type Participant = {
  nickname: string
  participantId: number
  peerId: string
}

const participants = ref<Participant[]>([])

const { data: wsData, open } = useWebSocket('/ws/session', {
  immediate: false,
  onMessage: (ws, event) => {
    const result = sessionEventSchema.safeParse(JSON.parse(event.data))
    if (!result.success) {
      console.warn(event.data)
      console.error(result.error)
      return
    }
    match(result.data).with({ event: 'join' }, (event) => {
      const existingParticipant = participants.value.find(
        (participant) => participant.participantId === event.participantId,
      )
      if (existingParticipant) {
        existingParticipant.nickname = event.nickname
        existingParticipant.peerId = event.peerId
        return
      }

      participants.value.push({
        // isUser: event.isUser,
        nickname: event.nickname,
        participantId: event.participantId,
        peerId: event.peerId,
      })
    })
  },
})

onMounted(() => {
  open()
})
</script>

<template>
  <div class="mx-auto flex h-svh max-w-5xl items-center justify-center">
    <PanelContainer size="full" class="relative">
      <div class="flex justify-between">
        <h1 class="mb-4 text-4xl font-bold">Session</h1>
        <div data-allow-mismatch="text">Status {{ recordingState }}</div>
      </div>

      <div class="my-8 flex flex-col items-center justify-center">
        Join this session using the invite code!
        <div v-if="data && data.code" class="relative">
          <span
            class="cursor-pointer text-5xl font-bold transition-colors hover:text-gray-500"
            @click="copy(data.code)"
          >
            {{ data.code }}
          </span>
          <Transition
            enter-from-class="opacity-0 -translate-y-4"
            enter-active-class="transition-opacity transition-transform"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100"
            leave-active-class="transition-opacity"
            leave-to-class="opacity-0"
          >
            <div
              v-if="copied"
              class="absolute inset-x-0 top-full rounded border border-purple-500 bg-purple-500/20 p-2 text-center text-sm"
            >
              Code copied
            </div>
          </Transition>
        </div>
      </div>
      <div>
        <p class="animate-pulse text-center" style="animation-duration: 5000ms">Waiting for session to start</p>
      </div>
      <div class="mb-4">
        <h2 class="mb-4 text-2xl font-bold">Participants</h2>
        <div class="flex flex-wrap gap-2">
          <SessionUserName v-for="participant in participants" :key="participant.peerId" :name="participant.nickname" />
        </div>
      </div>
      <div v-if="isHost" class="border-t border-white/20 pt-4">
        <SessionHostControls />
      </div>
      <div class="absolute inset-x-0 top-full p-2">{{ wsData }}</div>
    </PanelContainer>
  </div>
</template>
