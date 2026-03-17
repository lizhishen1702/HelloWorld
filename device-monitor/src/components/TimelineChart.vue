<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getBarColor } from '../utils/csvParser'

const emit = defineEmits(['select-device'])

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  /** 所选天数（1/2/3/5/7），用于动态时间轴刻度 */
  selectedDays: {
    type: Number,
    default: 3
  },
  selectedDeviceId: {
    type: String,
    default: null
  },
  rowHeight: {
    type: Number,
    default: 40
  }
})

const totalDays = computed(() => {
  const diff = props.endDate - props.startDate
  return Math.ceil(diff / (24 * 60 * 60 * 1000)) || 1
})

const dateHeaders = computed(() => {
  const dates = []
  const d = new Date(props.startDate)
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < totalDays.value; i++) {
    dates.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
})

const timeRangeMs = computed(() => props.endDate - props.startDate)

const rightColRef = ref(null)
const rightColWidthPx = ref(0)
let ro

onMounted(() => {
  if (!rightColRef.value) return
  const el = rightColRef.value
  const update = () => {
    rightColWidthPx.value = Math.max(0, Math.floor(el.clientWidth || 0))
  }
  update()
  ro = new ResizeObserver(() => update())
  ro.observe(el)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  ro = undefined
})

// 时间轴绘制宽度：不滚动，始终压缩适配容器宽度
const timelineWidthPx = computed(() => Math.max(1, rightColWidthPx.value || 1))
const dayWidthPx = computed(() => timelineWidthPx.value / totalDays.value)

/** 根据所选天数+容器宽度动态生成时间轴刻度。返回 { time: Date, label: string, leftPct: number } */
const timeTicks = computed(() => {
  const days = props.selectedDays
  const ticks = []
  const start = new Date(props.startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(props.endDate)

  // 先按天数给一个默认间隔（小时）
  let baseIntervalHours
  if (days <= 1) baseIntervalHours = 2
  else if (days <= 2) baseIntervalHours = 4
  else if (days <= 3) baseIntervalHours = 6
  else if (days <= 5) baseIntervalHours = 12
  else if (days <= 7) baseIntervalHours = 24
  else if (days <= 15) baseIntervalHours = 48
  else baseIntervalHours = 96

  // 再根据容器宽度做“降采样”，保证刻度标签不拥挤
  const minTickPx = 60
  const maxTicks = Math.max(2, Math.floor(timelineWidthPx.value / minTickPx))
  const rangeHours = Math.max(1, timeRangeMs.value / (60 * 60 * 1000))
  const candidates = [1, 2, 3, 4, 6, 8, 12, 24, 48, 96, 168]
  let intervalHours = baseIntervalHours
  for (const c of candidates) {
    if (c < baseIntervalHours) continue
    const tickCount = Math.ceil(rangeHours / c) + 1
    if (tickCount <= maxTicks) {
      intervalHours = c
      break
    }
  }

  const t = new Date(start)
  while (t <= end) {
    const time = new Date(t)
    const h = time.getHours()
    const m = time.getMinutes()
    const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const leftPct = ((time - props.startDate) / timeRangeMs.value) * 100
    if (leftPct >= 0 && leftPct <= 100) ticks.push({ time, label, leftPct })
    t.setTime(t.getTime() + intervalHours * 60 * 60 * 1000)
  }
  return ticks
})

function getBarPosition(record) {
  // 将条形限定在可视时间范围 [startDate, endDate] 内
  const visibleStart = record.boot < props.startDate ? props.startDate : record.boot
  const visibleEnd = record.shutdown > props.endDate ? props.endDate : record.shutdown

  const startOffset = visibleStart - props.startDate
  const duration = visibleEnd - visibleStart

  const leftPct = (startOffset / timeRangeMs.value) * 100
  const widthPct = Math.max((duration / timeRangeMs.value) * 100, 0.2)
  return { left: `${leftPct}%`, width: `${widthPct}%` }
}

function isInRange(record) {
  return record.shutdown >= props.startDate && record.boot <= props.endDate
}

function formatLocalDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 日期标签：根据可用宽度做降采样，保证文字不需要被截断成 ...
const dateLabels = computed(() => {
  const days = totalDays.value
  if (days === 0) return []

  const width = rightColWidthPx.value || 0
  const minLabelPx = 80 // 一个日期字符串大约需要的宽度

  // 没有测到宽度时，先全部显示
  if (!width) {
    return dateHeaders.value.map(d => formatLocalDate(d))
  }

  let maxLabels

  // 需求：当选择 30 天时，日期刻度减少一半
  if (props.selectedDays >= 30 && days >= 2) {
    maxLabels = Math.ceil(days / 2)
  } else {
    maxLabels = Math.max(2, Math.floor(width / minLabelPx))
  }

  // 如果容器足够宽，就全部显示
  if (maxLabels >= days) {
    return dateHeaders.value.map(d => formatLocalDate(d))
  }

  // 否则按步长取样：保证首尾一定显示，中间按 step 显示部分日期
  const step = Math.ceil(days / maxLabels)
  return dateHeaders.value.map((d, idx) => {
    if (idx === 0 || idx === days - 1 || idx % step === 0) {
      return formatLocalDate(d)
    }
    return ''
  })
})

// 实际要渲染的日期标签（过滤掉空字符串），用于控制列数
const visibleDateLabels = computed(() => dateLabels.value.filter(text => text))

// 日期字体大小：根据单个日期单元格的宽度自适应缩小，尽量完整显示文字
const dateFontSize = computed(() => {
  const width = rightColWidthPx.value || 0
  const count = visibleDateLabels.value.length || 1
  const cellWidth = width / count

  if (cellWidth >= 120) return 12
  if (cellWidth >= 90) return 11
  if (cellWidth >= 70) return 10
  if (cellWidth >= 50) return 9
  return 7
})

/** 格式化为：2026-03-03 09:45:00 星期一 */
function formatDateTime(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const w = weekdays[d.getDay()]
  return `${y}-${m}-${day} ${h}:${min}:${s} ${w}`
}

/** 格式化为：1天2小时2分 */
function formatDuration(boot, shutdown) {
  const ms = shutdown - boot
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins}分`)
  return parts.join('')
}

function getTooltipText(deviceId, record) {
  return `设备名：${deviceId}\n开始时间：${formatDateTime(record.boot)}\n结束时间：${formatDateTime(record.shutdown)}\n时长：${formatDuration(record.boot, record.shutdown)}`
}
</script>

<template>
  <div class="timeline-chart">
    <div class="chart-grid">
      <div class="left-col">
        <div class="left-header"></div>
        <button
          v-for="device in devices"
          :key="device.id"
          type="button"
          class="device-label device-label-btn"
          :class="{ active: device.id === selectedDeviceId }"
          :style="{ height: rowHeight + 'px' }"
          @click="emit('select-device', device.id)"
        >
          {{ device.id }}
        </button>
      </div>

      <div ref="rightColRef" class="right-col">
        <div class="timeline-header">
          <div
            class="date-row"
            :style="{ gridTemplateColumns: `repeat(${visibleDateLabels.length || 1}, minmax(0, 1fr))` }"
          >
            <div
              v-for="(label, i) in visibleDateLabels"
              :key="i"
              class="date-cell"
              :style="{ fontSize: dateFontSize + 'px' }"
            >
              {{ label }}
            </div>
          </div>
          <div class="time-row">
            <div class="time-axis-track">
              <div
                v-for="(tick, i) in timeTicks"
                :key="i"
                class="time-tick"
                :class="{
                  'time-tick-leftmost': i === 0,
                  'time-tick-rightmost': i === timeTicks.length - 1
                }"
                :style="{ left: tick.leftPct + '%' }"
              >
                <span class="tick-line"></span>
                <span class="tick-label">{{ tick.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-for="device in devices"
          :key="device.id"
          class="timeline-row"
          :style="{ height: rowHeight + 'px' }"
        >
          <div
            v-for="(record, ri) in device.records.filter(isInRange)"
            :key="ri"
            class="bar"
            :style="{
              ...getBarPosition(record),
              backgroundColor: getBarColor(record.durationHours)
            }"
            :title="getTooltipText(device.id, record)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-chart {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.chart-grid {
  display: flex;
  width: 100%;
}

.left-col {
  width: 120px;
  min-width: 120px;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
}

.left-header {
  height: 52px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.right-col {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  background: #ffffff;
}

.timeline-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.date-row {
  display: grid;
  align-items: center;
}

.date-cell {
  padding: 4px 8px;
  color: #6b7280;
  border-left: 1px solid #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
}

.time-row {
  position: relative;
  min-height: 24px;
  border-top: 1px solid #eef2f7;
}

.time-axis-track {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 24px;
}

.time-tick {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-tick-leftmost {
  transform: translateX(0);
  align-items: flex-start;
}

.time-tick-rightmost {
  transform: translateX(-100%);
  align-items: flex-end;
}

.tick-line {
  width: 1px;
  height: 6px;
  background: #9ca3af;
}

.tick-label {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
}

.device-label {
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
  width: 100%;
}

.device-label-btn {
  appearance: none;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.device-label-btn:hover {
  background: #f3f4f6;
}

.device-label-btn.active {
  background: #eef2ff;
  color: #1d4ed8;
  font-weight: 600;
}

.timeline-row {
  position: relative;
  min-height: 40px;
  border-bottom: 1px solid #f3f4f6;
}

.bar {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 4px;
  min-width: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.bar:hover {
  opacity: 0.85;
  z-index: 1;
}

.device-label {
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}
.device-label-btn {
  appearance: none;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
/* 左侧高亮色条 */
.device-label-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 999px;
  background: transparent;
}
.device-label-btn:hover {
  background: #e5f0ff;
}
.device-label-btn.active {
  background: #e0ecff;
  color: #1d4ed8;
  box-shadow: inset 3px 0 0 #2563eb;
}
/* 选中时左侧色条上色 */
.device-label-btn.active::before {
  background: #2563eb;
}
</style>
