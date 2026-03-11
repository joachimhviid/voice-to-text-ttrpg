<script setup lang="ts">
const sessionId = ref<string>()
const joinSession = () => {
  if (!sessionId.value || sessionId.value.trim() === '') {
    return
  }
  navigateTo(`/join/${sessionId.value}`)
}
</script>

<template>
  <div class="prose mx-auto">
    <h1>Join a session</h1>
    <input id="sessionId" v-model="sessionId" type="text" name="sessionId" />
    <button @click="joinSession">Join</button>
  </div>
</template>
