<template>
  <div class="max-w-md mx-auto overflow-hidden md:max-w-xl" style="background-color: var(--color-surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);">
    <!-- Modern header with gradient background -->
    <div class="p-5" style="background: linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-600));">
      <h1 class="text-xl font-bold text-white mb-4">Lista della Spesa</h1>
      <form @submit.prevent="addNewItem" class="flex items-center gap-2">
        <div class="relative flex-1">
          <input 
            v-model="newItemName" 
            type="text" 
            placeholder="Aggiungi un prodotto..." 
            required
            class="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/95 placeholder-neutral-400 text-neutral-800 pr-10"
            :disabled="isAdding"
            style="box-shadow: var(--shadow-sm);"
          />
          <div v-if="isAdding" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="w-5 h-5 border-2 rounded-full animate-spin" style="border-color: var(--color-primary-400); border-top-color: transparent;"></div>
          </div>
        </div>
        <button 
          type="submit" 
          class="p-3 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 disabled:opacity-50 flex-shrink-0"
          :disabled="isAdding"
          style="backdrop-filter: blur(4px); box-shadow: var(--shadow-sm);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>
    </div>
    
    <!-- Content area with modern spacing and design -->
    <div class="p-5" style="background-color: var(--color-surface);">
      <!-- Loading state with modern spinner -->
      <div v-if="shoppingList.loading && !shoppingList.items.length" class="flex justify-center items-center py-10">
        <div class="relative h-12 w-12">
          <div class="absolute top-0 left-0 right-0 bottom-0 animate-ping opacity-75 rounded-full" style="background-color: var(--color-primary-300);"></div>
          <div class="relative rounded-full h-12 w-12 flex items-center justify-center" style="background-color: var(--color-primary-500);">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Error message with modern design -->
      <div v-if="shoppingList.error" class="mb-6 p-4 rounded-lg" style="background-color: var(--color-error-50); border-left: 4px solid var(--color-error-500);">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor" style="color: var(--color-error-500);">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p style="color: var(--color-error-600);">{{ shoppingList.error }}</p>
        </div>
      </div>
      
      <!-- Active items section with modern Material Design styling -->
      <div v-if="!shoppingList.loading || shoppingList.items.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium" style="color: var(--color-neutral-800);">Da comprare</h2>
          <span class="px-3 py-1 text-xs font-medium" 
            style="border-radius: var(--radius-full); background-color: var(--color-primary-100); color: var(--color-primary-700);">
            {{ shoppingList.activeItems.length }}
          </span>
        </div>
        
        <ul 
          v-if="shoppingList.activeItems.length > 0" 
          class="space-y-3"
        >
          <li 
            v-for="item in shoppingList.activeItems" 
            :key="item._id"
            class="group flex items-center justify-between p-4 transition-all duration-200" 
            style="background-color: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--color-neutral-200);"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <button 
                @click="toggleItem(item)"
                class="relative flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200" 
                :style="{ 
                  'background-color': item.completed ? 'var(--color-primary-500)' : 'white',
                  'border': item.completed ? 'none' : '2px solid var(--color-neutral-300)',
                  'box-shadow': item.completed ? 'var(--shadow-sm)' : 'none',
                  'focus:ring-color': 'var(--color-primary-400)'
                }"
              >
                <svg v-if="item.completed" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="absolute inset-0 rounded-full transform scale-0 group-hover:scale-90 transition-transform duration-200" style="background-color: var(--color-primary-100);"></span>
              </button>
              
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate" style="color: var(--color-neutral-900);">{{ item.name }}</p>
                <div class="flex items-center mt-1 gap-2">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
                    :style="{
                      'border-radius': 'var(--radius-md)',
                      'background-color': getSourceBgColor(item.source),
                      'color': getSourceTextColor(item.source)
                    }"
                  >
                    {{ item.source }}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              @click="deleteItem(item._id)" 
              class="ml-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              style="border-radius: var(--radius-full); color: var(--color-neutral-400);"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </li>
        </ul>
        
        <!-- Empty state with modern illustration -->
        <div 
          v-else 
          class="flex flex-col items-center justify-center py-10 text-center"
        >
          <div class="relative w-20 h-20 mb-4">
            <div class="absolute inset-0 rounded-full opacity-20" style="background-color: var(--color-primary-300);"></div>
            <div class="absolute inset-2 rounded-full opacity-40" style="background-color: var(--color-primary-400);"></div>
            <div class="absolute inset-4 rounded-full flex items-center justify-center" style="background-color: var(--color-primary-500);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-medium mb-1" style="color: var(--color-neutral-700);">Lista vuota</h3>
          <p class="text-sm" style="color: var(--color-neutral-500);">Aggiungi qualcosa per iniziare la tua lista della spesa</p>
          <p class="text-xs mt-3 px-4 py-2 rounded-full" style="background-color: var(--color-neutral-100); color: var(--color-neutral-500);">Puoi anche usare Telegram o Google Home</p>
        </div>
      </div>
      
      <!-- Completed items section with modern styling -->
      <div v-if="hasCompletedItems && !shoppingList.loading" class="pt-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium" style="color: var(--color-neutral-700);">Completati</h2>
          <span class="px-3 py-1 text-xs font-medium" 
            style="border-radius: var(--radius-full); background-color: var(--color-neutral-100); color: var(--color-neutral-600);">
            {{ shoppingList.completedItems.length }}
          </span>
        </div>
        
        <ul class="space-y-3 mb-5">
          <li 
            v-for="item in shoppingList.completedItems" 
            :key="item._id"
            class="group flex items-center justify-between p-4 transition-all duration-200" 
            style="background-color: var(--color-neutral-50); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--color-neutral-200); opacity: 0.8;"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <button 
                @click="toggleItem(item)"
                class="relative flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200" 
                style="background-color: var(--color-success-500); border: none; box-shadow: var(--shadow-sm);"
              >
                <svg class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate line-through" style="color: var(--color-neutral-500);">{{ item.name }}</p>
                <div class="flex items-center mt-1 gap-2">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
                    :style="{
                      'border-radius': 'var(--radius-md)',
                      'background-color': getSourceBgColor(item.source),
                      'color': getSourceTextColor(item.source),
                      'opacity': '0.7'
                    }"
                  >
                    {{ item.source }}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              @click="deleteItem(item._id)" 
              class="ml-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              style="border-radius: var(--radius-full); color: var(--color-neutral-400);"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </li>
        </ul>
        
        <!-- Modern clear button with hover effect -->
        <button 
          @click="clearCompleted" 
          class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style="background-color: var(--color-neutral-100); color: var(--color-neutral-700); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
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

// Helper functions for source badge colors
const getSourceBgColor = (source) => {
  switch (source) {
    case 'web':
      return '#dbeafe' // blue-100
    case 'telegram':
      return '#e0e7ff' // indigo-100
    case 'telegram-voice':
      return '#f3e8ff' // purple-100
    case 'google-home':
      return '#ffedd5' // orange-100
    default:
      return '#f3f4f6' // gray-100
  }
}

const getSourceTextColor = (source) => {
  switch (source) {
    case 'web':
      return '#1e40af' // blue-800
    case 'telegram':
      return '#3730a3' // indigo-800
    case 'telegram-voice':
      return '#6b21a8' // purple-800
    case 'google-home':
      return '#9a3412' // orange-800
    default:
      return '#1f2937' // gray-800
  }
}

// Backward compatibility for getSourceColor function
const getSourceColor = (source) => {
  // This function is kept for backward compatibility
  // It returns an empty string as we're now using inline styles instead of classes
  return ''
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
