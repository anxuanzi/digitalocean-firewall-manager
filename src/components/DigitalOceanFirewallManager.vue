<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          DigitalOcean Firewall Manager
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage your firewall rules with batch editing capabilities
        </p>
      </div>

      <!-- Token Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            API Configuration
          </h2>
          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                isConnected
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              ]"
            >
              {{ isConnected ? 'Connected' : 'Not Connected' }}
            </span>
            <button
              v-if="isConnected"
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              @click="disconnect"
            >
              Disconnect
            </button>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1 relative">
            <input
              v-model="apiToken"
              :type="showToken ? 'text' : 'password'"
              class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your DigitalOcean Personal Access Token"
              @keyup.enter="connectToAPI"
            />
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              type="button"
              @click="showToken = !showToken"
            >
              <svg v-if="!showToken" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2"/>
              </svg>
            </button>
          </div>
          <button
            :disabled="!apiToken || loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            @click="connectToAPI"
          >
            {{ loading ? 'Connecting...' : 'Connect' }}
          </button>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Note: Due to CORS restrictions, you may need to use a proxy or browser extension for API calls.
          </p>
          <p v-if="isConnected" class="text-xs text-green-600 dark:text-green-400">
            Token saved locally
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="isConnected" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Firewall List -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Firewalls
              </h2>
              <button
                class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                @click="createNewFirewall"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
              </button>
            </div>

            <div v-if="loadingFirewalls" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="firewall in firewalls"
                :key="firewall.id"
                :class="[
                  'p-4 rounded-lg cursor-pointer transition-all',
                  selectedFirewall?.id === firewall.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                ]"
                @click="selectFirewall(firewall)"
              >
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ firewall.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ firewall.droplet_ids?.length || 0 }} droplets
                </div>
                <div class="flex gap-2 mt-2">
                  <span
                    class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                    {{ firewall.inbound_rules?.length || 0 }} inbound
                  </span>
                  <span
                    class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                    {{ firewall.outbound_rules?.length || 0 }} outbound
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Firewall Editor -->
        <div class="lg:col-span-2">
          <div v-if="selectedFirewall" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <input
                  v-model="editingFirewall.name"
                  class="text-2xl font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div class="flex gap-2">
                <button
                  :disabled="saving"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  @click="saveFirewall"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
                <button
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  @click="deleteFirewall"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav class="flex gap-8">
                <button
                  v-for="tab in tabs"
                  :key="tab"
                  :class="[
                    'pb-3 text-sm font-medium transition-colors relative',
                    activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  ]"
                  @click="activeTab = tab"
                >
                  {{ tab }}
                  <div
                    v-if="activeTab === tab"
                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  ></div>
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div v-if="activeTab === 'Inbound Rules'">
              <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Inbound Rules
                </h3>
                <button
                  class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  @click="addRule('inbound')"
                >
                  Add Rule
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(rule, index) in editingFirewall.inbound_rules"
                  :key="index"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div class="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Protocol
                      </label>
                      <select
                        v-model="rule.protocol"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="icmp">ICMP</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ports
                      </label>
                      <input
                        v-model="rule.ports"
                        :disabled="rule.protocol === 'icmp'"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="e.g., 80, 443, 8000-9000"
                        type="text"
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sources (IPs, CIDRs, or Tags) - One per line for batch editing
                    </label>
                    <textarea
                      v-model="rule.sourcesText"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Enter IPs, CIDR blocks, or tags (one per line)&#10;e.g.:&#10;192.168.1.0/24&#10;10.0.0.1&#10;tag:web-servers"
                      rows="3"
                      @input="updateRuleSources(rule, $event)"
                    ></textarea>
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ countSources(rule) }} sources
                    </div>
                  </div>

                  <div class="flex justify-between items-center">
                    <button
                      class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      @click="duplicateRule('inbound', index)"
                    >
                      Duplicate
                    </button>
                    <button
                      class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      @click="removeRule('inbound', index)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'Outbound Rules'">
              <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Outbound Rules
                </h3>
                <button
                  class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  @click="addRule('outbound')"
                >
                  Add Rule
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(rule, index) in editingFirewall.outbound_rules"
                  :key="index"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div class="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Protocol
                      </label>
                      <select
                        v-model="rule.protocol"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="icmp">ICMP</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ports
                      </label>
                      <input
                        v-model="rule.ports"
                        :disabled="rule.protocol === 'icmp'"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="e.g., 80, 443, 8000-9000"
                        type="text"
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Destinations (IPs, CIDRs, or Tags) - One per line for batch editing
                    </label>
                    <textarea
                      v-model="rule.destinationsText"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Enter IPs, CIDR blocks, or tags (one per line)&#10;e.g.:&#10;192.168.1.0/24&#10;10.0.0.1&#10;tag:web-servers"
                      rows="3"
                      @input="updateRuleDestinations(rule, $event)"
                    ></textarea>
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ countDestinations(rule) }} destinations
                    </div>
                  </div>

                  <div class="flex justify-between items-center">
                    <button
                      class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      @click="duplicateRule('outbound', index)"
                    >
                      Duplicate
                    </button>
                    <button
                      class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      @click="removeRule('outbound', index)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'Droplets & Tags'">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Droplet IDs (one per line)
                  </label>
                  <textarea
                    v-model="dropletsText"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Enter droplet IDs, one per line"
                    rows="4"
                    @input="updateDroplets"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (one per line)
                  </label>
                  <textarea
                    v-model="tagsText"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Enter tags, one per line"
                    rows="4"
                    @input="updateTags"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Firewall Selected
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Select a firewall from the list or create a new one to get started
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="fixed bottom-4 right-4 max-w-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg animate-slide-up z-50"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path clip-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    fill-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>
          <button
            class="ml-auto pl-3"
            @click="error = ''"
          >
            <svg class="h-4 w-4 text-red-400 hover:text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path clip-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    fill-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div
        v-if="success"
        class="fixed bottom-4 right-4 max-w-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg animate-slide-up z-50"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path clip-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    fill-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-800 dark:text-green-200">{{ success }}</p>
          </div>
          <button
            class="ml-auto pl-3"
            @click="success = ''"
          >
            <svg class="h-4 w-4 text-green-400 hover:text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path clip-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    fill-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

interface FirewallRule {
  protocol: 'tcp' | 'udp' | 'icmp'
  ports?: string
  sources?: {
    addresses?: string[]
    tags?: string[]
    droplet_ids?: number[]
    load_balancer_uids?: string[]
  }
  destinations?: {
    addresses?: string[]
    tags?: string[]
    droplet_ids?: number[]
    load_balancer_uids?: string[]
  }
  sourcesText?: string
  destinationsText?: string
}

interface Firewall {
  id?: string
  name: string
  status?: string
  inbound_rules?: FirewallRule[]
  outbound_rules?: FirewallRule[]
  created_at?: string
  droplet_ids?: number[]
  tags?: string[]
  pending_changes?: any[]
}

const apiToken = ref('')
const isConnected = ref(false)
const loading = ref(false)
const loadingFirewalls = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showToken = ref(false)

const firewalls = ref<Firewall[]>([])
const selectedFirewall = ref<Firewall | null>(null)
const editingFirewall = ref<Firewall>({
  name: '',
  inbound_rules: [],
  outbound_rules: [],
  droplet_ids: [],
  tags: []
})

const dropletsText = ref('')
const tagsText = ref('')

const tabs = ['Inbound Rules', 'Outbound Rules', 'Droplets & Tags']
const activeTab = ref('Inbound Rules')

const API_BASE = 'https://api.digitalocean.com/v2'
const TOKEN_STORAGE_KEY = 'do_firewall_manager_token'

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiToken.value}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || `API Error: ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}

// Connect to API and fetch firewalls
const connectToAPI = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await fetchFirewalls()
    isConnected.value = true
    // Save token to localStorage on successful connection
    localStorage.setItem(TOKEN_STORAGE_KEY, apiToken.value)
    success.value = 'Successfully connected to DigitalOcean API'
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to connect to API. Please check your token and CORS settings.'
    setTimeout(() => error.value = '', 5000)
    isConnected.value = false
  } finally {
    loading.value = false
  }
}

// Disconnect and clear token
const disconnect = () => {
  if (confirm('This will clear your saved token. Are you sure?')) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    apiToken.value = ''
    isConnected.value = false
    firewalls.value = []
    selectedFirewall.value = null
    editingFirewall.value = {
      name: '',
      inbound_rules: [],
      outbound_rules: [],
      droplet_ids: [],
      tags: []
    }
    success.value = 'Disconnected and token cleared'
    setTimeout(() => success.value = '', 3000)
  }
}

// Fetch all firewalls
const fetchFirewalls = async () => {
  loadingFirewalls.value = true
  try {
    const data = await apiCall('/firewalls')
    firewalls.value = data.firewalls || []
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch firewalls'
    setTimeout(() => error.value = '', 5000)
    throw err
  } finally {
    loadingFirewalls.value = false
  }
}

// Select a firewall for editing
const selectFirewall = (firewall: Firewall) => {
  selectedFirewall.value = firewall
  editingFirewall.value = JSON.parse(JSON.stringify(firewall))

  // Initialize text fields for batch editing
  if (editingFirewall.value.inbound_rules) {
    editingFirewall.value.inbound_rules.forEach(rule => {
      rule.sourcesText = formatSourcesAsText(rule.sources)
    })
  }

  if (editingFirewall.value.outbound_rules) {
    editingFirewall.value.outbound_rules.forEach(rule => {
      rule.destinationsText = formatSourcesAsText(rule.destinations)
    })
  }

  dropletsText.value = editingFirewall.value.droplet_ids?.join('\n') || ''
  tagsText.value = editingFirewall.value.tags?.join('\n') || ''

  // Show success message
  success.value = `Loaded firewall: ${firewall.name}`
  setTimeout(() => success.value = '', 2000)
}

// Format sources/destinations as text for batch editing
const formatSourcesAsText = (sources: any): string => {
  if (!sources) return ''
  const lines: string[] = []

  if (sources.addresses) {
    lines.push(...sources.addresses)
  }
  if (sources.tags) {
    lines.push(...sources.tags.map((t: string) => `tag:${t}`))
  }
  if (sources.droplet_ids) {
    lines.push(...sources.droplet_ids.map((id: number) => `droplet:${id}`))
  }
  if (sources.load_balancer_uids) {
    lines.push(...sources.load_balancer_uids.map((uid: string) => `lb:${uid}`))
  }

  return lines.join('\n')
}

// Parse text input to sources/destinations
const parseTextToSources = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim())
  const sources: any = {}

  const addresses: string[] = []
  const tags: string[] = []
  const droplet_ids: number[] = []
  const load_balancer_uids: string[] = []

  lines.forEach(line => {
    line = line.trim()
    if (line.startsWith('tag:')) {
      tags.push(line.substring(4))
    } else if (line.startsWith('droplet:')) {
      const id = parseInt(line.substring(8))
      if (!isNaN(id)) droplet_ids.push(id)
    } else if (line.startsWith('lb:')) {
      load_balancer_uids.push(line.substring(3))
    } else if (line) {
      // Assume it's an IP or CIDR
      addresses.push(line)
    }
  })

  if (addresses.length) sources.addresses = addresses
  if (tags.length) sources.tags = tags
  if (droplet_ids.length) sources.droplet_ids = droplet_ids
  if (load_balancer_uids.length) sources.load_balancer_uids = load_balancer_uids

  return Object.keys(sources).length ? sources : undefined
}

// Update rule sources from text input
const updateRuleSources = (rule: FirewallRule, event: Event) => {
  const text = (event.target as HTMLTextAreaElement).value
  rule.sources = parseTextToSources(text)
}

// Update rule destinations from text input
const updateRuleDestinations = (rule: FirewallRule, event: Event) => {
  const text = (event.target as HTMLTextAreaElement).value
  rule.destinations = parseTextToSources(text)
}

// Update droplets from text
const updateDroplets = () => {
  const ids = dropletsText.value
    .split('\n')
    .filter(line => line.trim())
    .map(line => parseInt(line.trim()))
    .filter(id => !isNaN(id))

  editingFirewall.value.droplet_ids = ids
}

// Update tags from text
const updateTags = () => {
  const tagList = tagsText.value
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.trim())

  editingFirewall.value.tags = tagList
}

// Count sources in a rule
const countSources = (rule: FirewallRule): number => {
  if (!rule.sources) return 0
  let count = 0
  if (rule.sources.addresses) count += rule.sources.addresses.length
  if (rule.sources.tags) count += rule.sources.tags.length
  if (rule.sources.droplet_ids) count += rule.sources.droplet_ids.length
  if (rule.sources.load_balancer_uids) count += rule.sources.load_balancer_uids.length
  return count
}

// Count destinations in a rule
const countDestinations = (rule: FirewallRule): number => {
  if (!rule.destinations) return 0
  let count = 0
  if (rule.destinations.addresses) count += rule.destinations.addresses.length
  if (rule.destinations.tags) count += rule.destinations.tags.length
  if (rule.destinations.droplet_ids) count += rule.destinations.droplet_ids.length
  if (rule.destinations.load_balancer_uids) count += rule.destinations.load_balancer_uids.length
  return count
}

// Add a new rule
const addRule = (type: 'inbound' | 'outbound') => {
  const newRule: FirewallRule = {
    protocol: 'tcp',
    ports: '80',
    sourcesText: '',
    destinationsText: ''
  }

  if (type === 'inbound') {
    newRule.sources = { addresses: ['0.0.0.0/0'] }
    newRule.sourcesText = '0.0.0.0/0'
    if (!editingFirewall.value.inbound_rules) {
      editingFirewall.value.inbound_rules = []
    }
    // Add new rule at the beginning (top) of the array
    editingFirewall.value.inbound_rules.unshift(newRule)
  } else {
    newRule.destinations = { addresses: ['0.0.0.0/0'] }
    newRule.destinationsText = '0.0.0.0/0'
    if (!editingFirewall.value.outbound_rules) {
      editingFirewall.value.outbound_rules = []
    }
    // Add new rule at the beginning (top) of the array
    editingFirewall.value.outbound_rules.unshift(newRule)
  }

  // Show success message
  success.value = `New ${type} rule added`
  setTimeout(() => success.value = '', 2000)
}

// Remove a rule
const removeRule = (type: 'inbound' | 'outbound', index: number) => {
  if (type === 'inbound') {
    editingFirewall.value.inbound_rules?.splice(index, 1)
  } else {
    editingFirewall.value.outbound_rules?.splice(index, 1)
  }

  // Show success message
  success.value = `${type.charAt(0).toUpperCase() + type.slice(1)} rule removed`
  setTimeout(() => success.value = '', 2000)
}

// Duplicate a rule
const duplicateRule = (type: 'inbound' | 'outbound', index: number) => {
  if (type === 'inbound' && editingFirewall.value.inbound_rules) {
    const rule = JSON.parse(JSON.stringify(editingFirewall.value.inbound_rules[index]))
    // Insert duplicated rule right after the original (at the top if original is at top)
    editingFirewall.value.inbound_rules.splice(index, 0, rule)
  } else if (type === 'outbound' && editingFirewall.value.outbound_rules) {
    const rule = JSON.parse(JSON.stringify(editingFirewall.value.outbound_rules[index]))
    // Insert duplicated rule right after the original (at the top if original is at top)
    editingFirewall.value.outbound_rules.splice(index, 0, rule)
  }

  // Show success message
  success.value = `${type.charAt(0).toUpperCase() + type.slice(1)} rule duplicated`
  setTimeout(() => success.value = '', 2000)
}

// Create a new firewall
const createNewFirewall = () => {
  selectedFirewall.value = null
  editingFirewall.value = {
    name: 'New Firewall',
    inbound_rules: [],
    outbound_rules: [],
    droplet_ids: [],
    tags: []
  }
  dropletsText.value = ''
  tagsText.value = ''
  activeTab.value = 'Inbound Rules'

  // Show info message
  success.value = 'New firewall created. Configure rules and save.'
  setTimeout(() => success.value = '', 3000)
}

// Save firewall changes
const saveFirewall = async () => {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    // Clean up the firewall object before sending
    const firewallData = JSON.parse(JSON.stringify(editingFirewall.value))

    // Remove helper properties
    if (firewallData.inbound_rules) {
      firewallData.inbound_rules.forEach((rule: any) => {
        delete rule.sourcesText
        if (rule.protocol === 'icmp') {
          delete rule.ports
        }
      })
    }

    if (firewallData.outbound_rules) {
      firewallData.outbound_rules.forEach((rule: any) => {
        delete rule.destinationsText
        if (rule.protocol === 'icmp') {
          delete rule.ports
        }
      })
    }

    if (selectedFirewall.value?.id) {
      // Update existing firewall
      await apiCall(`/firewalls/${selectedFirewall.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(firewallData)
      })
      success.value = 'Firewall updated successfully'
    } else {
      // Create new firewall
      const response = await apiCall('/firewalls', {
        method: 'POST',
        body: JSON.stringify(firewallData)
      })
      selectedFirewall.value = response.firewall
      editingFirewall.value = JSON.parse(JSON.stringify(response.firewall))
      success.value = 'Firewall created successfully'
    }

    await fetchFirewalls()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to save firewall'
    setTimeout(() => error.value = '', 5000)
  } finally {
    saving.value = false
  }
}

// Delete firewall
const deleteFirewall = async () => {
  if (!selectedFirewall.value?.id) return

  if (!confirm(`Are you sure you want to delete the firewall "${selectedFirewall.value.name}"?`)) {
    return
  }

  error.value = ''
  success.value = ''

  try {
    await apiCall(`/firewalls/${selectedFirewall.value.id}`, {
      method: 'DELETE'
    })

    success.value = 'Firewall deleted successfully'
    selectedFirewall.value = null
    await fetchFirewalls()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to delete firewall'
    setTimeout(() => error.value = '', 5000)
  }
}

// Clear messages after timeout - removed since we handle timeouts inline now

// Load token from localStorage on mount
onMounted(async () => {
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (savedToken) {
    apiToken.value = savedToken
    // Auto-connect with saved token
    await connectToAPI()
  }
})
</script>

<style scoped>
/* Animation for toast notifications */
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Custom scrollbar for dark mode */
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1f2937;
  }

  ::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
}
</style>