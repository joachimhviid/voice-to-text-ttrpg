<script setup lang="ts">
const { createSession, loading } = useRecordingSession()
</script>

<template>
  <div class="mx-auto flex h-svh max-w-5xl items-center justify-center">
    <div class="mx-4 w-full max-w-md rounded-lg border border-white/20 bg-gray-700/50 px-4 py-6">
      <h1 class="mb-4 text-2xl font-bold">Host a new session</h1>
      <p class="mb-4">Start a new recording session. Participants will join your session using an invite code.</p>
      <button
        class="w-full cursor-pointer rounded border border-purple-500 bg-purple-500/50 px-4 py-2 font-medium transition-colors hover:border-purple-800 hover:bg-purple-800/50"
        :disabled="loading"
        @click="createSession"
      >
        {{ loading ? 'Creating...' : 'Create session' }}
      </button>
    </div>
  </div>
</template>
