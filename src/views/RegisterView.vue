<template>
  <div
      class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 mb-28">
    <!-- Background blobs - fixed position -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
          class="absolute -top-20 -right-20 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
      <div
          class="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Scrollable content wrapper -->
    <div class="relative flex justify-center p-4 py-8">
      <div class="w-full max-w-md">
        <!-- Logo & Title -->
        <div class="text-center mb-6">
          <div
              class="w-16 h-16 md:w-20 md:h-20 gradient-header rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-glow">
            <svg class="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h1 class="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">Create account</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Join ChatApp today</p>
        </div>

        <!-- Form Card -->
        <div
            class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-card p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          <form @submit.prevent="handleRegister" class="space-y-3.5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input
                  v-model="form.name"
                  type="text"
                  placeholder="John Doe"
                  required
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name[0] }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                  v-model="form.email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email[0] }}</p>
            </div>

            <!-- Phone (optional) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Phone <span class="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div class="relative">
                <input
                    v-model="form.password"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    required
                    class="w-full pr-12 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                />
                <button type="button" @click="showPass = !showPass"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          :d="showPass ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password[0] }}</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm
                Password</label>
              <input
                  v-model="form.password_confirmation"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="Repeat password"
                  required
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
            </div>

            <!-- Error message -->
            <div v-if="generalError"
                 class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {{ generalError }}
            </div>

            <!-- Submit Button -->
            <button
                type="submit"
                :disabled="loading"
                class="btn-primary w-full py-2.5 md:py-3 text-sm md:text-base disabled:opacity-50 flex items-center justify-center gap-2 mt-5"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ loading ? 'Creating...' : 'Create Account' }}
            </button>
          </form>

          <div class="mt-5 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?
              <router-link to="/login"
                           class="font-semibold text-primary-500 hover:text-primary-600 transition-colors ml-1">
                Sign in
              </router-link>
            </p>
          </div>
        </div>

        <!-- Bottom spacing -->
        <div class="h-8"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})
const showPass = ref(false)
const loading = ref(false)
const errors = ref({})
const generalError = ref(null)

async function handleRegister() {
  loading.value = true
  errors.value = {}
  generalError.value = null

  const result = await authStore.register(form.value)

  if (result.success) {
    router.push('/')
  } else {
    if (result.errors) {
      errors.value = result.errors
    } else {
      generalError.value = result.message
    }
  }
  loading.value = false
}
</script>