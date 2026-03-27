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
        <div class="relative">
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
        <div class="relative">
          <input
            id="inviteCode"
            v-model="inviteCode"
            type="text"
            class="peer block w-full appearance-none rounded border border-white/20 bg-transparent px-2.5 pt-4 pb-2.5 text-sm focus:border-purple-500 focus:ring-0 focus:outline-none"
            placeholder=" "
          />
          <label
            for="inviteCode"
            class="absolute inset-s-1 top-2 z-10 origin-left -translate-y-4 scale-75 transform bg-gray-900 px-2 text-gray-400 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-purple-500"
          >
            Invite code
          </label>
        </div>
        <UiButton variant="primary" @click="joinSession">Join session</UiButton>
      </div>
    </PanelContainer>
  </div>
</template>
