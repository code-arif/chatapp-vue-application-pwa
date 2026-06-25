<template>
  <div class="min-h-screen bg-[var(--bg)]">
    <div class="gradient-header px-4 py-4 safe-top">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-white/70 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </router-link>
        <h1 class="text-white font-display font-semibold text-lg">My Profile</h1>
      </div>
    </div>
    
    <div class="max-w-lg mx-auto p-6">
      <ProfileModal @close="$router.push('/')" />
    </div>
  </div>
</template>

<script setup>
import ProfileModal from '@/components/modals/ProfileModal.vue'
</script>
