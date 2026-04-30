<script setup lang="ts">
const { recordingState } = useRecordingSession()

defineEmits<{
  (e: 'close' | 'pause' | 'start' | 'stop'): void
}>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <!-- v-if="['inactive', 'paused'].includes(recordingState)" -->
      <UiButton
        v-if="['inactive', 'paused'].includes(recordingState)"
        icon="heroicons:play"
        variant="primary"
        @click="$emit('start')"
      >
        Start recording
      </UiButton>
      <UiButton v-else icon="heroicons:pause" variant="primary" @click="$emit('pause')"> Pause recording </UiButton>
      <!-- :disabled="recordingState === 'inactive'" -->
      <UiButton
        :disabled="recordingState === 'inactive'"
        icon="heroicons:stop"
        variant="secondary"
        @click="$emit('stop')"
      >
        Stop recording
      </UiButton>
    </div>
    <UiButton icon="heroicons:power" variant="destroy" @click="$emit('close')">End session</UiButton>
  </div>
</template>
