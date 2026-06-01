<script setup>
import { ref, onMounted } from 'vue'
import api from '../api.js'
import PostCard from '../components/PostCard.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores/global.js'
import { Notyf } from 'notyf'

const { user } = storeToRefs(useGlobalStore())
const notyf = new Notyf()

const posts = ref([])
const loading = ref(true)
const error = ref(null)

const title = ref('')
const content = ref('')
const isSubmitting = ref(false)
const isFocused = ref(false)

onMounted(async () => {
  try {
    const response = await api.get('/posts/getPosts')
    posts.value = response.data.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
  } catch (err) {
    error.value = 'Failed to load posts.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) return

  isSubmitting.value = true
  try {
    const response = await api.post('/posts/createPost', {
      title: title.value,
      content: content.value
    })
    posts.value.unshift(response.data)
    notyf.success('Post created!')
    title.value = ''
    content.value = ''
    isFocused.value = false
  } catch (err) {
    notyf.error('Failed to create post.')
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="posts-page">
    <div class="posts-page__feed">

      <!-- Compose card -->
      <div v-if="user.email" class="compose-card">
        <div class="compose-card__top">
          <div class="compose-card__avatar">
            {{ user.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="compose-card__fields">
            <input
              v-model="title"
              class="compose-card__title-input"
              type="text"
              placeholder="Title"
              @focus="isFocused = true"
            />
            <textarea
              v-if="isFocused"
              v-model="content"
              class="compose-card__content-input"
              placeholder="What's on your mind?"
              rows="3"
              @focus="isFocused = true"
            ></textarea>
          </div>
        </div>

        <div v-if="isFocused" class="compose-card__footer">
          <button
            class="compose-card__cancel"
            @click="isFocused = false; title = ''; content = ''"
          >
            Cancel
          </button>
          <button
            class="compose-card__submit"
            :disabled="!title.trim() || !content.trim() || isSubmitting"
            @click="handleSubmit"
          >
            <i class="bi bi-send" v-if="!isSubmitting"></i>
            <i class="bi bi-arrow-repeat compose-card__spinning" v-else></i>
            {{ isSubmitting ? 'Posting...' : 'Post' }}
          </button>
        </div>
      </div>

      <p v-if="loading" class="posts-page__status">Loading...</p>
      <p v-else-if="error" class="posts-page__status posts-page__status--error">{{ error }}</p>
      <template v-else>
        <PostCard v-for="post in posts" :key="post._id" :post="post" />
      </template>

    </div>
  </div>
</template>