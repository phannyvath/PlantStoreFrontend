<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const saving = ref(false)
const form = ref({
  name: '',
  category: 'Indoor',
  price: '',
  image: '',
  description: '',
  care: { water: '', sunlight: '', level: 'Easy' },
})

async function submit() {
  saving.value = true
  try {
    await api.post('/plants', {
      name: form.value.name,
      category: form.value.category,
      price: Number(form.value.price),
      image: form.value.image,
      description: form.value.description,
      care: form.value.care,
    })
    router.push('/admin/plants')
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to create')
  } finally {
    saving.value = false
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
    <h1 class="mt-6 font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
      Add Plant
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
        <input
          v-model="form.image"
          type="url"
          placeholder="Image URL"
          class="input-focus rounded-xl border border-black/10 px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
          style="color: var(--color-text-dark);"
        />
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
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <router-link
            to="/admin/plants"
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
