<script setup>
import { onBeforeMount } from 'vue'
import { useGlobalStore } from '../stores/global'
import { useRouter } from 'vue-router'

const router = useRouter()
const { getUserDetails } = useGlobalStore()

onBeforeMount(async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    localStorage.clear()
    await getUserDetails(null)
    router.push({ name: 'Login' })
    return
  }

  await getUserDetails(token)
  router.push({ name: 'Posts' })
})
</script>

<template>
  <h1>HomePage</h1>
</template>