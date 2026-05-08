<script setup lang="ts">
import type { InternalApi } from 'nitropack'

type SessionData = NonNullable<InternalApi['/api/campaigns/:campaignId']['default']>['sessions'][number]
defineProps<{
  session: SessionData
}>()
</script>

<template>
  <div class="flex justify-between rounded border border-white/20 p-4">
    <!-- Session summary -->
    <span>{{ session.id }}</span>
    <span>{{ session.status }}</span>
    <!-- Who participated -->
    <!-- When did session take place -->
    <!-- Controls for deleting and/or editing? -->
    <UiButton variant="secondary">
      <Icon name="heroicons:chevron-down" size="20px" />
    </UiButton>
  </div>
</template>
