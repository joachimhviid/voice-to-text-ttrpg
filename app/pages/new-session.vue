<script setup lang="ts">
const title = ref('')
const content = ref('')
const router = useRouter()

async function createSession() {
  if (!title.value) {
    alert('Please enter a title')
    return
  }

  const { data } = await useFetch<Session>('/api/sessions', {
    body: { content: content.value, title: title.value },
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
      <button type="submit">Create</button>
    </form>
  </div>
</template>
