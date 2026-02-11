<script setup>
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="!auth.isLoggedIn" class="flex min-h-[60vh] items-center justify-center px-4" style="background: var(--color-background);">
    <div class="rounded-2xl p-8 text-center shadow-card" style="background: var(--color-card-bg);">
      <p style="color: var(--color-text);">You need to log in to view this page.</p>
      <router-link to="/login" class="btn-primary mt-4 inline-block px-6 py-2">
        Login
      </router-link>
    </div>
  </div>
  <slot v-else />
</template>
