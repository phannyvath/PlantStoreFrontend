<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const saving = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

onMounted(() => {
  // Protect route at component level
  if (!auth.isLoggedIn || !auth.isAdmin) {
    router.push({ name: 'home' })
  }
})
const error = ref('')
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  role: 'client',
})

async function submit() {
  error.value = ''
  if (!form.value.email || !form.value.password) {
    error.value = 'Email and password are required'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  saving.value = true
  try {
    await api.post('/users/create', {
      email: form.value.email,
      password: form.value.password,
      name: form.value.name || form.value.email,
      role: form.value.role,
    })
    router.push('/admin/users')
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create user'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-12" style="background: var(--color-background);">
    <router-link
      to="/admin/users"
      class="inline-flex items-center gap-2 text-sm font-medium hover:underline"
      style="color: var(--color-forest);"
    >
      <ArrowLeft class="h-4 w-4" stroke-width="1.5" />
      Back to users
    </router-link>
    <div class="mt-6 flex items-center gap-2">
      <UserPlus class="h-8 w-8 shrink-0" style="color: var(--color-forest);" stroke-width="1.5" />
      <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
        Create New User
      </h1>
    </div>
    <p class="mt-2 opacity-75" style="color: var(--color-text-dark);">Create a new user account with selected role.</p>
    <div class="card mt-8 rounded-2xl border border-[var(--color-border)] p-6">
      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
            Email <span style="color: #dc2626;">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="input-focus w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text);"
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
            Password <span style="color: #dc2626;">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="input-focus w-full rounded-xl border border-black/10 px-4 pr-10 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              style="color: var(--color-text);"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
              style="color: var(--color-text-muted);"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="h-4 w-4" stroke-width="1.5" />
              <EyeOff v-else class="h-4 w-4" stroke-width="1.5" />
            </button>
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
            Confirm Password <span style="color: #dc2626;">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="input-focus w-full rounded-xl border border-black/10 px-4 pr-10 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              style="color: var(--color-text);"
              placeholder="Confirm password"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
              style="color: var(--color-text-muted);"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Eye v-if="!showConfirmPassword" class="h-4 w-4" stroke-width="1.5" />
              <EyeOff v-else class="h-4 w-4" stroke-width="1.5" />
            </button>
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
            Name
          </label>
          <input
            v-model="form.name"
            type="text"
            class="input-focus w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text);"
            placeholder="User name (optional)"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
            Role <span style="color: #dc2626;">*</span>
          </label>
          <select
            v-model="form.role"
            required
            class="input-focus w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text);"
          >
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p v-if="error" class="text-sm" style="color: #dc2626;">{{ error }}</p>
        <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-black/5 dark:border-white/10">
          <button
            type="submit"
            class="btn-primary px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="saving"
          >
            {{ saving ? 'Creating…' : 'Create User' }}
          </button>
          <router-link
            to="/admin/users"
            class="inline-flex items-center justify-center rounded-full border-2 px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style="border-color: var(--color-forest); color: var(--color-forest); background: transparent;"
          >
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
