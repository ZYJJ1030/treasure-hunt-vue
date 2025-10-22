<template>
  <div class="location-modal" @click.self="emit('close')">
    <div class="location-content">
      <div class="location-header">
        <h2>📍 地点列表</h2>
        <button class="close-btn" @click="emit('close')">✕ 返回</button>
      </div>
      <div class="location-list">
        <div v-for="(loc, id) in locations" :key="id" class="location-item">
          <div class="location-name" @click="go(id)">
            <span class="icon">{{ loc.icon }}</span>
            <span class="name">{{ loc.name }}</span>
          </div>
          <div class="location-actions">
            <button class="btn primary" @click="go(id)">进入地点</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const emit = defineEmits(['close'])
const router = useRouter()
const gameStore = useGameStore()

const locations = computed(() => gameStore.locations || {})

const go = (id) => {
  router.push({ name: 'location', params: { id } })
  emit('close')
}
</script>

<style scoped>
.location-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.location-content {
  width: min(800px, 92vw);
  max-height: 80vh;
  overflow: auto;
  background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,248,220,0.96));
  border: 3px solid #FFD700;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}
.location-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 2px dashed #DAA520;
}
.location-header h2 {
  margin: 0;
  font-size: 20px;
  color: #8B4513;
}
.close-btn {
  border: none;
  background: #fff8dc;
  border: 2px solid #FFD700;
  color: #8B4513;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}
.location-list {
  padding: 10px 14px 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.location-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  background: rgba(255,255,255,0.9);
  border: 2px solid #FFD700;
  border-radius: 12px;
  padding: 10px 12px;
}
.location-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #8B4513;
  cursor: pointer;
}
.location-name:hover { text-decoration: underline; }
.icon { font-size: 18px; }
.name { font-size: 16px; }
.location-actions { display: flex; align-items: center; gap: 8px; }
.btn.primary {
  background: #fff8dc;
  color: #8B4513;
  border: 2px solid #FFD700;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}
.btn.primary:hover { filter: brightness(1.05); }
</style>