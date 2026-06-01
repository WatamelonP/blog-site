<script setup>
import './style.css'
import AppSidebar from './components/AppSidebar.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from './stores/global.js'
import { onBeforeMount, ref, computed, onMounted, onUnmounted } from 'vue'

const store = useGlobalStore()
const { isCollapsed } = storeToRefs(store)

const isMobile = ref(window.innerWidth < 768)
const onResize = () => isMobile.value = window.innerWidth < 768
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const mainStyle = computed(() => ({
  paddingLeft: isMobile.value ? '0' : isCollapsed.value ? '72px' : '256px',
}))

onBeforeMount(() => {
  const { getUserDetails } = useGlobalStore()
  getUserDetails(localStorage.getItem('token'))
})
</script>

<template>
  <AppSidebar />
  <main :style="mainStyle" class="app-main">
    <router-view />
  </main>
</template>