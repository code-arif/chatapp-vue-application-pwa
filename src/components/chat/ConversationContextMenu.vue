<template>
  <div
    class="context-menu"
    :style="{ top: `${y}px`, left: `${x}px`, position: 'fixed' }"
    @click.stop
  >
    <button @click="emit('action', { action: 'mute', conversation })" class="context-menu-item">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
      </svg>
      {{ conversation?.pivot?.is_muted ? 'Unmute' : 'Mute' }}
    </button>
    <button @click="emit('action', { action: 'archive', conversation })" class="context-menu-item">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
      {{ conversation?.pivot?.is_archived ? 'Unarchive' : 'Archive' }}
    </button>
    <button @click="emit('action', { action: 'leave', conversation })" class="context-menu-item text-red-500">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      {{ conversation?.is_group ? 'Leave Group' : 'Delete Chat' }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  conversation: Object,
  x: Number,
  y: Number,
})

const emit = defineEmits(['close', 'action'])
</script>
