<script setup>
import { ref, watch } from 'vue'
import api from '../api.js'
import { Notyf } from 'notyf'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const notyf = new Notyf()
const title = ref(props.post.title)
const content = ref(props.post.content)
const isSubmitting = ref(false)

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) return

  isSubmitting.value = true
  try {
    // console.log('updatePost:', props.post._id)
    const response = await api.patch(`/posts/updatePost/${props.post._id}`, {
      title: title.value,
      content: content.value
    })
    notyf.success('Post updated!')
    emit('updated', response.data)
    emit('close')
  } catch (err) {
    notyf.error('Failed to update post.')
    // console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="custom-modal-backdrop" @click.self="$emit('close')">
    <div class="custom-modal" role="dialog" aria-modal="true">

      <div class="custom-modal-header">
        <h3 class="custom-modal-title">Edit Post</h3>
        <button class="custom-modal-close" type="button" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="custom-modal-body">
        <div class="custom-modal-field">
          <label class="custom-modal-field__label" for="edit-title">Title</label>
          <input
            id="edit-title"
            v-model="title"
            type="text"
            class="custom-modal-field__input"
            placeholder="Post title..."
            maxlength="100"
          />
          <span class="custom-modal-field__count">{{ title.length }}/100</span>
        </div>

        <div class="custom-modal-field">
          <label class="custom-modal-field__label" for="edit-content">Content</label>
          <textarea
            id="edit-content"
            v-model="content"
            class="custom-modal-field__input custom-modal-field__textarea"
            placeholder="What's on your mind?"
            rows="5"
          ></textarea>
        </div>
      </div>

      <div class="custom-modal-footer">
        <button class="btn-secondary" type="button" @click="$emit('close')">
          Cancel
        </button>
        <button
          class="btn-primary"
          type="button"
          :disabled="!title.trim() || !content.trim() || isSubmitting"
          @click="handleSubmit"
        >
          <i class="bi bi-check-lg" v-if="!isSubmitting"></i>
          <i class="bi bi-arrow-repeat modal-spinning" v-else></i>
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

    </div>
  </div>
</template>