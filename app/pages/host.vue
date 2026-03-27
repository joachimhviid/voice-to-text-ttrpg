<script setup lang="ts">
const { createSession, loading } = useRecordingSession()

const nickname = ref<string>()

const create = () => {
  if (!nickname.value || nickname.value.trim() === '') {
    return
  }
  createSession(nickname.value)
}
</script>

<template>
  <div class="mx-auto flex h-svh max-w-5xl items-center justify-center">
    <PanelContainer>
      <h1 class="mb-4 text-2xl font-bold">Host a new session</h1>
      <p class="mb-4">Start a new recording session. Participants will join your session using an invite code.</p>
      <div class="relative mb-2">
        <input
          id="nickname"
          v-model="nickname"
          type="text"
          class="peer block w-full appearance-none rounded border border-white/20 bg-transparent px-2.5 pt-4 pb-2.5 text-sm focus:border-purple-500 focus:ring-0 focus:outline-none"
          placeholder=" "
        />
        <label
          for="nickname"
          class="absolute inset-s-1 top-2 z-10 origin-left -translate-y-4 scale-75 transform bg-gray-900 px-2 text-gray-400 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-purple-500"
        >
          Nickname
        </label>
      </div>
      <UiButton variant="primary" :disabled="loading" @click="create">
        {{ loading ? 'Creating...' : 'Create session' }}
      </UiButton>
    </PanelContainer>
  </div>
</template>
