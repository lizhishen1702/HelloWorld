<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import FileTreeNode from '../components/FileTreeNode.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 设备列表（可根据实际情况调整 / 从后端获取）
const devices = ['机器人1', '机器人2', '机器人3']
const selectedDevice = ref(devices[0])

const currentPath = ref('') // 相对于后端 FS_ROOT 的路径（含设备名称）
const entries = ref([]) // 当前目录内容
const loading = ref(false)
const treeLoading = ref(false)

// 左侧树仅展示文件夹
const treeNodes = ref([])

const breadcrumb = computed(() => (currentPath.value ? currentPath.value : '/'))

function formatSize(size) {
  if (size === 0) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Kb`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} Mb`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} Gb`
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}/${m}/${day} ${h}:${min}:${s}`
}

async function fetchDirectory(path) {
  loading.value = true
  try {
    const url = new URL(`${API_BASE_URL}/api/fs/list`)
    if (path) url.searchParams.set('path', path)
    const res = await fetch(url.toString())
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const data = await res.json()
    currentPath.value = data.path || ''
    entries.value = data.entries || []
    return data
  } catch (e) {
    console.warn('加载目录失败', e)
    if (!entries.value.length) entries.value = []
  } finally {
    loading.value = false
  }
}

async function ensureTreeChildren(node) {
  if (node.loaded) return
  treeLoading.value = true
  try {
    const data = await fetchDirectory(node.path)
    node.children = (data.entries || [])
      .filter((e) => e.is_dir)
      .map((e) => ({
        name: e.name,
        path: node.path ? `${node.path}/${e.name}` : e.name,
        children: [],
        expanded: false,
        loaded: false,
      }))
    node.loaded = true
  } finally {
    treeLoading.value = false
  }
}

async function onTreeNodeClick(node) {
  await ensureTreeChildren(node)
  node.expanded = !node.expanded
  await fetchDirectory(node.path)
}

async function onRowClick(entry) {
  if (entry.is_dir) {
    const path = currentPath.value ? `${currentPath.value}/${entry.name}` : entry.name
    await fetchDirectory(path)
    // 同步到树：找到对应节点并加载
    const queue = [...treeNodes.value]
    while (queue.length) {
      const n = queue.shift()
      if (n.path === path) {
        await ensureTreeChildren(n)
        n.expanded = true
        break
      }
      queue.push(...(n.children || []))
    }
  }
}

function downloadFile(entry) {
  if (entry.is_dir) return
  const path = currentPath.value ? `${currentPath.value}/${entry.name}` : entry.name
  const url = new URL(`${API_BASE_URL}/api/fs/download`)
  url.searchParams.set('path', path)

  const a = document.createElement('a')
  a.href = url.toString()
  a.download = entry.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function buildRootNode() {
  return {
    name: selectedDevice.value,
    path: selectedDevice.value, // 根节点路径 = 设备名，对应后端 files/设备名
    children: [],
    expanded: true,
    loaded: false,
  }
}

async function initForDevice() {
  treeNodes.value = [buildRootNode()]
  await fetchDirectory(selectedDevice.value)
  await ensureTreeChildren(treeNodes.value[0])
}

watch(selectedDevice, () => {
  initForDevice()
})

onMounted(() => {
  initForDevice()
})
</script>

<template>
  <div class="file-page">
    <div class="file-layout">
      <!-- 左侧：文件树 -->
      <div class="tree-panel">
        <div class="tree-header">
          <span>设备：</span>
          <select v-model="selectedDevice">
            <option v-for="dev in devices" :key="dev" :value="dev">
              {{ dev }}
            </option>
          </select>
        </div>
        <div class="tree-body">
          <ul class="tree-root">
            <li v-for="node in treeNodes" :key="node.path">
              <FileTreeNode :node="node" @click-node="onTreeNodeClick" />
            </li>
          </ul>
          <div v-if="treeLoading" class="tree-loading">加载中...</div>
        </div>
      </div>

      <!-- 右侧：路径 + 列表 -->
      <div class="list-panel">
        <div class="path-bar">
          {{ breadcrumb }}
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>文件名</th>
                <th>大小</th>
                <th>类型</th>
                <th>创建时间</th>
                <th>修改时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="center">加载中...</td>
              </tr>
              <tr
                v-for="entry in entries"
                v-else
                :key="entry.name"
                @click="entry.is_dir ? onRowClick(entry) : downloadFile(entry)"
                class="row"
              >
                <td>
                  <span class="icon" :class="entry.is_dir ? 'folder' : 'file'"></span>
                  {{ entry.name }}
                </td>
                <td>{{ formatSize(entry.size) }}</td>
                <td>{{ entry.is_dir ? '文件夹' : '文件' }}</td>
                <td>{{ formatTime(entry.created) }}</td>
                <td>{{ formatTime(entry.modified) }}</td>
              </tr>
              <tr v-if="!loading && !entries.length">
                <td colspan="5" class="center">当前文件夹为空</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-page {
  min-height: 100vh;
  padding: 24px 32px;
  background: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.file-layout {
  display: flex;
  gap: 16px;
  border: 1px solid #d1d5db;
  background: #ffffff;
}

.tree-panel {
  width: 260px;
  border-right: 1px solid #d1d5db;
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-header select {
  flex: 1;
  padding: 4px 8px;
  font-size: 13px;
}

.tree-body {
  padding: 8px 8px 12px;
  overflow: auto;
  flex: 1;
}

.tree-root {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.tree-node-label {
  /* 保留给 FileTreeNode 中的 scoped 样式做补充时使用（当前为空定义） */
}

.tree-loading {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.list-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.path-bar {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
}

.table-wrapper {
  padding: 8px 12px 12px;
  flex: 1;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 6px 8px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

thead th {
  background: #f9fafb;
  font-weight: 500;
  color: #4b5563;
}

.row {
  cursor: pointer;
}

.row:hover td {
  background: #f3f4f6;
}

.center {
  text-align: center;
  color: #6b7280;
}

.icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.icon.folder::before {
  content: '📁';
}

.icon.file::before {
  content: '📄';
}
</style>

