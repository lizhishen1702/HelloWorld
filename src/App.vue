<template>
  <div class="min-h-screen bg-background">
    <header class="bg-surface border-b border-border shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">室内地图管理系统</h1>
              <p class="text-xs text-secondary">智能设备监控平台</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-secondary">总面积: 1000㎡</span>
            <span class="text-sm text-secondary">|</span>
            <span class="text-sm text-secondary">房间数: 20</span>
          </div>
        </div>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
