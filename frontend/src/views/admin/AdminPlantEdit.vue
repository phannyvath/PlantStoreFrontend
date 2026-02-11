<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'
import { ArrowLeft, Trash2, ImagePlus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const plantId = computed(() => route.params.id)
const plant = ref(null)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const form = ref({
  name: '',
  category: 'Indoor',
  price: '',
  image: null, // Changed to null for file upload
  imageUrl: '', // For displaying existing image
  description: '',
  care: { water: '', sunlight: '', level: 'Easy' },
})

onMounted(async () => {
  // Protect route at component level
  if (!auth.isLoggedIn || !auth.isAdmin) {
    router.push({ name: 'home' })
    return
  }
  
  try {
    const { data } = await api.get(`/plants/${plantId.value}`)
    plant.value = data.data
    if (plant.value) {
      form.value = {
        name: plant.value.name,
        category: plant.value.category || 'Indoor',
        price: String(plant.value.price ?? ''),
        image: null, // New upload
        imageUrl: plant.value.image || '', // Existing image URL
        description: plant.value.description || '',
        care: {
          water: plant.value.care?.water || '',
          sunlight: plant.value.care?.sunlight || '',
          level: plant.value.care?.level || 'Easy',
        },
      }
    }
  } catch {
    plant.value = null
  } finally {
    loading.value = false
  }
})

function onImageChange(event) {
  const file = event.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = reader.result // base64 data URL
    form.value.imageUrl = null // Clear URL if file is uploaded
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  form.value.image = null
  form.value.imageUrl = ''
  // Reset file input
  const fileInput = document.getElementById('plant-image-input-edit')
  if (fileInput) fileInput.value = ''
}

async function submit() {
  saving.value = true
  try {
    await api.put(`/plants/${plantId.value}`, {
      name: form.value.name,
      category: form.value.category,
      price: Number(form.value.price),
      image: form.value.image || form.value.imageUrl || '', // Send base64 or URL
      description: form.value.description,
      care: form.value.care,
    })
    router.push('/admin/plants')
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to update')
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Delete this plant? This cannot be undone.')) return
  deleting.value = true
  try {
    await api.delete(`/plants/${plantId.value}`)
    router.push('/admin/plants')
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-12" style="background: var(--color-background);">
    <router-link
      to="/admin/plants"
      class="inline-flex items-center gap-2 text-sm font-medium hover:underline"
      style="color: var(--color-forest);"
    >
      <ArrowLeft class="h-4 w-4" stroke-width="1.5" />
      Back to plants
    </router-link>
    <div v-if="loading" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">
      Loading…
    </div>
    <template v-else-if="plant">
      <h1 class="mt-6 font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
        Edit Plant
      </h1>
      <div
        class="card mt-8 rounded-2xl border border-[var(--color-border)] p-6"
      >
        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
          <input
            v-model="form.name"
            placeholder="Name"
            required
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <input
            v-model="form.category"
            placeholder="Category"
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <input
            v-model="form.price"
            type="number"
            step="0.01"
            placeholder="Price"
            required
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-dark);">Plant Image</label>
            <div class="flex items-center gap-3">
              <input
                id="plant-image-input-edit"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onImageChange"
              />
              <label
                for="plant-image-input-edit"
                class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style="border-color: var(--color-border); color: var(--color-text);"
              >
                <ImagePlus class="h-4 w-4" stroke-width="1.5" />
                {{ form.image || form.imageUrl ? 'Change Image' : 'Upload Image' }}
              </label>
              <input
                v-if="!form.image"
                v-model="form.imageUrl"
                type="url"
                placeholder="Or enter image URL"
                class="input-focus flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                style="color: var(--color-text-dark);"
              />
              <button
                v-if="form.image || form.imageUrl"
                type="button"
                @click="clearImage"
                class="text-sm text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>
            <img
              v-if="form.image || form.imageUrl"
              :src="form.image || form.imageUrl"
              alt="Plant preview"
              class="mt-3 h-32 w-32 rounded-lg object-cover border"
              style="border-color: var(--color-border);"
            />
          </div>
          <input
            v-model="form.description"
            placeholder="Description"
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 sm:col-span-2 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <input
            v-model="form.care.water"
            placeholder="Care: Water"
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <input
            v-model="form.care.sunlight"
            placeholder="Care: Sunlight"
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <input
            v-model="form.care.level"
            placeholder="Care: Level (e.g. Easy)"
            class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            style="color: var(--color-text-dark);"
          />
          <div class="flex flex-wrap items-center gap-3 sm:col-span-2 pt-2">
            <button type="submit" class="btn-primary px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" :disabled="saving">
              {{ saving ? 'Saving…' : 'Update' }}
            </button>
            <router-link
              to="/admin/plants"
              class="inline-flex items-center justify-center rounded-full border-2 px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style="border-color: var(--color-forest); color: var(--color-forest); background: transparent;"
            >
              Cancel
            </router-link>
            <button
              type="button"
              class="ml-auto inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style="border-color: #b91c1c; color: #b91c1c; background: transparent;"
              :disabled="deleting"
              @click="remove"
            >
              <Trash2 class="h-4 w-4" stroke-width="1.5" />
              {{ deleting ? 'Deleting…' : 'Delete plant' }}
            </button>
          </div>
        </form>
      </div>
    </template>
    <p v-else class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">
      Plant not found.
    </p>
  </div>
</template>
