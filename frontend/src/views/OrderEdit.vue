<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'
import { Phone, Facebook, Instagram, ImagePlus, ArrowLeft, Pencil } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const order = ref(null)
const loading = ref(true)
const phone = ref('')
const socialSlots = ref([
  { type: 'facebook', link: '', image: null },
  { type: 'instagram', link: '', image: null },
])
const items = ref([])
const submitting = ref(false)
const message = ref('')

const SOCIAL_TYPES = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'telegram', label: 'Telegram', icon: 'telegram' },
]

const total = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

onMounted(async () => {
  // Protect route at component level
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: `/orders/${route.params.id}/edit` } })
    return
  }
  
  try {
    const { data } = await api.get(`/orders/${route.params.id}`)
    order.value = data.data
    if (order.value) {
      if (order.value.status !== 'pending') {
        router.push('/orders')
        return
      }
      phone.value = order.value.phone || ''
      items.value = order.value.items.map((i) => ({ ...i }))
      if (order.value.socialMedia && order.value.socialMedia.length > 0) {
        socialSlots.value = order.value.socialMedia.map((s) => ({
          type: s.type,
          link: s.link || '',
          image: s.imageUrl ? null : null,
          imageUrl: s.imageUrl || null,
        }))
        while (socialSlots.value.length < 2) {
          socialSlots.value.push({ type: 'facebook', link: '', image: null })
        }
      }
    }
  } catch {
    router.push('/orders')
  } finally {
    loading.value = false
  }
})

function onSocialImageChange(slotIndex, event) {
  const file = event.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    if (socialSlots.value[slotIndex]) {
      socialSlots.value[slotIndex].image = reader.result
      socialSlots.value[slotIndex].imageUrl = null
    }
  }
  reader.readAsDataURL(file)
}

function buildSocialPayload() {
  return socialSlots.value
    .filter((s) => s.link?.trim())
    .slice(0, 2)
    .map((s) => ({
      type: s.type,
      link: s.link.trim(),
      image: s.image || undefined,
    }))
}

function updateQuantity(index, delta) {
  const item = items.value[index]
  const newQty = item.quantity + delta
  if (newQty < 1) {
    items.value.splice(index, 1)
  } else {
    item.quantity = newQty
  }
}

async function saveOrder() {
  if (items.value.length === 0) {
    message.value = 'Order must have at least one item'
    return
  }
  
  // Validate required fields
  if (!phone.value?.trim()) {
    message.value = 'Phone number is required'
    return
  }
  
  const social = buildSocialPayload()
  if (social.length === 0) {
    message.value = 'At least one social media link is required'
    return
  }
  
  submitting.value = true
  message.value = ''
  try {
    const payload = {
      items: items.value.map((i) => ({ plantId: i.plantId, quantity: i.quantity })),
      phone: phone.value.trim(),
      socialMedia: social,
    }
    await api.put(`/orders/${route.params.id}`, payload)
    message.value = 'Order updated!'
    setTimeout(() => {
      router.push('/orders')
    }, 1500)
  } catch (e) {
    message.value = e.response?.data?.error || 'Could not update order'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-12" style="background: var(--color-background);">
    <router-link
      to="/orders"
      class="inline-flex items-center gap-2 text-sm font-medium hover:underline"
      style="color: var(--color-forest);"
    >
      <ArrowLeft class="h-4 w-4" stroke-width="1.5" />
      Back to orders
    </router-link>
    <h1 class="mt-6 font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
      Edit Order
    </h1>
    <p class="mt-2 opacity-75" style="color: var(--color-text-dark);">
      Update items and contact details.
    </p>
    <div v-if="loading" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">Loading…</div>
    <div v-else-if="!order" class="card mt-12 rounded-2xl border border-[var(--color-border)] p-12 text-center">
      <p style="color: var(--color-text);">Order not found.</p>
    </div>
    <div v-else class="mt-8 grid gap-8 lg:grid-cols-[1fr,400px]">
      <div class="space-y-6">
        <div class="card rounded-2xl border border-[var(--color-border)] p-6">
          <h2 class="mb-4 font-medium" style="color: var(--color-text-dark);">Order Items</h2>
          <ul class="space-y-4">
            <li
              v-for="(item, idx) in items"
              :key="item.plantId"
              class="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/10"
            >
              <div class="flex-1">
                <p class="font-medium" style="color: var(--color-text);">{{ item.name }}</p>
                <div class="mt-1.5 flex items-center gap-3">
                  <button
                    type="button"
                    class="rounded-lg border px-2 py-1 text-sm transition-opacity hover:opacity-90"
                    style="border-color: var(--color-border); color: var(--color-text);"
                    @click="updateQuantity(idx, -1)"
                  >
                    −
                  </button>
                  <span class="text-sm" style="color: var(--color-text-muted);">Qty: {{ item.quantity }}</span>
                  <button
                    type="button"
                    class="rounded-lg border px-2 py-1 text-sm transition-opacity hover:opacity-90"
                    style="border-color: var(--color-border); color: var(--color-text);"
                    @click="updateQuantity(idx, 1)"
                  >
                    +
                  </button>
                </div>
              </div>
              <p class="font-semibold" style="color: var(--color-forest);">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </p>
            </li>
          </ul>
          <div class="mt-6 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
            <p class="text-lg font-semibold" style="color: var(--color-text-dark);">Total</p>
            <p class="text-2xl font-semibold" style="color: var(--color-forest);">${{ total.toFixed(2) }}</p>
          </div>
        </div>
        <div class="card rounded-2xl border border-[var(--color-border)] p-6">
          <h2 class="mb-4 font-medium" style="color: var(--color-text-dark);">Contact Details <span style="color: #dc2626;">*</span></h2>
          <div class="space-y-4">
            <div>
              <label class="flex items-center gap-2 text-sm font-medium" style="color: var(--color-text);">
                <Phone class="h-4 w-4" stroke-width="1.5" /> Phone <span style="color: #dc2626;">*</span>
              </label>
              <input
                v-model="phone"
                type="tel"
                required
                placeholder="Your phone number"
                class="input-focus mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                style="color: var(--color-text);"
              />
            </div>
            <div>
              <p class="mb-2 flex items-center gap-2 text-sm font-medium" style="color: var(--color-text);">Social media <span style="color: #dc2626;">*</span> (at least 1, up to 2)</p>
              <div v-for="(slot, idx) in socialSlots" :key="idx" class="mt-3 flex flex-wrap items-end gap-3 rounded-lg p-3" style="background: var(--color-background);">
                <div class="flex gap-1">
                  <button
                    v-for="opt in SOCIAL_TYPES"
                    :key="opt.value"
                    type="button"
                    class="rounded-lg p-2 transition-opacity hover:opacity-90"
                    :class="slot.type === opt.value ? 'ring-2' : 'opacity-70'"
                    :style="slot.type === opt.value ? { background: 'var(--color-forest)', color: 'white', ringColor: 'var(--color-forest)' } : { background: 'var(--color-border)', color: 'var(--color-text)' }"
                    :title="opt.label"
                    @click="slot.type = opt.value"
                  >
                    <component v-if="opt.icon !== 'telegram'" :is="opt.icon" class="h-5 w-5" stroke-width="1.5" />
                    <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </button>
                </div>
                <input
                  v-model="slot.link"
                  type="url"
                  :placeholder="`${slot.type} link`"
                  class="input-focus flex-1 min-w-0 rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                  style="color: var(--color-text); max-width: 14rem;"
                />
                <div class="flex items-center gap-2">
                  <input
                    :id="`social-img-${idx}`"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onSocialImageChange(idx, $event)"
                  />
                  <label
                    :for="`social-img-${idx}`"
                    class="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                    style="border-color: var(--color-border); color: var(--color-text);"
                  >
                    <ImagePlus class="h-4 w-4" stroke-width="1.5" />
                    {{ slot.image || slot.imageUrl ? 'Change' : 'Upload photo' }}
                  </label>
                  <img
                    v-if="slot.image || slot.imageUrl"
                    :src="slot.image || slot.imageUrl"
                    alt="Preview"
                    class="h-10 w-10 rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:sticky lg:top-24">
        <div class="card rounded-2xl border border-[var(--color-border)] p-6">
          <h2 class="mb-4 font-medium" style="color: var(--color-text-dark);">Order Summary</h2>
          <div class="space-y-2 text-sm" style="color: var(--color-text-muted);">
            <div class="flex justify-between">
              <span>{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</span>
              <span style="color: var(--color-text);">${{ total.toFixed(2) }}</span>
            </div>
          </div>
          <div class="mt-6 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
            <p class="text-lg font-semibold" style="color: var(--color-text-dark);">Total</p>
            <p class="text-2xl font-semibold" style="color: var(--color-forest);">${{ total.toFixed(2) }}</p>
          </div>
          <button
            type="button"
            class="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 px-6 py-3 disabled:opacity-50"
            :disabled="submitting"
            @click="saveOrder"
          >
            <Pencil class="h-5 w-5" stroke-width="1.5" />
            {{ submitting ? 'Saving…' : 'Save Changes' }}
          </button>
          <p v-if="message" class="mt-4 text-sm text-center" :style="message.includes('!') ? { color: 'var(--color-forest)' } : { color: '#dc2626' }">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
