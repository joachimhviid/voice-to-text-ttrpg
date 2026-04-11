<script setup lang="ts">
import type { Wiki } from '#shared/types/wikis'
import WikiSection from '~/components/WikiSection.vue'
import CharacterGraph from '~/components/CharacterGraph.vue'

const route = useRoute()

// Fetch both the wiki data and the graph data for this specific wiki in parallel
const [{ data: wikiPage, refresh: refreshWiki }, { data: graphData, refresh: refreshGraph }] = await Promise.all([
  useFetch<Wiki>(`/api/wikis/${route.params.id}`),
  useFetch<{ nodes: any[], edges: any[] }>(`/api/wikis/${route.params.id}/graph`)
])

const isEditing = ref(false)
const editableWiki = ref<Partial<Wiki>>({})

function startEditing() {
  if (wikiPage.value) {
    editableWiki.value = JSON.parse(JSON.stringify(wikiPage.value))
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
  await refreshWiki()
}
</script>

<template>
  <div v-if="wikiPage" class="mx-auto max-w-4xl p-4 text-white">
    <div v-if="!isEditing">
      <h1 class="mb-4 text-4xl font-bold">{{ wikiPage.title }}</h1>
      <div class="prose prose-invert lg:prose-xl mb-6" v-html="wikiPage.content"></div>

      <WikiSection title="Combat Stats" :content="wikiPage.combatStats" :is-editing="false" />
      <WikiSection title="Inventory Stats" :content="wikiPage.inventoryStats" :is-editing="false" />

      <!-- Replaced the text-based Relations section with the Graph Component -->
      <CharacterGraph
        v-if="graphData"
        :nodes="graphData.nodes"
        :edges="graphData.edges"
      />

      <WikiSection title="Summary" :content="wikiPage.summary" :is-editing="false" />

      <button
        class="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 mt-6"
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

      <WikiSection
        title="Combat Stats"
        :is-editing="true"
        :content="editableWiki.combatStats"
        @update:content="newValue => (editableWiki.combatStats = newValue)"
      />
      <WikiSection
        title="Inventory Stats"
        :is-editing="true"
        :content="editableWiki.inventoryStats"
        @update:content="newValue => (editableWiki.inventoryStats = newValue)"
      />

      <!-- Keep the text-based Relations field available while editing in case they want notes -->
      <WikiSection
        title="Relations (Text Notes)"
        :is-editing="true"
        :content="editableWiki.relations"
        @update:content="newValue => (editableWiki.relations = newValue)"
      />

      <WikiSection
        title="Summary"
        :is-editing="true"
        :content="editableWiki.summary"
        @update:content="newValue => (editableWiki.summary = newValue)"
      />

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
