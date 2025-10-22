<template>
  <div class="inventory-panel">
    <!-- 道具按钮 -->
    <button class="inventory-btn" @click="openFullScreen">
      <span class="btn-icon">🎒</span>
      <span class="btn-text">道具</span>
      <span class="item-count" v-if="inventory.length > 0">
        {{ inventory.length }}
      </span>
    </button>
    
    <!-- 全屏道具详情模态框 -->
    <div v-if="isFullScreen" class="fullscreen-modal">
      <div class="modal-overlay" @click="closeFullScreen"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎒 道具详情</h2>
          <button class="close-modal-btn" @click="closeFullScreen">
            ✕
          </button>
        </div>
        
        <div class="modal-body">
          <div class="inventory-summary">
            <div class="summary-item">
              <span class="summary-label">道具总数：</span>
              <span class="summary-value">{{ inventory.length }}/8</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">稀有道具：</span>
              <span class="summary-value">{{ rareItemsCount }}</span>
            </div>
          </div>
          
          <div class="items-grid">
            <div 
              v-for="(item, index) in inventory" 
              :key="index"
              class="item-card"
              :class="{ 'highlighted': isItemHighlighted(item) }"
            >
              <div class="item-header">
                <div class="item-icon">{{ getItemIcon(item) }}</div>
                <div class="item-title">
                  <h3>{{ getItemName(item) }}</h3>
                  <div class="item-type">{{ getItemType(item) }}</div>
                </div>
              </div>
              
              <div class="item-details">
                <div class="item-description">{{ getItemDescription(item) }}</div>
                <div class="item-usage">
                  <span class="usage-label">使用场景：</span>
                  <span class="usage-text">{{ getItemUsage(item) }}</span>
                </div>
              </div>
              
              <div class="item-actions">
                <button 
                  class="action-btn use-btn"
                  @click="useItem(item)"
                  :disabled="!canUseItem(item)"
                >
                  {{ canUseItem(item) ? '使用' : '不可用' }}
                </button>
                <button 
                  class="action-btn drop-btn"
                  @click="dropItem(item)"
                >
                  丢弃
                </button>
              </div>
            </div>
            
            <!-- 空道具栏提示 -->
            <div v-if="inventory.length === 0" class="empty-inventory">
              <div class="empty-icon">📭</div>
              <h3>道具栏空空如也</h3>
              <p>去探索地图收集道具吧！</p>
            </div>
          </div>
          
          <!-- 当前地点提示 -->
          <div v-if="currentLocation" class="location-tips">
            <div class="tips-header">
              <span class="tips-icon">💡</span>
              <span>当前地点：{{ currentLocation.name }}</span>
            </div>
            <div class="suggested-items">
              <span v-for="item in getSuggestedItems()" :key="item" class="suggested-item">
                {{ getItemIcon(item) }} {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 响应式数据
const isFullScreen = ref(false)

// 计算属性
const inventory = computed(() => gameStore.inventory)
// 使用 store 提供的地点数据
const currentLocation = computed(() => gameStore.currentLocationData.value)

// 统一获取道具名称（兼容字符串或对象）
const getItemName = (it) => (typeof it === 'string' ? it : (it && it.name) || '')

const rareItemsCount = computed(() => {
  const rareItems = ['神秘钥匙', '神庙地图', '古书']
  return inventory.value.filter(it => rareItems.includes(getItemName(it))).length
})

// 方法
const openFullScreen = () => {
  isFullScreen.value = true
}

const closeFullScreen = () => {
  isFullScreen.value = false
}

const getItemIcon = (item) => {
  const name = getItemName(item)
  const icons = {
    '古书': '📖',
    '火把': '🔥',
    '神秘钥匙': '🔑',
    '神庙地图': '🗺️',
    '木筏': '🛶',
    '金币': '💰',
    '药水': '🧪',
    '指南针': '🧭',
    '望远镜': '🔭',
    '藏宝图': '🏴‍☠️'
  }
  return icons[name] || '📦'
}

const getItemType = (item) => {
  // 优先使用对象上的类型
  if (item && typeof item === 'object' && item.type) return item.type
  const name = getItemName(item)
  const types = {
    '古书': '稀有道具',
    '火把': '工具',
    '神秘钥匙': '关键道具',
    '神庙地图': '地图类',
    '木筏': '交通工具',
    '金币': '货币',
    '药水': '消耗品',
    '指南针': '导航工具',
    '望远镜': '观察工具',
    '藏宝图': '稀有道具'
  }
  return types[name] || '普通道具'
}

const getItemDescription = (item) => {
  if (item && typeof item === 'object' && item.description) return item.description
  const name = getItemName(item)
  const descriptions = {
    '古书': '记载着宝藏传说的古老书籍，蕴含着重要的线索',
    '火把': '照亮黑暗洞穴的必备工具，能够驱散恐惧',
    '神秘钥匙': '能够打开宝藏宝箱的神秘钥匙，闪烁着奇异的光芒',
    '神庙地图': '标记着神庙内部结构的详细地图，包含陷阱位置',
    '木筏': '用于安全渡过湍急河流的简易木筏，坚固可靠',
    '金币': '可以在村庄购买补给品的通用货币',
    '药水': '恢复体力的神奇药水，散发着淡淡的清香',
    '指南针': '帮助你在迷宫中找到正确方向的导航工具',
    '望远镜': '可以远距离观察地形和敌人的精密仪器',
    '藏宝图': '标记着宝藏位置的古老地图，价值连城'
  }
  return descriptions[name] || '神秘的道具，用途未知'
}

const getItemUsage = (item) => {
  const name = getItemName(item)
  const usages = {
    '古书': '📚 在【图书馆】阅读 → 获得宝藏线索和神庙信息',
    '火把': '🔥 在【洞穴】照明 → 发现隐藏通道和宝物',
    '神秘钥匙': '🔑 在【神庙】或【宝藏密室】 → 打开宝箱获得终极宝藏',
    '神庙地图': '🗺️ 在【神庙】导航 → 避开陷阱找到正确路线',
    '木筏': '🛶 在【河流】渡河 → 安全到达对岸继续探险',
    '金币': '💰 在【村庄】购物 → 买补给品和装备',
    '药水': '🧪 任何地点使用 → 恢复体力和生命值',
    '指南针': '🧭 在【迷宫】或【森林】 → 指引正确方向',
    '望远镜': '🔭 在【山顶】或【海岸】 → 观察远方地形',
    '藏宝图': '🏴‍☠️ 在【任意地点】查看 → 显示宝藏具体位置',
    '草药': '🌿 在【森林】或【村庄】 → 制作治疗药剂',
    '水晶': '💎 在【神庙】激活 → 解锁神秘机关',
    '星图': '⭐ 在【山顶】夜晚使用 → 获得天文线索',
    '沙漠玫瑰': '🌹 在【沙漠】或【神庙】 → 作为祭品或交换物',
    '海螺': '🐚 在【海岸】或【神庙】 → 发出特殊信号',
    '老鹰羽毛': '🪶 在【山峰】或【神庙】 → 制作飞行道具',
    '绳索': '🪢 在【悬崖】或【洞穴】 → 攀爬和下降',
    '旅行补给': '🎒 任何地点使用 → 补充食物和水分',
    '河边石头': '🪨 在【河流】或【村庄】 → 制作工具或武器',
    '食物补给': '🍞 任何地点使用 → 恢复饥饿和体力',
    '村民礼物': '🎁 在【村庄】或【神庙】 → 获得村民信任和帮助',
    '古老壁画线索': '🖼️ 在【洞穴】或【神庙】 → 解读古代秘密',
    '守卫祝福': '✨ 在【神庙】或【宝藏】 → 获得神圣保护'
  }
  return usages[name] || '🔍 可在特定场景使用，探索时会有提示'
}

const isItemHighlighted = (item) => {
  if (!currentLocation.value) return false
  const name = getItemName(item)
  const locationSuggestions = {
    '图书馆': ['古书'],
    '洞穴': ['火把'],
    '神庙': ['神秘钥匙', '神庙地图'],
    '宝藏': ['神秘钥匙'],
    '河流': ['木筏']
  }
  return locationSuggestions[currentLocation.value.name]?.includes(name) || false
}

const canUseItem = (item) => {
  if (!currentLocation.value) return false
  const name = getItemName(item)
  const usableItems = {
    '图书馆': ['古书'],
    '洞穴': ['火把'],
    '神庙': ['神秘钥匙', '神庙地图'],
    '宝藏': ['神秘钥匙'],
    '河流': ['木筏']
  }
  return usableItems[currentLocation.value.name]?.includes(name) || false
}

const useItem = (item) => {
  if (!canUseItem(item)) {
    gameStore.addLog(`当前地点无法使用${getItemName(item)}`)
    return
  }
  const name = getItemName(item)
  // 根据道具类型执行不同动作
  switch (name) {
    case '古书':
      gameStore.addLog('你阅读了古书，获得了关于宝藏的重要线索！', 'success')
      gameStore.updateProgress(10)
      break
    case '火把':
      gameStore.addLog('火把照亮了黑暗的洞穴，你发现了隐藏的通道！', 'success')
      gameStore.updateProgress(8)
      break
    case '神秘钥匙':
      gameStore.addLog('神秘钥匙闪烁着光芒，似乎与宝箱产生了共鸣！', 'success')
      gameStore.updateProgress(5)
      break
    case '神庙地图':
      gameStore.addLog('神庙地图帮助你避开了陷阱，找到了正确的路线！', 'success')
      gameStore.updateProgress(12)
      break
    case '木筏':
      gameStore.addLog('使用木筏安全渡过了湍急的河流！', 'success')
      gameStore.updateProgress(8)
      break
    default:
      gameStore.addLog(`使用了${name}，但似乎没什么效果...`)
  }
  
  // 某些道具使用后会消失
  const consumableItems = ['药水', '金币', '食物补给', '旅行补给']
  if (consumableItems.includes(name)) {
    gameStore.removeFromInventory(name)
    gameStore.addLog(`✨ ${name}已使用完毕`)
  }
}

const dropItem = (item) => {
  const name = getItemName(item)
  if (confirm(`确定要丢弃${name}吗？`)) {
    // 直接使用道具名称来删除，因为gameStore.removeFromInventory接受名称参数
    gameStore.removeFromInventory(name)
    gameStore.addLog(`🗑️ 丢弃了${name}`)
  }
}

const getSuggestedItems = () => {
  if (!currentLocation.value) return []
  const suggestions = {
    '图书馆': ['古书'],
    '洞穴': ['火把'],
    '神庙': ['神秘钥匙', '神庙地图'],
    '宝藏': ['神秘钥匙'],
    '河流': ['木筏']
  }
  return suggestions[currentLocation.value.name] || []
}

// 键盘快捷键
const handleKeyPress = (event) => {
  if (event.key === 'i' || event.key === 'I') {
    event.preventDefault()
    openFullScreen()
  }
  if (event.key === 'Escape' && isFullScreen.value) {
    event.preventDefault()
    closeFullScreen()
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
.inventory-panel {
  /* 移除position设置，让父容器控制定位 */
}

.inventory-btn {
  background: linear-gradient(135deg, #FFD700 60%, #FFB347 100%);
  border: 3px solid #FF9800;
  border-radius: 20px;
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  color: #4B3F1D;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;
  font-size: 1.1em;
  position: relative;
}

.inventory-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
}

.btn-icon {
  font-size: 1.5em;
}

.btn-text {
  font-size: 1.1em;
}

.item-count {
  background: #F44336;
  color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  font-weight: bold;
}

/* 全屏模态框样式 */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: linear-gradient(135deg, #FFFDE4 60%, #FFD700 100%);
  border: 4px solid #FF9800;
  border-radius: 20px;
  width: 90%;
  max-width: 1200px;
  height: 85%;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.4s ease;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #FF9800 60%, #FFB347 100%);
  padding: 1.5em 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #FFD700;
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  font-size: 2em;
}

.close-modal-btn {
  background: #F44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background: #FFD700;
  color: #F44336;
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  padding: 2em;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  overflow-y: auto;
}

.inventory-summary {
  background: rgba(255, 248, 220, 0.8);
  padding: 1em 1.5em;
  border-radius: 15px;
  border: 2px solid #FFD700;
  display: flex;
  gap: 2em;
  justify-content: center;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.summary-label {
  color: #4B3F1D;
  font-weight: bold;
  font-size: 1.1em;
}

.summary-value {
  color: #FF9800;
  font-weight: bold;
  font-size: 1.2em;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5em;
  flex: 1;
  overflow-y: auto;
  padding: 0.5em;
}

.item-card {
  background: rgba(255, 248, 220, 0.9);
  border: 3px solid #FFD700;
  border-radius: 15px;
  padding: 1.5em;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
}

.item-card.highlighted {
  background: linear-gradient(135deg, #4CAF50 60%, #45a049 100%);
  border-color: #388E3C;
  color: white;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 1em;
}

.item-header .item-icon {
  font-size: 3em;
  flex-shrink: 0;
}

.item-title h3 {
  margin: 0;
  font-size: 1.4em;
  color: #4B3F1D;
  font-weight: bold;
}

.item-type {
  background: #FFD700;
  color: #4B3F1D;
  padding: 0.3em 0.8em;
  border-radius: 8px;
  font-size: 0.8em;
  font-weight: bold;
  display: inline-block;
}

.item-card.highlighted .item-title h3,
.item-card.highlighted .item-type {
  color: white;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.item-description {
  color: #8B4513;
  font-size: 0.95em;
  line-height: 1.4;
}

.item-usage {
  display: flex;
  gap: 0.5em;
  align-items: center;
}

.usage-label {
  color: #FF9800;
  font-weight: bold;
  font-size: 0.9em;
}

.usage-text {
  color: #4B3F1D;
  font-size: 0.9em;
}

.item-card.highlighted .item-description,
.item-card.highlighted .usage-text {
  color: rgba(255, 255, 255, 0.9);
}

.item-actions {
  display: flex;
  gap: 0.8em;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.8em 1em;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.use-btn {
  background: #4CAF50;
  color: white;
}

.use-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.use-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.drop-btn {
  background: #F44336;
  color: white;
}

.drop-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.empty-inventory {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3em 2em;
  color: #8B4513;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 0.5em;
}

.empty-inventory h3 {
  margin: 0.5em 0;
  color: #FF9800;
  font-size: 1.5em;
}

.empty-inventory p {
  font-size: 1.1em;
}

.location-tips {
  background: rgba(255, 248, 220, 0.9);
  padding: 1.5em;
  border-radius: 15px;
  border: 2px solid #FFD700;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 1em;
}

.tips-icon {
  font-size: 1.2em;
}

.tips-header span {
  color: #4B3F1D;
  font-weight: bold;
  font-size: 1.1em;
}

.suggested-items {
  display: flex;
  gap: 0.8em;
  flex-wrap: wrap;
}

.suggested-item {
  background: #FFD700;
  color: #4B3F1D;
  padding: 0.5em 1em;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9em;
}

/* 动画 */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .modal-content {
    width: 95%;
    height: 90%;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .inventory-btn {
    padding: 12px 16px;
    font-size: 1em;
  }
  
  .modal-content {
    width: 98%;
    height: 95%;
    border-radius: 15px;
  }
  
  .modal-header {
    padding: 1em 1.5em;
  }
  
  .modal-header h2 {
    font-size: 1.5em;
  }
  
  .modal-body {
    padding: 1.5em;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .inventory-summary {
    flex-direction: column;
    gap: 1em;
  }
  
  .item-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5em;
  }
  
  .item-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-content {
    border-radius: 10px;
  }
  
  .modal-header {
    padding: 0.8em 1em;
  }
  
  .modal-body {
    padding: 1em;
  }
  
  .item-card {
    padding: 1em;
  }
}
</style>