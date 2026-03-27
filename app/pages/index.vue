<script setup lang="ts">
const { data: sessions } = await useAsyncData<Session[]>('sessions', () => $fetch('/api/sessions'))
</script>

<template>
  <div class="prose prose-invert prose-a:no-underline lg:prose-xl">
    <h1>D&D Sessions</h1>
    <ul>
      <li v-for="session in sessions" :key="session.id">
        <NuxtLink :to="`/sessions/${session.id}`">
          {{ session.title }}
        </NuxtLink>
      </li>
    </ul>
    <p>
      <NuxtLink to="/new-session"> New Session </NuxtLink>
    </p>
    <div class="flex gap-2">
      <NuxtLink
        to="/host"
        class="rounded border border-purple-500 bg-purple-500/50 px-4 py-1 transition-colors hover:border-purple-800 hover:bg-purple-800/50"
      >
        Host
      </NuxtLink>
      <NuxtLink
        to="/join"
        class="rounded border border-purple-500 bg-purple-500/50 px-4 py-1 transition-colors hover:border-purple-800 hover:bg-purple-800/50"
      >
        Join
      </NuxtLink>
    </div>
  </div>
</template>
