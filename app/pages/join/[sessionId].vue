<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'

const { params } = useRoute()

const sessionLog = ref<string[]>([])
// const websocketUrl = computed(() => {
//   if (import.meta.server) {
//     return undefined
//   }

//   const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
//   return `${protocol}://${window.location.host}/ws/session`
// })

const { data, open, send, status, ws } = useWebSocket('/ws/session', {
  immediate: false,
  onConnected: () => {
    sessionLog.value.push('Connected to session')
  },
  onDisconnected: () => {
    sessionLog.value.push('Disconnected from session')
  },
  onError: (_, event) => {
    sessionLog.value.push(`WebSocket error: ${String(event.type)}`)
  },
  onMessage: (ws, event) => {
    sessionLog.value.push(String(event.data))
  },
})

onMounted(() => {
  sessionLog.value.push(`Connecting to websocket`)
  open()
})

const ping = async () => {
  sessionLog.value.push('Sending ping')
  await send('ping')
}
</script>

<template>
  <div class="prose mx-auto">
    <h1>Joined session</h1>
    <p>{{ params }}</p>
    <!-- <p>{{ websocketUrl }}</p> -->
    <button @click="ping">Ping server</button>
    <ins>{{ status }}</ins>
    <div>{{ data }}</div>
    <div>{{ ws?.url }}</div>
    <ul>
      <li v-for="(entry, index) in sessionLog" :key="`${index}-${entry}`">
        {{ entry }}
      </li>
    </ul>
  </div>
</template>
