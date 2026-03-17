<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1>设备运行管理平台</h1>
      <p class="subtitle">请选择要进入的功能模块</p>
    </header>

    <main class="home-main">
      <div class="card-grid">
        <button class="entry-card primary" type="button" @click="goTo('/power-management')">
          <h2>上下电管理</h2>
          <p>查看设备在选定时间范围内的上电 / 下电时间轴与统计。</p>
        </button>

        <button class="entry-card" type="button" @click="goTo('/feature-a')">
          <h2>功能 A（预留）</h2>
          <p>后续可以接入告警管理、日志分析等功能。</p>
        </button>

        <button class="entry-card" type="button" @click="goTo('/feature-b')">
          <h2>功能 B（预留）</h2>
          <p>后续可以接入设备配置下发、批量操作等功能。</p>
        </button>

        <button class="entry-card" type="button" @click="goTo('/feature-c')">
          <h2>功能 C（预留）</h2>
          <p>后续可以接入报表中心、统计分析等功能。</p>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  padding: 32px 40px;
  background: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.home-header h1 {
  font-size: 24px;
  color: #111827;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
}

.home-main {
  margin-top: 24px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.entry-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 18px 16px;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}

.entry-card h2 {
  font-size: 16px;
  color: #111827;
  margin-bottom: 6px;
}

.entry-card p {
  font-size: 13px;
  color: #6b7280;
}

.entry-card:hover {
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
  border-color: #d1d5db;
}

.entry-card.primary {
  border-color: #2563eb;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
}

.entry-card.primary h2 {
  color: #1d4ed8;
}
</style>

