import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Map',
    component: () => import('./views/MapView.vue')
  },
  {
    path: '/room/:id',
    name: 'RoomDetail',
    component: () => import('./views/RoomDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
