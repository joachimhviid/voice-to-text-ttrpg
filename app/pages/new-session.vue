<script setup lang="ts">
import type { Session } from '~/server/types'

const title = ref('')
const content = ref('')
const combatStats = ref('')
const inventoryStats = ref('')
const relations = ref('')
const summary = ref('')
const router = useRouter()

async function createSession() {
  if (!title.value) {
    alert('Please enter a title')
    return
  }

  const { data } = await useFetch<Session>('/api/sessions', {
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
    await router.push(`/sessions/${data.value.id}`)
  }
}
</script>

<template>
  <div class="prose lg:prose-xl">
    <h1>New Session</h1>
    <form @submit.prevent="createSession">
      <div>
        <label for="title">Title</label>
        <input id="title" v-model="title" type="text" />
      </div>
      <div>
        <label for="content">Content</label>
        <textarea id="content" v-model="content" />
      </div>
      <div>
        <label for="combatStats">Combat Stats</label>
        <textarea id="combatStats" v-model="combatStats" />
      </div>
      <div>
        <label for="inventoryStats">Inventory Stats</label>
        <textarea id="inventoryStats" v-model="inventoryStats" />
      </div>
      <div>
        <label for="relations">Relations</label>
        <textarea id="relations" v-model="relations" />
      </div>
      <div>
        <label for="summary">Summary</label>
        <textarea id="summary" v-model="summary" />
      </div>
      <button type="submit">Create</button>
    </form>
  </div>
</template>
