<script setup lang="ts">
import type { CharacterEdge, CharacterNode } from '#shared/types/graph'

const { params } = useRoute('wiki-slug')
const slug = params.slug as string

console.log('[wiki] slug from route:', slug)

// Fetch ALL wiki docs to check if collection is indexed at all
const { data: allWikiDocs } = await useAsyncData('wiki-all', () =>
  queryCollection('wiki').all(),
)

console.log('[wiki] all wiki docs count:', allWikiDocs.value?.length)
console.log('[wiki] all wiki docs stems:', allWikiDocs.value?.map((d: any) => d.stem))

// Fetch the wiki entry from Nuxt Content
// Use `stem` (filename without extension) rather than path — more reliable across collection configs
const { data: wikiPage } = await useAsyncData(`wiki-${slug}`, () =>
  queryCollection('wiki').where('stem', '=', `wiki/${slug}`).first(),
)

console.log('[wiki] wikiPage result:', wikiPage.value)

// Fetch the character graph for this session if a sessionId is in the frontmatter
const sessionId = wikiPage.value?.sessionId
const { data: graphData } = await useAsyncData(
  `wiki-graph-${slug}`,
  () =>
  sessionId
    ? $fetch<{ edges: CharacterEdge[]; nodes: CharacterNode[] }>(`/api/sessions/${sessionId}/graph`)
    : Promise.resolve(null),
)
</script>

<template>
  <div v-if="wikiPage" class="flex justify-center p-4 text-white">
    <div class="mx-auto grid w-full max-w-[85rem] grid-cols-1 gap-6 md:grid-cols-[20rem_minmax(0,1fr)_20rem]">
      <!-- Left spacer -->
      <div class="hidden md:block" />

      <!-- Main content -->
      <div class="order-2 min-w-0 md:order-none">
        <h1 class="mb-4 text-4xl font-bold">{{ wikiPage.title }}</h1>
        <p class="mb-6 text-sm text-gray-400">{{ wikiPage.date }}</p>

        <div class="prose prose-invert lg:prose-xl mb-8 break-words">
          <ContentRenderer :value="wikiPage" />
        </div>

        <h2 class="mt-8 mb-2 text-2xl font-semibold">Relations Graph</h2>
        <CharacterGraph
          v-if="graphData"
          :nodes="graphData.nodes"
          :edges="graphData.edges"
        />
        <p v-else class="text-sm text-gray-400 italic">
          No relation data for this session.
        </p>
      </div>

      <!-- Right sidebar -->
      <div class="order-1 w-full min-w-0 space-y-6 md:order-none md:w-auto">
        <div class="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
          <div class="border-b border-gray-600 bg-gray-700 p-3 text-center text-xl font-bold">
            {{ wikiPage.title }}
          </div>
          <div class="space-y-2 p-4 text-sm">
            <div class="flex flex-col">
              <span class="font-semibold text-gray-400">Date</span>
              <span class="text-gray-200">{{ wikiPage.date }}</span>
            </div>
            <div v-if="wikiPage.source" class="flex flex-col">
              <span class="font-semibold text-gray-400">Source transcript</span>
              <span class="break-all text-gray-200">{{ wikiPage.source }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-8 text-center text-white">
    <p class="text-2xl font-bold mb-2">Wiki entry not found</p>
    <p class="text-gray-400">No wiki page exists for <code class="text-gray-300">{{ slug }}</code></p>

    <!-- Debug panel -->
    <div class="mt-8 mx-auto max-w-2xl text-left rounded-lg bg-gray-900 border border-gray-700 p-4">
      <p class="text-yellow-400 font-mono text-sm font-bold mb-3">🔍 Debug Info</p>
      <div class="space-y-2 font-mono text-xs">
        <div>
          <span class="text-gray-400">Slug from route: </span>
          <span class="text-green-400">{{ slug }}</span>
        </div>
        <div>
          <span class="text-gray-400">Total wiki docs indexed: </span>
          <span class="text-green-400">{{ allWikiDocs?.length ?? 0 }}</span>
        </div>
        <div v-if="allWikiDocs && allWikiDocs.length > 0">
          <span class="text-gray-400">Indexed stems:</span>
          <ul class="ml-4 mt-1 space-y-1">
            <li v-for="doc in allWikiDocs" :key="doc.stem" class="text-blue-400">
              {{ doc.stem }} <span class="text-gray-500">(path: {{ doc.path }})</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-red-400">
          ⚠ No wiki documents found in collection — content may not be indexed yet.
          Try restarting the dev server.
        </div>
      </div>
    </div>
  </div>
</template>
