<script setup lang="ts">
import { compareDesc } from 'date-fns'

const { params } = useRoute('campaigns-campaignId')
const { data: campaign, refresh } = await useFetch(
  `/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId',
)

useSeoMeta({
  title: campaign.value?.name,
})

const orderedSessions = computed(() => {
  if (!campaign.value) return []
  return campaign.value.sessions.toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
})

const onWikiGenerated = async (slug: string) => {
  await refresh()
  await navigateTo(`/campaigns/${params.campaignId}/wiki/${slug}`)
}

const { cancel, confirm, isRevealed, onConfirm, reveal } = useConfirmDialog()

const { execute: deleteCampaign, status: deleteStatus } = useFetch(`/api/campaigns/${params.campaignId}`, {
  immediate: false,
  method: 'DELETE',
  onResponse: () => {
    navigateTo('/campaigns')
  },
  watch: false,
})

onConfirm(() => deleteCampaign())
</script>

<template>
  <div class="mx-auto max-w-5xl p-4">
    <div class="mb-2 flex items-start justify-between gap-4">
      <h1 class="text-4xl font-bold">{{ campaign?.name }}</h1>

      <div class="shrink-0">
        <template v-if="deleteStatus === 'idle' && !isRevealed">
          <UiButton variant="destroy" @click="reveal">Delete campaign</UiButton>
        </template>
        <template v-if="isRevealed">
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Delete all sessions and wiki entries?</span>
            <UiButton variant="destroy" @click="confirm">Confirm</UiButton>
            <UiButton variant="tertiary" @click="cancel">Cancel</UiButton>
          </div>
        </template>
        <template v-if="deleteStatus === 'pending'">
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
