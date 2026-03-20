<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isUser?: boolean
    name?: string
  }>(),
  { isUser: false, name: undefined },
)

const sessionNickname = ref<string | undefined>()
const nickname = ref<string | undefined>(props.name)

const setNickname = () => {
  if (!nickname.value || nickname.value.trim() === '') {
    return
  }
  sessionNickname.value = nickname.value
}

const unsetNickname = () => (sessionNickname.value = undefined)
</script>

<template>
  <div v-if="!sessionNickname && isUser" class="flex flex-col">
    <!-- <label for="nickname">Set your nickname</label> -->
    <div class="flex gap-2">
      <input
        id="nickname"
        v-model="nickname"
        class="rounded border border-white/50 p-2.5"
        type="text"
        placeholder="Your nickname"
      />
      <button
        class="cursor-pointer rounded border border-purple-500 bg-purple-500/50 px-4 py-2 font-medium transition-colors hover:border-purple-800 hover:bg-purple-800/50"
        @click="setNickname"
      >
        Confirm
      </button>
    </div>
  </div>
  <div
    v-else
    class="flex w-fit items-center gap-2 rounded border py-2 pl-3"
    :class="[isUser ? 'border-amber-500 bg-amber-500/50 pr-3' : 'border-blue-500 bg-blue-500/50 pr-4']"
  >
    <Icon name="heroicons:user" size="20px" />
    <span class="text-lg font-medium">{{ nickname }}</span>
    <button
      v-if="isUser"
      class="flex cursor-pointer items-center rounded bg-white/0 p-1 transition hover:bg-white/20"
      @click="unsetNickname"
    >
      <Icon name="heroicons:pencil-square" size="20px" />
    </button>
  </div>
</template>
