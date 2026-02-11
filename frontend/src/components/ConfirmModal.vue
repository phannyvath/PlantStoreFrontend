<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel', 'close'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.5);"
      @click.self="emit('cancel')"
    >
      <div
        class="card w-full max-w-md rounded-2xl border border-[var(--color-border)] p-6"
        style="background: var(--color-card-bg);"
      >
        <div class="flex items-center justify-between">
          <h3 class="font-semibold" style="color: var(--color-text-dark);">{{ title }}</h3>
          <button
            type="button"
            class="rounded-lg p-1 transition-opacity hover:opacity-80"
            style="color: var(--color-text-muted);"
            @click="emit('cancel')"
          >
            <X class="h-5 w-5" stroke-width="1.5" />
          </button>
        </div>
        <p class="mt-4" style="color: var(--color-text);">{{ message }}</p>
        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-full border px-4 py-2.5 font-medium transition-opacity hover:opacity-90"
            style="border-color: var(--color-border); color: var(--color-text);"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-full px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            :style="danger ? { background: '#b91c1c' } : { background: 'var(--color-forest)' }"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
