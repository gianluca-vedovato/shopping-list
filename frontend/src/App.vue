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
  <div class="layout-wrapper">
    <!-- Header with gradient background -->
    <header class="app-header">
      <div class="header-content">
        <h1><i class="pi pi-shopping-cart"></i> Shopping List</h1>
        <div class="subtitle">
          Lista della Spesa
        </div>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="app-main">
      <!-- Router view will display the current route component -->
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer class="app-footer">
      <p>Shopping List App © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style>
/* Base styles */
body {
  margin: 0;
  font-family: var(--font-family);
  background-color: var(--surface-ground);
  color: var(--text-color);
}

/* Layout */
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.app-header {
  background: linear-gradient(to right, var(--green-600), var(--green-500));
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtitle {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

/* Main content */
.app-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Footer */
.app-footer {
  background-color: var(--surface-900);
  color: white;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.875rem;
}

/* PWA support */
.pwa-mode {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.25rem;
  }
  
  .app-main {
    padding: 1rem;
  }
}
</style>
