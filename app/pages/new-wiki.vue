<script setup lang="ts">
import type { Wiki } from '#shared/types/wikis'

const title = ref('')
const content = ref('')
const combatStats = ref('')
const inventoryStats = ref('')
const relations = ref('')
const summary = ref('')
const router = useRouter()

async function createWiki() {
  if (!title.value) {
    alert('Please enter a title')
    return
  }

  const { data } = await useFetch<Wiki>('/api/wikis', {
    body: {
      combatStats: combatStats.value,
      content: content.value,
      inventoryStats: inventoryStats.value,
      relations: relations.value,
      summary: summary.value,
      title: title.value,
    },
    method: 'POST',
  })

  if (data.value?.id) {
    await router.push(`/wiki/${data.value.id}`)
  }
}

function cancel() {
  router.back()
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 text-white">
    <h1 class="mb-6 text-3xl font-bold">New Wiki</h1>
    <form class="space-y-6" @submit.prevent="createWiki">
      <div>
        <label for="title" class="mb-2 block text-sm font-medium text-white">Title</label>
        <input
          id="title"
          v-model="title"
          type="text"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="content" class="mb-2 block text-sm font-medium text-white">Content</label>
        <textarea
          id="content"
          v-model="content"
          rows="10"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="combatStats" class="mb-2 block text-sm font-medium text-white">Combat Stats</label>
        <textarea
          id="combatStats"
          v-model="combatStats"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="inventoryStats" class="mb-2 block text-sm font-medium text-white">Inventory Stats</label>
        <textarea
          id="inventoryStats"
          v-model="inventoryStats"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="relations" class="mb-2 block text-sm font-medium text-white">Relations</label>
        <textarea
          id="relations"
          v-model="relations"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="summary" class="mb-2 block text-sm font-medium text-white">Summary</label>
        <textarea
          id="summary"
          v-model="summary"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div class="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          class="rounded-md bg-gray-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Create Wiki
        </button>
      </div>
    </form>
  </div>
</template>
