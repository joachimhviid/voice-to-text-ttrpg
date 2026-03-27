<script setup lang="ts">
import type { Wiki } from '#shared/types/wikis'

const route = useRoute()
const { data: wikiPage, refresh } = await useFetch<Wiki>(`/api/wikis/${route.params.id}`)

const isEditing = ref(false)
const editableWiki = ref<Partial<Wiki>>({})

function startEditing() {
  if (wikiPage.value) {
    editableWiki.value = { ...wikiPage.value }
    isEditing.value = true
  }
}

function cancelEditing() {
  isEditing.value = false
}

async function saveChanges() {
  await useFetch(`/api/wikis/${route.params.id}`, {
    body: editableWiki.value,
    method: 'PUT',
  })
  isEditing.value = false
  await refresh()
}
</script>

<template>
  <div v-if="wikiPage" class="mx-auto max-w-4xl p-4 text-white">
    <div v-if="!isEditing">
      <h1 class="mb-4 text-4xl font-bold">{{ wikiPage.title }}</h1>
      <div class="prose prose-invert lg:prose-xl mb-6" v-html="wikiPage.content"></div>

      <div v-if="wikiPage.combatStats" class="mb-4">
        <h2 class="mb-2 text-2xl font-semibold">Combat Stats</h2>
        <pre class="rounded-md bg-gray-800 p-4 text-white">{{ wikiPage.combatStats }}</pre>
      </div>

      <div v-if="wikiPage.inventoryStats" class="mb-4">
        <h2 class="mb-2 text-2xl font-semibold">Inventory Stats</h2>
        <pre class="rounded-md bg-gray-800 p-4 text-white">{{ wikiPage.inventoryStats }}</pre>
      </div>

      <div v-if="wikiPage.relations" class="mb-4">
        <h2 class="mb-2 text-2xl font-semibold">Relations</h2>
        <pre class="rounded-md bg-gray-800 p-4 text-white">{{ wikiPage.relations }}</pre>
      </div>

      <div v-if="wikiPage.summary" class="mb-4">
        <h2 class="mb-2 text-2xl font-semibold">Summary</h2>
        <pre class="rounded-md bg-gray-800 p-4 text-white">{{ wikiPage.summary }}</pre>
      </div>

      <button
        class="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        @click="startEditing"
      >
        Edit
      </button>
    </div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold">Editing: {{ editableWiki.title }}</h1>
      <div>
        <label for="title" class="mb-2 block text-sm font-medium text-white">Title</label>
        <input
          id="title"
          v-model="editableWiki.title"
          type="text"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="content" class="mb-2 block text-sm font-medium text-white">Content</label>
        <textarea
          id="content"
          v-model="editableWiki.content"
          rows="10"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="combatStats" class="mb-2 block text-sm font-medium text-white">Combat Stats</label>
        <textarea
          id="combatStats"
          v-model="editableWiki.combatStats"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="inventoryStats" class="mb-2 block text-sm font-medium text-white">Inventory Stats</label>
        <textarea
          id="inventoryStats"
          v-model="editableWiki.inventoryStats"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="relations" class="mb-2 block text-sm font-medium text-white">Relations</label>
        <textarea
          id="relations"
          v-model="editableWiki.relations"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="summary" class="mb-2 block text-sm font-medium text-white">Summary</label>
        <textarea
          id="summary"
          v-model="editableWiki.summary"
          rows="5"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div class="flex justify-end space-x-4">
        <button
          class="rounded-md bg-gray-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
          @click="cancelEditing"
        >
          Cancel
        </button>
        <button
          class="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          @click="saveChanges"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
  <div v-else class="p-8 text-center text-white">Loading wiki page...</div>
</template>
