<template>
  <div class="p-6">
    <!-- 统计面板 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-surface rounded-xl p-4 border border-border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-secondary">房间总数</p>
            <p class="text-2xl font-bold text-gray-900">{{ store.rooms.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-surface rounded-xl p-4 border border-border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-secondary">设备总数</p>
            <p class="text-2xl font-bold text-gray-900">{{ store.totalDevices }}</p>
          </div>
        </div>
      </div>
      <div class="bg-surface rounded-xl p-4 border border-border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-secondary">在线设备</p>
            <p class="text-2xl font-bold text-green-600">{{ store.onlineDevices }}</p>
          </div>
        </div>
      </div>
      <div class="bg-surface rounded-xl p-4 border border-border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-secondary">告警设备</p>
            <p class="text-2xl font-bold text-amber-600">{{ store.warningDevices }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="bg-surface rounded-xl p-4 border border-border shadow-sm mb-6">
      <h3 class="text-sm font-medium text-gray-700 mb-3">房间类型图例</h3>
      <div class="flex flex-wrap gap-4">
        <div v-for="(color, type) in roomColors" :key="type" class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :style="{ backgroundColor: color }"></div>
          <span class="text-sm text-secondary">{{ type }}</span>
        </div>
      </div>
    </div>

    <!-- 室内地图 -->
    <div class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div class="p-4 border-b border-border bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900">室内平面图</h2>
        <p class="text-sm text-secondary">点击房间查看详细设备信息</p>
      </div>
      <div class="p-6">
        <div class="indoor-map">
          <RoomCard 
            v-for="room in store.rooms" 
            :key="room.id" 
            :room="room"
            @click="goToRoom(room.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useBuildingStore } from '../stores/buildingStore'
import RoomCard from '../components/RoomCard.vue'

const router = useRouter()
const store = useBuildingStore()

const roomColors = {
  '加工': '#3B82F6',
  '检测': '#F59E0B',
  '集成': '#EF4444',
  '镀膜': '#22C55E',
}

const goToRoom = (id) => {
  router.push(`/room/${id}`)
}
</script>

<style scoped>
.indoor-map {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(140px, auto);
  gap: 12px;
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .indoor-map {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .indoor-map {
    grid-template-columns: 1fr;
  }
}
</style>
