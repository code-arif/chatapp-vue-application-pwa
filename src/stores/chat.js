import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { conversationsAPI, messagesAPI } from '@/services/api'
import { subscribeToConversation, leaveConversation, subscribeToUsers } from '@/services/echo'
import { soundService } from '@/services/sound'
import { useAuthStore } from '@/stores/auth'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  
  const conversations = ref([])
  const activeConversationId = ref(null)
  const messages = ref({}) // { conversationId: [] }
  const typingUsers = ref({}) // { conversationId: { userId: { name, timestamp } } }
  const loadingConversations = ref(false)
  const loadingMessages = ref(false)
  const uploadProgress = ref(0)
  const replyingTo = ref(null)
  const editingMessage = ref(null)
  const messagePagination = ref({}) // { conversationId: { page, lastPage, loading } }
  const unreadTotal = ref(0)
  const userStatuses = ref({}) // { userId: 'online'|'offline'|'away' }
  const searchQuery = ref('')

  const activeConversation = computed(() => 
    conversations.value.find(c => c.id === activeConversationId.value)
  )

  const activeMessages = computed(() => 
    messages.value[activeConversationId.value] || []
  )

  const sortedConversations = computed(() => {
    const query = searchQuery.value.toLowerCase()
    const filtered = query 
      ? conversations.value.filter(c => c.name?.toLowerCase().includes(query))
      : conversations.value
    
    return [...filtered].sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at) : new Date(a.created_at)
      const bTime = b.last_message_at ? new Date(b.last_message_at) : new Date(b.created_at)
      return bTime - aTime
    })
  })

  const typingInConversation = computed(() => (conversationId) => {
    const typing = typingUsers.value[conversationId] || {}
    const currentUserId = authStore.currentUser?.id
    return Object.entries(typing)
      .filter(([uid]) => parseInt(uid) !== currentUserId)
      .map(([, data]) => data.name)
  })

  // Fetch all conversations
  async function fetchConversations() {
    loadingConversations.value = true
    try {
      const res = await conversationsAPI.index()
      conversations.value = res.data.data
      updateUnreadTotal()
    } catch (e) {
      console.error('fetchConversations error:', e)
    } finally {
      loadingConversations.value = false
    }
  }

  // Fetch messages for a conversation
  async function fetchMessages(conversationId, page = 1) {
    if (!messagePagination.value[conversationId]) {
      messagePagination.value[conversationId] = { page: 1, lastPage: 1, loading: false }
    }

    if (messagePagination.value[conversationId].loading) return

    messagePagination.value[conversationId].loading = true
    loadingMessages.value = page === 1

    try {
      const res = await messagesAPI.index(conversationId, { page, per_page: 30 })
      const { data, meta } = res.data
      
      // Messages come in desc order, reverse to show oldest first
      const reversed = [...data].reverse()

      if (page === 1) {
        messages.value[conversationId] = reversed
      } else {
        // Prepend older messages
        messages.value[conversationId] = [...reversed, ...(messages.value[conversationId] || [])]
      }

      messagePagination.value[conversationId] = {
        page: meta.current_page,
        lastPage: meta.last_page,
        loading: false,
      }

      return meta
    } catch (e) {
      console.error('fetchMessages error:', e)
    } finally {
      loadingMessages.value = false
      if (messagePagination.value[conversationId]) {
        messagePagination.value[conversationId].loading = false
      }
    }
  }

  // Load more (older) messages
  async function loadMoreMessages(conversationId) {
    const pagination = messagePagination.value[conversationId]
    if (!pagination || pagination.page >= pagination.lastPage || pagination.loading) return false

    const nextPage = pagination.page + 1
    await fetchMessages(conversationId, nextPage)
    return true
  }

  // Set active conversation
  async function setActiveConversation(conversationId) {
    if (activeConversationId.value === conversationId) return

    // Leave old conversation channel
    if (activeConversationId.value) {
      leaveConversation(activeConversationId.value)
    }

    activeConversationId.value = conversationId
    replyingTo.value = null
    editingMessage.value = null

    if (conversationId) {
      await fetchMessages(conversationId)
      subscribeToConversationEvents(conversationId)
      markConversationRead(conversationId)
    }
  }

  // Send a message
  async function sendMessage(data) {
    try {
      const formData = new FormData()
      formData.append('conversation_id', data.conversation_id)
      formData.append('type', data.type || 'text')
      
      if (data.content) formData.append('content', data.content)
      if (data.reply_to) formData.append('reply_to', data.reply_to)
      if (data.file) {
        formData.append('media', data.file)
        uploadProgress.value = 0
      }

      const res = await messagesAPI.store(formData)
      const message = res.data.data

      addMessageToConversation(message)
      updateConversationLastMessage(data.conversation_id, message)
      soundService.playMessageSent()
      replyingTo.value = null

      return { success: true, message }
    } catch (e) {
      soundService.playError()
      return { success: false, error: e.response?.data?.message || 'Failed to send' }
    } finally {
      uploadProgress.value = 0
    }
  }

  // Edit a message
  async function editMessage(messageId, content) {
    try {
      const res = await messagesAPI.update(messageId, content)
      const updated = res.data.data
      updateMessageInConversation(updated)
      editingMessage.value = null
      return { success: true }
    } catch (e) {
      return { success: false }
    }
  }

  // Delete a message
  async function deleteMessage(messageId, conversationId) {
    try {
      await messagesAPI.destroy(messageId)
      removeMessageFromConversation(messageId, conversationId)
      return { success: true }
    } catch (e) {
      return { success: false }
    }
  }

  // Toggle reaction
  async function toggleReaction(messageId, emoji) {
    try {
      const res = await messagesAPI.toggleReaction(messageId, emoji)
      const { added, reactions } = res.data.data
      
      // Update message reactions
      const conversationId = activeConversationId.value
      const msgs = messages.value[conversationId] || []
      const idx = msgs.findIndex(m => m.id === messageId)
      if (idx !== -1) {
        messages.value[conversationId][idx] = {
          ...messages.value[conversationId][idx],
          reactions
        }
      }
      return { success: true, added }
    } catch (e) {
      return { success: false }
    }
  }

  // Mark messages as read
  async function markConversationRead(conversationId) {
    const msgs = messages.value[conversationId] || []
    const currentUserId = authStore.currentUser?.id
    
    const unreadIds = msgs
      .filter(m => m.sender_id !== currentUserId && !m.is_read)
      .map(m => m.id)

    if (unreadIds.length === 0) return

    try {
      await messagesAPI.markAsRead(unreadIds)
      // Update local state
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) conv.unread_count = 0
      
      msgs.forEach((m, i) => {
        if (unreadIds.includes(m.id)) {
          messages.value[conversationId][i] = { ...m, is_read: true }
        }
      })
      updateUnreadTotal()
    } catch (e) {}
  }

  // Subscribe to conversation real-time events
  function subscribeToConversationEvents(conversationId) {
    subscribeToConversation(conversationId, {
      onMessageSent: (data) => {
        const msg = data.message
        const currentUserId = authStore.currentUser?.id
        
        // Don't add if it's our own message (already added optimistically)
        const msgs = messages.value[conversationId] || []
        if (!msgs.find(m => m.id === msg.id)) {
          addMessageToConversation(msg)
          if (msg.sender_id !== currentUserId) {
            soundService.playMessageReceived()
          }
        }
        updateConversationLastMessage(conversationId, msg)
      },
      
      onMessageUpdated: (data) => {
        updateMessageInConversation(data.message)
      },
      
      onMessageDeleted: (data) => {
        removeMessageFromConversation(data.message_id, data.conversation_id)
      },
      
      onMessageRead: (data) => {
        const msgs = messages.value[conversationId] || []
        data.message_ids.forEach(id => {
          const idx = msgs.findIndex(m => m.id === id)
          if (idx !== -1) {
            const readBy = messages.value[conversationId][idx].read_by || []
            if (!readBy.find(r => r.user_id === data.user_id)) {
              messages.value[conversationId][idx] = {
                ...messages.value[conversationId][idx],
                read_by: [...readBy, {
                  user_id: data.user_id,
                  user_name: data.user_name,
                  read_at: data.read_at
                }]
              }
            }
          }
        })
      },
      
      onReaction: (data) => {
        const msgs = messages.value[conversationId] || []
        const idx = msgs.findIndex(m => m.id === data.message_id)
        if (idx !== -1) {
          messages.value[conversationId][idx] = {
            ...messages.value[conversationId][idx],
            reactions: data.reactions
          }
        }
      },
      
      onTyping: (data) => {
        if (!typingUsers.value[conversationId]) {
          typingUsers.value[conversationId] = {}
        }
        
        if (data.is_typing) {
          typingUsers.value[conversationId][data.user_id] = {
            name: data.user_name,
            timestamp: Date.now()
          }
        } else {
          delete typingUsers.value[conversationId][data.user_id]
        }
      }
    })
  }

  // Initialize user status listener
  function initUserStatusListener() {
    subscribeToUsers((data) => {
      userStatuses.value[data.user_id] = data.status
      
      // Update conversations with other user status
      conversations.value.forEach((conv, i) => {
        if (!conv.is_group && conv.users) {
          const other = conv.users.find(u => u.id === data.user_id)
          if (other) {
            conversations.value[i].users = conv.users.map(u => 
              u.id === data.user_id ? { ...u, status: data.status } : u
            )
          }
        }
      })
    })
  }

  // Helper: Add message to conversation
  function addMessageToConversation(message) {
    const convId = message.conversation_id
    if (!messages.value[convId]) {
      messages.value[convId] = []
    }
    // Avoid duplicates
    if (!messages.value[convId].find(m => m.id === message.id)) {
      messages.value[convId] = [...messages.value[convId], message]
    }
  }

  // Helper: Update message in conversation
  function updateMessageInConversation(message) {
    const convId = message.conversation_id
    if (messages.value[convId]) {
      const idx = messages.value[convId].findIndex(m => m.id === message.id)
      if (idx !== -1) {
        messages.value[convId][idx] = { ...messages.value[convId][idx], ...message }
      }
    }
  }

  // Helper: Remove message from conversation
  function removeMessageFromConversation(messageId, conversationId) {
    if (messages.value[conversationId]) {
      messages.value[conversationId] = messages.value[conversationId].filter(m => m.id !== messageId)
    }
  }

  // Helper: Update conversation last message
  function updateConversationLastMessage(conversationId, message) {
    const idx = conversations.value.findIndex(c => c.id === conversationId)
    if (idx !== -1) {
      conversations.value[idx] = {
        ...conversations.value[idx],
        last_message: message,
        last_message_at: message.created_at,
      }
      
      const currentUserId = authStore.currentUser?.id
      if (message.sender_id !== currentUserId && conversationId !== activeConversationId.value) {
        conversations.value[idx].unread_count = (conversations.value[idx].unread_count || 0) + 1
      }
      
      updateUnreadTotal()
    }
  }

  // Add new conversation to list
  function addConversation(conversation) {
    const existing = conversations.value.find(c => c.id === conversation.id)
    if (!existing) {
      conversations.value = [conversation, ...conversations.value]
    }
  }

  // Update conversation
  function updateConversation(conversation) {
    const idx = conversations.value.findIndex(c => c.id === conversation.id)
    if (idx !== -1) {
      conversations.value[idx] = { ...conversations.value[idx], ...conversation }
    }
  }

  // Remove conversation
  function removeConversation(conversationId) {
    conversations.value = conversations.value.filter(c => c.id !== conversationId)
    if (activeConversationId.value === conversationId) {
      activeConversationId.value = null
    }
  }

  function updateUnreadTotal() {
    unreadTotal.value = conversations.value.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  }

  function setReplyingTo(message) {
    replyingTo.value = message
    editingMessage.value = null
  }

  function setEditingMessage(message) {
    editingMessage.value = message
    replyingTo.value = null
  }

  function clearReplyAndEdit() {
    replyingTo.value = null
    editingMessage.value = null
  }

  return {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    loadingConversations,
    loadingMessages,
    uploadProgress,
    replyingTo,
    editingMessage,
    messagePagination,
    unreadTotal,
    userStatuses,
    searchQuery,
    activeConversation,
    activeMessages,
    sortedConversations,
    typingInConversation,
    fetchConversations,
    fetchMessages,
    loadMoreMessages,
    setActiveConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    markConversationRead,
    subscribeToConversationEvents,
    initUserStatusListener,
    addConversation,
    updateConversation,
    removeConversation,
    setReplyingTo,
    setEditingMessage,
    clearReplyAndEdit,
  }
})
