<template>
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
    <!-- Add new item form with sleek design -->
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>
    </div>
    
    <!-- Content area with modern spacing and design -->
    <div class="p-4">
      <!-- Loading state with subtle animation -->
      <div v-if="shoppingList.loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
      
      <!-- Error message with clean design -->
      <div v-if="shoppingList.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-red-700">{{ shoppingList.error }}</p>
        </div>
      </div>
      
      <!-- Active items section with clean typography -->
      <div v-if="!shoppingList.loading" class="mb-6">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-medium text-gray-900">Da comprare</h2>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
            {{ shoppingList.activeItems.length }}
          </span>
        </div>
        
        <ul 
          v-if="shoppingList.activeItems.length > 0" 
          class="space-y-2"
        >
          <li 
            v-for="item in shoppingList.activeItems" 
            :key="item._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <button 
                @click="toggleItem(item)"
                class="flex-shrink-0 h-5 w-5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                :class="{ 'bg-primary-500 border-primary-500': item.completed }"
              >
                <svg v-if="item.completed" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        </ul>
        
        <!-- Empty state with friendly illustration -->
        <div 
          v-else 
          class="flex flex-col items-center justify-center py-8 text-center text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-sm">La tua lista è vuota. Aggiungi qualcosa!</p>
          <p class="text-xs mt-1 italic">Puoi anche usare Telegram o Google Home</p>
        </div>
      </div>
      
      <!-- Completed items section with subtle styling -->
      <div v-if="hasCompletedItems && !shoppingList.loading" class="border-t pt-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-medium text-gray-700">Completati</h2>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {{ shoppingList.completedItems.length }}
          </span>
        </div>
        
        <ul 
          class="space-y-2 mb-4"
        >
          <li 
            v-for="item in shoppingList.completedItems" 
            :key="item._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-70 hover:opacity-100 transition-all duration-150"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <button 
                @click="toggleItem(item)"
                class="flex-shrink-0 h-5 w-5 rounded border border-gray-300 bg-primary-500 border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        </ul>
        
        <!-- Clean, minimal clear button -->
        <button 
          @click="clearCompleted" 
          class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Cancella completati
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useShoppingListStore } from '../stores/shoppingList'

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
const addNewItem = async () => {
  if (!newItemName.value.trim()) return
  
  try {
    isAdding.value = true
    await shoppingList.addItem(newItemName.value)
    newItemName.value = ''
  } catch (error) {
    console.error('Failed to add item:', error)
  } finally {
    isAdding.value = false
  }
}

const toggleItem = async (item) => {
  try {
    await shoppingList.toggleItemStatus(item)
  } catch (error) {
    console.error('Failed to toggle item:', error)
  }
}

const deleteItem = async (itemId) => {
  try {
    await shoppingList.deleteItem(itemId)
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}

const clearCompleted = async () => {
  try {
    await shoppingList.clearCompletedItems()
  } catch (error) {
    console.error('Failed to clear completed items:', error)
  }
}

// Helper function to get source badge color
const getSourceColor = (source) => {
  switch (source) {
    case 'web':
      return 'bg-blue-100 text-blue-800'
    case 'telegram':
      return 'bg-indigo-100 text-indigo-800'
    case 'telegram-voice':
      return 'bg-purple-100 text-purple-800'
    case 'google-home':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<style scoped>
.shopping-list-container {
  max-width: 600px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.add-item-form {
  background: linear-gradient(to right, var(--green-600), var(--green-500));
  padding: 1rem;
  border-radius: 6px 6px 0 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.item-card.completed {
  opacity: 0.7;
}

.item-card.completed:hover {
  opacity: 0.9;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-name.completed {
  text-decoration: line-through;
  color: var(--text-color-secondary);
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-hint {
  font-size: 0.875rem;
  font-style: italic;
  margin-top: 0.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.completed-list .item-card {
  background-color: var(--surface-ground);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .shopping-list-container {
    margin: 0;
    height: 100%;
  }
  
  .item-name {
    font-size: 0.875rem;
  }
}

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
