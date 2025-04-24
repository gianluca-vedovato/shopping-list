import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
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
  .use(PrimeVue, { ripple: true })
  .mount('#app')
