<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import api from '../api/axios'
import { Droplets, Sun, Pencil, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const plant = ref(null)
const quantity = ref(1)
const adding = ref(false)
const message = ref('')
const deleting = ref(false)

const id = computed(() => route.params.id)

onMounted(async () => {
  try {
    const { data } = await api.get(`/plants/${id.value}`)
    plant.value = data.data
  } catch {
    plant.value = null
  }
})

function addToCart() {
  if (!plant.value) return
  cart.addItem(plant.value.id, plant.value.name, plant.value.price, quantity.value)
  message.value = 'Added to cart!'
  setTimeout(() => {
    message.value = ''
  }, 2000)
}

async function removePlant() {
  if (!plant.value || !confirm('Delete this plant?')) return
  deleting.value = true
  try {
    await api.delete(`/plants/${plant.value.id}`)
    router.push('/plants')
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-12" style="background: var(--color-background);">
    <router-link to="/plants" class="text-sm font-medium hover:underline" style="color: var(--color-forest);">
      ← Back to plants
    </router-link>
    <div v-if="plant" class="card mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <div class="grid gap-0 md:grid-cols-2">
        <div class="relative aspect-[4/3] md:aspect-auto" style="background: var(--color-background);">
          <img
            :src="plant.image"
            :alt="plant.name"
            class="h-full w-full object-cover transition-opacity duration-500"
            style="animation: fadeIn 0.6s ease-out forwards;"
          />
          <span
            class="absolute right-4 top-4 rounded-full px-3 py-1.5 text-sm font-medium text-white"
            style="background: var(--color-forest);"
          >
            {{ plant.category }}
          </span>
        </div>
        <div class="flex flex-col p-8 md:p-10">
          <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
            {{ plant.name }}
          </h1>
          <p class="mt-4 leading-relaxed opacity-85" style="color: var(--color-text-dark);">
            {{ plant.description }}
          </p>
          <div class="mt-6 flex flex-wrap gap-6">
            <span class="flex items-center gap-2 text-sm font-medium" style="color: var(--color-accent);">
              <Droplets class="h-4 w-4 shrink-0" stroke-width="1.5" aria-hidden="true" /> {{ plant.care?.water }}
            </span>
            <span class="flex items-center gap-2 text-sm font-medium" style="color: var(--color-forest);">
              <Sun class="h-4 w-4 shrink-0" stroke-width="1.5" aria-hidden="true" /> {{ plant.care?.sunlight }}
            </span>
          </div>
          <div class="mt-10 flex flex-wrap items-center gap-6 border-t border-black/5 pt-8 dark:border-white/10">
            <template v-if="auth.isAdmin">
              <p class="text-2xl font-semibold" style="color: var(--color-forest);">
                ${{ Number(plant.price).toFixed(2) }}
              </p>
              <router-link
                :to="`/admin/plants/${plant.id}`"
                class="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-medium transition-opacity hover:opacity-90"
                style="border-color: var(--color-forest); color: var(--color-forest);"
              >
                <Pencil class="h-5 w-5" stroke-width="1.5" />
                Edit plant
              </router-link>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style="background: #b91c1c;"
                :disabled="deleting"
                @click="removePlant"
              >
                <Trash2 class="h-5 w-5" stroke-width="1.5" />
                {{ deleting ? 'Deleting…' : 'Delete plant' }}
              </button>
            </template>
            <template v-else>
              <div class="flex flex-wrap items-center gap-6">
                <div class="flex items-center gap-2">
                  <label for="qty" class="text-sm" style="color: var(--color-text-dark);">Qty</label>
                  <input
                    id="qty"
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    class="w-20 rounded-xl border border-black/10 px-3 py-2 text-center dark:border-white/10 dark:bg-white/5"
                    style="color: var(--color-text-dark);"
                  />
                </div>
                <p class="text-2xl font-semibold" style="color: var(--color-forest);">
                  ${{ Number(plant.price).toFixed(2) }}
                </p>
                <button
                  type="button"
                  class="btn-primary px-6 py-3 disabled:opacity-50"
                  :disabled="adding"
                  @click="addToCart"
                >
                  {{ adding ? 'Adding…' : 'Add to Cart' }}
                </button>
              </div>
              <p class="mt-3 text-xs opacity-75" style="color: var(--color-text-muted);">
                Items are saved to your cart. Go to checkout to confirm your order.
              </p>
            </template>
          </div>
          <p v-if="message" class="mt-4 text-sm" :style="message.includes('!') ? { color: 'var(--color-forest)' } : { color: '#dc2626' }">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
    <p v-else class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">Plant not found.</p>
  </div>
</template>
