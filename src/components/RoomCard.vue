<template>
  <div 
    class="room-card group cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1"
    :style="{ 
      borderColor: room.color,
      backgroundColor: `${room.color}10`,
      gridColumn: `span ${room.layout.w}`,
      gridRow: `span ${room.layout.h}`
    }"
  >
    <!-- 房间头部 -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-bold text-gray-900 group-hover:text-primary transition-colors">
          {{ room.name }}
        </h3>
        <p class="text-xs text-secondary">{{ room.area }}㎡</p>
      </div>
      <div 
        class="px-2 py-1 rounded-full text-xs font-medium text-white"
        :style="{ backgroundColor: room.color }"
      >
        {{ room.type }}
      </div>
    </div>

    <!-- 设备列表预览 -->
    <div class="space-y-1.5 mb-3">
      <div 
        v-for="device in room.devices.slice(0, 3)" 
        :key="device.id"
        class="flex items-center justify-between text-xs bg-white/60 rounded-lg px-2 py-1.5"
      >
        <div class="flex items-center gap-1.5">
          <span>{{ device.icon }}</span>
          <span class="text-gray-700 font-medium">{{ device.id }}</span>
        </div>
        <span 
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-green-500': device.status === 'online',
            'bg-red-500': device.status === 'offline',
            'bg-amber-500': device.status === 'warning'
          }"
        ></span>
      </div>
      <div v-if="room.devices.length > 3" class="text-xs text-secondary text-center">
        +{{ room.devices.length - 3 }} 个设备
      </div>
    </div>

    <!-- 底部状态 -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-200/50">
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1 text-xs">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          <span class="text-secondary">{{ onlineCount }}</span>
        </span>
        <span v-if="warningCount > 0" class="flex items-center gap-1 text-xs">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span class="text-secondary">{{ warningCount }}</span>
        </span>
        <span v-if="offlineCount > 0" class="flex items-center gap-1 text-xs">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          <span class="text-secondary">{{ offlineCount }}</span>
        </span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const onlineCount = computed(() => props.room.devices.filter(d => d.status === 'online').length)
const offlineCount = computed(() => props.room.devices.filter(d => d.status === 'offline').length)
const warningCount = computed(() => props.room.devices.filter(d => d.status === 'warning').length)
</script>

<style scoped>
.room-card {
  min-height: 140px;
  display: flex;
  flex-direction: column;
}
</style>
