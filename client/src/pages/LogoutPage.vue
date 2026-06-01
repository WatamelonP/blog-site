<script setup>
import { onBeforeMount } from 'vue';
import { useGlobalStore } from '../stores/global';
import { useRouter } from 'vue-router';

const router = useRouter();

const { getUserDetails } = useGlobalStore();

onBeforeMount(async () => {
    localStorage.clear();
    await getUserDetails(null);
    router.push({ path: "/login" });
})
</script>

<template>
        <h1>Logout</h1>
</template>