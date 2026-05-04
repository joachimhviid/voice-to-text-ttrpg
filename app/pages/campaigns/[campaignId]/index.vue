<script setup lang="ts">
import { compareDesc } from 'date-fns'

const { params } = useRoute('campaigns-campaignId')
const { data: campaign, refresh } = await useFetch(`/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId')

const orderedSessions = computed(() => {
  if (!campaign.value) return []
  return campaign.value.sessions.toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
})

async function onWikiGenerated(slug: string) {
  // Refresh campaign data so the card immediately shows the View Wiki link
  await refresh()
  await navigateTo(`/wiki/${slug}`)
}
</script>

<template>
  <div class="mx-auto max-w-5xl p-4">
    <h1 class="mb-2 text-4xl font-bold">{{ campaign?.name }}</h1>
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
