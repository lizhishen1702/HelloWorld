<template>
  <div class="p-6" v-if="room">
    <!-- 返回按钮和房间信息头 -->
    <div class="mb-6">
      <button 
        @click="goBack" 
        class="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>返回地图</span>
      </button>
      
      <div class="bg-surface rounded-xl border border-border shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div 
              class="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              :style="{ backgroundColor: room.color }"
            >
              {{ room.id }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ room.name }}</h1>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-secondary">{{ room.type }}</span>
                <span class="text-secondary">|</span>
                <span class="text-secondary">{{ room.area }}㎡</span>
                <span class="text-secondary">|</span>
                <span class="text-secondary">{{ room.devices.length }} 个设备</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span class="text-green-700 font-medium">{{ onlineCount }} 在线</span>
            </div>
            <div v-if="warningCount > 0" class="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg">
              <span class="w-3 h-3 rounded-full bg-amber-500"></span>
              <span class="text-amber-700 font-medium">{{ warningCount }} 告警</span>
            </div>
            <div v-if="offlineCount > 0" class="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="text-red-700 font-medium">{{ offlineCount }} 离线</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div class="p-4 border-b border-border bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900">设备列表</h2>
        <p class="text-sm text-secondary">查看该房间内所有设备的状态和详细信息</p>
      </div>
      
      <div class="divide-y divide-border">
        <div 
          v-for="device in room.devices" 
          :key="device.id"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <!-- 设备基本信息 -->
            <div class="flex items-center gap-4 min-w-[250px]">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                {{ device.icon }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-900">{{ device.id }}</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': device.status === 'online',
                      'bg-red-100 text-red-700': device.status === 'offline',
                      'bg-amber-100 text-amber-700': device.status === 'warning'
                    }"
                  >
                    {{ statusText(device.status) }}
                  </span>
                </div>
                <p class="text-sm text-secondary">{{ device.name }}</p>
              </div>
            </div>

            <!-- 设备数据 -->
            <div class="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div 
                v-for="(value, key) in device.data" 
                :key="key"
                class="bg-gray-50 rounded-lg px-3 py-2"
              >
                <p class="text-xs text-secondary">{{ formatKey(key) }}</p>
                <p class="font-medium text-gray-900">{{ formatValue(key, value) }}</p>
              </div>
            </div>

            <!-- 最后更新时间 -->
            <div class="text-right min-w-[140px]">
              <p class="text-xs text-secondary">最后更新</p>
              <p class="text-sm text-gray-700">{{ device.lastUpdate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间布局示意图 -->
    <div class="mt-6 bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div class="p-4 border-b border-border bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900">设备分布</h2>
        <p class="text-sm text-secondary">房间内设备位置示意图</p>
      </div>
      <div class="p-6">
        <div class="relative bg-gray-100 rounded-xl p-6 min-h-[300px]" :style="{ borderColor: room.color, borderWidth: '3px', borderStyle: 'solid' }">
          <!-- 房间名称 -->
          <div class="absolute top-2 left-2 px-3 py-1 bg-white rounded-lg shadow text-sm font-medium">
            {{ room.name }}
          </div>
          
          <!-- 设备图标分布 -->
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
            <div 
              v-for="device in room.devices" 
              :key="device.id"
              class="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="text-3xl mb-1">{{ device.icon }}</div>
              <span class="text-xs font-medium text-gray-700">{{ device.id }}</span>
              <span 
                class="w-2 h-2 rounded-full mt-1"
                :class="{
                  'bg-green-500': device.status === 'online',
                  'bg-red-500': device.status === 'offline',
                  'bg-amber-500': device.status === 'warning'
                }"
              ></span>
            </div>
          </div>
          
          <!-- 门的位置 -->
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div class="w-16 h-4 bg-amber-600 rounded-t-lg flex items-center justify-center">
              <span class="text-white text-xs">门</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-else class="p-6">
    <div class="bg-surface rounded-xl border border-border shadow-sm p-12 text-center">
      <p class="text-secondary">房间不存在或正在加载...</p>
      <button 
        @click="goBack" 
        class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        返回地图
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBuildingStore } from '../stores/buildingStore'

const route = useRoute()
const router = useRouter()
const store = useBuildingStore()

const room = computed(() => store.getRoomById(route.params.id))

const onlineCount = computed(() => room.value?.devices.filter(d => d.status === 'online').length || 0)
const offlineCount = computed(() => room.value?.devices.filter(d => d.status === 'offline').length || 0)
const warningCount = computed(() => room.value?.devices.filter(d => d.status === 'warning').length || 0)

const goBack = () => {
  router.push('/')
}

const statusText = (status) => {
  const map = {
    'online': '在线',
    'offline': '离线',
    'warning': '告警'
  }
  return map[status] || status
}

const formatKey = (key) => {
  const map = {
    'temperature': '温度',
    'humidity': '湿度',
    'brightness': '亮度',
    'power': '电源',
    'mode': '模式',
    'recording': '录制中',
    'storage': '存储空间',
    'locked': '锁定状态',
    'lastAccess': '最后访问',
    'alarm': '报警状态',
    'battery': '电池电量',
    'setTemp': '设定温度',
    'currentTemp': '当前温度',
    'hours': '使用时长'
  }
  return map[key] || key
}

const formatValue = (key, value) => {
  if (typeof value === 'boolean') {
    if (key === 'power') return value ? '开启' : '关闭'
    if (key === 'recording') return value ? '是' : '否'
    if (key === 'locked') return value ? '已锁' : '未锁'
    if (key === 'alarm') return value ? '报警' : '正常'
    return value ? '是' : '否'
  }
  if (key === 'temperature' || key === 'currentTemp' || key === 'setTemp') return `${value}°C`
  if (key === 'humidity' || key === 'storage' || key === 'battery' || key === 'brightness') return `${value}%`
  if (key === 'hours') return `${value}小时`
  return value
}
</script>
