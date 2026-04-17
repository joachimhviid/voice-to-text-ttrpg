<script setup lang="ts">
const campaignName = ref<string>()

const createCampaign = async () => {
  if (!campaignName.value || campaignName.value.trim() === '') {
    return
  }

  const newCampaign = await $fetch('/api/campaigns/create', {
    body: {
      campaignName: campaignName.value,
    },
    method: 'post',
  })

  navigateTo(`/campaigns/${newCampaign.id}`)
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl items-center justify-center">
    <PanelContainer size="md">
      <h1 class="mb-4 text-2xl font-bold">Create a new campaign</h1>
      <div class="flex flex-col gap-2">
        <UiTextInput id="campaignName" v-model="campaignName" label="Campaign name" />
        <UiButton variant="primary" @click="createCampaign">Create campaign</UiButton>
      </div>
    </PanelContainer>
  </div>
</template>
