<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{
  session: {
    id: string
    status: string
    createdAt: string
    wikiSlug?: string | null
  }
}>()

const emit = defineEmits<{
  wikiGenerated: [slug: string]
}>()

type GenerateState = 'idle' | 'generating' | 'error'
const generateState = ref<GenerateState>('idle')
const errorMessage = ref('')

const statusLabel: Record<string, string> = {
  open: 'Open',
  inProgress: 'In Progress',
  closed: 'Closed',
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

const canGenerateWiki = computed(
  () => props.session.status === 'closed' && !props.session.wikiSlug && generateState.value !== 'generating',
)

async function generateWiki() {
  generateState.value = 'generating'
  errorMessage.value = ''

  try {
    const result = await $fetch<{ slug: string }>(`/api/sessions/${props.session.id}/generate-wiki`, {
      method: 'POST',
    })
    generateState.value = 'idle'
    emit('wikiGenerated', result.slug)
  } catch (e: unknown) {
    generateState.value = 'error'
    errorMessage.value = e instanceof Error ? e.message : 'Wiki generation failed — is Ollama running?'
  }
}
</script>

<template>
  <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
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
        :to="`/wiki/${session.wikiSlug}`"
        class="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
      >
        View wiki — {{ wikiTitle }}
      </NuxtLink>

      <button
        v-if="canGenerateWiki"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="generateWiki"
      >
        Generate Wiki
      </button>

      <div v-if="generateState === 'generating'" class="flex items-center gap-2 text-sm text-gray-400">
        <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
        Generating — this may take a minute...
      </div>

      <p v-if="generateState === 'error'" class="text-sm text-red-400">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
