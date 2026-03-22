<script setup lang="ts">
import { PARTICIPANT_SESSION_COOKIE } from '#shared/utils/participantSessionCookie'

const props = defineProps<{
  name: string
}>()

const sessionCookie = useCookie<ParticipantSessionCookie | undefined>(PARTICIPANT_SESSION_COOKIE)
const isUser = computed(() => sessionCookie.value && sessionCookie.value.nickname === props.name)
</script>

<template>
  <div
    class="flex w-fit items-center gap-2 rounded border py-2 pl-3"
    :class="[isUser ? 'border-amber-500 bg-amber-500/50 pr-3' : 'border-blue-500 bg-blue-500/50 pr-4']"
  >
    <Icon name="heroicons:user" size="20px" />
    <span class="text-lg font-medium">{{ name }}</span>
  </div>
</template>
