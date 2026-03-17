<script setup>
import { ref, computed, watch } from 'vue'
import { deviceConfig, timeRangeOptions } from '../utils/deviceConfig'
import { parseDeviceCSV } from '../utils/csvParser'
import TimelineChart from './TimelineChart.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const selectedDeviceType = ref('机器人')
const selectedTimeRange = ref(3)
const selectedDeviceId = ref(null)
const sortKey = ref('boot') // boot | shutdown | duration
const sortOrder = ref('desc') // asc | desc

const deviceList = computed(() => deviceConfig[selectedDeviceType.value] || [])

const startDate = computed(() => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - selectedTimeRange.value + 1)
  start.setHours(0, 0, 0, 0)
  return start
})

const endDate = computed(() => {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return end
})

watch(selectedDeviceType, () => {
  selectedDeviceId.value = null
  loadDeviceData()
})

const devicesWithData = ref([])
const loading = ref(false)

async function loadDeviceData() {
  loading.value = true
  devicesWithData.value = []
  const list = deviceConfig[selectedDeviceType.value] || []

  for (const device of list) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/device-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: device.id,
          csvPath: device.csvPath
        })
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const text = await res.text()
      const records = parseDeviceCSV(text)
      devicesWithData.value.push({ ...device, records })
    } catch (e) {
      console.warn(`无法加载 ${device.id} 的CSV:`, e)
      devicesWithData.value.push({ ...device, records: [] })
    }
  }
  loading.value = false
}

loadDeviceData()

const selectedDevice = computed(() => {
  if (!selectedDeviceId.value) return null
  return devicesWithData.value.find(d => d.id === selectedDeviceId.value) || null
})

const selectedDeviceRecords = computed(() => {
  const records = selectedDevice.value?.records || []
  const copied = [...records]
  return copied.sort((a, b) => {
    let av
    let bv
    if (sortKey.value === 'boot') {
      av = a.boot
      bv = b.boot
    } else if (sortKey.value === 'shutdown') {
      av = a.shutdown
      bv = b.shutdown
    } else {
      // duration
      av = a.shutdown - a.boot
      bv = b.shutdown - b.boot
    }
    const diff = av - bv
    return sortOrder.value === 'asc' ? diff : -diff
  })
})

function formatDateTime(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}`
}

function formatDuration(boot, shutdown) {
  const ms = shutdown - boot
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  parts.push(`${mins}分`)
  return parts.join('')
}

function onSelectDevice(id) {
  selectedDeviceId.value = id
}

function onSort(column) {
  if (sortKey.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column
    // 默认从大到小（desc）
    sortOrder.value = 'desc'
  }
}
</script>

<template>
  <div class="device-monitor">
    <div class="control-panel">
      <div class="control-group">
        <label>设备列表:</label>
        <select v-model="selectedDeviceType" class="select">
          <option v-for="(_, type) in deviceConfig" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="control-group">
        <label>时间范围:</label>
        <select v-model="selectedTimeRange" class="select">
          <option v-for="opt in timeRangeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="time-display">
        <span>开始时间: {{ startDate.toLocaleString('zh-CN') }}</span>
        <span>结束时间: {{ endDate.toLocaleString('zh-CN') }}</span>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-swatch legend-orange"></span>
        <span class="legend-text">&lt; 1小时</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch legend-blue"></span>
        <span class="legend-text">1～12小时</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch legend-green"></span>
        <span class="legend-text">&gt; 12小时</span>
      </div>
    </div>
    <div>
      <p class="text-sm text-secondary" style="color: gray;font-size: 13px;">点击左侧设备名称查看详细上下电时间列表</p>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <TimelineChart
      v-else
      :devices="devicesWithData"
      :start-date="startDate"
      :end-date="endDate"
      :selected-days="selectedTimeRange"
      :selected-device-id="selectedDeviceId"
      @select-device="onSelectDevice"
    />

    <div v-if="selectedDevice" class="device-table">
      <div class="device-table-title">
        {{ selectedDevice.id }} 上下电记录（共 {{ selectedDeviceRecords.length }} 条）
      </div>
      <div class="device-table-wrap">
        <table>
          <thead>
            <tr>
              <th
                class="sortable"
                :class="{ active: sortKey === 'boot' }"
                @click="onSort('boot')"
              >
                上电时间
                <span v-if="sortKey === 'boot'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                class="sortable"
                :class="{ active: sortKey === 'shutdown' }"
                @click="onSort('shutdown')"
              >
                下电时间
                <span v-if="sortKey === 'shutdown'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                class="sortable"
                :class="{ active: sortKey === 'duration' }"
                @click="onSort('duration')"
              >
                时长
                <span v-if="sortKey === 'duration'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in selectedDeviceRecords" :key="i">
              <td>{{ formatDateTime(r.boot) }}</td>
              <td>{{ formatDateTime(r.shutdown) }}</td>
              <td>{{ formatDuration(r.boot, r.shutdown) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-monitor {
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.control-panel {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-size: 14px;
  color: #374151;
}

.select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 100px;
}

.time-display {
  margin-left: auto;
  display: flex;
  gap: 24px;
  font-size: 13px;
  color:rgb(74, 80, 90);
}

.legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0 12px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-swatch {
  width: 14px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.legend-orange { background: #f59e0b; }
.legend-blue { background: #3b82f6; }
.legend-green { background: #22c55e; }

.loading {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.device-table {
  margin-top: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.device-table-title {
  padding: 10px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.device-table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  white-space: nowrap;
}

thead th {
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable.active {
  color: #1d4ed8;
}

.sort-indicator {
  margin-left: 4px;
  font-size: 11px;
}

tbody tr:hover td {
  background: #f9fafb;
}
</style>
