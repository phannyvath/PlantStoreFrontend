<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import ConfirmModal from '../../components/ConfirmModal.vue'
import PasswordConfirmModal from '../../components/PasswordConfirmModal.vue'
import { Ban, Trash2, UserPlus, Unlock } from 'lucide-vue-next'

const router = useRouter()
const users = ref([])
const loading = ref(true)
const showBlockModal = ref(false)
const showUnblockModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)
const blockReason = ref('')
const deleting = ref(false)
const blocking = ref(false)

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  try {
    const { data } = await api.get('/users')
    users.value = data.data || []
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

function openBlockModal(user) {
  selectedUser.value = user
  blockReason.value = ''
  showBlockModal.value = true
}

function openUnblockModal(user) {
  selectedUser.value = user
  showUnblockModal.value = true
}

function openDeleteModal(user) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function cancelBlock() {
  showBlockModal.value = false
  selectedUser.value = null
  blockReason.value = ''
}

function cancelUnblock() {
  showUnblockModal.value = false
  selectedUser.value = null
}

function cancelDelete() {
  showDeleteModal.value = false
  selectedUser.value = null
}

async function confirmBlock() {
  if (!selectedUser.value) return
  blocking.value = true
  try {
    await api.post('/users/block', {
      email: selectedUser.value.email,
      reason: blockReason.value || 'No reason provided',
    })
    await loadUsers()
    showBlockModal.value = false
    selectedUser.value = null
    blockReason.value = ''
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to block user')
  } finally {
    blocking.value = false
  }
}

async function confirmUnblock() {
  if (!selectedUser.value) return
  blocking.value = true
  try {
    await api.post('/users/unblock', {
      email: selectedUser.value.email,
    })
    await loadUsers()
    showUnblockModal.value = false
    selectedUser.value = null
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to unblock user')
  } finally {
    blocking.value = false
  }
}

async function confirmDelete(password) {
  if (!selectedUser.value) return
  deleting.value = true
  try {
    await api.delete(`/users/${selectedUser.value.id}`, {
      data: { password },
    })
    await loadUsers()
    showDeleteModal.value = false
    selectedUser.value = null
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete user')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-12" style="background: var(--color-background);">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
          Manage Users
        </h1>
        <p class="mt-2 opacity-75" style="color: var(--color-text-dark);">Registered users and access control.</p>
      </div>
      <router-link
        to="/admin/users/new"
        class="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
      >
        <UserPlus class="h-4 w-4" stroke-width="1.5" />
        Create User
      </router-link>
    </div>
    <div v-if="loading" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">Loading…</div>
    <div v-else class="card mt-10 overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <table class="w-full text-left">
        <thead class="border-b border-black/10" style="background: var(--color-background);">
          <tr>
            <th class="px-6 py-4 font-medium" style="color: var(--color-text-dark);">Email</th>
            <th class="px-6 py-4 font-medium" style="color: var(--color-text-dark);">Name</th>
            <th class="px-6 py-4 font-medium" style="color: var(--color-text-dark);">Role</th>
            <th class="px-6 py-4 font-medium" style="color: var(--color-text-dark);">Status</th>
            <th class="px-6 py-4 font-medium" style="color: var(--color-text-dark);">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-black/5 dark:border-white/10">
            <td class="px-6 py-4" style="color: var(--color-text-dark);">{{ u.email }}</td>
            <td class="px-6 py-4" style="color: var(--color-text-dark);">{{ u.name }}</td>
            <td class="px-6 py-4">
              <span class="rounded-full px-3 py-1 text-sm font-medium" style="background: rgba(47, 107, 79, 0.15); color: var(--color-forest);">{{ u.role }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <span
                  v-if="u.isBlocked"
                  class="rounded-full px-3 py-1 text-sm font-medium"
                  style="background: rgba(185, 28, 28, 0.15); color: #b91c1c;"
                >
                  Blocked
                </span>
                <span
                  v-else
                  class="rounded-full px-3 py-1 text-sm font-medium"
                  style="background: rgba(47, 107, 79, 0.15); color: var(--color-forest);"
                >
                  Active
                </span>
                <span
                  v-if="u.isBlocked && u.blockedReason"
                  class="text-xs opacity-75"
                  style="color: var(--color-text-muted);"
                  :title="u.blockedReason"
                >
                  Reason: {{ u.blockedReason }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  v-if="!u.isBlocked"
                  type="button"
                  class="rounded-lg p-2 transition-opacity hover:opacity-90"
                  style="color: #dc2626;"
                  title="Block user"
                  @click="openBlockModal(u)"
                >
                  <Ban class="h-4 w-4" stroke-width="1.5" />
                </button>
                <button
                  v-else
                  type="button"
                  class="rounded-lg p-2 transition-opacity hover:opacity-90"
                  style="color: var(--color-forest);"
                  title="Unblock user"
                  @click="openUnblockModal(u)"
                >
                  <Unlock class="h-4 w-4" stroke-width="1.5" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style="color: #b91c1c;"
                  title="Delete user"
                  :disabled="deleting"
                  @click="openDeleteModal(u)"
                >
                  <Trash2 class="h-4 w-4" stroke-width="1.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Block Modal -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showBlockModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0, 0, 0, 0.5);"
        @click.self="cancelBlock"
      >
        <div
          class="card w-full max-w-md rounded-2xl border border-[var(--color-border)] p-6"
          style="background: var(--color-card-bg);"
        >
          <h3 class="font-semibold" style="color: var(--color-text-dark);">Block User</h3>
          <p class="mt-2 text-sm" style="color: var(--color-text-muted);">
            Blocking <strong style="color: var(--color-text-dark);">{{ selectedUser?.email }}</strong> will prevent them from logging in or registering again.
          </p>
          <div class="mt-4">
            <label class="mb-2 block text-sm font-medium" style="color: var(--color-text-dark);">
              Reason for blocking (optional)
            </label>
            <textarea
              v-model="blockReason"
              class="input-focus w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              style="color: var(--color-text);"
              rows="3"
              placeholder="Enter reason for blocking this user..."
            />
          </div>
          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-full border px-4 py-2.5 font-medium transition-opacity hover:opacity-90"
              style="border-color: var(--color-border); color: var(--color-text);"
              @click="cancelBlock"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 rounded-full px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style="background: #dc2626;"
              :disabled="blocking"
              @click="confirmBlock"
            >
              {{ blocking ? 'Blocking…' : 'Block User' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Unblock Modal -->
    <ConfirmModal
      :show="showUnblockModal"
      title="Unblock User"
      :message="`Are you sure you want to unblock ${selectedUser?.email}? They will be able to log in and register again.`"
      confirm-text="Unblock"
      cancel-text="Cancel"
      @confirm="confirmUnblock"
      @cancel="cancelUnblock"
    />

    <!-- Delete Modal -->
    <PasswordConfirmModal
      :show="showDeleteModal"
      title="Delete User"
      :message="`Are you sure you want to permanently delete ${selectedUser?.email}? This action cannot be undone. Please enter your password to confirm.`"
      confirm-text="Delete User"
      cancel-text="Cancel"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

