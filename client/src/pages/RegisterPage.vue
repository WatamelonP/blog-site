<script setup>
import { watch, ref } from 'vue';
import { useGlobalStore } from '../stores/global';
import api from '../api';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';

const router = useRouter();
const notyf = new Notyf();
const { getUserDetails } = useGlobalStore();

const email = ref("");
const username = ref("")
const password = ref("");
const confirmPassword = ref("");
const isEnabled = ref(false);

watch([email, password, confirmPassword], (currentValue) => {
    isEnabled.value = currentValue.every(input => input !== "");
});

async function handleRegister() {
    if (password.value !== confirmPassword.value) {
        notyf.error("Passwords do not match");
        return;
    }

    if (password.value.length < 8) {
        notyf.error("Password must be at least 8 characters");
        return;
    }

    if (username.value.trim().length < 3) {
        notyf.error("Username must be at least 3 characters");
        return;
    }

    try {
        await api.post('/users/register', {
            email: email.value,
            username: username.value,
            password: password.value
        });


        let loginRes = await api.post('/users/login', {
            email: email.value,
            password: password.value
        });

        if (loginRes.data.access) {
            notyf.success("Account created!");
            localStorage.setItem("token", loginRes.data.access);
            await getUserDetails(loginRes.data.access);
            email.value = "";
            password.value = "";
            confirmPassword.value = "";
            router.push({ path: "/" });
        }

    } catch (error) {
        if (error.response?.status === 400) {
            notyf.error(error.response.data.message);
        } else {
            notyf.error("Registration failed");
        }
    }
}
</script>

<template>
    <div class="login-wrap">
        <div class="login-card">
            <p class="brand"><span>TV+</span> AND CHILL</p>
            <p class="subtitle">Create your account</p>

            <form @submit.prevent="handleRegister">
                <div class="field">
                    <label for="emailInput">Email address</label>
                    <input type="email" id="emailInput" placeholder="you@example.com" v-model="email" />
                </div>
                <div class="field">
                    <label for="usernameInput">Username</label>
                    <input type="text" id="usernameInput" placeholder="username" v-model="username" />
                </div>
                <div class="field">
                    <label for="passwordInput">Password</label>
                    <input type="password" id="passwordInput" placeholder="••••••••" v-model="password" />
                </div>
                <div class="field">
                    <label for="cpasswordInput">Confirm password</label>
                    <input type="password" id="cpasswordInput" placeholder="••••••••" v-model="confirmPassword" />
                </div>

                <button type="submit" class="btn-login" :disabled="!isEnabled">
                    <i class="bi bi-person-plus"></i>
                    Create account
                </button>
            </form>

            <p class="footer-link">Already have an account? <router-link :to="{ name: 'Login' }">Sign in</router-link></p>
        </div>
    </div>
</template>