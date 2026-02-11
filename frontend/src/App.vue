<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'
import AdminSidebar from './components/AdminSidebar.vue'

const route = useRoute()
const auth = useAuthStore()

const isAdminLayout = computed(() => auth.isAdmin && route.path.startsWith('/admin'))
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-background);">
    <!-- Admin: sidebar only (no navbar) -->
    <template v-if="isAdminLayout">
      <AdminSidebar />
      <main class="min-h-screen transition-all duration-300" style="margin-left: 14rem;">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="r.path" />
          </Transition>
        </RouterView>
      </main>
    </template>
    <!-- Guest / Client: navbar -->
    <template v-else>
      <Navbar />
      <main>
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="r.path" />
          </Transition>
        </RouterView>
      </main>
    </template>
  </div>
</template>
