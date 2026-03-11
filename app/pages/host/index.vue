<script setup lang="ts">
const startSession = () => {
  // placeholder, should be fetched from backend
  const sessionId = '1234'
  navigateTo(`/host/${sessionId}`)
}
</script>

<template>
  <div class="prose mx-auto">
    <h1>Host a new session</h1>
    <button @click="startSession">Start session</button>
  </div>
</template>
