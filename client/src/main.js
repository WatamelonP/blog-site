import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia';
import { useGlobalStore } from './stores/global'
import { createRouter, createWebHistory } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css'

import 'notyf/notyf.min.css';

import './style.css'

// Page imports
import HomePage from './pages/HomePage.vue';
import PostsPage from './pages/PostsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import LoginPage from './pages/LoginPage.vue';
import RegisterPage from './pages/RegisterPage.vue';
import LogoutPage from './pages/LogoutPage.vue'

const pinia = createPinia()

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			redirect: () => {
				const token = localStorage.getItem("token");

				return token
					? { name: "Posts" }
					: { name: "Login" };
			}
		},
		{
			path: '/posts',
			name: 'Posts',
			component: PostsPage
		},
		{
			path: '/profile',
			name: 'Profile',
			component: ProfilePage,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: LoginPage
		},
		{
			path: '/register',
			name: 'Register',
			component: RegisterPage
		},
		{
			path: '/logout',
			name: 'Logout',
			component: LogoutPage,
			meta: {
				requiresAuth: true
			}
		}
	]

})

const app = createApp(App)
app.use(pinia)

router.beforeEach(async (to, from, next) => {
	const token = localStorage.getItem("token");

	if (to.meta.requiresAuth && !token) {
		return next({ name: "Login" });
	}

	next();
});
app.use(router).mount('#app')
