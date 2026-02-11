<script setup>
import PlantModel from '../components/PlantModel.vue'
import { Leaf } from 'lucide-vue-next'
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Natural background -->
    <div
      class="absolute inset-0"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0 opacity-[0.4]"
        style="background: linear-gradient(165deg, rgba(47, 107, 79, 0.12) 0%, var(--color-background) 25%, rgba(184, 212, 184, 0.15) 50%, var(--color-background) 100%);"
      />
      <div
        class="absolute inset-0 opacity-[0.5]"
        style="background-image: radial-gradient(circle at 20% 80%, rgba(47, 107, 79, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(58, 141, 222, 0.06) 0%, transparent 45%);"
      />
      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 opacity-30"
        style="background: linear-gradient(to top, rgba(47, 107, 79, 0.1), transparent);"
      />
    </div>

    <div class="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div class="flex items-center gap-2 text-[var(--color-forest)]">
        <Leaf class="h-8 w-8 shrink-0" stroke-width="1.5" />
        <h1 class="font-serif text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
          About Us
        </h1>
      </div>

      <div class="mt-10 grid gap-10 lg:grid-cols-[1fr,320px] lg:items-start">
        <div class="space-y-6">
          <p class="text-lg leading-relaxed text-[var(--color-text)] sm:text-xl">
            Forest Plant Store is a nature-inspired shop where you can find indoor plants, outdoor varieties, herbs, and trees. We focus on sustainability, calm design, and helping you bring a bit of the forest home.
          </p>
          <p class="text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
            Our plants are chosen for their ease of care and eco-friendly impact. We use soft, natural aesthetics and believe in slow, organic growth—both in our plants and in how we run our store.
          </p>
        </div>

        <div class="flex flex-col items-center gap-3 lg:sticky lg:top-24">
          <div
            class="relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-card sm:max-w-[320px]"
            style="aspect-ratio: 1; background: var(--color-card-bg);"
          >
            <PlantModel />
          </div>
          <p class="text-center text-sm text-[var(--color-text-muted)]">
            Drag to pick up · drop to play
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
