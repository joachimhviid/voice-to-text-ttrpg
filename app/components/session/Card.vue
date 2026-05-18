<script setup lang="ts">
import { format } from 'date-fns'
import type { InternalApi } from 'nitropack'

type SessionData = NonNullable<InternalApi['/api/campaigns/:campaignId']['default']>['sessions'][number]
const props = defineProps<{
  session: SessionData
}>()

const emit = defineEmits<{
  wikiGenerated: [slug: string]
}>()

const statusLabel: Record<string, string> = {
  closed: 'Closed',
  inProgress: 'In Progress',
  open: 'Open',
}

const statusColour: Record<string, string> = {
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  inProgress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  open: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const wikiTitle = computed(() => {
  if (!props.session.wikiSlug) return ''
  return props.session.wikiSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})

const formattedDate = computed(() => {
  try {
    return format(new Date(props.session.createdAt), 'dd MMM yyyy, HH:mm')
  } catch {
    return props.session.createdAt
  }
})

const {
  data,
  error,
  execute: generateWiki,
  pending,
  status,
} = useFetch(`/api/sessions/${props.session.id}/generate-wiki` as `/api/sessions/:sessionId/generate-wiki`, {
  immediate: false,
  method: 'POST',
  watch: false,
})

const canGenerateWiki = computed(() => props.session.status === 'closed' && !props.session.wikiSlug && !pending.value)

watch(data, (value) => {
  if (status.value === 'success' && value) {
    emit('wikiGenerated', value.slug)
  }
})
</script>

<template>
  <div class="rounded-lg border border-white/20 p-4">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p v-if="wikiTitle && wikiTitle !== ''" class="font-medium">{{ wikiTitle }}</p>
        <p class="text-sm text-gray-400">{{ formattedDate }}</p>
        <p class="mt-1 truncate font-mono text-xs text-gray-500">{{ session.id }}</p>
      </div>
      <span
        class="shrink-0 rounded border px-2 py-0.5 text-xs font-medium"
        :class="statusColour[session.status] ?? 'bg-gray-700 text-gray-300'"
      >
        {{ statusLabel[session.status] ?? session.status }}
      </span>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <NuxtLink
        v-if="session.wikiSlug"
        :to="`/campaigns/${session.campaignId}/wiki/${session.wikiSlug}`"
        class="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
      >
        View wiki
      </NuxtLink>

      <UiButton v-if="canGenerateWiki" variant="primary" size="sm" @click="generateWiki">Generate Wiki</UiButton>

      <div v-if="pending" class="flex items-center gap-2 text-sm text-gray-400">
        <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
        Generating — this may take a minute...
      </div>

      <p v-if="error" class="text-sm text-red-400">
        {{ error || 'Wiki generation failed — is Ollama running?' }}
      </p>
    </div>
  </div>
</template>
