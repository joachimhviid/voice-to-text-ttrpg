<script setup lang="ts">
const { data: sessions } = await useAsyncData<Session[]>('sessions', () => $fetch('/api/sessions'))
</script>

<template>
  <div class="prose lg:prose-xl">
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
  </div>
</template>
