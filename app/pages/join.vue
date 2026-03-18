<script setup lang="ts">
const inviteCode = ref<string>()
const { joinSession: joinRecordingSession } = useRecordingSession()
const joinSession = () => {
  if (!inviteCode.value || inviteCode.value.trim() === '') {
    return
  }
  joinRecordingSession(inviteCode.value)
}
</script>

<template>
  <div class="mx-auto flex h-svh max-w-5xl items-center justify-center">
    <div class="mx-4 w-full max-w-md rounded-lg border border-white/20 bg-gray-700/50 px-4 py-6">
      <h1 class="mb-4 text-2xl font-bold">Join a session</h1>
      <p class="mb-4">Use the invite code provided by the host to join their session.</p>
      <div class="flex flex-col gap-2">
        <input
          id="inviteCode"
          v-model="inviteCode"
          placeholder="Invite code"
          type="text"
          name="inviteCode"
          class="rounded border border-white/50 p-2"
        />
        <button
          class="cursor-pointer rounded border border-purple-500 bg-purple-500/50 px-4 py-2 font-medium transition-colors hover:border-purple-800 hover:bg-purple-800/50"
          @click="joinSession"
        >
          Join session
        </button>
      </div>
    </div>
  </div>
</template>
