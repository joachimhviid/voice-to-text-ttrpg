<script setup lang="ts">
const { params } = useRoute()

// Connect to websocket
</script>

<template>
  <div class="prose mx-auto">
    <h1>Hosting session:</h1>
    <p>{{ params }}</p>
    <button>End session</button>
  </div>
</template>
