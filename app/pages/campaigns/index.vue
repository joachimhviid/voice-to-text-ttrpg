<script setup lang="ts">
const { data: campaigns } = useFetch('/api/campaigns')
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <h1 class="mb-4 text-4xl font-bold">Campaigns</h1>
    <p class="mb-4">
      Continue an existing campaign by selecting it from the list or embark on a new adventure by pressing the button
      below!
    </p>
    <UiButton variant="primary" link="/campaigns/create">Create new campaign</UiButton>
    <div class="mt-8 flex flex-col gap-2">
      <CampaignCard v-for="campaign in campaigns" :key="campaign.id" :campaign="campaign" />
    </div>
  </div>
</template>
