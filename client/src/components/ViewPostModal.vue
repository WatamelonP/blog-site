<script setup>
import { ref, onMounted, computed } from 'vue'
import { Notyf } from 'notyf'
import api from '../api.js'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores/global.js'

const props = defineProps({
  postId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const notyf = new Notyf()
const { user } = storeToRefs(useGlobalStore())

const post = ref(null)
const loading = ref(true)
const error = ref(null)
const comment = ref('')
const isSubmitting = ref(false)

const editingCommentId = ref(null)
const editingCommentText = ref('')

onMounted(async () => {
  try {
    const response = await api.get(`/posts/getPost/${props.postId}`)
    post.value = response.data
  } catch (err) {
    error.value = 'Failed to load post.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

async function submitComment() {
  if (!comment.value.trim()) return
  isSubmitting.value = true
  try {
    const response = await api.post(`/posts/${props.postId}/comments`, {
      comment: comment.value
    })
    post.value.comments.push(response.data)
    comment.value = ''
    notyf.success('Comment added!')
  } catch (err) {
    notyf.error('Failed to add comment.')
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

function startEditComment(c) {
  editingCommentId.value = c._id
  editingCommentText.value = c.comment
}

function cancelEditComment() {
  editingCommentId.value = null
  editingCommentText.value = ''
}

async function saveEditComment(commentId) {
  if (!editingCommentText.value.trim()) return
  try {
    const response = await api.patch(`/posts/${props.postId}/comments/${commentId}`, {
      comment: editingCommentText.value
    })
    const index = post.value.comments.findIndex(c => c._id === commentId)
    if (index !== -1) post.value.comments[index] = response.data
    notyf.success('Comment updated!')
    cancelEditComment()
  } catch (err) {
    notyf.error('Failed to update comment.')
    console.error(err)
  }
}

async function deleteComment(commentId) {
  try {
    await api.delete(`posts/${props.postId}/comments/${commentId}`)
    post.value.comments = post.value.comments.filter(c => c._id !== commentId)
    notyf.success('Comment deleted!')
  } catch (err) {
    notyf.error('Failed to delete comment.')
    console.error(err)
  }
}
</script>

<template>
  <div class="custom-modal-backdrop" @click.self="$emit('close')">
    <div class="custom-modal view-post-modal" role="dialog" aria-modal="true">

      <!-- Header -->
      <div class="custom-modal-header">
        <h3 class="custom-modal-title">View Post</h3>
        <button class="custom-modal-close" type="button" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="custom-modal-body text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="custom-modal-body">
        <p class="text-danger">{{ error }}</p>
      </div>

      <template v-else>
        <!-- Post Body -->
        <div class="custom-modal-body view-post-modal__body">

          <div class="view-post-modal__author-row">
            <div class="view-post-modal__avatar">
              {{ post.author?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="view-post-modal__author">{{ post.author }}</p>
              <p class="view-post-modal__date">{{ formatDate(post.dateAdded) }}</p>
            </div>
          </div>

          <h4 class="view-post-modal__title">{{ post.title }}</h4>
          <p class="view-post-modal__content">{{ post.content }}</p>

          <!-- Divider -->
          <hr class="view-post-modal__divider" />

          <!-- Comments -->
          <p class="view-post-modal__comments-heading">
            {{ post.comments?.length ?? 0 }} {{ post.comments?.length === 1 ? 'Comment' : 'Comments' }}
          </p>

          <div class="view-post-modal__comments">
            <div
              v-if="!post.comments?.length"
              class="view-post-modal__no-comments"
            >
              No comments yet. Be the first!
            </div>

            <div
              v-for="c in post.comments"
              :key="c._id"
              class="view-post-modal__comment"
            >
              <div class="view-post-modal__comment-avatar">
                {{ c.author?.charAt(0).toUpperCase() }}
              </div>
              <div class="view-post-modal__comment-body">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <div>
                    <span class="view-post-modal__comment-author">{{ c.author }}</span>
                    <span class="view-post-modal__comment-date ms-2">{{ formatDate(c.dateCreated) }}</span>
                  </div>
                  <div class="dropdown" v-if="c.author === user.username || user.isAdmin">
                    <button class="btn p-0 border-0 view-post-modal__comment-menu" type="button" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <button v-if="c.author === user.username" class="dropdown-item" @click="startEditComment(c)">Edit</button>
                      </li>
                      <li>
                        <button v-if="c.author === user.username || user.isAdmin" class="dropdown-item text-danger" @click="deleteComment(c._id)">Delete</button>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Editing state -->
                <template v-if="editingCommentId === c._id">
                  <textarea
                    v-model="editingCommentText"
                    class="view-post-modal__edit-input"
                    rows="2"
                  ></textarea>
                  <div class="d-flex gap-2 mt-1">
                    <button class="btn btn-sm view-post-modal__save-btn" @click="saveEditComment(c._id)">Save</button>
                    <button class="btn btn-sm view-post-modal__cancel-btn" @click="cancelEditComment">Cancel</button>
                  </div>
                </template>

                <p v-else class="view-post-modal__comment-text">{{ c.comment }}</p>
              </div>
            </div>
          </div>

          <!-- Add Comment -->
          <div v-if="user.email" class="view-post-modal__add-comment">
            <div class="view-post-modal__avatar view-post-modal__avatar--sm">
              {{ user.username?.charAt(0).toUpperCase() }}
            </div>
            <div class="view-post-modal__comment-input-wrap">
              <textarea
                v-model="comment"
                class="view-post-modal__comment-input"
                placeholder="Write a comment..."
                rows="2"
              ></textarea>
              <div class="d-flex justify-content-end mt-1">
                <button
                  class="view-post-modal__submit-btn"
                  :disabled="!comment.trim() || isSubmitting"
                  @click="submitComment"
                >
                  <i class="bi bi-send" v-if="!isSubmitting"></i>
                  <i class="bi bi-arrow-repeat modal-spinning" v-else></i>
                  {{ isSubmitting ? 'Posting...' : 'Comment' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </template>

    </div>
  </div>
</template>