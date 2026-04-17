<script setup lang="ts">
const { params } = useRoute('campaigns-campaignId')
const { data: campaign } = useFetch(`/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId')
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <h1 class="mb-4 text-4xl font-bold">{{ campaign?.name }}</h1>
    <p>Description of campaign.</p>
    <div>
      <!-- Start a new session -->
      <UiButton variant="primary" :link="`/campaigns/${params.campaignId}/host`">Begin new session</UiButton>
      <!-- Link to wiki -->
    </div>
    <div>
      <!-- List of sessions with summaries -->
    </div>
  </div>
</template>
