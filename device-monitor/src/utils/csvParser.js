/**
 * 解析CSV文件，提取 boot_str 和 shutdown_str 列
 * @param {string} csvText - CSV文件内容
 * @returns {Array<{boot: Date, shutdown: Date, durationHours: number}>}
 */
export function parseDeviceCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const bootIdx = headers.findIndex(h => h === 'boot_str')
  const shutdownIdx = headers.findIndex(h => h === 'shutdown_str')

  if (bootIdx === -1 || shutdownIdx === -1) {
    console.warn('CSV缺少 boot_str 或 shutdown_str 列')
    return []
  }

  const parseDateTime = (str) => {
    if (!str) return null
    // 支持 YYYY/M/D HH:MM 和 YYYY-MM-DD HH:MM 格式
    const normalized = str.replace(/\//g, '-')
    const date = new Date(normalized)
    return isNaN(date.getTime()) ? null : date
  }

  const records = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    const bootStr = row[bootIdx]?.trim()
    const shutdownStr = row[shutdownIdx]?.trim()
    if (!bootStr || !shutdownStr) continue

    const boot = parseDateTime(bootStr)
    const shutdown = parseDateTime(shutdownStr)
    if (!boot || !shutdown || shutdown <= boot) continue

    const durationMs = shutdown - boot
    const durationHours = durationMs / (1000 * 60 * 60)
    records.push({ boot, shutdown, durationHours })
  }
  return records
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if ((c === ',' && !inQuotes) || c === '\n') {
      result.push(current)
      current = ''
    } else {
      current += c
    }
  }
  result.push(current)
  return result
}

/**
 * 根据时长获取条形图颜色
 * @param {number} durationHours
 * @returns {string} CSS颜色
 */
export function getBarColor(durationHours) {
  if (durationHours < 1) return '#f59e0b'  // 橘黄色
  if (durationHours <= 12) return '#3b82f6' // 蓝色
  return '#22c55e' // 绿色
}
