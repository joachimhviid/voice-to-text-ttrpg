<script setup lang="ts">
import type { InternalApi } from 'nitropack'
import { format, formatDistanceToNow } from 'date-fns'

type CampaignWithSessions = InternalApi['/api/campaigns']['default'][number]
defineProps<{
  campaign: CampaignWithSessions
}>()
</script>

<template>
  <div class="flex justify-between gap-2 rounded-lg border border-white/20 p-4">
    <div class="flex flex-col gap-2">
      <div>
        <NuxtLink class="inline-block" :to="`/campaigns/${campaign.id}`">
          <h3 class="text-xl font-medium">{{ campaign.name }}</h3>
        </NuxtLink>
      </div>
      <div class="flex gap-4">
        <div class="flex items-center gap-1 text-gray-400" :title="format(campaign.createdAt, 'yyyy-MM-dd HH:mm:ss')">
          <Icon name="heroicons-solid:clock" />
          Created <span class="font-bold">{{ formatDistanceToNow(campaign.createdAt, { addSuffix: true }) }}</span>
        </div>
        <div class="flex items-center gap-1 text-gray-400">
          <Icon name="heroicons-solid:folder" />
          Sessions
          <span class="font-bold">{{ campaign.sessions.length }}</span>
        </div>
      </div>
    </div>
    <div>
      <UiButton
        variant="secondary"
        :link="`/campaigns/${campaign.id}`"
        icon="heroicons:arrow-right"
        class="h-full text-2xl"
      ></UiButton>
    </div>
  </div>
</template>
