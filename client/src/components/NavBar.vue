<template>
  <!-- Desktop Sidebar -->
  <aside
    v-if="!isMobile"
    class="app-sidebar d-flex flex-column"
    :class="{ 'app-sidebar--collapsed': isCollapsed }"
  >
    <button class="app-sidebar__toggle" @click="toggleCollapse">
      <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
    </button>

    <div class="app-sidebar__brand d-flex align-items-center gap-2">
      <div class="app-sidebar__logo">
        <i class="bi bi-pencil-square"></i>
      </div>
      <span class="app-sidebar__brand-name">BlogApp</span>
    </div>

    <nav class="app-sidebar__nav d-flex flex-column gap-1 flex-grow-1">
      <router-link v-if="!user.email" :to="{ name: 'Home' }" class="app-sidebar__item">
        <i class="bi bi-house"></i>
        <span class="app-sidebar__label">Home</span>
      </router-link>
      <router-link :to="{ name: 'Posts' }" class="app-sidebar__item">
        <i class="bi bi-file-text"></i>
        <span class="app-sidebar__label">Posts</span>
      </router-link>
      <router-link v-if="user.email" :to="{ name: 'Profile' }" class="app-sidebar__item">
        <i class="bi bi-person"></i>
        <span class="app-sidebar__label">Profile</span>
      </router-link>
    </nav>

    <div class="app-sidebar__bottom d-flex flex-column gap-2">
      <button class="app-sidebar__item app-sidebar__theme" @click="toggleDark">
        <i :class="isDark ? 'bi bi-sun' : 'bi bi-moon'"></i>
        <span class="app-sidebar__label">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
      <div class="app-sidebar__divider"></div>
      <template v-if="!user.email">
        <router-link :to="{ name: 'Login' }" class="app-sidebar__item">
          <i class="bi bi-box-arrow-in-right"></i>
          <span class="app-sidebar__label">Login</span>
        </router-link>
        <router-link :to="{ name: 'Register' }" class="app-sidebar__item">
          <i class="bi bi-person-plus"></i>
          <span class="app-sidebar__label">Register</span>
        </router-link>
      </template>
      <template v-else>
        <div class="app-sidebar__user d-flex align-items-center gap-2">
          <div class="app-sidebar__avatar flex-shrink-0">
            {{ user.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="app-sidebar__user-info">
            <p class="app-sidebar__username">{{ user.username }}</p>
            <p class="app-sidebar__email">{{ user.email }}</p>
          </div>
        </div>
        <button class="app-sidebar__item app-sidebar__logout" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span class="app-sidebar__label">Logout</span>
        </button>
      </template>
    </div>
  </aside>

  <!-- Mobile Bottom Tab Bar -->
  <nav v-else class="app-bottomnav">
    <router-link v-if="!user.email" :to="{ name: 'Home' }" class="app-bottomnav__item">
      <i class="bi bi-house"></i>
      <span>Home</span>
    </router-link>
    <router-link :to="{ name: 'Posts' }" class="app-bottomnav__item">
      <i class="bi bi-file-text"></i>
      <span>Posts</span>
    </router-link>

    <router-link v-if="user.email" :to="{ name: 'Profile' }" class="app-bottomnav__item">
      <i class="bi bi-person"></i>
      <span>Profile</span>
    </router-link>
    <router-link v-if="!user.email" :to="{ name: 'Login' }" class="app-bottomnav__item">
      <i class="bi bi-box-arrow-in-right"></i>
      <span>Login</span>
    </router-link>
    <button class="app-bottomnav__item" @click="toggleDark">
      <i :class="isDark ? 'bi bi-sun' : 'bi bi-moon'"></i>
      <span>{{ isDark ? 'Light' : 'Dark' }}</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores/global.js'

const router = useRouter()
const store = useGlobalStore()
const { user, isDark, isCollapsed } = storeToRefs(store)
const { toggleDark, toggleCollapse } = store

const isMobile = ref(window.innerWidth < 768)
const onResize = () => isMobile.value = window.innerWidth < 768
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

function logout() {
  localStorage.removeItem('token')
  store.user.token = ''
  store.user.email = ''
  store.user.username = ''
  store.user.isAdmin = false
  router.push({ name: 'Login' })
}
</script>