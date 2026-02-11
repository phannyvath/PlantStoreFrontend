<script setup>
import { ref } from 'vue'
import { X, Lock, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Please enter your password to confirm this action.' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const password = ref('')
const showPassword = ref(false)
const error = ref('')

function handleConfirm() {
  const trimmedPassword = password.value.trim()
  if (!trimmedPassword) {
    error.value = 'Password is required'
    return
  }
  error.value = ''
  // Send trimmed password to avoid whitespace issues
  emit('confirm', trimmedPassword)
  password.value = ''
}

function handleCancel() {
  password.value = ''
  error.value = ''
  emit('cancel')
}

function handleClose() {
  password.value = ''
  error.value = ''
  emit('close')
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.5);"
      @click.self="handleCancel"
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
            @click="handleCancel"
          >
            <X class="h-5 w-5" stroke-width="1.5" />
          </button>
        </div>
        <p class="mt-4" style="color: var(--color-text);">{{ message }}</p>
        <div class="mt-4">
          <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
            Password
          </label>
          <div class="relative">
            <Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style="color: var(--color-text-muted);" stroke-width="1.5" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input-focus w-full rounded-xl border border-black/10 px-10 pr-10 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              style="color: var(--color-text); padding-right: 2.75rem;"
              placeholder="Enter your password"
              @keyup.enter="handleConfirm"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
              style="color: var(--color-text-muted);"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="h-4 w-4" stroke-width="1.5" />
              <EyeOff v-else class="h-4 w-4" stroke-width="1.5" />
            </button>
          </div>
          <p v-if="error" class="mt-2 text-sm" style="color: #dc2626;">{{ error }}</p>
        </div>
        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-full border px-4 py-2.5 font-medium transition-opacity hover:opacity-90"
            style="border-color: var(--color-border); color: var(--color-text);"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-full px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            :style="danger ? { background: '#b91c1c' } : { background: 'var(--color-forest)' }"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
