<script setup lang="ts">
const { params } = useRoute('campaigns-campaignId')
const { data: campaign } = useFetch(`/api/campaigns/${params.campaignId}` as '/api/campaigns/:campaignId')
</script>

<template>
  <div>{{ campaign }}</div>
</template>
