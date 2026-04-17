<script setup lang="ts"></script>

<template>
  <div class="flex min-h-screen flex-col text-white">
    <UiNavigation />
    <div class="grow">
      <slot />
    </div>
  </div>
</template>
