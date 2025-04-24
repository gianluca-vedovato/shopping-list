<template>
  <Card class="shopping-list-container">
    <!-- Add new item form -->
    <template #header>
      <div class="add-item-form">
        <form @submit.prevent="addNewItem" class="p-inputgroup">
          <InputText 
            v-model="newItemName" 
            placeholder="Aggiungi un prodotto..." 
            :disabled="isAdding"
            class="p-inputtext-lg"
          />
          <Button 
            type="submit" 
            icon="pi pi-plus" 
            severity="secondary" 
            :loading="isAdding"
          />
        </form>
      </div>
    </template>
    
    <!-- Content area -->
    <template #content>
      <!-- Loading and error states -->
      <div v-if="shoppingList.loading" class="loading-container">
        <ProgressSpinner />
      </div>
      
      <Message v-if="shoppingList.error" severity="error" :closable="false">
        {{ shoppingList.error }}
      </Message>
      
      <!-- Active items section -->
      <div v-if="!shoppingList.loading" class="mb-4">
        <div class="section-header">
          <h2>Da comprare</h2>
          <Badge :value="shoppingList.activeItems.length" severity="success" />
        </div>
        
        <div v-if="shoppingList.activeItems.length > 0" class="item-list">
          <div 
            v-for="item in shoppingList.activeItems" 
            :key="item._id"
            class="item-card"
          >
            <div class="item-content">
              <Checkbox 
                :modelValue="item.completed" 
                @update:modelValue="toggleItem(item)"
                :binary="true"
              />
              
              <div class="item-details">
                <p class="item-name">{{ item.name }}</p>
                <Badge :value="item.source" :severity="getSourceSeverity(item.source)" />
              </div>
            </div>
            
            <Button 
              @click="deleteItem(item._id)" 
              icon="pi pi-trash" 
              severity="danger" 
              text 
              rounded 
              aria-label="Delete"
            />
          </div>
        </div>
        
        <div 
          v-else 
          class="empty-list"
        >
          <i class="pi pi-shopping-cart empty-icon"></i>
          <p>La tua lista è vuota. Aggiungi qualcosa!</p>
          <p class="empty-hint">Puoi anche usare Telegram o Google Home</p>
        </div>
      </div>
      
      <!-- Completed items section -->
      <div v-if="hasCompletedItems && !shoppingList.loading">
        <Divider />
        <div class="section-header">
          <h2>Completati</h2>
          <Badge :value="shoppingList.completedItems.length" severity="secondary" />
        </div>
        
        <div class="item-list completed-list">
          <div 
            v-for="item in shoppingList.completedItems" 
            :key="item._id"
            class="item-card completed"
          >
            <div class="item-content">
              <Checkbox 
                :modelValue="item.completed" 
                @update:modelValue="toggleItem(item)"
                :binary="true"
              />
              
              <div class="item-details">
                <p class="item-name completed">{{ item.name }}</p>
                <Badge :value="item.source" :severity="getSourceSeverity(item.source)" />
              </div>
            </div>
            
            <Button 
              @click="deleteItem(item._id)" 
              icon="pi pi-trash" 
              severity="danger" 
              text 
              rounded 
              aria-label="Delete"
            />
          </div>
        </div>
        
        <div class="mt-3">
          <Button 
            @click="clearCompleted" 
            icon="pi pi-trash" 
            label="Cancella completati" 
            severity="secondary" 
            outlined 
            class="w-full"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useShoppingListStore } from '../stores/shoppingList'

// Import PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Divider from 'primevue/divider'

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

// Helper function to get source badge severity
const getSourceSeverity = (source) => {
  switch (source) {
    case 'web':
      return 'info'
    case 'telegram':
      return 'primary'
    case 'telegram-voice':
      return 'help'
    case 'google-home':
      return 'warning'
    default:
      return 'secondary'
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
