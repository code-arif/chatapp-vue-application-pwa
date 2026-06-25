<template>
  <div class="flex h-full overflow-hidden">
    <!-- Sidebar - Chat List -->
    <transition name="sidebar">
      <div
        :class="[
          'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/50 flex-shrink-0 z-30',
          'md:w-[340px] lg:w-[380px]',
          isMobile ? 'absolute inset-y-0 left-0 w-full' : 'relative',
          (isMobile && activeConversationId) ? 'hidden' : 'flex'
        ]"
      >
        <!-- Header -->
        <div class="gradient-header px-4 pt-safe-top safe-top">
          <div class="flex items-center justify-between py-4">
            <div class="flex items-center gap-3">
              <!-- Avatar with menu -->
              <button @click="showProfile = true" class="relative">
                <img
                  :src="authStore.currentUser?.avatar"
                  :alt="authStore.currentUser?.name"
                  class="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                />
                <span :class="['status-dot', authStore.currentUser?.status || 'online', 'border-orange-400']"></span>
              </button>
              <div>
                <h1 class="font-display font-bold text-white text-lg leading-tight">ChatApp</h1>
                <p class="text-white/70 text-xs">{{ onlineCount }} online</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- Theme toggle -->
              <button
                @click="themeStore.toggleTheme()"
                class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
              >
                <svg v-if="themeStore.theme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              </button>
              
              <!-- New Chat/Group button -->
              <button
                @click="showNewChat = true"
                class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all relative"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span v-if="chatStore.unreadTotal > 0" class="badge -top-1.5 -right-1.5 text-[10px] min-w-[16px] h-4">
                  {{ chatStore.unreadTotal > 99 ? '99+' : chatStore.unreadTotal }}
                </span>
              </button>
            </div>
          </div>
          
          <!-- Search bar -->
          <div class="pb-3">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="chatStore.searchQuery"
                type="text"
                placeholder="Search conversations..."
                class="w-full pl-9 pr-4 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white placeholder-white/60 text-sm outline-none focus:bg-white/30 transition-all"
              />
            </div>
          </div>
        </div>
        
        <!-- Conversation List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading skeleton -->
          <div v-if="chatStore.loadingConversations" class="p-3 space-y-2">
            <div v-for="i in 6" :key="i" class="flex items-center gap-3 p-3">
              <div class="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="skeleton h-4 w-2/3 rounded"></div>
                <div class="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="chatStore.sortedConversations.length === 0" class="flex flex-col items-center justify-center h-48 text-center p-6">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p class="font-semibold text-gray-700 dark:text-gray-300">No conversations yet</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a new chat!</p>
            <button @click="showNewChat = true" class="btn-primary mt-4 text-sm">New Chat</button>
          </div>
          
          <!-- Conversations -->
          <div v-else class="py-1">
            <ConversationItem
              v-for="conv in chatStore.sortedConversations"
              :key="conv.id"
              :conversation="conv"
              :is-active="conv.id === activeConversationId"
              :typing-users="chatStore.typingInConversation(conv.id)"
              @click="selectConversation(conv.id)"
              @context="onConversationContext"
            />
          </div>
        </div>
        
        <!-- Bottom navigation (mobile) -->
        <div class="md:hidden border-t border-gray-100 dark:border-gray-700 safe-bottom">
          <div class="flex justify-around py-2">
            <button @click="showNewChat = true" class="flex flex-col items-center py-2 px-4 text-primary-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="text-xs mt-0.5">New</span>
            </button>
            <button @click="showProfile = true" class="flex flex-col items-center py-2 px-4 text-gray-500 dark:text-gray-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-xs mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Chat Area -->
    <div
      :class="[
        'flex-1 flex flex-col overflow-hidden',
        isMobile && !activeConversationId ? 'hidden' : 'flex'
      ]"
    >
      <ChatWindow
        v-if="activeConversationId"
        :conversation-id="activeConversationId"
        @back="clearActive"
      />
      
      <!-- Empty state - no conversation selected -->
      <div v-else class="flex-1 flex flex-col items-center justify-center bg-[var(--bg)]">
        <div class="text-center animate-fade-in">
          <div class="w-32 h-32 gradient-header rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">ChatApp</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">Select a conversation to start chatting, or create a new one</p>
          <button @click="showNewChat = true" class="btn-primary mt-6">Start Chatting</button>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <NewChatModal v-if="showNewChat" @close="showNewChat = false" @created="onConversationCreated" />
    <ProfileModal v-if="showProfile" @close="showProfile = false" />
    <ConversationContextMenu
      v-if="contextMenu.show"
      :conversation="contextMenu.conversation"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="contextMenu.show = false"
      @action="onContextAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useThemeStore } from '@/stores/theme'
import { usersAPI } from '@/services/api'
import { initEcho } from '@/services/echo'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ConversationItem from '@/components/chat/ConversationItem.vue'
import NewChatModal from '@/components/modals/NewChatModal.vue'
import ProfileModal from '@/components/modals/ProfileModal.vue'
import ConversationContextMenu from '@/components/chat/ConversationContextMenu.vue'

const authStore = useAuthStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()

const showNewChat = ref(false)
const showProfile = ref(false)
const isMobile = ref(window.innerWidth < 768)
const activeConversationId = computed(() => chatStore.activeConversationId)
const onlineCount = ref(0)
const contextMenu = ref({ show: false, conversation: null, x: 0, y: 0 })

let heartbeatTimer = null
let resizeObserver = null

onMounted(async () => {
  // Init echo
  initEcho()
  
  // Fetch conversations
  await chatStore.fetchConversations()
  
  // Init user status listener
  chatStore.initUserStatusListener()
  
  // Fetch online count
  try {
    const res = await usersAPI.online()
    onlineCount.value = res.data.data.length
  } catch (e) {}
  
  // Heartbeat every 30s
  heartbeatTimer = setInterval(async () => {
    try { await usersAPI.heartbeat() } catch (e) {}
  }, 30000)
  
  // Handle resize
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }
  window.addEventListener('resize', handleResize)
  
  // Close context menu on click
  document.addEventListener('click', () => {
    contextMenu.value.show = false
  })
})

onUnmounted(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  document.removeEventListener('click', () => {})
})

async function selectConversation(id) {
  await chatStore.setActiveConversation(id)
}

function clearActive() {
  chatStore.activeConversationId = null
}

function onConversationCreated(conversation) {
  chatStore.addConversation(conversation)
  selectConversation(conversation.id)
  showNewChat.value = false
}

function onConversationContext({ conversation, event }) {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    conversation,
    x: event.clientX,
    y: event.clientY,
  }
}

async function onContextAction({ action, conversation }) {
  contextMenu.value.show = false
  
  if (action === 'mute') {
    const { conversationsAPI } = await import('@/services/api')
    await conversationsAPI.toggleMute(conversation.id)
  } else if (action === 'archive') {
    const { conversationsAPI } = await import('@/services/api')
    await conversationsAPI.toggleArchive(conversation.id)
  } else if (action === 'leave') {
    const { conversationsAPI } = await import('@/services/api')
    await conversationsAPI.destroy(conversation.id)
    chatStore.removeConversation(conversation.id)
  }
}
</script>
