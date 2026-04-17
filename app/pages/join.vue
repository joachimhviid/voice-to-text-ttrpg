<script setup lang="ts">
const inviteCode = ref<string>()
const nickname = ref<string>()

const { joinSession: joinRecordingSession } = useRecordingSession()

const joinSession = () => {
  if (!inviteCode.value || inviteCode.value.trim() === '') {
    return
  }
  if (!nickname.value || nickname.value.trim() === '') {
    return
  }
  joinRecordingSession(inviteCode.value, nickname.value)
}
</script>

<template>
  <div class="mx-auto flex h-svh max-w-5xl items-center justify-center">
    <PanelContainer>
      <h1 class="mb-4 text-2xl font-bold">Join a session</h1>
      <p class="mb-4">Use the invite code provided by the host to join their session.</p>
      <div class="flex flex-col gap-2">
        <UiTextInput id="nickname" v-model="nickname" label="Nickname" />
        <UiTextInput id="inviteCode" v-model="inviteCode" label="Invite code" />
        <UiButton variant="primary" @click="joinSession">Join session</UiButton>
      </div>
    </PanelContainer>
  </div>
</template>
