<script setup>
import { ref } from 'vue'
// 如果你用 vue-router，可以引入 useRouter
// import { useRouter } from 'vue-router'
// const router = useRouter()

// 1. 定义房间数据 (核心坐标与尺寸)
// x, y 是左上角坐标，width, height 是宽高
const rooms = ref([
  { id: 1, name: 'A区: 组装车间', x: 20, y: 20, width: 300, height: 200, link: '/room/assembly', status: 'normal' },
  { id: 2, name: 'B区: CNC加工', x: 340, y: 20, width: 200, height: 400, link: '/room/cnc', status: 'warning' },
  { id: 3, name: 'C区: 质检室', x: 20, y: 240, width: 140, height: 180, link: '/room/qa', status: 'normal' },
  { id: 4, name: 'D区: 喷涂线', x: 180, y: 240, width: 140, height: 180, link: '/room/paint', status: 'error' },
  { id: 5, name: '库房', x: 560, y: 20, width: 200, height: 400, link: '/room/storage', status: 'normal' },
])

// 2. 点击跳转逻辑
const handleRoomClick = (room) => {
  console.log(`准备跳转到: ${room.name}, 链接: ${room.link}`)
  
  // 方案A: 使用 Vue Router 跳转 (推荐)
  // router.push(room.link)
  
  // 方案B: 打开新网页
  // window.open(room.link, '_blank')
  
  // 方案C: 触发父组件事件，比如在右侧展开房间详情弹窗
  // emit('open-detail', room)
}

// 3. 根据状态返回不同的边框颜色 (复用咱们之前聊的高亮思路)
const getRoomClass = (status) => {
  const base = "transition-all duration-300 cursor-pointer stroke-2 "
  switch(status) {
    case 'warning': return base + "fill-amber-50 stroke-amber-400 hover:fill-amber-100"
    case 'error': return base + "fill-red-50 stroke-red-500 hover:fill-red-100 animate-pulse"
    default: return base + "fill-white stroke-slate-300 hover:fill-indigo-50 hover:stroke-indigo-400"
  }
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-200">
    <h2 class="text-xl font-bold text-slate-800 mb-6">📍 生产车间实时二维图</h2>
    
    <div class="relative w-full aspect-[16/9] bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden">
      <svg 
        viewBox="0 0 800 450" 
        class="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g 
          v-for="room in rooms" 
          :key="room.id" 
          @click="handleRoomClick(room)"
          class="group"
        >
          <rect 
            :x="room.x" 
            :y="room.y" 
            :width="room.width" 
            :height="room.height" 
            rx="8" 
            :class="getRoomClass(room.status)"
            class="room-shape"
          />
          
          <text 
            :x="room.x + room.width / 2" 
            :y="room.y + room.height / 2" 
            text-anchor="middle" 
            dominant-baseline="middle"
            class="font-bold text-sm pointer-events-none transition-colors"
            :class="room.status === 'error' ? 'fill-red-700' : 'fill-slate-600 group-hover:fill-indigo-700'"
          >
            {{ room.name }}
          </text>
        </g>
      </svg>
    </div>
    
    <div class="mt-4 flex gap-4 text-sm text-slate-500 justify-end">
      <span class="flex items-center gap-1"><div class="w-3 h-3 bg-white border-2 border-slate-300 rounded-sm"></div> 正常</span>
      <span class="flex items-center gap-1"><div class="w-3 h-3 bg-amber-50 border-2 border-amber-400 rounded-sm"></div> 警告</span>
      <span class="flex items-center gap-1"><div class="w-3 h-3 bg-red-50 border-2 border-red-500 rounded-sm animate-pulse"></div> 故障</span>
    </div>
  </div>
</template>

<style scoped>
/* 给房间加一点悬停时的立体感 */
.room-shape:hover {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transform: translateY(-2px);
}
</style>