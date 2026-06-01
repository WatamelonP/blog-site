<script setup>
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores/global.js'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

const { user } = storeToRefs(useGlobalStore())
</script>

<template>
  <div class="profile-card">
    <div class="profile-card__avatar">
      {{ user.username?.charAt(0).toUpperCase() }}
    </div>

    <div class="profile-card__info">
      <h2 class="profile-card__username">{{ user.username }}</h2>
      <p class="profile-card__email">{{ user.email }}</p>
    </div>

    <div class="profile-card__divider"></div>

    <div class="profile-card__meta">
      <div class="profile-card__meta-item">
        <span class="profile-card__meta-label">Date joined: </span>
        <span class="profile-card__meta-value">{{ formatDate(user.createdAt) }}</span>
      </div>
    </div>
  </div>    
</template>