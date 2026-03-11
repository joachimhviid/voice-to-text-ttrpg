<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'

const { params } = useRoute()

const sessionLog = ref<unknown[]>([])

const { data, open, send, status } = useWebSocket('/ws/session', {
  immediate: false,
  onConnected: () => {
    sessionLog.value.push('Connected to session')
  },
  onMessage: (ws, event) => {
    sessionLog.value.push(event.data)
  },
})

onMounted(() => open())

const ping = async () => {
  console.log('ping')
  await send('ping')
}
</script>

<template>
  <div class="prose mx-auto">
    <h1>Joined session</h1>
    <p>{{ params }}</p>
    <button @click="ping">Ping server</button>
    <ins>{{ status }}</ins>
    <div>{{ data }}</div>
  </div>
</template>
