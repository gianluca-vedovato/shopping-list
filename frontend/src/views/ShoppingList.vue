<template>
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
    <!-- Add new item form -->
    <div class="p-4 bg-gradient-to-r from-primary-500 to-primary-600 shadow-inner">
      <form @submit.prevent="addNewItem" class="flex items-center space-x-2">
        <input 
          v-model="newItemName" 
          type="text" 
          placeholder="Aggiungi un prodotto..." 
          required
          class="flex-1 px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-white/50 bg-white/90 placeholder-gray-500 text-gray-900"
          :disabled="isAdding"
        />
        <button 
          type="submit" 
          class="inline-flex items-center justify-center p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 disabled:opacity-50"
          :disabled="isAdding"
        >
          <PlusIcon class="h-6 w-6" />
        </button>
      </form>
    </div>
    
    <!-- Content area -->
    <div class="p-4">
      <!-- Loading and error states -->
      <div v-if="shoppingList.loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
      
      <div v-if="shoppingList.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
        <div class="flex items-center">
          <XMarkIcon class="h-5 w-5 text-red-500 mr-2" />
          <p class="text-red-700">{{ shoppingList.error }}</p>
        </div>
      </div>
      
      <!-- Active items section -->
      <div v-if="!shoppingList.loading" class="mb-6">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-medium text-gray-900">Da comprare</h2>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
            {{ shoppingList.activeItems.length }}
          </span>
        </div>
        
        <motion.ul 
          v-if="shoppingList.activeItems.length > 0" 
          class="space-y-2"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.3 }"
        >
          <motion.li 
            v-for="item in shoppingList.activeItems" 
            :key="item._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -20 }"
            :transition="{ duration: 0.2 }"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <button 
                @click="toggleItem(item)"
                class="flex-shrink-0 h-5 w-5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                :class="{ 'bg-primary-500 border-primary-500': item.completed }"
              >
                <CheckIcon v-if="item.completed" class="h-4 w-4 text-white" />
              </button>
              
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1"
                  :class="getSourceColor(item.source)"
                >
                  {{ item.source }}
                </span>
              </div>
            </div>
            
            <button 
              @click="deleteItem(item._id)" 
              class="ml-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </motion.li>
        </motion.ul>
        
        <div 
          v-else 
          class="flex flex-col items-center justify-center py-8 text-center text-gray-500"
        >
          <p class="text-sm">La tua lista è vuota. Aggiungi qualcosa!</p>
          <p class="text-xs mt-1 italic">Puoi anche usare Telegram o Google Home</p>
        </div>
      </div>
      
      <!-- Completed items section -->
      <div v-if="hasCompletedItems && !shoppingList.loading" class="border-t pt-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-medium text-gray-700">Completati</h2>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {{ shoppingList.completedItems.length }}
          </span>
        </div>
        
        <motion.ul 
          class="space-y-2 mb-4"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.3 }"
        >
          <motion.li 
            v-for="item in shoppingList.completedItems" 
            :key="item._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-70 hover:opacity-100 transition-all duration-150"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 0.7, y: 0 }"
            :exit="{ opacity: 0, y: -20 }"
            :transition="{ duration: 0.2 }"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <button 
                @click="toggleItem(item)"
                class="flex-shrink-0 h-5 w-5 rounded border border-gray-300 bg-primary-500 border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <CheckIcon class="h-4 w-4 text-white" />
              </button>
              
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-500 line-through truncate">{{ item.name }}</p>
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 opacity-70"
                  :class="getSourceColor(item.source)"
                >
                  {{ item.source }}
                </span>
              </div>
            </div>
            
            <button 
              @click="deleteItem(item._id)" 
              class="ml-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </motion.li>
        </motion.ul>
        
        <button 
          @click="clearCompleted" 
          class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
        >
          <TrashIcon class="h-4 w-4 mr-2" />
          Cancella completati
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useShoppingListStore } from '../stores/shoppingList'
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { motion } from 'framer-motion'

// Initialize the store
const shoppingList = useShoppingListStore()

// Local state
const newItemName = ref('')
const isAdding = ref(false)

// Computed properties
const hasCompletedItems = computed(() => shoppingList.completedItems.length > 0)

// Fetch items when component mounts
onMounted(() => {
  shoppingList.fetchItems()
})

// Methods
const addNewItem = () => {
  if (newItemName.value.trim()) {
    isAdding.value = true
    shoppingList.addItem(newItemName.value.trim())
      .finally(() => {
        newItemName.value = '' // Clear input after adding
        isAdding.value = false
      })
  }
}

const toggleItem = (item) => {
  shoppingList.toggleItemStatus(item)
}

const deleteItem = (itemId) => {
  // Modern approach without confirm dialog
  shoppingList.deleteItem(itemId)
}

const clearCompleted = () => {
  // Modern approach without confirm dialog
  shoppingList.clearCompletedItems()
}

// Source badge color mapping
const getSourceColor = (source) => {
  const colors = {
    'web': 'bg-blue-100 text-blue-800',
    'telegram': 'bg-sky-100 text-sky-800',
    'telegram-voice': 'bg-purple-100 text-purple-800',
    'google-home': 'bg-red-100 text-red-800'
  }
  return colors[source] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
/* Custom animations and styles */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Fix for motion components in Vue */
motion\.ul {
  display: block;
}

motion\.li {
  display: flex;
}
</style>
