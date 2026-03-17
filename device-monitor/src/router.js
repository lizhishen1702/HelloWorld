import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import DeviceMonitor from './components/DeviceMonitor.vue'
import PlaceholderPage from './views/PlaceholderPage.vue'
import PlaceholderPage2 from './views/PlaceholderPage2.vue'
import PlaceholderPage3 from './views/PlaceholderPage3.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/power-management',
    name: 'power-management',
    component: DeviceMonitor,
  },
  {
    path: '/feature-a',
    name: 'feature-a',
    component: PlaceholderPage,
    props: { title: '功能 A（预留）' },
  },
  {
    path: '/feature-b',
    name: 'feature-b',
    component: PlaceholderPage2,
    props: { title: '功能 B（预留）' },
  },
  {
    path: '/feature-c',
    name: 'feature-c',
    component: PlaceholderPage3,
    props: { title: '功能 C（预留）' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

