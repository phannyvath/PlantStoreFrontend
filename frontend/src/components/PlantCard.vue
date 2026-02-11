<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps({
  plant: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
  showAdminActions: { type: Boolean, default: false },
})

const emit = defineEmits(['delete'])
</script>

<template>
  <article class="card group overflow-hidden rounded-2xl border border-[var(--color-border)]">
    <router-link
      v-if="!showAdminActions"
      :to="`/plants/${plant.id}`"
      class="block"
    >
      <div class="relative aspect-[4/3] overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]" style="background: var(--color-background);">
        <img
          :src="plant.image"
          :alt="plant.name"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div class="p-5">
        <h2 class="font-serif text-xl font-semibold" style="color: var(--color-text-dark);">
          {{ plant.name }}
        </h2>
        <p class="mt-1 text-sm opacity-75" style="color: var(--color-text-dark);">Description</p>
        <p class="mt-1 font-semibold" style="color: var(--color-forest);">
          ${{ Number(plant.price).toFixed(2) }}
        </p>
        <span
          v-if="showActions"
          class="mt-4 inline-block rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:shadow-md"
          style="border-color: var(--color-forest); color: var(--color-forest);"
        >
          View Details
        </span>
      </div>
    </router-link>
    <template v-else>
      <div class="relative aspect-[4/3] overflow-hidden" style="background: var(--color-background);">
        <img
          :src="plant.image"
          :alt="plant.name"
          class="h-full w-full object-cover"
        />
      </div>
      <div class="p-5">
        <h2 class="font-serif text-xl font-semibold" style="color: var(--color-text-dark);">
          {{ plant.name }}
        </h2>
        <p class="mt-1 text-sm opacity-75" style="color: var(--color-text-dark);">Description</p>
        <p class="mt-1 font-semibold" style="color: var(--color-forest);">
          ${{ Number(plant.price).toFixed(2) }}
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <router-link
            :to="`/admin/plants/${plant.id}`"
            class="inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style="border-color: var(--color-forest); color: var(--color-forest);"
          >
            <Pencil class="h-4 w-4" stroke-width="1.5" />
            Edit
          </router-link>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: #b91c1c;"
            @click="emit('delete', plant.id)"
          >
            <Trash2 class="h-4 w-4" stroke-width="1.5" />
            Delete
          </button>
        </div>
      </div>
    </template>
  </article>
</template>
