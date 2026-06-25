<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal-box max-w-sm animate-bounce-in p-6">
      <div class="flex flex-col items-center text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 class="font-display font-bold text-lg mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
      </div>
      <div class="flex gap-3 mt-6">
        <button @click="$emit('cancel')" class="btn-ghost flex-1">Cancel</button>
        <button @click="$emit('confirm')" :class="['flex-1 px-4 py-2.5 rounded-full font-semibold text-sm transition-all', confirmClass || 'bg-red-500 hover:bg-red-600 text-white']">
          {{ confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String,
  confirmText: String,
  confirmClass: String,
})
defineEmits(['confirm', 'cancel'])
</script>
