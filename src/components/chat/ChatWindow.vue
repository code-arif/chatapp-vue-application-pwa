<template>
  <div class="flex flex-col h-full bg-[var(--bg)]">
    <!-- Chat Header -->
    <div class="gradient-header px-4 py-3 safe-top flex items-center gap-3 flex-shrink-0 shadow-md">
      <!-- Back button (mobile) -->
      <button
        @click="$emit('back')"
        class="md:hidden w-8 h-8 flex items-center justify-center text-white -ml-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <!-- Avatar -->
      <div class="avatar-wrapper cursor-pointer" @click="showInfo = true">
        <img
          :src="conversation?.avatar"
          :alt="conversation?.name"
          class="w-10 h-10 rounded-full object-cover border-2 border-white/30"
        />
        <span
          v-if="!conversation?.is_group && otherUser"
          :class="['status-dot', otherUser?.status || 'offline', 'border-orange-500']"
        ></span>
      </div>
      
      <!-- Name & Status -->
      <div class="flex-1 min-w-0 cursor-pointer" @click="showInfo = true">
        <h2 class="font-display font-semibold text-white text-[15px] truncate">{{ conversation?.name }}</h2>
        <p class="text-white/70 text-xs truncate">
          <template v-if="typingText">
            <span class="text-yellow-200">{{ typingText }}</span>
          </template>
          <template v-else-if="conversation?.is_group">
            {{ conversation?.users_count || conversation?.users?.length }} members
          </template>
          <template v-else>
            {{ statusText }}
          </template>
        </p>
      </div>
      
      <!-- Action buttons -->
      <div class="flex items-center gap-1">
        <!-- Search in chat -->
        <button @click="showSearch = !showSearch" class="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
        
        <!-- More options -->
        <div class="relative">
          <button @click="showMenu = !showMenu" class="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
          
          <!-- Dropdown menu -->
          <div
            v-if="showMenu"
            v-click-outside="() => showMenu = false"
            class="absolute right-0 top-full mt-2 context-menu"
          >
            <button @click="showInfo = true; showMenu = false" class="context-menu-item">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Chat Info</span>
            </button>
            <button @click="toggleMute(); showMenu = false" class="context-menu-item">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
              <span>{{ isMuted ? 'Unmute' : 'Mute' }}</span>
            </button>
            <button @click="leaveConversation(); showMenu = false" class="context-menu-item text-red-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>{{ conversation?.is_group ? 'Leave Group' : 'Delete Chat' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Search bar -->
    <div v-if="showSearch" class="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <div class="relative">
        <input
          v-model="messageSearch"
          type="text"
          placeholder="Search in this chat..."
          class="w-full px-4 py-2 pl-9 bg-gray-50 dark:bg-gray-700 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-400/30 border border-gray-200 dark:border-gray-600"
          autofocus
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
    
    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-4 messages-container"
      @scroll="onScroll"
    >
      <!-- Load more indicator -->
      <div v-if="loadingMore" class="flex justify-center py-4">
        <div class="flex gap-1">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
      
      <!-- Messages grouped by date -->
      <template v-if="!chatStore.loadingMessages">
        <template v-for="(group, date) in groupedMessages" :key="date">
          <!-- Date divider -->
          <div class="flex items-center gap-3 my-4">
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span class="text-xs text-gray-400 dark:text-gray-500 bg-[var(--bg)] px-2 py-0.5 rounded-full font-medium">{{ date }}</span>
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>
          
          <!-- Messages -->
          <MessageBubble
            v-for="(message, idx) in group"
            :key="message.id"
            :message="message"
            :prev-message="idx > 0 ? group[idx - 1] : null"
            :is-mine="message.sender_id === currentUserId"
            :is-group="conversation?.is_group"
            :search-query="messageSearch"
            @reply="chatStore.setReplyingTo(message)"
            @edit="chatStore.setEditingMessage(message)"
            @delete="confirmDelete(message)"
            @react="handleReaction"
            @view-media="viewMedia"
          />
        </template>
        
        <!-- Typing indicator in chat -->
        <div v-if="typingUsers.length > 0" class="flex items-end gap-2 mb-2 animate-fade-in">
          <img
            v-if="typingUser"
            :src="typingUser.avatar"
            class="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <div class="msg-bubble-in px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Loading messages -->
      <div v-else class="space-y-4">
        <div v-for="i in 8" :key="i" :class="['flex', i % 3 === 0 ? 'justify-end' : '']">
          <div class="flex gap-2" :class="i % 3 === 0 ? 'flex-row-reverse' : ''">
            <div class="skeleton w-8 h-8 rounded-full flex-shrink-0"></div>
            <div class="space-y-1">
              <div :class="['skeleton h-12 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-32']"></div>
              <div class="skeleton h-3 w-16 rounded ml-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Scroll to bottom button -->
    <button
      v-if="showScrollBottom"
      @click="scrollToBottom"
      class="absolute bottom-24 right-6 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-float flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 z-10"
    >
      <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
      <span v-if="chatStore.activeConversation?.unread_count > 0" class="badge -top-1 -right-1 text-[10px]">
        {{ chatStore.activeConversation?.unread_count }}
      </span>
    </button>
    
    <!-- Message Input -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 px-3 py-2 safe-bottom flex-shrink-0">
      <!-- Reply preview -->
      <div v-if="chatStore.replyingTo" class="flex items-center gap-2 mb-2 px-1">
        <div class="flex-1 reply-preview">
          <p class="text-xs font-semibold text-primary-600 dark:text-primary-400">
            {{ chatStore.replyingTo.sender?.name || 'Message' }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
            {{ getMessagePreview(chatStore.replyingTo) }}
          </p>
        </div>
        <button @click="chatStore.clearReplyAndEdit()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Edit mode indicator -->
      <div v-if="chatStore.editingMessage" class="flex items-center gap-2 mb-2 px-1">
        <div class="flex-1 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-4 border-primary-400">
          <p class="text-xs font-semibold text-primary-600 dark:text-primary-400">Editing message</p>
          <p class="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">{{ chatStore.editingMessage.content }}</p>
        </div>
        <button @click="chatStore.clearReplyAndEdit()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Upload preview -->
      <div v-if="selectedFile" class="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <div class="flex-1 flex items-center gap-2 min-w-0">
          <span class="text-xl">{{ getFileIcon(selectedFile.type) }}</span>
          <div class="min-w-0">
            <p class="text-xs font-medium truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        <!-- Upload progress -->
        <div v-if="chatStore.uploadProgress > 0" class="flex items-center gap-2">
          <div class="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 rounded-full transition-all" :style="{ width: chatStore.uploadProgress + '%' }"></div>
          </div>
          <span class="text-xs text-gray-500">{{ chatStore.uploadProgress }}%</span>
        </div>
        <button @click="clearFile" class="text-gray-400 hover:text-red-500 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Input row -->
      <div class="flex items-end gap-2">
        <!-- Attachment button -->
        <button
          @click="$refs.fileInput.click()"
          class="w-9 h-9 flex-shrink-0 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
        </button>
        <input ref="fileInput" type="file" class="hidden" @change="onFileSelect" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" />
        
        <!-- Emoji button -->
        <div class="relative flex-shrink-0">
          <button
            @click="showEmoji = !showEmoji"
            class="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
          
          <!-- Emoji picker -->
          <div v-if="showEmoji" class="absolute bottom-full left-0 mb-2 z-50">
            <emoji-picker @emoji-click="onEmojiSelect" class="h-80"></emoji-picker>
          </div>
        </div>
        
        <!-- Text input -->
        <textarea
          v-model="messageText"
          ref="textInput"
          :placeholder="editMode ? 'Edit message...' : 'Message...'"
          class="chat-input flex-1"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="() => {}"
          @keydown.escape="chatStore.clearReplyAndEdit()"
          @input="onTyping"
        ></textarea>
        
        <!-- Send button -->
        <button
          @click="sendMessage"
          :disabled="!canSend"
          :class="[
            'w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all',
            canSend
              ? 'gradient-header text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Modals -->
    <ConversationInfoModal
      v-if="showInfo"
      :conversation="conversation"
      @close="showInfo = false"
      @updated="onConversationUpdated"
    />
    
    <!-- Media viewer -->
    <MediaViewer
      v-if="mediaViewer.show"
      :url="mediaViewer.url"
      :type="mediaViewer.type"
      :name="mediaViewer.name"
      @close="mediaViewer.show = false"
    />
    
    <!-- Delete confirm dialog -->
    <ConfirmDialog
      v-if="deleteTarget"
      title="Delete Message"
      message="Are you sure you want to delete this message? This cannot be undone."
      confirm-text="Delete"
      confirm-class="bg-red-500 hover:bg-red-600 text-white"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { typingAPI, conversationsAPI } from '@/services/api'
import { getMessagePreview, formatFileSize, getFileIcon, groupMessagesByDate, scrollToBottom as scrollToBottomHelper, isNearBottom } from '@/utils/helpers'
import MessageBubble from './MessageBubble.vue'
import ConversationInfoModal from '@/components/modals/ConversationInfoModal.vue'
import MediaViewer from '@/components/ui/MediaViewer.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const props = defineProps({ conversationId: Number })
const emit = defineEmits(['back'])

// Dynamic import emoji picker
import('emoji-picker-element')

const authStore = useAuthStore()
const chatStore = useChatStore()

const messagesContainer = ref(null)
const textInput = ref(null)
const fileInput = ref(null)
const messageText = ref('')
const selectedFile = ref(null)
const showEmoji = ref(false)
const showMenu = ref(false)
const showInfo = ref(false)
const showSearch = ref(false)
const messageSearch = ref('')
const showScrollBottom = ref(false)
const loadingMore = ref(false)
const deleteTarget = ref(null)
const mediaViewer = ref({ show: false, url: null, type: null, name: null })

let typingTimer = null
let isTypingActive = false

const conversation = computed(() => chatStore.activeConversation)
const currentUserId = computed(() => authStore.currentUser?.id)
const editMode = computed(() => !!chatStore.editingMessage)
const isMuted = computed(() => conversation.value?.pivot?.is_muted)

const otherUser = computed(() => {
  if (!conversation.value?.is_group && conversation.value?.users) {
    return conversation.value.users.find(u => u.id !== currentUserId.value)
  }
  return null
})

const statusText = computed(() => {
  if (!otherUser.value) return ''
  if (otherUser.value.status === 'online') return 'Active now'
  if (otherUser.value.last_seen_at) {
    const { formatLastSeen } = require('@/utils/helpers')
    return `Last seen ${formatLastSeen(otherUser.value.last_seen_at)}`
  }
  return 'Offline'
})

const typingUsers = computed(() => chatStore.typingInConversation(props.conversationId) || [])
const typingText = computed(() => {
  if (typingUsers.value.length === 0) return ''
  if (typingUsers.value.length === 1) return `${typingUsers.value[0]} is typing...`
  return 'Several people are typing...'
})
const typingUser = computed(() => {
  if (!conversation.value?.is_group || !typingUsers.value.length) return null
  return conversation.value.users?.find(u => u.name === typingUsers.value[0])
})

const groupedMessages = computed(() => groupMessagesByDate(chatStore.activeMessages))

const canSend = computed(() => messageText.value.trim() || selectedFile.value)

// Watch for new messages to auto-scroll
watch(() => chatStore.activeMessages.length, async (newLen) => {
  const msgs = chatStore.activeMessages
  if (msgs.length === 0) return
  
  const lastMsg = msgs[msgs.length - 1]
  const isOwnMsg = lastMsg.sender_id === currentUserId.value
  
  await nextTick()
  
  if (isOwnMsg || isNearBottom(messagesContainer.value)) {
    scrollToBottom()
  } else {
    showScrollBottom.value = true
  }
})

// Watch conversation change
watch(() => props.conversationId, async (newId) => {
  if (newId) {
    messageText.value = ''
    selectedFile.value = null
    showEmoji.value = false
    await nextTick()
    scrollToBottom(false)
    textInput.value?.focus()
  }
})

// Watch editing message
watch(() => chatStore.editingMessage, (msg) => {
  if (msg) {
    messageText.value = msg.content
    nextTick(() => textInput.value?.focus())
  } else {
    messageText.value = ''
  }
})

onMounted(() => {
  nextTick(() => {
    scrollToBottom(false)
    textInput.value?.focus()
  })
})

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer)
  stopTyping()
})

function scrollToBottom(smooth = true) {
  scrollToBottomHelper(messagesContainer.value, smooth ? 'smooth' : 'instant')
  showScrollBottom.value = false
  chatStore.markConversationRead(props.conversationId)
}

function onScroll() {
  const el = messagesContainer.value
  if (!el) return
  
  showScrollBottom.value = !isNearBottom(el)
  
  // Load more when near top
  if (el.scrollTop < 100 && !loadingMore.value) {
    loadOlderMessages()
  }
}

async function loadOlderMessages() {
  const el = messagesContainer.value
  if (!el) return
  
  const prevHeight = el.scrollHeight
  loadingMore.value = true
  
  const loaded = await chatStore.loadMoreMessages(props.conversationId)
  loadingMore.value = false
  
  if (loaded) {
    await nextTick()
    el.scrollTop = el.scrollHeight - prevHeight
  }
}

async function sendMessage() {
  if (!canSend.value) return
  
  const text = messageText.value.trim()
  
  // Edit mode
  if (chatStore.editingMessage) {
    if (!text) return
    await chatStore.editMessage(chatStore.editingMessage.id, text)
    messageText.value = ''
    return
  }
  
  const data = {
    conversation_id: props.conversationId,
    type: selectedFile.value ? getMediaType(selectedFile.value.type) : 'text',
    content: text || null,
    reply_to: chatStore.replyingTo?.id || null,
    file: selectedFile.value || null,
  }
  
  messageText.value = ''
  selectedFile.value = null
  stopTyping()
  
  await chatStore.sendMessage(data)
  await nextTick()
  scrollToBottom()
}

function getMediaType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

function onTyping() {
  if (!isTypingActive) {
    isTypingActive = true
    typingAPI.typing(props.conversationId).catch(() => {})
  }
  
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    stopTyping()
  }, 3000)
}

function stopTyping() {
  if (isTypingActive) {
    isTypingActive = false
    typingAPI.stopTyping(props.conversationId).catch(() => {})
  }
}

function onEmojiSelect(e) {
  messageText.value += e.detail.unicode
  showEmoji.value = false
  textInput.value?.focus()
}

function onFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    fileInput.value.value = ''
  }
}

function clearFile() {
  selectedFile.value = null
}

async function handleReaction({ messageId, emoji }) {
  await chatStore.toggleReaction(messageId, emoji)
}

function viewMedia({ url, type, name }) {
  mediaViewer.value = { show: true, url, type, name }
}

function confirmDelete(message) {
  deleteTarget.value = message
}

async function doDelete() {
  if (!deleteTarget.value) return
  await chatStore.deleteMessage(deleteTarget.value.id, props.conversationId)
  deleteTarget.value = null
}

async function toggleMute() {
  await conversationsAPI.toggleMute(props.conversationId)
}

async function leaveConversation() {
  await conversationsAPI.destroy(props.conversationId)
  chatStore.removeConversation(props.conversationId)
  emit('back')
}

function onConversationUpdated(updated) {
  chatStore.updateConversation(updated)
}

// Click outside directive (simple inline)
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
