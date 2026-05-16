<script setup lang="ts">
defineProps<{
  content: null | string | undefined
  isEditing: boolean
  title: string
}>()

const emit = defineEmits(['update:content'])

function onInput(event: Event) {
  emit('update:content', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="mb-4">
    <h2 class="mb-2 text-2xl font-semibold">{{ title }}</h2>
    <div v-if="!isEditing">
      <pre v-if="content" class="rounded-md bg-gray-800 p-4 wrap-break-word whitespace-pre-wrap text-white">
        {{ content }}
      </pre>
      <p v-else class="text-gray-400 italic">No content provided.</p>
    </div>
    <div v-else>
      <textarea
        :value="content || ''"
        rows="5"
        class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        @input="onInput"
      />
    </div>
  </div>
</template>
