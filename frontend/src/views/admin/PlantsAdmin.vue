<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api/axios'
import PlantCard from '../../components/PlantCard.vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

const plants = ref([])
const loading = ref(true)

async function load() {
  try {
    const { data } = await api.get('/plants')
    plants.value = data.data || []
  } catch {
    plants.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function remove(id) {
  if (!confirm('Delete this plant?')) return
  try {
    await api.delete(`/plants/${id}`)
    await load()
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete')
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-12" style="background: var(--color-background);">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
        Manage Plants
      </h1>
      <router-link
        to="/admin/plants/new"
        class="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
      >
        <Plus class="h-5 w-5" stroke-width="1.5" />
        Add Plant
      </router-link>
    </div>
    <div v-if="loading" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">Loading…</div>
    <ul v-else class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="plant in plants" :key="plant.id" class="relative">
        <PlantCard :plant="plant" :show-actions="false" />
        <div class="absolute right-4 top-4 flex gap-2">
          <router-link
            :to="`/admin/plants/${plant.id}`"
            class="rounded-full p-2 transition-opacity hover:opacity-90"
            style="background: var(--color-forest); color: white;"
            aria-label="Edit plant"
          >
            <Pencil class="h-4 w-4" stroke-width="1.5" />
          </router-link>
          <button
            type="button"
            class="rounded-full p-2 transition-opacity hover:opacity-90"
            style="background: #b91c1c; color: white;"
            aria-label="Delete plant"
            @click="remove(plant.id)"
          >
            <Trash2 class="h-4 w-4" stroke-width="1.5" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
