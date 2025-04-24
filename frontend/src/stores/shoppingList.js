import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  
  getters: {
    activeItems: (state) => state.items.filter(item => !item.completed),
    completedItems: (state) => state.items.filter(item => item.completed),
    totalItems: (state) => state.items.length
  },
  
  actions: {
    async fetchItems() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/items`)
        this.items = response.data
      } catch (error) {
        console.error('Error fetching items:', error)
        this.error = 'Failed to load shopping list items'
      } finally {
        this.loading = false
      }
    },
    
    async addItem(name, source = 'web') {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/items`, { name, source })
        this.items.unshift(response.data) // Add to beginning of array
      } catch (error) {
        console.error('Error adding item:', error)
        this.error = 'Failed to add item to shopping list'
      } finally {
        this.loading = false
      }
    },
    
    async toggleItemStatus(item) {
      this.loading = true
      this.error = null
      
      try {
        const updatedItem = { ...item, completed: !item.completed }
        const response = await axios.put(`${API_URL}/items/${item._id}`, updatedItem)
        
        // Update the item in the local state
        const index = this.items.findIndex(i => i._id === item._id)
        if (index !== -1) {
          this.items[index] = response.data
        }
      } catch (error) {
        console.error('Error updating item:', error)
        this.error = 'Failed to update item status'
      } finally {
        this.loading = false
      }
    },
    
    async updateItemName(item, newName) {
      this.loading = true
      this.error = null
      
      try {
        const updatedItem = { ...item, name: newName }
        const response = await axios.put(`${API_URL}/items/${item._id}`, updatedItem)
        
        // Update the item in the local state
        const index = this.items.findIndex(i => i._id === item._id)
        if (index !== -1) {
          this.items[index] = response.data
        }
      } catch (error) {
        console.error('Error updating item name:', error)
        this.error = 'Failed to update item name'
      } finally {
        this.loading = false
      }
    },
    
    async deleteItem(itemId) {
      this.loading = true
      this.error = null
      
      try {
        await axios.delete(`${API_URL}/items/${itemId}`)
        
        // Remove the item from the local state
        this.items = this.items.filter(item => item._id !== itemId)
      } catch (error) {
        console.error('Error deleting item:', error)
        this.error = 'Failed to delete item'
      } finally {
        this.loading = false
      }
    },
    
    async clearCompletedItems() {
      this.loading = true
      this.error = null
      
      try {
        const completedIds = this.items
          .filter(item => item.completed)
          .map(item => item._id)
        
        // Delete each completed item
        await Promise.all(
          completedIds.map(id => axios.delete(`${API_URL}/items/${id}`))
        )
        
        // Update the local state
        this.items = this.items.filter(item => !item.completed)
      } catch (error) {
        console.error('Error clearing completed items:', error)
        this.error = 'Failed to clear completed items'
      } finally {
        this.loading = false
      }
    }
  }
})
