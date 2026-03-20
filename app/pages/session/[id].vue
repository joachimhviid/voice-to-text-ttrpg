<script setup lang="ts">
import { sessionEventSchema } from '#imports'
import { match } from 'ts-pattern'

const { params } = useRoute('session-id')
const { isHost } = useRecordingSession()

const { data } = await useFetch(`/api/sessions/${params.id}` as '/api/sessions/:id')
const { copied, copy } = useClipboard()

type Participant = {
  nickname?: string
  userId: string
}

const participants = ref<Participant[]>([])

const {
  data: wsData,
  open,
  send,
  status,
} = useWebSocket('/ws/session', {
  immediate: false,
  onMessage: (ws, event) => {
    const result = sessionEventSchema.safeParse(JSON.parse(event.data))
    if (!result.success) {
      console.warn(event.data)
      console.error(result.error)
      return
    }
    match(result.data)
      .with({ event: 'join' }, (event) => {
        console.log('someone joined', event.userId)
        participants.value.push({
          userId: event.userId,
        })
      })
      .with({ event: 'setNickname' }, (event) => {
        console.log(`${event.userId} set their nickname to ${event.nickname}`)
        const participant = participants.value.find((p) => p.userId === event.userId)
        if (!participant) {
          console.log('User with userid not found', event.userId, participants.value)
          return
        }
        participant.nickname = event.nickname
      })
  },
})

watch(wsData, (value) => {
  console.log(value)
})

onMounted(() => {
  open()
  send(JSON.stringify({ action: 'join', sessionId: params.id }))
})

const setNickname = async (name: string) => {
  console.log('Setting nickname', name)
  send(JSON.stringify({ action: 'setNickname', nickname: name, sessionId: params.id }))
}
</script>

<template>
  <div class="mx-auto flex h-svh max-w-5xl items-center justify-center">
    <PanelContainer size="full">
      <div class="flex justify-between">
        <h1 class="mb-4 text-4xl font-bold">Session</h1>
        <div data-allow-mismatch="text">Status {{ status }}</div>
      </div>
      <div v-if="isHost">
        <SessionHostControls />
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
        <p>Waiting for session to start</p>
      </div>
      <div>
        <h2 class="mb-4 text-2xl font-bold">Participants</h2>
        <div class="flex flex-col justify-between gap-2 md:flex-row">
          <SessionUserName is-user @set-nickname="setNickname" />
          <div class="flex gap-2 md:self-end">
            <SessionUserName
              v-for="(participant, index) in participants"
              :key="participant.userId"
              :name="participant.nickname ?? `Anon${index}`"
            />
            <!-- <SessionUserName name="Dave" />
            <SessionUserName name="Steve" />
            <SessionUserName name="Nate" /> -->
          </div>
        </div>
      </div>
      {{ wsData }}
    </PanelContainer>
  </div>
</template>
