<script setup lang="ts">
const { createSession, loading } = useRecordingSession()

const { params } = useRoute('campaigns-campaignId-host')
const { data: campaign } = useFetch(`/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId')

const nickname = ref<string>()

const create = () => {
  if (!nickname.value || nickname.value.trim() === '') {
    return
  }
  createSession(nickname.value, Number(params.campaignId))
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl items-center justify-center">
    <PanelContainer>
      <span v-if="campaign" class="text-sm text-gray-400">{{ campaign.name }}</span>
      <h1 class="mb-4 text-2xl font-bold">Host a new session</h1>
      <p class="mb-4">Start a new recording session. Participants will join your session using an invite code.</p>
      <div class="flex flex-col gap-2">
        <UiTextInput id="nickname" v-model="nickname" label="Nickname" />
        <UiButton variant="primary" :disabled="loading" @click="create">
          {{ loading ? 'Creating...' : 'Create session' }}
        </UiButton>
      </div>
    </PanelContainer>
  </div>
</template>
