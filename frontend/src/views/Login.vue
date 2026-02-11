<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/auth/login', { email: email.value, password: password.value })
    auth.setAuth(data.data.token, data.data.user)
    const redirect = route.query.redirect || (data.data.user?.role === 'admin' ? '/admin' : '/plants')
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center px-4 py-16" style="background: var(--color-background);">
    <div class="w-full max-w-md animate-[slideUp_0.6s_ease-out] rounded-3xl p-8 shadow-card" style="background: var(--color-card-bg);">
      <h1 class="font-serif text-2xl font-semibold" style="color: var(--color-text);">Login</h1>
      <p class="mt-2 text-sm opacity-75" style="color: var(--color-text);">
        Welcome back. Sign in to explore plants.
      </p>
      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div>
          <label for="email" class="block text-sm font-medium" style="color: var(--color-text);">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="input-focus mt-2 w-full rounded-xl px-4 py-3"
            style="color: var(--color-text);"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium" style="color: var(--color-text);">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="input-focus mt-2 w-full rounded-xl px-4 py-3"
            style="color: var(--color-text);"
          />
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <button
          type="submit"
          class="btn-primary w-full py-3.5 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Logging in…' : 'Log in' }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm" style="color: var(--color-text-muted);">
        No account?
        <router-link to="/register" class="font-medium hover:underline" style="color: var(--color-forest);">Register</router-link>
      </p>
    </div>
  </div>
</template>
