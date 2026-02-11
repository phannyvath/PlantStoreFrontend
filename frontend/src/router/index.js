import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Landing.vue'), meta: { title: 'Forest Plant Store' } },
  { path: '/about', name: 'about', component: () => import('../views/About.vue'), meta: { title: 'About' } },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { title: 'Login' } },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue'), meta: { title: 'Register' } },
  { path: '/plants', name: 'plants', component: () => import('../views/Plants.vue'), meta: { title: 'Our Plants', requiresAuth: true } },
  { path: '/plants/:id', name: 'plant-detail', component: () => import('../views/PlantDetail.vue'), meta: { title: 'Plant Details', requiresAuth: true } },
  { path: '/checkout', name: 'checkout', component: () => import('../views/Checkout.vue'), meta: { title: 'Checkout', requiresAuth: true } },
  { path: '/orders', name: 'orders', component: () => import('../views/Orders.vue'), meta: { title: 'My Orders', requiresAuth: true } },
  { path: '/orders/:id/edit', name: 'order-edit', component: () => import('../views/OrderEdit.vue'), meta: { title: 'Edit Order', requiresAuth: true } },
  { path: '/admin', name: 'admin', component: () => import('../views/admin/Dashboard.vue'), meta: { title: 'Dashboard', requiresAuth: true, admin: true } },
  { path: '/admin/plants', name: 'admin-plants', component: () => import('../views/admin/PlantsAdmin.vue'), meta: { title: 'Manage Plants', requiresAuth: true, admin: true } },
  { path: '/admin/plants/new', name: 'admin-plant-new', component: () => import('../views/admin/AdminPlantNew.vue'), meta: { title: 'Add Plant', requiresAuth: true, admin: true } },
  { path: '/admin/plants/:id', name: 'admin-plant-edit', component: () => import('../views/admin/AdminPlantEdit.vue'), meta: { title: 'Edit Plant', requiresAuth: true, admin: true } },
  { path: '/admin/orders', name: 'admin-orders', component: () => import('../views/admin/OrdersAdmin.vue'), meta: { title: 'Manage Orders', requiresAuth: true, admin: true } },
  { path: '/admin/users', name: 'admin-users', component: () => import('../views/admin/UsersAdmin.vue'), meta: { title: 'Manage Users', requiresAuth: true, admin: true } },
  { path: '/admin/users/new', name: 'admin-user-new', component: () => import('../views/admin/AdminUserNew.vue'), meta: { title: 'Create User', requiresAuth: true, admin: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} — Forest Plant Store` : 'Forest Plant Store'
  const auth = useAuthStore()
  
  // If route requires authentication and user is not logged in, redirect to login
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  
  // If route requires admin and user is not admin, redirect to home
  if (to.meta.admin && !auth.isAdmin) {
    return next({ name: 'home' })
  }
  
  // If user is already logged in and tries to access login/register, redirect to home
  if (auth.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return next({ name: 'home' })
  }
  
  next()
})

export default router
