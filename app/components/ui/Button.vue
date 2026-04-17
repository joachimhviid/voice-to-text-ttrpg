<script setup lang="ts">
import type { NuxtRoute } from '@typed-router/__router'
import type { RoutesNamesList } from '@typed-router/__routes'
import { match } from 'ts-pattern'
import { NuxtLink } from '#components'

const props = defineProps<{
  icon?: string
  link?: NuxtRoute<RoutesNamesList, string>
  variant: 'destroy' | 'primary' | 'secondary' | 'tertiary'
}>()

const buttonClasses = computed(() => {
  return match(props.variant)
    .with('primary', () => {
      return [
        'border border-purple-500 bg-purple-500/50 hover:bg-purple-800/50 disabled:bg-purple-500/20 disabled:border-purple-500/20',
      ]
    })
    .with('secondary', () => {
      return [
        'border border-purple-500 hover:bg-purple-800/50 disabled:hover:bg-purple-800/20 disabled:border-purple-500/20',
      ]
    })
    .with('tertiary', () => {
      return ['hover:bg-purple-300/20']
    })
    .with('destroy', () => {
      return ['border border-red-500 hover:bg-red-500/20 disabled:border-red-500/20']
    })
    .exhaustive()
})
</script>

<template>
  <component
    :is="link ? NuxtLink : 'button'"
    :to="link"
    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded px-4 py-2 transition disabled:cursor-not-allowed disabled:text-gray-200/50"
    :class="buttonClasses"
  >
    <Icon v-if="icon" :name="icon" />
    <slot />
  </component>
</template>
