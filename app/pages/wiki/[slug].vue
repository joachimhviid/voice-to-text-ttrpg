<script setup lang="ts">
import type { CharacterEdge, CharacterNode } from '#shared/types/graph'

const { params } = useRoute('wiki-slug')
const slug = params.slug as string

// Fetch the wiki entry from Nuxt Content
const { data: wikiPage } = await useAsyncData(`wiki-${slug}`, () =>
  queryCollection('wiki').where('stem', '=', `wiki/${slug}`).first(),
)

// ── TOC ───────────────────────────────────────────────────────────────────────

interface TocLink { id: string; text: string; depth: number }

// Use the pre-built toc.links from Nuxt Content (headings only),
// flatten one level of children, then append the in-template Relations Graph.
const tocLinks = computed<TocLink[]>(() => {
  const links: any[] = (wikiPage.value?.body as any)?.toc?.links ?? []
  const flat: TocLink[] = []
  for (const link of links) {
    flat.push({ id: link.id, text: link.text, depth: link.depth })
    for (const child of link.children ?? []) {
      flat.push({ id: child.id, text: child.text, depth: child.depth })
    }
  }
  flat.push({ id: 'character-graph', text: 'Relations Graph', depth: 2 })
  return flat
})

// ── Delete ────────────────────────────────────────────────────────────────────

const sessionId = wikiPage.value?.sessionId
const deleteState = ref<'idle' | 'confirm' | 'deleting'>('idle')

async function deleteWiki() {
  if (!sessionId) return
  deleteState.value = 'deleting'
  try {
    await $fetch(`/api/sessions/${sessionId}/wiki`, { method: 'DELETE' })
    await navigateTo('/')
  } catch {
    deleteState.value = 'idle'
  }
}

// ── Graph ─────────────────────────────────────────────────────────────────────
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

        <h2 id="character-graph" class="mt-8 mb-2 text-2xl font-semibold">Relations Graph</h2>
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

          <div v-if="sessionId" class="border-t border-gray-600 p-3">
            <template v-if="deleteState === 'idle'">
              <button
                class="w-full rounded bg-red-900/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-800/60 hover:text-red-300"
                @click="deleteState = 'confirm'"
              >
                Delete wiki entry
              </button>
            </template>
            <template v-else-if="deleteState === 'confirm'">
              <p class="mb-2 text-xs text-gray-400">This will delete the wiki entry and all relation data for this session.</p>
              <div class="flex gap-2">
                <button
                  class="flex-1 rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                  @click="deleteWiki"
                >
                  Confirm
                </button>
                <button
                  class="flex-1 rounded bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600"
                  @click="deleteState = 'idle'"
                >
                  Cancel
                </button>
              </div>
            </template>
            <template v-else>
              <p class="text-center text-sm text-gray-400">Deleting…</p>
            </template>
          </div>
        </div>

        <!-- Table of contents -->
        <nav v-if="tocLinks.length" class="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
          <div class="border-b border-gray-600 bg-gray-700 p-3 text-sm font-bold text-gray-200">
            Contents
          </div>
          <ol class="p-3 text-sm space-y-1">
            <li
              v-for="link in tocLinks"
              :key="link.id"
              :class="{
                'pl-4': link.depth === 3,
                'pl-8 text-gray-400': link.depth >= 4,
              }"
            >
              <a
                :href="`#${link.id}`"
                class="hover:text-white transition-colors"
                :class="link.depth >= 4 ? 'text-gray-500' : 'text-gray-300'"
              >{{ link.text }}</a>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
  <div v-else class="p-8 text-center text-white">
    <p class="text-2xl font-bold mb-2">Wiki entry not found</p>
    <p class="text-gray-400">No wiki page exists for <code class="text-gray-300">{{ slug }}</code></p>
  </div>
</template>
