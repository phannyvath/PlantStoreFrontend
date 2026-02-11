<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'
import ConfirmModal from '../../components/ConfirmModal.vue'
import { Phone, Facebook, Instagram, ExternalLink, Pencil, Trash2, Download } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const orders = ref([])
const loading = ref(true)
const updating = ref(null)
const deleting = ref(null)
const showDeleteModal = ref(false)
const showPermanentDeleteModal = ref(false)
const orderToDelete = ref(null)

onMounted(async () => {
  // Protect route at component level
  if (!auth.isLoggedIn || !auth.isAdmin) {
    router.push({ name: 'home' })
    return
  }
  
  try {
    const { data } = await api.get('/orders/all')
    orders.value = data.data || []
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})

function openDeleteModal(id) {
  orderToDelete.value = id
  showDeleteModal.value = true
}

function openPermanentDeleteModal(id) {
  orderToDelete.value = id
  showPermanentDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  showPermanentDeleteModal.value = false
  orderToDelete.value = null
}

async function confirmDelete() {
  if (!orderToDelete.value) return
  deleting.value = orderToDelete.value
  try {
    await api.delete(`/orders/${orderToDelete.value}`)
    orders.value = orders.value.filter((o) => o.id !== orderToDelete.value)
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete')
  } finally {
    deleting.value = null
    showDeleteModal.value = false
    orderToDelete.value = null
  }
}

async function confirmPermanentDelete() {
  if (!orderToDelete.value) return
  deleting.value = orderToDelete.value
  try {
    await api.delete(`/orders/${orderToDelete.value}/permanent`)
    orders.value = orders.value.filter((o) => o.id !== orderToDelete.value)
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete')
  } finally {
    deleting.value = null
    showPermanentDeleteModal.value = false
    orderToDelete.value = null
  }
}

async function downloadReceipt(orderId) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/orders/${orderId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      alert('Could not download receipt')
      return
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${orderId.slice(0, 8)}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    alert('Failed to download receipt')
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

function statusStyle(status) {
  const s = (status || '').toLowerCase()
  if (s === 'delivered' || s === 'completed') return { bg: 'var(--color-forest)', color: 'white' }
  if (s === 'shipped' || s === 'confirmed' || s === 'processing') return { bg: 'rgba(58, 141, 222, 0.2)', color: 'var(--color-accent)' }
  return { bg: 'rgba(139, 94, 60, 0.2)', color: 'var(--color-soil)' }
}

function socialIcon(type) {
  if (type === 'facebook') return Facebook
  if (type === 'instagram') return Instagram
  return null
}

function socialLabel(type) {
  return type ? String(type).charAt(0).toUpperCase() + String(type).slice(1) : ''
}

async function updateStatus(id, status) {
  updating.value = id
  try {
    const { data } = await api.patch(`/orders/${id}/status`, { status })
    // Update the order with the full response from server to preserve all fields
    const index = orders.value.findIndex((x) => x.id === id)
    if (index !== -1 && data.data) {
      orders.value[index] = { ...orders.value[index], ...data.data }
    }
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to update')
  } finally {
    updating.value = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-12" style="background: var(--color-background);">
    <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
      Manage Orders
    </h1>
    <p class="mt-2 opacity-75" style="color: var(--color-text-dark);">
      All customer orders. Update status with calm, clear controls.
    </p>
    <div v-if="loading" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">Loading…</div>
    <ul v-else class="mt-10 space-y-6">
      <li
        v-for="order in orders"
        :key="order.id"
        class="card rounded-2xl border border-[var(--color-border)] p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div>
              <p class="font-medium" style="color: var(--color-text);">Order #{{ order.id.slice(0, 8) }}</p>
              <p v-if="order.userName" class="mt-1 text-sm opacity-75" style="color: var(--color-text-muted);">Customer: {{ order.userName }}</p>
            </div>
            <span
              v-if="order.deletedByUser"
              class="rounded-full px-2 py-0.5 text-xs font-medium opacity-75"
              style="background: rgba(139, 94, 60, 0.2); color: var(--color-soil);"
            >
              Hidden by user
            </span>
          </div>
          <p class="text-sm opacity-75" style="color: var(--color-text);">{{ formatDate(order.createdAt) }}</p>
          <div class="flex items-center gap-2">
            <select
              :value="order.status"
              class="input-focus rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              :disabled="updating === order.id"
              style="color: var(--color-text);"
              @change="updateStatus(order.id, $event.target.value)"
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
            </select>
            <template v-if="order.status === 'pending'">
              <router-link
                :to="`/orders/${order.id}/edit`"
                class="rounded-lg p-2 transition-opacity hover:opacity-90"
                style="color: var(--color-forest);"
                aria-label="Edit order"
              >
                <Pencil class="h-4 w-4" stroke-width="1.5" />
              </router-link>
              <button
                type="button"
                class="rounded-lg p-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style="color: #b91c1c;"
                aria-label="Delete order"
                :disabled="deleting === order.id"
                @click="openDeleteModal(order.id)"
              >
                <Trash2 class="h-4 w-4" stroke-width="1.5" />
              </button>
            </template>
            <template v-if="order.status === 'delivered'">
              <button
                type="button"
                class="rounded-lg p-2 transition-opacity hover:opacity-90"
                style="color: var(--color-forest);"
                aria-label="Download receipt"
                @click="downloadReceipt(order.id)"
              >
                <Download class="h-4 w-4" stroke-width="1.5" />
              </button>
            </template>
            <button
              type="button"
              class="rounded-lg p-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style="color: #991b1b;"
              aria-label="Permanently delete"
              :disabled="deleting === order.id"
              @click="openPermanentDeleteModal(order.id)"
            >
              <Trash2 class="h-4 w-4" stroke-width="1.5" />
            </button>
          </div>
        </div>
        <ul class="mt-4 space-y-2 border-t border-black/5 pt-4 dark:border-white/10">
          <li v-for="item in order.items" :key="item.plantId" class="flex justify-between text-sm" style="color: var(--color-text);">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>
        <p class="mt-4 text-right font-semibold" style="color: var(--color-forest);">Total: ${{ Number(order.total).toFixed(2) }}</p>
        <div v-if="order.phone || (order.socialMedia && order.socialMedia.length > 0)" class="mt-4 space-y-3 border-t border-black/5 pt-4 dark:border-white/10">
          <div v-if="order.phone" class="flex items-center gap-2 text-sm" style="color: var(--color-text);">
            <Phone class="h-4 w-4 shrink-0" stroke-width="1.5" />
            <span style="color: var(--color-text-muted);">Phone:</span>
            <span style="color: var(--color-text);">{{ order.phone }}</span>
          </div>
          <div v-if="order.socialMedia && order.socialMedia.length > 0" class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium" style="color: var(--color-text-muted);">Social media:</span>
            <template v-for="(social, i) in order.socialMedia" :key="i">
              <a
                v-if="social.link"
                :href="social.link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-opacity hover:opacity-90"
                style="border-color: var(--color-border); color: var(--color-forest);"
              >
                <component v-if="socialIcon(social.type)" :is="socialIcon(social.type)" class="h-4 w-4 shrink-0" stroke-width="1.5" />
                <span v-else>{{ socialLabel(social.type) }}</span>
                <ExternalLink class="h-3 w-3 shrink-0" stroke-width="1.5" />
              </a>
              <img
                v-if="social.imageUrl"
                :src="social.imageUrl"
                alt="Social"
                class="h-10 w-10 rounded-lg object-cover border"
                style="border-color: var(--color-border);"
              />
            </template>
          </div>
        </div>
      </li>
    </ul>
    <p v-if="!loading && orders.length === 0" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">No orders yet.</p>
    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Order"
      message="Are you sure you want to delete this order? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      danger
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="cancelDelete"
    />
    <ConfirmModal
      :show="showPermanentDeleteModal"
      title="Permanently Delete Order"
      message="This will permanently delete the order from the database. This action cannot be undone. Are you sure?"
      confirm-text="Delete Permanently"
      cancel-text="Cancel"
      danger
      @confirm="confirmPermanentDelete"
      @cancel="cancelDelete"
      @close="cancelDelete"
    />
  </div>
</template>
