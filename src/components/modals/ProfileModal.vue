<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-box max-w-md animate-slide-up flex flex-col max-h-[90vh]">
      <!-- Header - fixed at top -->
      <div class="gradient-header px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h2 class="text-white font-display font-semibold text-lg">Profile</h2>
        <button @click="$emit('close')" class="text-white/70 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Scrollable content area -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6">
          <!-- Avatar section -->
          <div class="flex flex-col items-center mb-6">
            <div class="relative group">
              <img
                  :src="form.avatarPreview || authStore.currentUser?.avatar"
                  :alt="authStore.currentUser?.name"
                  class="w-24 h-24 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
              />
              <label
                  class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <input type="file" accept="image/*" class="hidden" @change="onAvatarSelect"/>
              </label>
            </div>
            <p class="mt-3 font-display font-bold text-xl">{{ authStore.currentUser?.name }}</p>
            <p class="text-sm text-gray-500">{{ authStore.currentUser?.email }}</p>

            <!-- Status selector -->
            <div class="flex gap-2 mt-3">
              <button
                  v-for="s in statuses"
                  :key="s.value"
                  @click="updateStatus(s.value)"
                  :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  currentStatus === s.value
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-50'
                ]"
              >
                <span :class="['w-2 h-2 rounded-full', s.color]"></span>
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1.5">Display Name</label>
              <input
                  v-model="form.name"
                  type="text"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5">Bio</label>
              <textarea
                  v-model="form.bio"
                  placeholder="Tell people about yourself..."
                  rows="2"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400 resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5">Phone</label>
              <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 outline-none focus:border-primary-400"
              />
            </div>

            <!-- Settings -->
            <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 class="font-semibold text-sm mb-3">Settings</h3>
              <div class="space-y-2">
                <!-- Sound toggle -->
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm">Message Sounds</span>
                  <button
                      @click="toggleSound"
                      :class="[
                      'relative w-11 h-6 rounded-full transition-colors',
                      soundEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    ]"
                  >
                    <span
                        :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform', soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5']"></span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="saved"
                 class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl text-green-600 dark:text-green-400 text-sm text-center">
              Profile saved successfully!
            </div>

            <div class="flex gap-3">
              <button type="submit" :disabled="saving"
                      class="btn-primary flex-1 flex items-center justify-center gap-2">
                <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Save Changes
              </button>
            </div>
          </form>

          <!-- Logout - inside scrollable area with proper spacing -->
          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button @click="logout"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-semibold">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {profileAPI} from '@/services/api'
import {soundService} from '@/services/sound'

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: authStore.currentUser?.name || '',
  bio: authStore.currentUser?.bio || '',
  phone: authStore.currentUser?.phone || '',
  avatar: null,
  avatarPreview: null,
})

const saving = ref(false)
const saved = ref(false)
const soundEnabled = ref(soundService.isEnabled())
const currentStatus = ref(authStore.currentUser?.status || 'online')

const statuses = [
  {value: 'online', label: 'Online', color: 'bg-green-500'},
  {value: 'away', label: 'Away', color: 'bg-yellow-500'},
  {value: 'offline', label: 'Offline', color: 'bg-gray-400'},
]

function onAvatarSelect(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.avatar = file
    form.value.avatarPreview = URL.createObjectURL(file)
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('name', form.value.name)
    if (form.value.bio) fd.append('bio', form.value.bio)
    if (form.value.phone) fd.append('phone', form.value.phone)
    if (form.value.avatar) fd.append('avatar', form.value.avatar)

    const res = await profileAPI.update(fd)
    authStore.updateUser(res.data.data)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) {
  }
  saving.value = false
}

async function updateStatus(status) {
  currentStatus.value = status
  try {
    await profileAPI.updateStatus(status)
    authStore.updateUser({status})
  } catch (e) {
  }
}

function toggleSound() {
  soundEnabled.value = soundService.toggle()
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>