<template>
  <div
    :class="[
      'flex mb-1 group animate-message-pop',
      isMine ? 'justify-end' : 'justify-start',
      isConsecutive ? 'mt-0.5' : 'mt-3'
    ]"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Avatar (others) -->
    <div v-if="!isMine && isGroup && !isConsecutive" class="w-8 flex-shrink-0 mr-2 self-end">
      <img :src="message.sender?.avatar" :alt="message.sender?.name" class="w-7 h-7 rounded-full object-cover" />
    </div>
    <div v-else-if="!isMine && isGroup" class="w-8 flex-shrink-0 mr-2"></div>
    
    <!-- Message content -->
    <div :class="['max-w-[75%] md:max-w-[65%] relative', isMine ? 'items-end' : 'items-start', 'flex flex-col']">
      <!-- Sender name (group chat) -->
      <p v-if="isGroup && !isMine && !isConsecutive" class="text-xs font-semibold mb-1 ml-1" :style="{ color: senderColor }">
        {{ message.sender?.name }}
      </p>
      
      <!-- Context menu trigger (hover/long press) -->
      <div
        :class="[
          'relative',
          isMine ? 'msg-bubble-out text-gray-900' : 'msg-bubble-in text-gray-900 dark:text-gray-100',
          'px-3.5 py-2.5 select-text'
        ]"
        @contextmenu.prevent="showContextMenu"
      >
        <!-- Reply preview -->
        <div v-if="message.reply_to" class="reply-preview mb-2">
          <p class="text-xs font-semibold text-primary-600 dark:text-primary-400">
            {{ message.reply_to?.sender?.name || 'Message' }}
          </p>
          <p class="text-xs opacity-70 truncate">{{ getPreview(message.reply_to) }}</p>
        </div>
        
        <!-- Image message -->
        <div v-if="message.type === 'image'" class="img-bubble -mx-0.5 -mt-0.5">
          <img
            :src="message.media_url"
            :alt="message.media_name"
            class="rounded-xl max-w-[260px] max-h-[340px] object-cover cursor-pointer block"
            loading="lazy"
            @click="$emit('view-media', { url: message.media_url, type: 'image', name: message.media_name })"
          />
          <p v-if="message.content" class="text-sm mt-2 px-0.5">{{ message.content }}</p>
        </div>
        
        <!-- Video message -->
        <div v-else-if="message.type === 'video'" class="-mx-0.5 -mt-0.5">
          <video
            :src="message.media_url"
            class="rounded-xl max-w-[260px] max-h-[340px] cursor-pointer"
            controls
            preload="metadata"
            @click.stop
          ></video>
          <p v-if="message.content" class="text-sm mt-2 px-0.5">{{ message.content }}</p>
        </div>
        
        <!-- Audio message -->
        <div v-else-if="message.type === 'audio'" class="audio-player">
          <button @click="toggleAudio" class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-white">
            <svg v-if="!playing" class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          <div class="flex-1">
            <div class="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div class="h-full bg-primary-500 rounded-full transition-all" :style="{ width: audioProgress + '%' }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ audioTime }}</p>
          </div>
        </div>
        
        <!-- File message -->
        <div v-else-if="message.type === 'file'" class="file-bubble">
          <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
            {{ getFileIcon(message.media_type) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ message.media_name }}</p>
            <p class="text-xs opacity-60 mt-0.5">{{ message.formatted_size }}</p>
          </div>
          <a :href="message.media_url" download :filename="message.media_name" class="text-primary-500 hover:text-primary-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </a>
        </div>
        
        <!-- Text message -->
        <p v-else class="text-sm leading-relaxed break-words" v-html="linkifiedContent"></p>
        
        <!-- Time & status -->
        <div class="msg-time" :class="isMine ? 'justify-end' : 'justify-start'">
          <span class="text-[10px]" :class="isMine ? 'text-gray-600/60' : 'text-gray-400'">
            {{ formatMessageTime(message.created_at) }}
          </span>
          <!-- Edited indicator -->
          <span v-if="message.is_edited" class="text-[10px] opacity-50">edited</span>
          <!-- Read receipt -->
          <template v-if="isMine">
            <svg
              v-if="isRead"
              class="w-3.5 h-3.5 text-primary-600"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </template>
        </div>
      </div>
      
      <!-- Reactions -->
      <div v-if="message.reactions && message.reactions.length > 0" class="flex flex-wrap gap-1 mt-1" :class="isMine ? 'justify-end' : 'justify-start'">
        <button
          v-for="reaction in message.reactions"
          :key="reaction.emoji"
          :class="['reaction-pill', reaction.users?.some(u => u.id === currentUserId) && 'reacted']"
          @click="$emit('react', { messageId: message.id, emoji: reaction.emoji })"
        >
          <span>{{ reaction.emoji }}</span>
          <span class="font-semibold">{{ reaction.count }}</span>
        </button>
      </div>
    </div>
    
    <!-- Quick action buttons (hover) -->
    <div
      :class="[
        'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all self-center',
        isMine ? 'order-first mr-1' : 'ml-1'
      ]"
    >
      <button @click="openEmojiReact" class="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-600 transition-all text-sm">
        😊
      </button>
      <button @click="$emit('reply', message)" class="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-600 transition-all">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
      </button>
    </div>
    
    <!-- Context menu -->
    <div
      v-if="contextMenuOpen"
      class="context-menu z-50"
      :style="contextMenuStyle"
      v-click-outside="() => contextMenuOpen = false"
    >
      <button @click="$emit('reply', message); contextMenuOpen = false" class="context-menu-item">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
        Reply
      </button>
      <button v-if="message.type === 'text' && isMine" @click="$emit('edit', message); contextMenuOpen = false" class="context-menu-item">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Edit
      </button>
      <button @click="copyMessage" class="context-menu-item">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        Copy
      </button>
      <button v-if="isMine" @click="$emit('delete', message); contextMenuOpen = false" class="context-menu-item text-red-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Delete
      </button>
      <!-- Quick reactions -->
      <div class="flex gap-2 px-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <button
          v-for="emoji in quickReactions"
          :key="emoji"
          @click="$emit('react', { messageId: message.id, emoji }); contextMenuOpen = false"
          class="text-xl hover:scale-125 transition-transform"
        >{{ emoji }}</button>
      </div>
    </div>
    
    <!-- Emoji React Popup -->
    <div v-if="emojiReactOpen" class="absolute z-50 bottom-full mb-2" :class="isMine ? 'right-0' : 'left-0'">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-float border border-gray-100 dark:border-gray-700 p-2">
        <div class="flex gap-2">
          <button
            v-for="emoji in quickReactions"
            :key="emoji"
            @click="$emit('react', { messageId: message.id, emoji }); emojiReactOpen = false"
            class="text-2xl hover:scale-125 transition-transform p-1"
          >{{ emoji }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatMessageTime, getMessagePreview, getFileIcon, linkifyText, stringToColor } from '@/utils/helpers'

const props = defineProps({
  message: Object,
  prevMessage: Object,
  isMine: Boolean,
  isGroup: Boolean,
  searchQuery: String,
})

defineEmits(['reply', 'edit', 'delete', 'react', 'view-media'])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.currentUser?.id)

const contextMenuOpen = ref(false)
const contextMenuStyle = ref({})
const emojiReactOpen = ref(false)
const playing = ref(false)
const audioProgress = ref(0)
const audioTime = ref('0:00')

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '👏']

const isConsecutive = computed(() => {
  if (!props.prevMessage) return false
  return props.prevMessage.sender_id === props.message.sender_id
    && new Date(props.message.created_at) - new Date(props.prevMessage.created_at) < 5 * 60 * 1000
})

const senderColor = computed(() => stringToColor(props.message.sender?.name || ''))

const isRead = computed(() => {
  return props.message.read_by && props.message.read_by.length > 0
})

const linkifiedContent = computed(() => {
  let text = linkifyText(props.message.content || '')
  if (props.searchQuery) {
    const regex = new RegExp(`(${props.searchQuery})`, 'gi')
    text = text.replace(regex, '<mark class="highlight">$1</mark>')
  }
  return text
})

function getPreview(msg) {
  return getMessagePreview(msg)
}

function showContextMenu(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  contextMenuStyle.value = {
    top: `${e.clientY}px`,
    left: `${Math.min(e.clientX, window.innerWidth - 200)}px`,
    position: 'fixed',
  }
  contextMenuOpen.value = true
}

function openEmojiReact() {
  emojiReactOpen.value = !emojiReactOpen.value
}

function copyMessage() {
  if (props.message.content) {
    navigator.clipboard.writeText(props.message.content)
  }
  contextMenuOpen.value = false
}

function toggleAudio() {
  playing.value = !playing.value
}

// Swipe to reply
let touchStartX = 0
const swipeThreshold = 60

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchMove(e) {
  const diff = e.touches[0].clientX - touchStartX
  if (Math.abs(diff) < swipeThreshold) return
}

function onTouchEnd(e) {
  const diff = e.changedTouches[0].clientX - touchStartX
  if (diff > swipeThreshold && !props.isMine) {
    // Swipe right on incoming - reply
  } else if (diff < -swipeThreshold && props.isMine) {
    // Swipe left on outgoing - reply
  }
}

const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutsideHandler = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el.__clickOutsideHandler)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutsideHandler)
  }
}
</script>
