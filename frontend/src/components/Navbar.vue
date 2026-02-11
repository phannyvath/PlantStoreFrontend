<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { Sun, Moon, ShoppingCart } from 'lucide-vue-next'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const open = ref(false)
const dark = ref(false)

onMounted(() => {
  dark.value = localStorage.getItem('theme') === 'dark'
  if (dark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
})

const guestLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
]

const clientLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/plants', label: 'Plants' },
  { path: '/orders', label: 'My Orders' },
]

const adminLinks = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/plants', label: 'Plants Admin' },
  { path: '/admin/orders', label: 'Orders Admin' },
  { path: '/admin/users', label: 'Users Admin' },
]

const navLinks = computed(() => {
  if (auth.isAdmin) return adminLinks
  if (auth.isLoggedIn) return clientLinks
  return guestLinks
})

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

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
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b transition-colors duration-300"
    style="background: var(--color-navbar-bg); border-color: var(--color-border); box-shadow: var(--shadow-soft);"
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <router-link
        to="/"
        class="font-serif text-xl font-semibold"
        style="color: var(--color-forest);"
      >
        Forest Plant Store
      </router-link>
      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="link in navLinks" :key="link.path">
          <router-link
            :to="link.path"
            class="nav-link font-medium"
            :class="{ 'router-link-active': isActive(link.path) }"
            :style="isActive(link.path) ? { color: 'var(--color-forest)' } : { color: 'var(--color-text-muted)' }"
          >
            {{ link.label }}
          </router-link>
        </li>
        <li v-if="auth.isLoggedIn && !auth.isAdmin">
          <router-link
            to="/checkout"
            class="relative rounded-lg p-2 transition-opacity hover:opacity-80"
            aria-label="Cart"
            style="color: var(--color-text-dark);"
          >
            <ShoppingCart class="h-5 w-5" stroke-width="1.5" />
            <span
              v-if="cart.itemCount > 0"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
              style="background: var(--color-forest);"
            >
              {{ cart.itemCount }}
            </span>
          </router-link>
        </li>
        <li v-if="auth.isLoggedIn">
          <button
            type="button"
            class="nav-link font-medium transition-opacity hover:opacity-80"
            style="color: var(--color-text-muted);"
            @click="auth.logout(); $router.push('/')"
          >
            Logout
          </button>
        </li>
        <li>
          <button
            type="button"
            class="rounded-lg p-2 transition-opacity hover:opacity-80"
            aria-label="Toggle dark mode"
            style="color: var(--color-text-dark);"
            @click="toggleDark"
          >
            <Sun v-if="dark" class="h-5 w-5" stroke-width="1.5" />
            <Moon v-else class="h-5 w-5" stroke-width="1.5" />
          </button>
        </li>
      </ul>
      <div class="flex items-center gap-2 md:hidden">
        <router-link
          v-if="auth.isLoggedIn && !auth.isAdmin"
          to="/checkout"
          class="relative rounded-lg p-2"
          aria-label="Cart"
          style="color: var(--color-text-dark);"
        >
          <ShoppingCart class="h-5 w-5" stroke-width="1.5" />
          <span
            v-if="cart.itemCount > 0"
            class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
            style="background: var(--color-forest);"
          >
            {{ cart.itemCount }}
          </span>
        </router-link>
        <button
          type="button"
          class="rounded-lg p-2"
          aria-label="Toggle dark mode"
          style="color: var(--color-text-dark);"
          @click="toggleDark"
        >
          <Sun v-if="dark" class="h-5 w-5" stroke-width="1.5" />
          <Moon v-else class="h-5 w-5" stroke-width="1.5" />
        </button>
        <button
          type="button"
          class="rounded p-2"
          aria-label="Menu"
          style="color: var(--color-text-dark);"
          @click="open = !open"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="open"
        class="border-t px-4 py-4 md:hidden"
        style="background: var(--color-navbar-bg); border-color: var(--color-border);"
      >
        <ul class="flex flex-col gap-3">
          <li v-for="link in navLinks" :key="link.path">
            <router-link
              :to="link.path"
              class="block py-1 font-medium"
              style="color: var(--color-text-dark);"
              @click="open = false"
            >
              {{ link.label }}
            </router-link>
          </li>
          <li v-if="auth.isLoggedIn && !auth.isAdmin">
            <router-link
              to="/checkout"
              class="flex items-center gap-2 py-1 font-medium"
              style="color: var(--color-text-dark);"
              @click="open = false"
            >
              <ShoppingCart class="h-4 w-4" stroke-width="1.5" />
              Cart
              <span
                v-if="cart.itemCount > 0"
                class="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style="background: var(--color-forest);"
              >
                {{ cart.itemCount }}
              </span>
            </router-link>
          </li>
          <li v-if="auth.isLoggedIn">
            <button
              type="button"
              class="block py-1 font-medium"
              style="color: var(--color-text-dark);"
              @click="auth.logout(); open = false; $router.push('/')"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>
