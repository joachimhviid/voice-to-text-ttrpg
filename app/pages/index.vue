<script setup lang="ts">
import type { Wiki } from '#shared/types/wikis'
// const { data: sessions } = await useAsyncData<Session[]>('sessions', () => $fetch('/api/sessions'))
const { data: wikis } = await useAsyncData<Wiki[]>('wikis', () => $fetch('/api/wikis'))
</script>

<template>
  <div class="prose prose-invert prose-a:no-underline lg:prose-xl mx-auto">
    <h1>D&D Sessions</h1>
    <ul>
      <!-- <li v-for="session in sessions" :key="session.id">
        <NuxtLink :to="`/sessions/${session.id}`">
          {{ session.title }}
        </NuxtLink>
      </li> -->
    </ul>
    <div class="mb-8 flex gap-2">
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
      <NuxtLink
        to="/new-wiki"
        class="rounded border border-purple-500 bg-purple-500/50 px-4 py-1 transition-colors hover:border-purple-800 hover:bg-purple-800/50"
      >
        New Wiki
      </NuxtLink>
    </div>

    <h2 class="mt-8">Wiki Pages</h2>
    <ul v-if="wikis && wikis.length">
      <li v-for="wikiPage in wikis" :key="wikiPage.id">
        <NuxtLink :to="`/wiki/${wikiPage.id}`">
          {{ wikiPage.title }}
        </NuxtLink>
      </li>
    </ul>
    <p v-else>No wiki pages found. Create one!</p>
  </div>
</template>
