<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LayoutDashboard, Leaf, Package, Users, Sun, Moon, LogOut } from 'lucide-vue-next'

const route = useRoute()
const auth = useAuthStore()
const dark = ref(false)

onMounted(() => {
  dark.value = localStorage.getItem('theme') === 'dark'
})

function toggleDark() {
  dark.value = !dark.value
  if (dark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const links = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/plants', label: 'Plants', icon: Leaf },
  { path: '/admin/orders', label: 'Orders', icon: Package },
  { path: '/admin/users', label: 'Users', icon: Users },
]

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r transition-colors"
    style="background: var(--color-card-bg); border-color: var(--color-border); box-shadow: var(--shadow-soft);"
  >
    <div class="border-b p-4" style="border-color: var(--color-border);">
      <router-link to="/admin" class="font-serif text-lg font-semibold" style="color: var(--color-forest);">
        Admin
      </router-link>
      <p class="mt-0.5 text-xs" style="color: var(--color-text-muted);">Forest Plant Store</p>
    </div>
    <nav class="flex-1 space-y-0.5 p-3">
      <router-link
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(link.path) ? 'sidebar-link-active' : 'sidebar-link'"
        :style="isActive(link.path) ? { background: 'var(--color-forest)', color: 'white' } : { color: 'var(--color-text)' }"
      >
        <component :is="link.icon" class="h-5 w-5 shrink-0" stroke-width="1.5" />
        {{ link.label }}
      </router-link>
    </nav>
    <div class="border-t p-3" style="border-color: var(--color-border);">
      <button
        type="button"
        class="sidebar-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
        style="color: var(--color-text-muted);"
        aria-label="Toggle theme"
        @click="toggleDark"
      >
        <Sun v-if="dark" class="h-5 w-5 shrink-0" stroke-width="1.5" />
        <Moon v-else class="h-5 w-5 shrink-0" stroke-width="1.5" />
        {{ dark ? 'Light mode' : 'Dark mode' }}
      </button>
      <button
        type="button"
        class="sidebar-link mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
        style="color: var(--color-text-muted);"
        @click="auth.logout(); $router.push('/')"
      >
        <LogOut class="h-5 w-5 shrink-0" stroke-width="1.5" />
        Logout
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-link:hover {
  background: var(--color-background);
  color: var(--color-text);
}
.sidebar-link-active:hover {
  opacity: 0.95;
}
</style>
