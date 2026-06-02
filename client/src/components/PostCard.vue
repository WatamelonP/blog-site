<script setup>
import { ref, computed } from 'vue'
import { Notyf } from 'notyf'
import api from '../api.js'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores/global.js'
import EditPostModal from './EditPostModal.vue'
import ViewPostModal from './ViewPostModal.vue'

const viewModal = ref(false)
const notyf = new Notyf()
const router = useRouter()
const { user } = storeToRefs(useGlobalStore())

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updated'])

const deleteModal = ref(false)
const editModal = ref(false)
const showComments = ref(false)
const showAllComments = ref(false)

const visibleComments = computed(() => {
  if (!props.post.comments) return []
  return showAllComments.value
    ? props.post.comments
    : props.post.comments.slice(0, 3)
})

const hasMore = computed(() => props.post.comments?.length > 3)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

async function confirmDelete() {
  try {
    await api.delete(`/posts/deletePost/${props.post._id}`)
    notyf.success('Post deleted!')
    deleteModal.value = false
    router.go(0)
  } catch (err) {
    notyf.error('Failed to delete post.')
    console.log("user.value.isAdmin: ",user.value.isAdmin)
    console.error(err)
  }
}



function onPostUpdated(updatedPost) {
  emit('updated', updatedPost)
  editModal.value = false
  router.go(0)
}

</script>

<template>
  
  <div class="post-card-container">
    
    <div class="post-card">
      <div class="post-card__header">
        <div class="post-card__avatar">
          {{ post.author?.charAt(0).toUpperCase() }}
        </div>
        <div class="post-card__meta">
          <span class="post-card__author">{{ post.author }}</span>
        </div>
        <span v-if="post.dateCreated" class="post-card__date">
          {{ formatDate(post.dateCreated) }}
        </span>
        
        <div class="dropdown" v-if="post.author === user.username || user.isAdmin">
          <button class="btn p-0 border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item" type="button" @click="editModal = true">
  Update Post
</button>
            </li>
            <li>
              <button class="dropdown-item text-danger" type="button" @click="deleteModal = true">
                Delete Post
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="post-card__body" @click="viewModal = true" style="cursor: pointer;">
        <h3 class="post-card__title">{{ post.title }}</h3>
        <p class="post-card__content">{{ post.content }}</p>
      </div>

      <div class="post-card__footer">
        <button
          class="post-card__comments-btn"
          :class="{ 'post-card__comments-btn--active': showComments }"
          @click="showComments = !showComments"
        >
          <i class="bi bi-chat"></i>
          {{ post.comments?.length ?? 0 }}
          {{ post.comments?.length === 1 ? 'comment' : 'comments' }}
          <i
            class="bi post-card__chevron"
            :class="showComments ? 'bi-chevron-up' : 'bi-chevron-down'"
          ></i>
        </button>
      </div>

      <template v-if="showComments">
        <div v-if="post.comments?.length" class="post-card__comments">
          <div
            v-for="comment in visibleComments"
            :key="comment._id"
            class="post-card__comment"
          >
            <div class="post-card__comment-avatar">
              {{ comment.author?.charAt(0).toUpperCase() }}
            </div>
            <div class="post-card__comment-body">
              <span class="post-card__comment-author">{{ comment.author }}</span>
              <p class="post-card__comment-text">{{ comment.comment }}</p>
            </div>
          </div>

          <button
            v-if="hasMore && !showAllComments"
            class="post-card__see-more"
            @click="showAllComments = true"
          >
            See {{ post.comments.length - 3 }} more
            {{ post.comments.length - 3 === 1 ? 'comment' : 'comments' }}
          </button>

          <button
            v-if="showAllComments"
            class="post-card__see-more"
            @click="showAllComments = false"
          >
            Show less
          </button>
        </div>

        <div v-else class="post-card__no-comments">
          No comments yet.
        </div>
      </template>
    </div>

   
    <div class="custom-modal-backdrop" v-if="deleteModal" @click.self="deleteModal = false">
      <div class="custom-modal" role="dialog" aria-modal="true">
        <div class="custom-modal-header">
          <h3 class="custom-modal-title">Delete Post</h3>
          <button class="custom-modal-close" type="button" @click="deleteModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="custom-modal-body">
          <p>Are you sure you want to delete this post? This action cannot be undone and will permanently remove your content.</p>
        </div>

        <div class="custom-modal-footer">
          <button class="btn-secondary" type="button" @click="deleteModal = false">
            Cancel
          </button>
          <button class="btn-destructive" type="button" @click="confirmDelete()">
            Delete Post
          </button>
        </div>
      </div>
    </div>
    
   <EditPostModal
  v-if="editModal"
  :post="post"
  @close="editModal = false"
  @updated="onPostUpdated"
/>
<ViewPostModal
  v-if="viewModal"
  :postId="post._id"
  @close="viewModal = false"
/>
  </div>
</template>