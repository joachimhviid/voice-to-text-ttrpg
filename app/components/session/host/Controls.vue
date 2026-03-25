<script setup lang="ts">
const { closeSession, pauseRecording, recordingState, startRecording, stopRecording } = useRecordingSession()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <UiButton
        v-if="['inactive', 'paused'].includes(recordingState)"
        icon="heroicons:play"
        variant="primary"
        @click="startRecording"
      >
        Start recording
      </UiButton>
      <UiButton v-else icon="heroicons:pause" variant="primary" @click="pauseRecording"> Pause recording </UiButton>
      <UiButton
        :disabled="recordingState === 'inactive'"
        icon="heroicons:stop"
        variant="secondary"
        @click="stopRecording"
      >
        Stop recording
      </UiButton>
    </div>
    <UiButton icon="heroicons:power" variant="destroy" @click="closeSession">End session</UiButton>
  </div>
</template>
