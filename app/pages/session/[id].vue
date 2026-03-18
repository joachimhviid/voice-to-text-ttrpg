<script setup lang="ts">
const { params } = useRoute('session-id')
const { isHost } = useRecordingSession()

const { data } = await useFetch(`/api/sessions/${params.id}` as '/api/sessions/:id')
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div v-if="isHost">Host controls go here</div>
    <div>
      <div v-if="data">
        Invite code: <span>{{ data.code }}</span>
      </div>
      <p>Waiting for session to start</p>
    </div>
  </div>
</template>
