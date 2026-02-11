<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, UserCheck, UserX, Clock, CheckCircle, Truck, Ban } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const stats = ref({
  totalSales: 0,
  totalRevenue: 0,
  ordersPending: 0,
  ordersConfirmed: 0,
  ordersShipped: 0,
  ordersDelivered: 0,
  totalUsers: 0,
  adminUsers: 0,
  clientUsers: 0,
  blockedUsers: 0,
  totalPlants: 0,
  recentOrders: 0,
})
const loading = ref(true)

onMounted(async () => {
  // Protect route at component level
  if (!auth.isLoggedIn || !auth.isAdmin) {
    router.push({ name: 'home' })
    return
  }
  
  try {
    const { data } = await api.get('/dashboard/stats')
    stats.value = data.data || stats.value
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12" style="background: var(--color-background);">
    <h1 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
      Admin Dashboard
    </h1>
    <p class="mt-2 opacity-75" style="color: var(--color-text-dark);">
      Complete overview of your plant store operations.
    </p>

    <div v-if="loading" class="mt-12 text-center opacity-75" style="color: var(--color-text-dark);">Loading…</div>

    <div v-else class="mt-12 space-y-8">
      <!-- Sales & Revenue Section -->
      <div>
        <h2 class="mb-4 text-lg font-semibold" style="color: var(--color-text-dark);">Sales & Revenue</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <router-link
            to="/admin/orders"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Total Sales</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.totalSales }}</p>
                <p class="mt-1 text-xs opacity-75" style="color: var(--color-dashboard-text);">All orders</p>
              </div>
              <ShoppingCart class="h-8 w-8 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
            </div>
          </router-link>
          <div class="dashboard-card rounded-2xl p-6 transition-all duration-300">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Total Revenue</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">${{ stats.totalRevenue.toFixed(2) }}</p>
                <p class="mt-1 text-xs opacity-75" style="color: var(--color-dashboard-text);">Total earnings</p>
              </div>
              <DollarSign class="h-8 w-8 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
            </div>
          </div>
          <div class="dashboard-card rounded-2xl p-6 transition-all duration-300">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Recent Orders</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.recentOrders }}</p>
                <p class="mt-1 text-xs opacity-75" style="color: var(--color-dashboard-text);">Last 7 days</p>
              </div>
              <TrendingUp class="h-8 w-8 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
            </div>
          </div>
        </div>
      </div>

      <!-- Order Status Section -->
      <div>
        <h2 class="mb-4 text-lg font-semibold" style="color: var(--color-text-dark);">Order Status</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <router-link
            to="/admin/orders"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Pending</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.ordersPending }}</p>
              </div>
              <Clock class="h-6 w-6 opacity-50" style="color: var(--color-soil);" stroke-width="1.5" />
            </div>
          </router-link>
          <router-link
            to="/admin/orders"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Confirmed</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.ordersConfirmed }}</p>
              </div>
              <CheckCircle class="h-6 w-6 opacity-50" style="color: var(--color-accent);" stroke-width="1.5" />
            </div>
          </router-link>
          <router-link
            to="/admin/orders"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Shipped</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.ordersShipped }}</p>
              </div>
              <Truck class="h-6 w-6 opacity-50" style="color: var(--color-accent);" stroke-width="1.5" />
            </div>
          </router-link>
          <router-link
            to="/admin/orders"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Delivered</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.ordersDelivered }}</p>
              </div>
              <Package class="h-6 w-6 opacity-50" style="color: var(--color-forest);" stroke-width="1.5" />
            </div>
          </router-link>
        </div>
      </div>

      <!-- Users & Products Section -->
      <div>
        <h2 class="mb-4 text-lg font-semibold" style="color: var(--color-text-dark);">Users & Products</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <router-link
            to="/admin/users"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Total Users</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.totalUsers }}</p>
              </div>
              <Users class="h-6 w-6 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
            </div>
          </router-link>
          <router-link
            to="/admin/users"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Admins</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.adminUsers }}</p>
              </div>
              <UserCheck class="h-6 w-6 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
            </div>
          </router-link>
          <router-link
            to="/admin/users"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Clients</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.clientUsers }}</p>
              </div>
              <Users class="h-6 w-6 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
            </div>
          </router-link>
          <router-link
            to="/admin/users"
            class="dashboard-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Blocked</h3>
                <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.blockedUsers }}</p>
              </div>
              <Ban class="h-6 w-6 opacity-50" style="color: #b91c1c;" stroke-width="1.5" />
            </div>
          </router-link>
        </div>
      </div>

      <!-- Products Section -->
      <div>
        <router-link
          to="/admin/plants"
          class="dashboard-card block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium opacity-75" style="color: var(--color-dashboard-text);">Total Plants</h3>
              <p class="mt-2 text-3xl font-semibold" style="color: var(--color-dashboard-text);">{{ stats.totalPlants }}</p>
              <p class="mt-1 text-xs opacity-75" style="color: var(--color-dashboard-text);">Manage catalog</p>
            </div>
            <Package class="h-8 w-8 opacity-50" style="color: var(--color-dashboard-title);" stroke-width="1.5" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
