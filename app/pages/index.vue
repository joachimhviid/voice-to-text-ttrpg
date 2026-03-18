<script setup lang="ts">
const { data: home } = await useAsyncData(() => queryCollection('content').path('/').first())
</script>

<template>
  <div class="prose prose-invert prose-a:no-underline mx-auto">
    <ContentRenderer v-if="home" :value="home" />
    <div v-else>Home not found</div>
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
