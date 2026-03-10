<script setup lang="ts">
const route = useRoute()
const { data: session } = await useFetch<Session>(`/api/sessions/${route.params.id}`)
</script>

<template>
  <div v-if="session" class="prose lg:prose-xl mx-auto p-4">
    <h1>{{ session.title }}</h1>
    <div v-html="session.content"></div>
  </div>
  <div v-else>Loading...</div>
</template>
