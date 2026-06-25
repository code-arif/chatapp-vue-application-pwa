<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-box max-w-md animate-slide-up">
      <!-- Header -->
      <div class="gradient-header px-6 py-4 flex items-center gap-3">
        <button @click="$emit('close')" class="text-white/70 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2 class="text-white font-display font-semibold text-lg flex-1">
          {{ conversation?.is_group ? 'Group Info' : 'Contact Info' }}
        </h2>
        <button v-if="isAdmin && conversation?.is_group" @click="editing = !editing" class="text-white/70 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
      </div>
      
      <div class="overflow-y-auto max-h-[80vh]">
        <!-- Avatar & Info -->
        <div class="flex flex-col items-center py-6 px-6 border-b border-gray-100 dark:border-gray-700">
          <div class="relative">
            <img
              :src="conversation?.avatar"
              :alt="conversation?.name"
              class="w-20 h-20 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
            />
            <label v-if="isAdmin && conversation?.is_group && editing" class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
              <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            </label>
          </div>
          
          <div class="text-center mt-3">
            <div v-if="editing">
              <input
                v-model="editName"
                class="text-center text-lg font-display font-bold px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-400/30 border border-gray-200 dark:border-gray-600 w-full"
              />
              <textarea
                v-model="editDescription"
                placeholder="Add group description..."
                rows="2"
                class="mt-2 text-center text-sm px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-400/30 border border-gray-200 dark:border-gray-600 w-full resize-none"
              ></textarea>
              <button @click="saveGroupInfo" class="btn-primary mt-3 text-sm w-full">Save Changes</button>
            </div>
            <div v-else>
              <h3 class="text-xl font-display font-bold">{{ conversation?.name }}</h3>
              <p v-if="conversation?.description" class="text-sm text-gray-500 mt-1">{{ conversation?.description }}</p>
              <div v-if="conversation?.is_group" class="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ conversation?.users?.length || 0 }} members
              </div>
              <div v-else-if="otherUser" class="mt-1">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', otherUser.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400']">
                  {{ otherUser.status === 'online' ? '● Active now' : '○ Offline' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Members list (group) -->
        <div v-if="conversation?.is_group" class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-sm">Members</h4>
            <button v-if="isAdmin" @click="showAddMember = true" class="text-xs text-primary-500 font-semibold hover:text-primary-600">
              + Add Member
            </button>
          </div>
          
          <div class="space-y-1">
            <div
              v-for="member in conversation.users"
              :key="member.id"
              class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div class="avatar-wrapper">
                <img :src="member.avatar" :alt="member.name" class="w-9 h-9 rounded-full object-cover" />
                <span :class="['status-dot', member.status || 'offline']"></span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold truncate">{{ member.name }}</p>
                  <span v-if="member.pivot?.role === 'admin'" class="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
                  <span v-if="member.id === currentUserId" class="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full">You</span>
                </div>
                <p class="text-xs text-gray-400">{{ member.status === 'online' ? 'Online' : 'Offline' }}</p>
              </div>
              
              <!-- Admin actions -->
              <div v-if="isAdmin && member.id !== currentUserId" class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  v-if="member.pivot?.role !== 'admin'"
                  @click="makeAdmin(member.id)"
                  class="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 hover:text-primary-500"
                  title="Make Admin"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </button>
                <button
                  @click="removeMember(member.id)"
                  class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                  title="Remove"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Contact details (private) -->
        <div v-else-if="otherUser" class="p-4 space-y-3">
          <div v-if="otherUser.bio" class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm">{{ otherUser.bio }}</p>
          </div>
          <div v-if="otherUser.phone" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <p class="text-sm">{{ otherUser.phone }}</p>
          </div>
        </div>
        
        <!-- Add member modal (inline) -->
        <div v-if="showAddMember" class="p-4 border-t border-gray-100 dark:border-gray-700">
          <h4 class="font-semibold text-sm mb-3">Add Members</h4>
          <input
            v-model="addMemberSearch"
            type="text"
            placeholder="Search users..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400 mb-3"
            @input="searchAddMembers"
          />
          <div class="max-h-40 overflow-y-auto space-y-1">
            <button
              v-for="user in addMemberResults"
              :key="user.id"
              @click="addMember(user)"
              class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <img :src="user.avatar" class="w-8 h-8 rounded-full object-cover" />
              <div>
                <p class="text-sm font-medium">{{ user.name }}</p>
                <p class="text-xs text-gray-400">{{ user.email }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { conversationsAPI, usersAPI } from '@/services/api'
import { debounce } from '@/utils/helpers'

const props = defineProps({ conversation: Object })
const emit = defineEmits(['close', 'updated'])

const authStore = useAuthStore()
const chatStore = useChatStore()
const currentUserId = computed(() => authStore.currentUser?.id)

const editing = ref(false)
const editName = ref(props.conversation?.name || '')
const editDescription = ref(props.conversation?.description || '')
const editAvatar = ref(null)
const showAddMember = ref(false)
const addMemberSearch = ref('')
const addMemberResults = ref([])

const isAdmin = computed(() => {
  const user = props.conversation?.users?.find(u => u.id === currentUserId.value)
  return user?.pivot?.role === 'admin'
})

const otherUser = computed(() => {
  if (props.conversation?.is_group) return null
  return props.conversation?.users?.find(u => u.id !== currentUserId.value)
})

function onAvatarChange(e) {
  editAvatar.value = e.target.files[0]
}

async function saveGroupInfo() {
  try {
    const fd = new FormData()
    fd.append('name', editName.value)
    if (editDescription.value) fd.append('description', editDescription.value)
    if (editAvatar.value) fd.append('avatar', editAvatar.value)
    
    const res = await conversationsAPI.update(props.conversation.id, fd)
    chatStore.updateConversation(res.data.data)
    emit('updated', res.data.data)
    editing.value = false
  } catch (e) {}
}

async function makeAdmin(userId) {
  try {
    await conversationsAPI.makeAdmin(props.conversation.id, userId)
    const conv = { ...props.conversation }
    conv.users = conv.users.map(u => u.id === userId ? { ...u, pivot: { ...u.pivot, role: 'admin' } } : u)
    chatStore.updateConversation(conv)
  } catch (e) {}
}

async function removeMember(userId) {
  try {
    await conversationsAPI.removeUser(props.conversation.id, userId)
    const conv = { ...props.conversation }
    conv.users = conv.users.filter(u => u.id !== userId)
    chatStore.updateConversation(conv)
  } catch (e) {}
}

const searchAddMembers = debounce(async () => {
  if (!addMemberSearch.value.trim()) return
  try {
    const res = await usersAPI.search(addMemberSearch.value)
    const existingIds = props.conversation?.users?.map(u => u.id) || []
    addMemberResults.value = res.data.data.filter(u => !existingIds.includes(u.id))
  } catch (e) {}
}, 300)

async function addMember(user) {
  try {
    await conversationsAPI.addUser(props.conversation.id, user.id)
    const conv = { ...props.conversation }
    conv.users = [...(conv.users || []), { ...user, pivot: { role: 'member' } }]
    chatStore.updateConversation(conv)
    showAddMember.value = false
    addMemberSearch.value = ''
    addMemberResults.value = []
  } catch (e) {}
}
</script>
