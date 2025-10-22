import { createRouter, createWebHistory } from 'vue-router'

import MapPage from './pages/MapPage.vue'
import LocationPage from './pages/LocationPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MapPage,
    meta: { pageMusic: 'background' }
  },
  { path: '/location/:id', name: 'location', component: LocationPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router