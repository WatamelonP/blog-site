import { defineStore } from 'pinia';
import { reactive, computed, ref } from 'vue';
import api from '../api';

export const useGlobalStore = defineStore('global', () => {
    let user = ref({
        token: localStorage.getItem('token'),
        email: "",
        username: "",
        isAdmin: false
    });

    async function getUserDetails(token) {
        if (!token) {
            user.value.token = "";
            user.value.email = "";
            user.value.username = "";
            user.value.createdAt = "";
            user.value.isAdmin = false;
            return;
        }
        let { data } = await api.get('/users/profile');
        user.value.token = token;
        user.value.email = data.user.email;
        user.value.username = data.user.username;
        user.value.createdAt = data.user.createdAt;
        user.value.isAdmin = data.user.isAdmin;
    }

    getUserDetails(user.value.token);

    const isDark = ref(true)
    document.documentElement.classList.add('dark')

    const isCollapsed = ref(true)

    function toggleDark() {
        isDark.value = !isDark.value
        document.documentElement.classList.toggle('dark', isDark.value)
    }

    function toggleCollapse() {
        isCollapsed.value = !isCollapsed.value
    }

    return {
        user,
        getUserDetails,
        isDark,
        toggleDark,
        isCollapsed,
        toggleCollapse
    };
});