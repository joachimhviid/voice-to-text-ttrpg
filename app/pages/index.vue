<script setup lang="ts">
const { data: home } = await useAsyncData(() => queryCollection('content').path('/').first())
</script>

<template>
  <div class="prose mx-auto">
    <ContentRenderer v-if="home" :value="home" />
    <div v-else>Home not found</div>
  </div>
</template>
