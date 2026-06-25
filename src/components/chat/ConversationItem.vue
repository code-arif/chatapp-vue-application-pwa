<template>
  <div
    :class="['conversation-item', isActive && 'active']"
    @click="$emit('click')"
    @contextmenu.prevent="$emit('context', { conversation, event: $event })"
  >
    <!-- Avatar -->
    <div class="avatar-wrapper flex-shrink-0">
      <img
        :src="conversation.avatar"
        :alt="conversation.name"
        class="w-12 h-12 rounded-full object-cover"
      />
      <span
        v-if="!conversation.is_group && otherUser"
        :class="['status-dot', otherUser?.status || 'offline']"
      ></span>
    </div>
    
    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <span class="font-semibold text-[14px] text-gray-900 dark:text-gray-100 truncate">
          {{ conversation.name }}
        </span>
        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <span class="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {{ formatLastSeen(conversation.last_message_at || conversation.created_at) }}
          </span>
          <!-- Unread badge -->
          <span
            v-if="conversation.unread_count > 0"
            class="min-w-[20px] h-5 bg-primary-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5"
          >
            {{ conversation.unread_count > 99 ? '99+' : conversation.unread_count }}
          </span>
          <!-- Muted icon -->
          <svg v-else-if="conversation.pivot?.is_muted" class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
          </svg>
        </div>
      </div>
      
      <!-- Last message preview or typing indicator -->
      <div class="flex items-center gap-1 mt-0.5">
        <!-- Typing indicator takes priority -->
        <template v-if="typingUsers && typingUsers.length > 0">
          <div class="flex items-center gap-1.5 text-primary-500">
            <div class="flex gap-0.5">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
            <span class="text-xs font-medium truncate">
              {{ typingText }}
            </span>
          </div>
        </template>
        
        <template v-else>
          <!-- Read receipt for outgoing -->
          <template v-if="conversation.last_message?.sender_id === currentUserId">
            <svg class="w-3.5 h-3.5 flex-shrink-0 read-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </template>
          
          <p class="text-[13px] text-gray-500 dark:text-gray-400 truncate">
            <span v-if="conversation.is_group && conversation.last_message?.sender_id !== currentUserId && conversation.last_message?.sender" class="font-medium text-gray-600 dark:text-gray-300">
              {{ conversation.last_message.sender?.name?.split(' ')[0] }}:&nbsp;
            </span>
            {{ getPreview(conversation.last_message) }}
          </p>
        </template>
      </div>
    </div>
    
    <!-- Group indicator -->
    <div v-if="conversation.is_group" class="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
      <svg class="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatLastSeen, getMessagePreview, formatTypingText } from '@/utils/helpers'

const props = defineProps({
  conversation: Object,
  isActive: Boolean,
  typingUsers: Array,
})

defineEmits(['click', 'context'])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.currentUser?.id)

const otherUser = computed(() => {
  if (props.conversation.is_group) return null
  return props.conversation.users?.find(u => u.id !== currentUserId.value)
})

const typingText = computed(() => formatTypingText(props.typingUsers || []))

function getPreview(message) {
  return getMessagePreview(message)
}
</script>
