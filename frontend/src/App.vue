<script setup>
// App.vue is the main component that contains the router view
</script>

<template>
  <div class="app">
    <header>
      <h1>Shopping List</h1>
    </header>
    
    <main>
      <!-- Router view will display the current route component -->
      <router-view />
    </main>
    
    <footer>
      <p>Shopping List App © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style>
/* Global styles */
:root {
  --primary-color: #42b983;
  --secondary-color: #35495e;
  --accent-color: #ff7e67;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --gray-color: #6c757d;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--dark-color);
  background-color: var(--light-color);
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

main {
  flex: 1;
  padding: 1rem;
}

footer {
  background-color: var(--secondary-color);
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
}

button {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* For mobile devices */
@media (max-width: 768px) {
  header h1 {
    font-size: 1.5rem;
  }
  
  main {
    padding: 0.5rem;
  }
}

/* For PWA support - make it feel more like a native app */
@media (display-mode: standalone) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
</style>
