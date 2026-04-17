<script setup lang="ts">
import type { Wiki } from '#shared/types/wikis'
import type { CharacterEdge, CharacterNode } from '#shared/types/graph'
import WikiSection from '~/components/WikiSection.vue'
import CharacterGraph from '~/components/CharacterGraph.vue'

const route = useRoute()

// Fetch both the wiki data and the graph data for this specific wiki in parallel
const [{ data: wikiPage, refresh: refreshWiki }, { data: graphData }] = await Promise.all([
  useFetch<Wiki>(`/api/wikis/${route.params.id}`),
  useFetch<{ edges: CharacterEdge[]; nodes: CharacterNode[] }>(`/api/wikis/${route.params.id}/graph`),
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

const toc = ref<{ id: string; level: number; text: string }[]>([])
const processedContent = ref('')

function computeContentData() {
  if (!wikiPage.value?.content) {
    toc.value = []
    processedContent.value = ''
    return
  }
  const parser = new DOMParser()

  const tocDoc = parser.parseFromString(wikiPage.value.content, 'text/html')
  const headers = tocDoc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  toc.value = Array.from(headers).map((header, index) => {
    const id = header.id || `header-${index}`
    if (!header.id) header.id = id
    return {
      id,
      level: parseInt(header.tagName[1] || '1', 10),
      text: header.textContent || '',
    }
  })

  const contentDoc = parser.parseFromString(wikiPage.value.content, 'text/html')
  contentDoc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((header, index) => {
    if (!header.id) header.id = `header-${index}`
  })
  processedContent.value = contentDoc.body.innerHTML
}

onMounted(computeContentData)
watch(wikiPage, computeContentData)

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div v-if="wikiPage" class="flex justify-center p-4 text-white">
    <div v-if="!isEditing" class="mx-auto grid w-full max-w-[85rem] grid-cols-1 gap-6 md:grid-cols-[20rem_minmax(0,1fr)_20rem]">
      <!-- Empty left spacer mirrors sidebar width to keep main content centered -->
      <div class="hidden md:block"></div>
      <!-- Main Content Area -->
      <div class="order-2 min-w-0 md:order-none">
        <h1 class="mb-4 text-4xl font-bold">{{ wikiPage.title }}</h1>
        <div class="prose prose-invert lg:prose-xl mb-6 break-words" v-html="processedContent"></div>

        <WikiSection id="combat-stats" title="Combat Stats" :content="wikiPage.combatStats" :is-editing="false" />
        <WikiSection
          id="inventory-stats"
          title="Inventory Stats"
          :content="wikiPage.inventoryStats"
          :is-editing="false"
        />

        <!-- Replaced the text-based Relations section with the Graph Component -->
        <h2 id="relations-graph" class="mt-8 mb-2 text-2xl font-semibold">Relations Graph</h2>
        <CharacterGraph v-if="graphData" :nodes="graphData.nodes" :edges="graphData.edges" />

        <WikiSection id="summary" title="Summary" :content="wikiPage.summary" :is-editing="false" />

        <button
          class="mt-6 rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          @click="startEditing"
        >
          Edit
        </button>
      </div>

      <!-- Right Sidebar (Infobox & TOC) -->
      <div class="order-1 w-full min-w-0 space-y-6 md:order-none md:w-auto">

        <!-- Fandom-style Infobox -->
        <div class="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
          <div class="border-b border-gray-600 bg-gray-700 p-3 text-center text-xl font-bold">
            {{ wikiPage.title }}
          </div>
          <div v-if="wikiPage.imageUrl" class="flex justify-center border-b border-gray-600 bg-gray-900 p-2">
            <img :src="wikiPage.imageUrl" alt="Wiki Image" class="h-auto max-h-64 max-w-full rounded object-contain" />
          </div>
          <div class="w-full overflow-hidden space-y-2 p-4 text-sm">
            <div v-if="wikiPage.summary" class="flex min-w-0 flex-col">
              <span class="font-semibold text-gray-400">Quick Summary</span>
              <span class="break-words text-gray-200">{{ wikiPage.summary }}</span>
            </div>
            <!-- Additional quick stats could go here -->
          </div>
        </div>

        <!-- Table of Contents -->
        <div class="sticky top-4 rounded-lg border border-gray-600 bg-gray-800 p-4">
          <h3 class="mb-3 border-b border-gray-700 pb-2 text-lg font-bold">Contents</h3>
          <ul class="space-y-1 text-sm">
            <li v-for="item in toc" :key="item.id" :style="{ paddingLeft: `${(item.level - 1) * 0.75}rem` }">
              <a
                href="javascript:void(0)"
                class="block py-1 text-blue-400 hover:text-blue-300 hover:underline"
                @click="scrollTo(item.id)"
              >
                {{ item.text }}
              </a>
            </li>
            <!-- Add fixed sections to TOC -->
            <li v-if="wikiPage.combatStats" class="pl-0">
              <a
                href="javascript:void(0)"
                class="block py-1 text-blue-400 hover:text-blue-300 hover:underline"
                @click="scrollTo('combat-stats')"
                >Combat Stats</a
              >
            </li>
            <li v-if="wikiPage.inventoryStats" class="pl-0">
              <a
                href="javascript:void(0)"
                class="block py-1 text-blue-400 hover:text-blue-300 hover:underline"
                @click="scrollTo('inventory-stats')"
                >Inventory Stats</a
              >
            </li>
            <li v-if="graphData" class="pl-0">
              <a
                href="javascript:void(0)"
                class="block py-1 text-blue-400 hover:text-blue-300 hover:underline"
                @click="scrollTo('relations-graph')"
                >Relations Graph</a
              >
            </li>
            <li v-if="wikiPage.summary" class="pl-0">
              <a
                href="javascript:void(0)"
                class="block py-1 text-blue-400 hover:text-blue-300 hover:underline"
                @click="scrollTo('summary')"
                >Summary</a
              >
            </li>
          </ul>
        </div>

      </div>

    </div>

    <!-- Edit Mode -->
    <div v-else class="space-y-6 mx-auto max-w-6xl">
      <h1 class="text-3xl font-bold">Editing: {{ editableWiki.title }}</h1>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <label for="imageUrl" class="mb-2 block text-sm font-medium text-white">Image URL</label>
          <input
            id="imageUrl"
            v-model="editableWiki.imageUrl"
            type="text"
            placeholder="https://example.com/image.png"
            class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label for="content" class="mb-2 block text-sm font-medium text-white">Content (HTML)</label>
        <textarea
          id="content"
          v-model="editableWiki.content"
          rows="10"
          class="w-full rounded-md border border-gray-600 bg-gray-800 p-2 font-mono text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <WikiSection
        title="Combat Stats"
        :is-editing="true"
        :content="editableWiki.combatStats"
        @update:content="(newValue) => (editableWiki.combatStats = newValue)"
      />
      <WikiSection
        title="Inventory Stats"
        :is-editing="true"
        :content="editableWiki.inventoryStats"
        @update:content="(newValue) => (editableWiki.inventoryStats = newValue)"
      />

      <WikiSection
        title="Summary"
        :is-editing="true"
        :content="editableWiki.summary"
        @update:content="(newValue) => (editableWiki.summary = newValue)"
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
