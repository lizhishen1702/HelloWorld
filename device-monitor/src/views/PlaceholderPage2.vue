<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const navItems = [
  { key: 'active', label: '激活的异常' },
  { key: 'log', label: '异常事件日志' },
  { key: 'stats', label: '异常统计' },
]

const devices = ['机器人1', '机器人2', '机器人3']

const currentNav = ref('log')
const selectedDevice = ref(devices[0])
const startTime = ref('')
const endTime = ref('')

const loading = ref(false)
const rows = ref([])
const statsRows = ref([])

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}.${ms}`
}

async function fetchData() {
  loading.value = true
  try {
    // 这里只是预留接口和参数格式，后端可按此实现
    const res = await axios.get(`${API_BASE_URL}/alerts`, {
      params: {
        type: currentNav.value, // active | log | stats
        deviceId: selectedDevice.value,
        startTime: startTime.value,
        endTime: endTime.value,
      },
    })

    if (currentNav.value === 'stats') {
      statsRows.value = Array.isArray(res.data) ? res.data : []
    } else {
      rows.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (e) {
    console.warn('获取异常数据失败（接口占位）：', e)
    if (currentNav.value === 'stats') {
      statsRows.value = []
    } else {
      rows.value = []
    }
  } finally {
    loading.value = false
  }
}

function onSearch() {
  fetchData()
}

function onNavClick(key) {
  if (currentNav.value === key) return
  currentNav.value = key
  fetchData()
}

const showStatusAndClearTime = computed(() => currentNav.value === 'log')

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="abnormal-page">
    <div class="sidebar">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: currentNav === item.key }"
        @click="onNavClick(item.key)"
      >
        <span class="nav-indicator" />
        <span class="nav-text">{{ item.label }}</span>
      </div>
    </div>

    <div class="main-panel">
      <div class="filter-bar">
        <div class="filter-group">
          <label>设备</label>
          <select v-model="selectedDevice">
            <option v-for="dev in devices" :key="dev" :value="dev">
              {{ dev }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>开始时间</label>
          <input v-model="startTime" type="datetime-local" />
        </div>
        <div class="filter-group">
          <label>结束时间</label>
          <input v-model="endTime" type="datetime-local" />
        </div>
        <button class="btn" type="button" @click="onSearch">下载</button>
      </div>

      <div class="table-container">
        <div class="table-header">
          <span v-if="currentNav === 'log'">异常事件日志</span>
          <span v-else-if="currentNav === 'active'">激活的异常</span>
          <span v-else>异常统计</span>
        </div>

        <div v-if="loading" class="table-loading">加载中...</div>

        <table v-else-if="currentNav !== 'stats'">
          <thead>
            <tr>
              <th>异常等级</th>
              <th>触发时间</th>
              <th>模块</th>
              <th>异常码</th>
              <th v-if="showStatusAndClearTime">状态</th>
              <th v-if="showStatusAndClearTime">清除时间</th>
              <th>异常描述</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="idx">
              <td>{{ row.level || row.severity || '' }}</td>
              <td>{{ formatDateTime(row.triggerTime || row.time) }}</td>
              <td>{{ row.module || '' }}</td>
              <td>{{ row.code || '' }}</td>
              <td v-if="showStatusAndClearTime">{{ row.status || '' }}</td>
              <td v-if="showStatusAndClearTime">
                {{ formatDateTime(row.clearTime) }}
              </td>
              <td>{{ row.description || row.message || '' }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td :colspan="showStatusAndClearTime ? 7 : 5" class="empty-cell">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else>
          <thead>
            <tr>
              <th>模块</th>
              <th>异常等级</th>
              <th>次数</th>
              <th>首次发生时间</th>
              <th>最近发生时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in statsRows" :key="idx">
              <td>{{ row.module || '' }}</td>
              <td>{{ row.level || row.severity || '' }}</td>
              <td>{{ row.count ?? '' }}</td>
              <td>{{ formatDateTime(row.firstTime) }}</td>
              <td>{{ formatDateTime(row.lastTime) }}</td>
            </tr>
            <tr v-if="!statsRows.length">
              <td colspan="5" class="empty-cell">暂无统计数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.abnormal-page {
  display: flex;
  min-height: 100vh;
  background: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sidebar {
  width: 180px;
  background: #ffffff;
  border-right: 1px solid #d1d5db;
  padding-top: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  color: #4b5563;
  font-size: 14px;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #eef2ff;
  color: #1d4ed8;
  font-weight: 600;
}

.nav-indicator {
  width: 4px;
  height: 16px;
  border-radius: 999px;
  background: transparent;
  margin-right: 8px;
}

.nav-item.active .nav-indicator {
  background: #2563eb;
}

.main-panel {
  flex: 1;
  padding: 16px 24px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.filter-group select,
.filter-group input {
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: #ffffff;
}

.btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.btn:hover {
  background: #1d4ed8;
}

.table-container {
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  min-height: 300px;
}

.table-header {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #374151;
}

.table-loading {
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

thead th {
  background: #f9fafb;
  color: #4b5563;
  font-weight: 500;
}

tbody tr:hover td {
  background: #f3f4f6;
}

.empty-cell {
  text-align: center;
  color: #6b7280;
}
</style>