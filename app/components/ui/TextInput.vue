<script setup lang="ts">
defineProps<{
  id: string
  label: string
}>()

const model = defineModel<string>()
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      v-model="model"
      type="text"
      class="peer block w-full appearance-none rounded border border-white/20 bg-transparent px-2.5 pt-4 pb-2.5 text-sm focus:border-purple-500 focus:ring-0 focus:outline-none"
      placeholder=" "
    />
    <label
      :for="id"
      class="absolute inset-s-1 top-2 z-10 origin-left -translate-y-4 scale-75 transform bg-gray-900 px-2 text-gray-400 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-purple-500"
    >
      {{ label }}
    </label>
  </div>
</template>
