<script setup>
import { watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';
import api from '../api';
import { Notyf } from 'notyf';


const store = useGlobalStore();
const notyf = new Notyf();
const router = useRouter();
const { getUserDetails } = store;
const email = ref("");
const password = ref("");
const isEnabled = ref(false);

watch([email, password], (currentValue) => {
    isEnabled.value = currentValue.every(input => input !== "");
});

async function handleSubmit() {
    try {
        let res = await api.post('/users/login', {
            email: email.value,
            password: password.value
        });
        if (res.data.access) {
            notyf.success("Login Successful");
            localStorage.setItem("token", res.data.access);
            await getUserDetails(res.data.access);
            email.value = "";
            password.value = "";
            router.push({ path: '/posts' });
        }
    } catch (e) {
        if (e.response?.status === 401) {
            notyf.error(e.response.data.message);
        } else {
            console.error(e);
            notyf.error("Login Failed. Please contact administrator.");
        }
    }
}
</script>

<template>
    <div class="login-wrap">
  <div class="login-card">

    <div class="login-brand">
      <h1 class="login-brand__title">
        TV<span>+</span>
      </h1>
      <p class="login-brand__subtitle">
        Sign in to continue
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">

      <div class="mb-3">
        <label class="form-label" for="userEmail">
          Email Address
        </label>

        <input
          id="userEmail"
          type="email"
          class="form-control"
          placeholder="you@example.com"
          v-model="email"
        >
      </div>

      <div class="mb-4">
        <label class="form-label" for="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          class="form-control"
          placeholder="••••••••"
          v-model="password"
        >
      </div>

      <button
        type="submit"
        class="login-btn"
        :disabled="!isEnabled"
      >
        Sign In
      </button>

    </form>

    <div class="login-footer">
      New here?
      <router-link :to="{ name: 'Register' }">
        Create an account
      </router-link>
    </div>

  </div>
</div>
</template>

