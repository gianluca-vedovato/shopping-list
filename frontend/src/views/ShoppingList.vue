<template>
  <div class="shopping-list-container">
    <h1>Shopping List</h1>
    
    <!-- Add new item form -->
    <form @submit.prevent="addNewItem" class="add-item-form">
      <input 
        v-model="newItemName" 
        type="text" 
        placeholder="Add an item..." 
        required
        class="item-input"
      />
      <button type="submit" class="add-button">Add</button>
    </form>
    
    <!-- Loading and error states -->
    <div v-if="shoppingList.loading" class="loading">Loading...</div>
    <div v-if="shoppingList.error" class="error">{{ shoppingList.error }}</div>
    
    <!-- Active items section -->
    <div class="items-section">
      <h2>Items to Buy ({{ shoppingList.activeItems.length }})</h2>
      <ul v-if="shoppingList.activeItems.length > 0" class="items-list">
        <li v-for="item in shoppingList.activeItems" :key="item._id" class="item">
          <div class="item-content">
            <input 
              type="checkbox" 
              :checked="item.completed" 
              @change="toggleItem(item)"
              class="item-checkbox"
            />
            <span class="item-name">{{ item.name }}</span>
            <span class="item-source" :class="item.source">{{ item.source }}</span>
          </div>
          <div class="item-actions">
            <button @click="deleteItem(item._id)" class="delete-button">Delete</button>
          </div>
        </li>
      </ul>
      <p v-else class="empty-message">No items in your shopping list. Add some items above!</p>
    </div>
    
    <!-- Completed items section -->
    <div v-if="shoppingList.completedItems.length > 0" class="items-section completed-section">
      <h2>Completed Items ({{ shoppingList.completedItems.length }})</h2>
      <ul class="items-list completed-list">
        <li v-for="item in shoppingList.completedItems" :key="item._id" class="item completed">
          <div class="item-content">
            <input 
              type="checkbox" 
              :checked="item.completed" 
              @change="toggleItem(item)"
              class="item-checkbox"
            />
            <span class="item-name">{{ item.name }}</span>
            <span class="item-source" :class="item.source">{{ item.source }}</span>
          </div>
          <div class="item-actions">
            <button @click="deleteItem(item._id)" class="delete-button">Delete</button>
          </div>
        </li>
      </ul>
      <button 
        v-if="shoppingList.completedItems.length > 0" 
        @click="clearCompleted" 
        class="clear-button"
      >
        Clear Completed
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShoppingListStore } from '../stores/shoppingList'

// Initialize the store
const shoppingList = useShoppingListStore()

// Local state
const newItemName = ref('')

// Fetch items when component mounts
onMounted(() => {
  shoppingList.fetchItems()
})

// Methods
const addNewItem = () => {
  if (newItemName.value.trim()) {
    shoppingList.addItem(newItemName.value.trim())
    newItemName.value = '' // Clear input after adding
  }
}

const toggleItem = (item) => {
  shoppingList.toggleItemStatus(item)
}

const deleteItem = (itemId) => {
  if (confirm('Are you sure you want to delete this item?')) {
    shoppingList.deleteItem(itemId)
  }
}

const clearCompleted = () => {
  if (confirm('Are you sure you want to clear all completed items?')) {
    shoppingList.clearCompletedItems()
  }
}
</script>

<style scoped>
.shopping-list-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

h2 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin: 15px 0;
}

.add-item-form {
  display: flex;
  margin-bottom: 20px;
}

.item-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.add-button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.add-button:hover {
  background-color: #3aa876;
}

.items-list {
  list-style: none;
  padding: 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.item:hover {
  background-color: #f0f0f0;
}

.item.completed {
  background-color: #f0f0f0;
  opacity: 0.8;
}

.item-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-checkbox {
  margin-right: 10px;
}

.item-name {
  flex: 1;
}

.completed .item-name {
  text-decoration: line-through;
  color: #888;
}

.item-source {
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 10px;
  background-color: #e0e0e0;
}

.item-source.telegram {
  background-color: #0088cc;
  color: white;
}

.item-source.google-home {
  background-color: #4285F4;
  color: white;
}

.item-actions {
  display: flex;
}

.delete-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  background-color: #ff5252;
}

.clear-button {
  background-color: #7f8c8d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 14px;
}

.clear-button:hover {
  background-color: #6c7a7d;
}

.loading, .error, .empty-message {
  text-align: center;
  padding: 15px;
  margin: 10px 0;
}

.loading {
  color: #3498db;
}

.error {
  color: #e74c3c;
  background-color: #fadbd8;
  border-radius: 4px;
}

.empty-message {
  color: #7f8c8d;
  font-style: italic;
}

/* Mobile-friendly styles */
@media (max-width: 480px) {
  .shopping-list-container {
    padding: 10px;
  }
  
  .item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>
