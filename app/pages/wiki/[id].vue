<script setup lang="ts">
import type { Session } from '#shared/types/session'

const route = useRoute()
const { data: session, refresh } = await useFetch<Session>(`/api/sessions/${route.params.id}`)

const isEditing = ref(false)
const editableSession = ref<Partial<Session>>({})

function startEditing() {
  editableSession.value = { ...session.value }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveChanges() {
  await useFetch(`/api/sessions/${route.params.id}`, {
    body: editableSession.value,
    method: 'PUT',
  })
  isEditing.value = false
  await refresh()
}
</script>

<template>
  <div v-if="session" class="prose lg:prose-xl mx-auto p-4">
    <div v-if="!isEditing">
      <h1>{{ session.title }}</h1>
      <div v-html="session.content"></div>

      <div v-if="session.combatStats">
        <h2>Combat Stats</h2>
        <pre>{{ session.combatStats }}</pre>
      </div>

      <div v-if="session.inventoryStats">
        <h2>Inventory Stats</h2>
        <pre>{{ session.inventoryStats }}</pre>
      </div>

      <div v-if="session.relations">
        <h2>Relations</h2>
        <pre>{{ session.relations }}</pre>
      </div>

      <div v-if="session.summary">
        <h2>Summary</h2>
        <pre>{{ session.summary }}</pre>
      </div>

      <button @click="startEditing">Edit</button>
    </div>

    <div v-else>
      <h1>Editing Session</h1>
      <div>
        <label for="title">Title</label>
        <input id="title" v-model="editableSession.title" type="text" class="w-full" />
      </div>
      <div>
        <label for="content">Content</label>
        <textarea id="content" v-model="editableSession.content" class="w-full" rows="5"></textarea>
      </div>
      <div>
        <label for="combatStats">Combat Stats</label>
        <textarea id="combatStats" v-model="editableSession.combatStats" class="w-full" rows="5"></textarea>
      </div>
      <div>
        <label for="inventoryStats">Inventory Stats</label>
        <textarea id="inventoryStats" v-model="editableSession.inventoryStats" class="w-full" rows="5"></textarea>
      </div>
      <div>
        <label for="relations">Relations</label>
        <textarea id="relations" v-model="editableSession.relations" class="w-full" rows="5"></textarea>
      </div>
      <div>
        <label for="summary">Summary</label>
        <textarea id="summary" v-model="editableSession.summary" class="w-full" rows="5"></textarea>
      </div>

      <button @click="saveChanges">Save</button>
      <button @click="cancelEditing">Cancel</button>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
