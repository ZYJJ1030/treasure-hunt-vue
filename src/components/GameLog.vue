<template>
  <div class="game-log-panel" :class="{ 'log-open': isOpen }">
    <!-- 日志切换按钮 -->
    <button class="log-toggle" @click="toggleLog">
      <span class="toggle-icon">{{ isOpen ? '📜' : '📋' }}</span>
      <span class="toggle-text">游戏日志</span>
      <span class="new-count" v-if="newMessagesCount > 0">
        {{ newMessagesCount }}
      </span>
    </button>
    
    <!-- 日志内容 -->
    <div class="log-content" v-if="isOpen">
      <div class="log-header">
        <h3>📜 游戏日志</h3>
        <div class="log-controls">
          <button 
            class="log-btn clear-btn"
            @click="clearLog"
            :disabled="gameLog.length === 0"
          >
            🗑️ 清空
          </button>
          <button class="log-btn close-btn" @click="closeLog">
            ✕
          </button>
        </div>
      </div>
      
      <!-- 日志过滤器 -->
      <div class="log-filters">
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          全部
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'info' }"
          @click="activeFilter = 'info'"
        >
          信息
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'success' }"
          @click="activeFilter = 'success'"
        >
          成功
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'warning' }"
          @click="activeFilter = 'warning'"
        >
          警告
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'error' }"
          @click="activeFilter = 'error'"
        >
          错误
        </button>
      </div>
      
      <!-- 日志列表 -->
      <div class="log-list" ref="logList">
        <div v-if="filteredLog.length === 0" class="empty-log">
          <div class="empty-icon">📝</div>
          <h4>暂无日志记录</h4>
          <p>开始游戏后，这里会显示你的冒险历程</p>
        </div>
        
        <div 
          v-for="(log, index) in filteredLog" 
          :key="index"
          class="log-entry"
          :class="getLogClass(log.type)"
        >
          <div class="log-timestamp">
            {{ formatTime(log.timestamp) }}
          </div>
          <div class="log-message">
            <span class="log-icon">{{ getLogIcon(log.type) }}</span>
            <span class="log-text">{{ log.message }}</span>
          </div>
        </div>
      </div>
      
      <!-- 日志统计 -->
      <div class="log-stats">
        <div class="stat-item">
          <span class="stat-label">总日志数：</span>
          <span class="stat-value">{{ gameLog.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功：</span>
          <span class="stat-value success">{{ successCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">警告：</span>
          <span class="stat-value warning">{{ warningCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">错误：</span>
          <span class="stat-value error">{{ errorCount }}</span>
        </div>
      </div>
      
      <!-- 自动滚动控制 -->
      <div class="auto-scroll-control">
        <label class="auto-scroll-label">
          <input 
            type="checkbox" 
            v-model="autoScroll" 
            class="auto-scroll-checkbox"
          />
          <span class="auto-scroll-text">自动滚动到最新</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 响应式数据
const isOpen = ref(false)
const activeFilter = ref('all')
const autoScroll = ref(true)
const newMessagesCount = ref(0)
const logList = ref(null)

// 计算属性
const gameLog = computed(() => gameStore.gameLog)

const filteredLog = computed(() => {
  if (activeFilter.value === 'all') {
    return gameLog.value
  }
  return gameLog.value.filter(log => log.type === activeFilter.value)
})

const successCount = computed(() => 
  gameLog.value.filter(log => log.type === 'success').length
)

const warningCount = computed(() => 
  gameLog.value.filter(log => log.type === 'warning').length
)

const errorCount = computed(() => 
  gameLog.value.filter(log => log.type === 'error').length
)

// 方法
const toggleLog = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    newMessagesCount.value = 0
    scrollToBottom()
  }
}

const closeLog = () => {
  isOpen.value = false
  newMessagesCount.value = 0
}

const clearLog = () => {
  if (confirm('确定要清空所有日志记录吗？')) {
    gameStore.clearLog()
  }
}

const getLogClass = (type) => {
  return `log-${type}`
}

const getLogIcon = (type) => {
  const icons = {
    'info': 'ℹ️',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌'
  }
  return icons[type] || '📝'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const scrollToBottom = () => {
  if (logList.value) {
    nextTick(() => {
      logList.value.scrollTop = logList.value.scrollHeight
    })
  }
}

// 监听日志变化
watch(gameLog, (newLog, oldLog) => {
  if (newLog.length > oldLog.length) {
    // 有新消息
    if (!isOpen.value) {
      newMessagesCount.value += newLog.length - oldLog.length
    }
    
    if (autoScroll.value && isOpen.value) {
      scrollToBottom()
    }
  }
}, { deep: true })

// 监听打开状态
watch(isOpen, (newValue) => {
  if (newValue) {
    newMessagesCount.value = 0
    scrollToBottom()
  }
})

// 键盘快捷键
const handleKeyPress = (event) => {
  if (event.key === 'l' || event.key === 'L') {
    event.preventDefault()
    toggleLog()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.game-log-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.log-toggle {
  background: linear-gradient(135deg, #FFD700 60%, #FFB347 100%);
  border: 3px solid #FF9800;
  border-radius: 20px;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #4B3F1D;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
  margin-bottom: 1em;
}

.log-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
}

.toggle-icon {
  font-size: 1.2em;
}

.toggle-text {
  font-size: 1em;
}

.new-count {
  background: #F44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
  animation: pulse 2s infinite;
}

.log-content {
  background: linear-gradient(135deg, #FFFDE4 60%, #FFD700 100%);
  border: 3px solid #FF9800;
  border-radius: 20px;
  padding: 1.5em;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: none;
  animation: slideInLeft 0.3s ease;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}

.log-header h3 {
  margin: 0;
  color: #FF9800;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  text-shadow: 1px 1px 0 #fff;
}

.log-controls {
  display: flex;
  gap: 0.5em;
}

.log-btn {
  background: #F44336;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5em 0.8em;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.log-btn:hover:not(:disabled) {
  background: #FFD700;
  color: #F44336;
}

.log-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.clear-btn {
  background: #FF9800;
}

.log-filters {
  display: flex;
  gap: 0.3em;
  margin-bottom: 1em;
  background: rgba(255, 248, 220, 0.8);
  padding: 0.5em;
  border-radius: 12px;
  flex-wrap: wrap;
}

.filter-btn {
  flex: 1;
  min-width: 60px;
  padding: 0.5em 0.8em;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8em;
  font-weight: bold;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #FFD700;
  color: #4B3F1D;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.log-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1em;
  background: rgba(255, 248, 220, 0.5);
  border-radius: 12px;
  padding: 0.5em;
  min-height: 200px;
  max-height: 300px;
}

.log-entry {
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
  padding: 0.6em;
  margin-bottom: 0.3em;
  border-radius: 8px;
  border-left: 3px solid #FFD700;
  background: rgba(255, 255, 255, 0.9);
  animation: fadeIn 0.3s ease;
  font-size: 0.8em;
}

.log-timestamp {
  font-size: 0.65em;
  color: #8B4513;
  min-width: 50px;
  font-family: monospace;
}

.log-message {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.3em;
}

.log-icon {
  font-size: 0.8em;
  margin-top: 0.1em;
}

.log-text {
  font-size: 0.8em;
  line-height: 1.3;
  color: #4B3F1D;
}

.log-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3em;
  margin-bottom: 1em;
  background: rgba(255, 248, 220, 0.8);
  padding: 0.6em;
  border-radius: 12px;
}

.stat-label {
  display: block;
  font-size: 0.65em;
  color: #4B3F1D;
  margin-bottom: 0.1em;
}

.stat-value {
  display: block;
  font-size: 0.9em;
  font-weight: bold;
  color: #FF9800;
}

.stat-value.success {
  color: #4CAF50;
}

.stat-value.warning {
  color: #FF9800;
}

.stat-value.error {
  color: #F44336;
}

.auto-scroll-control {
  display: flex;
  justify-content: center;
}

.auto-scroll-label {
  display: flex;
  align-items: center;
  gap: 0.5em;
  cursor: pointer;
  font-size: 0.9em;
  color: #4B3F1D;
}

.auto-scroll-checkbox {
  width: 16px;
  height: 16px;
}

.auto-scroll-text {
  font-weight: bold;
}

/* 动画 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-log-panel {
    bottom: 10px;
    left: 10px;
  }
  
  .log-content {
    max-width: 400px;
    padding: 1em;
    max-height: 300px;
  }
  
  .log-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .log-filters {
    justify-content: center;
  }
  
  .filter-btn {
    min-width: 50px;
    font-size: 0.7em;
  }
}

@media (max-width: 480px) {
  .game-log-panel {
    position: static;
    margin: 1em;
  }
  
  .log-content {
    max-width: none;
    width: calc(100vw - 2em);
    margin: 1em 0;
  }
  
  .log-toggle {
    width: 100%;
    justify-content: center;
  }
  
  .log-stats {
    grid-template-columns: 1fr;
  }
}
</style>