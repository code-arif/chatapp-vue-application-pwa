<template>
  <div class="fixed inset-0 bg-black/90 z-[60] flex flex-col" @click.self="$emit('close')">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3">
      <span class="text-white/70 text-sm truncate">{{ name || 'Media' }}</span>
      <div class="flex items-center gap-2">
        <a :href="url" download class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </a>
        <button @click="$emit('close')" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Media content -->
    <div class="flex-1 flex items-center justify-center p-4">
      <img
        v-if="type === 'image'"
        :src="url"
        :alt="name"
        class="max-w-full max-h-full object-contain rounded-lg"
        @click.stop
      />
      <video
        v-else-if="type === 'video'"
        :src="url"
        class="max-w-full max-h-full rounded-lg"
        controls
        autoplay
        @click.stop
      ></video>
      <audio
        v-else-if="type === 'audio'"
        :src="url"
        controls
        autoplay
        class="w-full max-w-md"
        @click.stop
      ></audio>
    </div>
  </div>
</template>

<script setup>
defineProps({ url: String, type: String, name: String })
defineEmits(['close'])
</script>
