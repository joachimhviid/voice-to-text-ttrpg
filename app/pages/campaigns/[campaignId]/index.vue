<script setup lang="ts">
import { compareDesc } from 'date-fns'

const { params } = useRoute('campaigns-campaignId')
const { data: campaign, refresh } = await useFetch(
  `/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId',
)

const orderedSessions = computed(() => {
  if (!campaign.value) return []
  return campaign.value.sessions.toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
})

async function onWikiGenerated(slug: string) {
  await refresh()
  await navigateTo(`/wiki/${slug}`)
}

const deleteState = ref<'confirm' | 'deleting' | 'idle'>('idle')

async function deleteCampaign() {
  deleteState.value = 'deleting'
  try {
    await $fetch(`/api/campaigns/${params.campaignId}`, { method: 'DELETE' })
    await navigateTo('/campaigns')
  } catch {
    deleteState.value = 'idle'
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl p-4">
    <div class="mb-2 flex items-start justify-between gap-4">
      <h1 class="text-4xl font-bold">{{ campaign?.name }}</h1>

      <div class="shrink-0">
        <template v-if="deleteState === 'idle'">
          <UiButton variant="destroy" @click="deleteState = 'confirm'">Delete campaign</UiButton>
        </template>
        <template v-else-if="deleteState === 'confirm'">
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Delete all sessions and wiki entries?</span>
            <UiButton variant="destroy" @click="deleteCampaign">Confirm</UiButton>
            <UiButton variant="tertiary" @click="deleteState = 'idle'">Cancel</UiButton>
          </div>
        </template>
        <template v-else>
          <span class="text-sm text-gray-400">Deleting…</span>
        </template>
      </div>
    </div>

    <p class="mb-6 text-gray-400">Description of campaign.</p>

    <div class="mb-8 flex gap-2">
      <UiButton variant="primary" :link="`/campaigns/${params.campaignId}/host`">Begin new session</UiButton>
    </div>

    <h2 class="mb-4 text-2xl font-semibold">Sessions</h2>

    <div v-if="orderedSessions.length" class="flex flex-col gap-3">
      <SessionCard
        v-for="session in orderedSessions"
        :key="session.id"
        :session="session"
        @wiki-generated="onWikiGenerated"
      />
    </div>
    <p v-else class="text-gray-400">No sessions yet. Begin a new one above.</p>
  </div>
</template>
