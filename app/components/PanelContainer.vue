<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: 'full' | 'lg' | 'md' | 'sm'
  }>(),
  {
    size: 'md',
  },
)

const widthClass = computed(() => {
  switch (props.size) {
    case 'full':
      return 'max-w-full'
    case 'lg':
      return 'max-w-3xl'
    case 'md':
      return 'max-w-md'
    case 'sm':
      return 'max-w-sm'
    default:
      return 'max-w-md'
  }
})
</script>

<template>
  <div class="mx-4 w-full rounded-lg border border-white/20 bg-gray-900 px-4 py-6" :class="widthClass">
    <slot></slot>
  </div>
</template>
