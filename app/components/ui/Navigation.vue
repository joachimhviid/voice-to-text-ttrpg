<script setup lang="ts"></script>

<template>
  <nav
    class="sticky top-4 mx-auto my-4 flex w-full max-w-5xl gap-4 rounded-lg border border-white/20 p-4 backdrop-blur"
  >
    <NuxtLink to="/" exact-active-class="underline decoration-2">Home</NuxtLink>
    <NuxtLink to="/campaigns" exact-active-class="underline decoration-2">Campaigns</NuxtLink>
  </nav>
</template>
