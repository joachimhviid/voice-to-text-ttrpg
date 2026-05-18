<script setup lang="ts">
import type { CharacterEdge, CharacterNode } from '#shared/types/graph'
import type { TocLink } from '@nuxt/content'

const { params } = useRoute('campaigns-campaignId-wiki-slug')

const { data: wiki } = await useAsyncData(`wiki-${params.slug}`, async () => {
  const page = await queryCollection('wiki').where('stem', '=', `wiki/${params.slug}`).first()
  if (!page) {
    throw createError('Wiki page not found')
  }
  const graph = await $fetch<{ edges: CharacterEdge[]; nodes: CharacterNode[] }>(
    `/api/sessions/${page.sessionId}/graph`,
  )

  return {
    graph,
    page,
  }
})

if (!wiki.value) {
  throw createError('Wiki not found')
}

useSeoMeta(wiki.value.page.seo)

// ── TOC ───────────────────────────────────────────────────────────────────────

// Use the pre-built toc.links from Nuxt Content (headings only),
// flatten one level of children, then append the in-template Relations Graph.
const tocLinks = computed<TocLink[]>(() => {
  const links = wiki.value?.page.body?.toc?.links ?? []

  return links
    .flatMap((link) => (link.children ? [link, ...link.children] : link))
    .concat([{ depth: 2, id: 'character-graph', text: 'Relations Graph' }])
})

// ── Delete ────────────────────────────────────────────────────────────────────
const { cancel, confirm, isRevealed, onConfirm, reveal } = useConfirmDialog()

const { execute: deleteWiki, status: deleteStatus } = useFetch(`/api/sessions/${wiki.value.page.sessionId}/wiki`, {
  immediate: false,
  method: 'DELETE',
  onResponse: () => {
    navigateTo('/')
  },
  watch: false,
})

onConfirm(() => deleteWiki())
</script>

<template>
  <div v-if="wiki" class="mx-auto max-w-5xl p-4 text-white">
    <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
      <!-- Main content -->
      <div class="order-2 min-w-0 md:order-0">
        <h1 class="mb-4 text-4xl font-bold">{{ wiki.page.title }}</h1>
        <p class="text-sm text-gray-400">{{ wiki.page.date }}</p>

        <div class="prose prose-invert mb-8 wrap-break-word">
          <ContentRenderer :value="wiki.page" />
        </div>

        <h2 id="character-graph" class="mt-8 mb-2 text-2xl font-semibold">Relations Graph</h2>
        <CharacterGraph v-if="wiki.graph" :nodes="wiki.graph.nodes" :edges="wiki.graph.edges" />
        <p v-else class="text-sm text-gray-400 italic">No relation data for this session.</p>
      </div>

      <!-- Right sidebar -->
      <div class="order-1 w-full min-w-0 space-y-6 md:order-0 md:w-auto">
        <div class="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
          <div class="border-b border-gray-600 bg-gray-700 p-3 text-center text-xl font-bold">
            {{ wiki.page.title }}
          </div>
          <div class="space-y-2 p-4 text-sm">
            <div class="flex flex-col">
              <span class="font-semibold text-gray-400">Date</span>
              <span class="text-gray-200">{{ wiki.page.date }}</span>
            </div>
          </div>

          <div v-if="wiki.page.sessionId" class="border-t border-gray-600 p-3">
            <template v-if="deleteStatus === 'idle' && !isRevealed">
              <UiButton variant="destroy" size="sm" @click="reveal">Delete wiki entry</UiButton>
            </template>
            <template v-if="isRevealed">
              <p class="mb-2 text-xs text-gray-400">
                This will delete the wiki entry and all relation data for this session.
              </p>
              <div class="flex gap-2">
                <UiButton variant="destroy" size="sm" @click="confirm">Confirm</UiButton>
                <UiButton variant="tertiary" size="sm" @click="cancel">Cancel</UiButton>
              </div>
            </template>
            <template v-if="deleteStatus === 'pending'">
              <p class="text-center text-sm text-gray-400">Deleting…</p>
            </template>
          </div>
        </div>

        <!-- Table of contents -->
        <nav v-if="tocLinks.length" class="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
          <div class="border-b border-gray-600 bg-gray-700 p-3 text-sm font-bold text-gray-200">Contents</div>
          <ol class="space-y-1 p-3 text-sm">
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
                class="transition-colors hover:text-white"
                :class="link.depth >= 4 ? 'text-gray-500' : 'text-gray-300'"
                >{{ link.text }}</a
              >
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
  <div v-else class="p-8 text-center text-white">
    <p class="mb-2 text-2xl font-bold">Wiki entry not found</p>
    <p class="text-gray-400">
      No wiki page exists for <code class="text-gray-300">{{ params.slug }}</code>
    </p>
  </div>
</template>
