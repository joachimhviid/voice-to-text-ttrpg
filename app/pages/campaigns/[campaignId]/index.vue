<script setup lang="ts">
import { compareDesc } from 'date-fns'
const { params } = useRoute('campaigns-campaignId')
const { data: campaign } = useFetch(`/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId')

const orderedSessions = computed(() => {
  if (!campaign.value) {
    return []
  }
  return campaign.value.sessions.toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <h1 class="mb-4 text-4xl font-bold">{{ campaign?.name }}</h1>
    <p class="mb-4">Description of campaign.</p>
    <div class="mb-4 flex gap-2">
      <!-- Start a new session -->
      <UiButton variant="primary" :link="`/campaigns/${params.campaignId}/host`">Begin new session</UiButton>
      <!-- Link to wiki -->
      <UiButton variant="secondary">Wiki</UiButton>
    </div>
    <div>
      <!-- List of sessions with summaries -->
      <div v-for="session in orderedSessions" :key="session.id">{{ session.id }} {{ session.status }}</div>
    </div>
  </div>
</template>
