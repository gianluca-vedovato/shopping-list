<script setup>
// App.vue is the main component that contains the router view
import { onMounted } from 'vue';

// Check if the app is in standalone mode (PWA)
const isPwa = () => window.matchMedia('(display-mode: standalone)').matches;

onMounted(() => {
  // Apply safe area insets for PWA
  if (isPwa()) {
    document.body.classList.add('pwa-mode');
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header with gradient background -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 px-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold">🛒 Shopping List</h1>
        <div class="text-sm bg-white/20 px-3 py-1 rounded-full">
          Lista della Spesa
        </div>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="flex-1 container mx-auto px-4 py-6">
      <!-- Router view will display the current route component -->
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer class="bg-secondary-800 text-white text-center py-3 text-sm">
      <p>Shopping List App © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style>
/* PWA support - make it feel more like a native app */
.pwa-mode {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Custom animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}
</style>
