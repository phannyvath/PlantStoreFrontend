import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => {
    let items = []
    try {
      const raw = localStorage.getItem('cart')
      items = raw ? JSON.parse(raw) : []
    } catch {
      items = []
    }
    return { items }
  },
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    total: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },
  actions: {
    addItem(plantId, plantName, price, quantity = 1) {
      const existing = this.items.findIndex((i) => i.plantId === plantId)
      if (existing >= 0) {
        this.items[existing].quantity += quantity
      } else {
        this.items.push({ plantId, name: plantName, price, quantity })
      }
      this.save()
    },
    removeItem(plantId) {
      this.items = this.items.filter((i) => i.plantId !== plantId)
      this.save()
    },
    updateQuantity(plantId, quantity) {
      const item = this.items.find((i) => i.plantId === plantId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(plantId)
        } else {
          item.quantity = quantity
          this.save()
        }
      }
    },
    clear() {
      this.items = []
      this.save()
    },
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
  },
})
