<template>
  <div class="h-full bg-[var(--bg)] text-[var(--text-primary)]">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- PWA Install Banner -->
    <div
      v-if="showInstallBanner"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 
             bg-white dark:bg-gray-800 rounded-2xl shadow-float p-4 
             border border-gray-100 dark:border-gray-700 z-50 animate-slide-up"
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 gradient-header rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm">Install ChatApp</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add to home screen for the best experience</p>
        </div>
        <button @click="showInstallBanner = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="installPWA" class="btn-primary flex-1 text-sm py-2">Install</button>
        <button @click="showInstallBanner = false" class="btn-ghost text-sm">Later</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { initEcho } from '@/services/echo'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const showInstallBanner = ref(false)
let deferredPrompt = null

onMounted(() => {
  // Initialize echo if authenticated
  if (authStore.isAuthenticated) {
    initEcho()
  }

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    // Show banner after 3 seconds
    setTimeout(() => {
      if (!localStorage.getItem('pwa_dismissed')) {
        showInstallBanner.value = true
      }
    }, 3000)
  })
})

async function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true')
    } else {
      localStorage.setItem('pwa_dismissed', 'true')
    }
    showInstallBanner.value = false
    deferredPrompt = null
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
