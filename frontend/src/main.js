import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './tailwind.css'
import App from './App.vue'

// Import views
import ShoppingList from './views/ShoppingList.vue'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ShoppingList, name: 'home' },
  ]
})

// Create pinia instance
const pinia = createPinia()

// Create and mount the app
createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')
