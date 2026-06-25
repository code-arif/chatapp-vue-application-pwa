<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-box max-w-lg animate-slide-up flex flex-col max-h-[90vh]">
      <!-- Header - fixed at top -->
      <div class="gradient-header px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <button v-if="step > 1" @click="step--" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="text-white font-display font-semibold text-lg">
            {{ step === 1 ? 'New Chat' : mode === 'private' ? 'Start Chat' : 'Create Group' }}
          </h2>
        </div>
        <button @click="$emit('close')" class="text-white/70 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Scrollable content area -->
      <div class="flex-1 overflow-y-auto">
        <!-- Step 1: Choose type -->
        <div v-if="step === 1" class="p-6">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">What would you like to do?</p>
          <div class="grid grid-cols-2 gap-3">
            <button
                @click="mode = 'private'; step = 2"
                class="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-primary-100 dark:border-primary-900/30 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div
                  class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span class="font-semibold text-sm">Private Chat</span>
            </button>
            <button
                @click="mode = 'group'; step = 2"
                class="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-primary-100 dark:border-primary-900/30 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div
                  class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <span class="font-semibold text-sm">Group Chat</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Group config or search users -->
        <div v-else-if="step === 2" class="p-6">
          <!-- Group name & avatar (group mode) -->
          <div v-if="mode === 'group'" class="mb-6">
            <div class="flex items-center gap-4 mb-4">
              <!-- Group avatar upload -->
              <label class="cursor-pointer">
                <div
                    class="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-primary-300 dark:border-primary-700 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all relative">
                  <img v-if="groupAvatarPreview" :src="groupAvatarPreview" class="w-full h-full object-cover"/>
                  <svg v-else class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <input type="file" accept="image/*" class="hidden" @change="onGroupAvatarSelect"/>
              </label>

              <div class="flex-1">
                <label class="block text-sm font-semibold mb-1.5">Group Name *</label>
                <input
                    v-model="groupName"
                    type="text"
                    placeholder="Enter group name"
                    class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5">Description <span class="font-normal text-gray-400">(optional)</span></label>
              <textarea
                  v-model="groupDescription"
                  placeholder="Group description..."
                  rows="2"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- User search -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              {{ mode === 'group' ? 'Add Members' : 'Select Contact' }}
            </label>
            <div class="relative mb-3">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                  v-model="userSearch"
                  type="text"
                  placeholder="Search users..."
                  class="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400"
                  @input="searchUsers"
              />
            </div>

            <!-- Selected members chips (group) -->
            <div v-if="mode === 'group' && selectedUsers.length > 0" class="flex flex-wrap gap-2 mb-3">
              <span
                  v-for="user in selectedUsers"
                  :key="user.id"
                  class="flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                <img :src="user.avatar" class="w-4 h-4 rounded-full object-cover"/>
                {{ user.name.split(' ')[0] }}
                <button @click="removeUser(user.id)" class="hover:text-red-500 ml-0.5">×</button>
              </span>
            </div>

            <!-- User list -->
            <div class="max-h-64 overflow-y-auto space-y-1">
              <div v-if="searchLoading" class="py-4 text-center text-sm text-gray-400">Searching...</div>
              <div v-else-if="userResults.length === 0" class="py-4 text-center text-sm text-gray-400">No users found
              </div>
              <button
                  v-else
                  v-for="user in userResults"
                  :key="user.id"
                  @click="selectUser(user)"
                  :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
                  isSelected(user.id)
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <div class="avatar-wrapper">
                  <img :src="user.avatar" :alt="user.name" class="w-9 h-9 rounded-full object-cover"/>
                  <span :class="['status-dot', user.status || 'offline']"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{{ user.name }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
                </div>
                <div v-if="mode === 'group'" class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                     :class="isSelected(user.id) ? 'bg-primary-500' : 'border-2 border-gray-300 dark:border-gray-600'"
                >
                  <svg v-if="isSelected(user.id)" class="w-3 h-3 text-white" fill="none" stroke="currentColor"
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with action button - fixed at bottom -->
      <div v-if="step === 2"
           class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 flex justify-end gap-3">
        <button @click="$emit('close')" class="btn-ghost">Cancel</button>
        <button
            @click="createConversation"
            :disabled="!canCreate || creating"
            class="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="creating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ mode === 'private' ? 'Start Chat' : `Create Group` }}
          <span v-if="mode === 'group' && selectedUsers.length > 0">({{ selectedUsers.length }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {usersAPI, conversationsAPI} from '@/services/api'
import {debounce} from '@/utils/helpers'

const emit = defineEmits(['close', 'created'])

const step = ref(1)
const mode = ref('private')
const userSearch = ref('')
const userResults = ref([])
const selectedUsers = ref([])
const searchLoading = ref(false)
const creating = ref(false)
const groupName = ref('')
const groupDescription = ref('')
const groupAvatar = ref(null)
const groupAvatarPreview = ref(null)

const canCreate = computed(() => {
  if (mode.value === 'private') return selectedUsers.value.length === 1
  if (mode.value === 'group') return groupName.value.trim() && selectedUsers.value.length >= 1
  return false
})

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  searchLoading.value = true
  try {
    const res = await usersAPI.index({per_page: 20})
    userResults.value = res.data.data
  } catch (e) {
  }
  searchLoading.value = false
}

const searchUsers = debounce(async () => {
  if (!userSearch.value.trim()) {
    loadUsers()
    return
  }
  searchLoading.value = true
  try {
    const res = await usersAPI.search(userSearch.value)
    userResults.value = res.data.data
  } catch (e) {
  }
  searchLoading.value = false
}, 300)

function selectUser(user) {
  if (mode.value === 'private') {
    selectedUsers.value = [user]
  } else {
    if (isSelected(user.id)) {
      selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
    } else {
      selectedUsers.value = [...selectedUsers.value, user]
    }
  }
}

function removeUser(userId) {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== userId)
}

function isSelected(userId) {
  return selectedUsers.value.some(u => u.id === userId)
}

function onGroupAvatarSelect(e) {
  const file = e.target.files[0]
  if (file) {
    groupAvatar.value = file
    groupAvatarPreview.value = URL.createObjectURL(file)
  }
}

async function createConversation() {
  creating.value = true
  try {
    const formData = new FormData()

    if (mode.value === 'private') {
      formData.append('type', 'private')
      formData.append('user_id', selectedUsers.value[0].id)
    } else {
      formData.append('type', 'group')
      formData.append('name', groupName.value)
      if (groupDescription.value) formData.append('description', groupDescription.value)
      if (groupAvatar.value) formData.append('avatar', groupAvatar.value)
      selectedUsers.value.forEach(u => formData.append('user_ids[]', u.id))
    }

    const res = await conversationsAPI.store(formData)
    emit('created', res.data.data)
  } catch (e) {
    console.error(e)
  } finally {
    creating.value = false
  }
}
</script>