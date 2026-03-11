import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 生成模拟数据
const generateRooms = () => {
  // const roomTypes = ['办公室', '会议室', '机房', '仓库', '休息室', '实验室', '档案室', '接待室']
  const roomName = ['101-超精磨&铣磨', '105-预抛', '109-预抛光', '111-综合检测', '113-精抛', '121-光学镀膜', 
    '127/129-精修', '133-精密检测', '135-机构测试台', '138-间隔测试', '148-间隔测试']
  const roomTypes = ['加工', '加工', '加工', '检测', '加工', '镀膜', 
    '加工', '检测', '集成', '集成', '集成']
  const deviceTypes = [
    { type: '空调', icon: '❄️' },
    { type: '灯光', icon: '💡' },
    { type: '监控', icon: '📹' },
    { type: '传感器', icon: '📡' },
    { type: '门禁', icon: '🚪' },
    { type: '烟感', icon: '🔥' },
    { type: '温控', icon: '🌡️' },
    { type: '投影', icon: '📽️' }
  ]

  const rooms = []
  
  // 定义房间布局 - 5行4列
  const layout = [
    { row: 0, col: 0, w: 1, h: 1 }, { row: 0, col: 1, w: 1, h: 1 }, { row: 0, col: 2, w: 1, h: 1 }, { row: 0, col: 3, w: 1, h: 1 },
    { row: 1, col: 0, w: 1, h: 1 }, { row: 1, col: 1, w: 1, h: 1 }, { row: 1, col: 3, w: 1, h: 1 },
    { row: 2, col: 0, w: 1, h: 1 }, { row: 2, col: 1, w: 1, h: 1 }, { row: 2, col: 2, w: 1, h: 1 }, { row: 2, col: 3, w: 1, h: 1 },
    { row: 3, col: 0, w: 1, h: 1 }, { row: 3, col: 2, w: 1, h: 1 }, { row: 3, col: 3, w: 1, h: 1 },
    { row: 4, col: 0, w: 1, h: 1 }, { row: 4, col: 1, w: 1, h: 1 }, { row: 4, col: 2, w: 1, h: 1 },
    { row: 5, col: 0, w: 1, h: 1 }, { row: 5, col: 1, w: 1, h: 2 }, { row: 5, col: 2, w: 1, h: 1 },
  ]

  const pointLayout = [
    ['20,20 320,20 320,220 20,220'], ['340,20 540,20 540,420 440,420 440,220 340,220'], ['560,20 760,100 700,420 560,300']
  ]

  for (let i = 0; i < 11; i++) {
    const roomType = roomTypes[i % roomTypes.length]
    const deviceCount = Math.floor(Math.random() * 5) + 2 // 2-6个设备
    const devices = []

    for (let j = 0; j < deviceCount; j++) {
      const deviceInfo = deviceTypes[j % deviceTypes.length]
      const status = Math.random() > 0.15 ? 'online' : (Math.random() > 0.5 ? 'offline' : 'warning')
      devices.push({
        id: `D${String(i + 1).padStart(2, '0')}${String(j + 1).padStart(2, '0')}`,
        name: `${deviceInfo.type}-${j + 1}`,
        type: deviceInfo.type,
        icon: deviceInfo.icon,
        status: status,
        lastUpdate: new Date(Date.now() - Math.random() * 86400000).toLocaleString('zh-CN'),
        data: generateDeviceData(deviceInfo.type)
      })
    }

    rooms.push({
      id: i + 1,
      // name: `${roomType}-${String(i + 1).padStart(2, '0')}`,
      name: roomName[i],
      type: roomTypes[i],
      area: Math.floor(30 + Math.random() * 70), // 30-100平米
      // layout: layout[i] || { row: Math.floor(i / 4), col: i % 4, w: 1, h: 1 },
      layout: layout[i],
      // points: pointLayout[i],
      devices: devices,
      color: getRoomColor(roomType)
    })
  }

  return rooms
}

const generateDeviceData = (type) => {
  switch (type) {
    case '空调':
      return { temperature: (20 + Math.random() * 8).toFixed(1), mode: Math.random() > 0.5 ? '制冷' : '制热', power: Math.random() > 0.3 }
    case '灯光':
      return { brightness: Math.floor(Math.random() * 100), power: Math.random() > 0.2 }
    case '监控':
      return { recording: Math.random() > 0.1, storage: Math.floor(Math.random() * 100) }
    case '传感器':
      return { humidity: Math.floor(40 + Math.random() * 40), temperature: (18 + Math.random() * 12).toFixed(1) }
    case '门禁':
      return { locked: Math.random() > 0.3, lastAccess: '张三 - 14:30' }
    case '烟感':
      return { alarm: false, battery: Math.floor(60 + Math.random() * 40) }
    case '温控':
      return { setTemp: Math.floor(20 + Math.random() * 6), currentTemp: (18 + Math.random() * 10).toFixed(1) }
    case '投影':
      return { power: Math.random() > 0.5, hours: Math.floor(Math.random() * 2000) }
    default:
      return {}
  }
}

const getRoomColor = (type) => {
  const colors = {
    // '办公室': '#3B82F6',
    // '会议室': '#8B5CF6',
    // '机房': '#EF4444',
    // '仓库': '#F59E0B',
    // '休息室': '#22C55E',
    // '实验室': '#06B6D4',
    // '档案室': '#6366F1',
    // '接待室': '#EC4899'
    '加工': '#3B82F6',
    '集成': '#EF4444',
    '检测': '#F59E0B',
    '镀膜': '#22C55E'
  }
  return colors[type] || '#64748B'
}

export const useBuildingStore = defineStore('building', () => {
  const rooms = ref(generateRooms())

  const getRoomById = computed(() => {
    return (id) => rooms.value.find(room => room.id === parseInt(id))
  })

  const totalDevices = computed(() => {
    return rooms.value.reduce((sum, room) => sum + room.devices.length, 0)
  })

  const onlineDevices = computed(() => {
    return rooms.value.reduce((sum, room) => {
      return sum + room.devices.filter(d => d.status === 'online').length
    }, 0)
  })

  const warningDevices = computed(() => {
    return rooms.value.reduce((sum, room) => {
      return sum + room.devices.filter(d => d.status === 'warning').length
    }, 0)
  })

  return {
    rooms,
    getRoomById,
    totalDevices,
    onlineDevices,
    warningDevices
  }
})
