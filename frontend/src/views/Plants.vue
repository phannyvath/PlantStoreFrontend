<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'
import PlantCard from '../components/PlantCard.vue'
import { Filter } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const plants = ref([])
const loading = ref(true)
const visible = ref([])
const filterCategory = ref('')
const priceMin = ref('')
const priceMax = ref('')

const categories = computed(() => {
  const set = new Set(plants.value.map((p) => p.category).filter(Boolean))
  return ['', ...Array.from(set).sort()]
})

const filteredPlants = computed(() => {
  let list = plants.value
  if (filterCategory.value) {
    list = list.filter((p) => p.category === filterCategory.value)
  }
  const min = priceMin.value === '' ? -Infinity : Number(priceMin.value)
  const max = priceMax.value === '' ? Infinity : Number(priceMax.value)
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    list = list.filter((p) => {
      const price = Number(p.price)
      return (Number.isNaN(min) || price >= min) && (Number.isNaN(max) || price <= max)
    })
  }
  return list
})

function setVisible(index) {
  if (!visible.value.includes(index)) visible.value = [...visible.value, index]
}

// Protect route at component level
onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/plants' } })
    return
  }
  
  try {
    const { data } = await api.get('/plants')
    plants.value = data.data || []
  } catch {
    plants.value = []
  } finally {
    loading.value = false
  }
  nextTick(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible(Number(e.target.dataset.index))
        })
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    )
    document.querySelectorAll('[data-plant-card]').forEach((el) => observer.observe(el))
  })
})

async function removePlant(id) {
  if (!confirm('Delete this plant?')) return
  try {
    await api.delete(`/plants/${id}`)
    plants.value = plants.value.filter((p) => p.id !== id)
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete')
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-14" style="background: var(--color-background);">
    <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
      Our Plants
    </h1>
    <p class="mt-2 opacity-75" style="color: var(--color-text-dark);">
      Indoor, outdoor, herbs, and trees. Light and breathable.
    </p>

    <!-- Filters -->
    <div
      v-if="!loading && plants.length > 0"
      class="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border p-4"
      style="border-color: var(--color-border); background: var(--color-card-bg);"
    >
      <span class="flex items-center gap-2 text-sm font-medium" style="color: var(--color-text-muted);">
        <Filter class="h-4 w-4" stroke-width="1.5" />
        Filter
      </span>
      <div class="flex flex-wrap items-center gap-3">
        <label class="text-sm" style="color: var(--color-text);">Category</label>
        <select
          v-model="filterCategory"
          class="input-focus rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); color: var(--color-text); min-width: 7rem;"
        >
          <option value="">All</option>
          <option v-for="cat in categories.filter(Boolean)" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label class="text-sm" style="color: var(--color-text);">Price range</label>
        <input
          v-model="priceMin"
          type="number"
          step="0.01"
          min="0"
          placeholder="Min $"
          class="input-focus w-24 rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); color: var(--color-text);"
        />
        <span class="text-sm opacity-60" style="color: var(--color-text);">–</span>
        <input
          v-model="priceMax"
          type="number"
          step="0.01"
          min="0"
          placeholder="Max $"
          class="input-focus w-24 rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); color: var(--color-text);"
        />
      </div>
    </div>

    <div v-if="loading" class="mt-14 text-center opacity-75" style="color: var(--color-text-dark);">
      Loading…
    </div>
    <ul v-else class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="(plant, i) in filteredPlants"
        :key="plant.id"
        data-plant-card
        :data-index="i"
        class="transition-all duration-700 ease-out"
        :class="visible.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="visible.includes(i) ? { transitionDelay: `${i * 80}ms` } : {}"
      >
        <PlantCard
          :plant="plant"
          :show-admin-actions="auth.isAdmin"
          @delete="removePlant"
        />
      </li>
    </ul>
    <p
      v-if="!loading && filteredPlants.length === 0"
      class="mt-12 text-center opacity-75"
      style="color: var(--color-text-dark);"
    >
      No plants match your filters.
    </p>
  </div>
</template>
