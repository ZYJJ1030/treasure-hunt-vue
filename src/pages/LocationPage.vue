<template>
  <div class="location-page">
    <!-- 右上角按钮组 -->
    <div class="top-right-buttons">
      <button class="music-btn" @click="toggleMusic" :class="{ 'playing': isPlaying }">
        {{ isPlaying ? '🔊' : '🔇' }} {{ isPlaying ? '暂停音乐' : '播放音乐' }}
      </button>
      <button class="return-game-btn" @click="goBackToGame">
        🏠 返回游戏
      </button>
    </div>
    
    <!-- 导航栏 -->
    <nav class="location-nav">
      <h1 class="location-title">{{ location?.name || '未知地点' }}</h1>
    </nav>
    
    <!-- 地点内容 -->
    <div class="location-content">
      <!-- 地点描述 -->
      <div class="location-description-section">
        <h2>📍 地点描述</h2>
        <p>{{ getLocationDescription }}</p>
      </div>
      
      <!-- 地点特色 -->
      <div class="location-features">
        <div v-if="location.canRest" class="feature">
          <span class="feature-icon">😴</span>
          <span class="feature-text">可以休息恢复</span>
        </div>
        <div v-if="location.hasShop" class="feature">
          <span class="feature-icon">🛒</span>
          <span class="feature-text">设有商店</span>
        </div>
        <div v-if="location.events && location.events.length > 0" class="feature">
          <span class="feature-icon">🎭</span>
          <span class="feature-text">可能触发事件</span>
        </div>
      </div>
      
      <!-- 交互按钮 -->
      <div class="location-actions">
        <button 
          class="btn btn-primary" 
          @click="exploreLocation"
          :disabled="!gameActive"
        >
          🔍 探索此地
        </button>
        
        <button 
          class="btn btn-secondary" 
          @click="searchLocation"
          :disabled="!gameActive"
        >
          🔎 搜寻宝藏
        </button>
        
        <button 
          v-if="location.canRest"
          class="btn btn-secondary" 
          @click="restAtLocation"
          :disabled="!gameActive"
        >
          😴 休息恢复
        </button>
        
        <button 
          v-if="location.hasShop"
          class="btn btn-secondary" 
          @click="visitShop"
          :disabled="!gameActive"
        >
          🛒 访问商店
        </button>
        
        <!-- 地点特定动作 -->
        <template v-if="locationId === 'library'">
          <button 
            class="btn btn-secondary" 
            @click="readBook"
            :disabled="!hasItem('古书') || !gameActive"
          >
            📖 阅读古书
          </button>
          <button 
            class="btn btn-secondary" 
            @click="decodeMap"
            :disabled="!gameActive"
          >
            🗺️ 解读地图
          </button>
        </template>
        
        <template v-if="locationId === 'cave'">
          <button 
            class="btn btn-secondary" 
            @click="enterCave"
            :disabled="!gameActive"
          >
            🕳️ 进入洞穴深处
          </button>
        </template>
        
        <template v-if="locationId === 'temple'">
          <button 
            class="btn btn-secondary" 
            @click="prayAtTemple"
            :disabled="!gameActive"
          >
            🙏 祈祷
          </button>
        </template>
        
        <template v-if="locationId === 'river'">
          <button 
            class="btn btn-secondary" 
            @click="crossRiver"
            :disabled="!gameActive"
          >
            🌊 渡河
          </button>
        </template>
      </div>
      
      <!-- 库存提示 -->
      <div v-if="inventory.length > 0" class="inventory-hint">
        <h4>🎒 你的背包</h4>
        <div class="inventory-items">
          <span 
            v-for="item in inventory" 
            :key="item"
            class="item-tag"
          >
            {{ getItemIcon(item) }} {{ item }}
          </span>
        </div>
      </div>
      
      <!-- 地点背景装饰 -->
      <div class="location-background">
        <div class="bg-decoration"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

// 地点音乐映射
const locationMusic = {
  'library': `${import.meta.env.BASE_URL}BGM/library.mp3`,
  'cave': `${import.meta.env.BASE_URL}BGM/cave.mp3`, 
  'temple': `${import.meta.env.BASE_URL}BGM/temple.mp3`,
  'treasure': `${import.meta.env.BASE_URL}BGM/treasure.mp3`,
  'village': `${import.meta.env.BASE_URL}BGM/village.mp3`,
  'river': `${import.meta.env.BASE_URL}BGM/river.mp3`,
  'coast': `${import.meta.env.BASE_URL}BGM/beach.mp3`,  // 修正：coast地点使用beach.mp3音乐
  'beach': `${import.meta.env.BASE_URL}BGM/beach.mp3`,  // 保留beach以防万一
  'forest': `${import.meta.env.BASE_URL}BGM/forest.mp3`,
  'mountain': `${import.meta.env.BASE_URL}BGM/mountain.mp3`,
  'waterfall': `${import.meta.env.BASE_URL}BGM/waterfall.mp3`
}

const locationId = computed(() => route.params.id)
const location = computed(() => gameStore.locations[locationId.value] || {})

// 使用全局音乐状态
const isPlaying = computed(() => 
  gameStore.isMusicPlaying && gameStore.currentPlayingLocation === locationId.value
)

// 计算属性
const gameActive = computed(() => gameStore.gameActive.value)
const inventory = computed(() => {
  const inv = gameStore.inventory.value
  return Array.isArray(inv) ? inv.map(i => i.name) : []
})

const getLocationDescription = computed(() => {
  const locId = locationId.value
  const loc = location.value
  
  if (locId === 'library') {
    return '古老的图书馆里摆满了尘封的书籍，空气中弥漫着墨水和羊皮纸的味道。书架上的古书记载着关于宝藏的传说和线索。'
  } else if (locId === 'cave') {
    return '阴暗的洞穴深处传来滴水声，微弱的光线从洞口透入。洞穴深处似乎隐藏着什么秘密。'
  } else if (locId === 'temple') {
    return '宏伟的神庙矗立在你面前，巨大的石柱上雕刻着神秘的图案。神庙入口有两尊石像守卫，传说宝藏就藏在神庙的最深处。'
  } else if (locId === 'treasure') {
    return '你终于来到了传说中的宝藏密室！房间中央有一个华丽的宝箱，周围散落着金币和宝石。宝箱上有一个复杂的锁。'
  } else if (locId === 'village') {
    return '友好的村庄里住着热情的村民，他们或许知道一些关于宝藏的信息。村庄的集市上可以购买补给品。'
  } else if (locId === 'river') {
    return '湍急的河流挡住了去路，河水清澈见底但水流很急。需要想办法安全过河。'
  } else if (locId === 'coast') {
    return loc.description || '波涛汹涌的海岸线，礁石嶙峋，海浪拍打着古老的石柱。'
  } else if (locId === 'beach') {
    return loc.description || '美丽的海滩，细软的沙子和清澈的海水。'
  } else if (locId === 'forest') {
    return loc.description || '茂密的森林，充满了生机和神秘。'
  } else if (locId === 'mountain') {
    return loc.description || '雄伟的山脉，云雾缭绕的山峰。'
  } else if (locId === 'waterfall') {
    return loc.description || '壮观的瀑布，水流奔腾而下。'
  } else {
    return loc.description || '一个神秘的地方，等待着你的探索。'
  }
})

// 方法
const goBackToMap = () => {
  router.push('/')
}

const goBackToGame = () => {
  // 返回游戏主界面前先停止音乐
  console.log('🏠 点击返回按钮，准备停止音乐')
  gameStore.stopGlobalMusic()
  gameStore.addLog('🔇 离开地点，已停止背景音乐', 'info')
  console.log('🏠 准备导航回主页面')
  // 返回游戏主界面，关闭地点页面
  router.push('/')
}

const hasItem = (itemName) => {
  return gameStore.hasItem(itemName)
}

const getItemIcon = (item) => {
  const icons = {
    '古书': '📖',
    '火把': '🔥',
    '神秘钥匙': '🔑',
    '神庙地图': '🗺️',
    '木筏': '🛶',
    '符文石': '🔮'
  }
  return icons[item] || '📦'
}

// 通用动作函数
const exploreLocation = () => {
  const locId = locationId.value
  
  switch(locId) {
    case 'library':
      const events = [
        { text: '你发现了一本古老的地图册，上面标记着神秘的地点。', item: '古地图', progress: 5 },
        { text: '在书架后面，你找到了一支神奇的火把。', item: '火把', progress: 3 },
        { text: '你读到了关于宝藏的传说，获得了重要线索。', progress: 8 }
      ]
      
      const event = events[Math.floor(Math.random() * events.length)]
      gameStore.addLog(event.text, 'info')
      
      if (event.item) {
        gameStore.addItem(event.item)
        gameStore.triggerEffect('sparkle')
      }
      
      gameStore.updateProgress(event.progress)
      break
    
    case 'cave':
      if (hasItem('火把')) {
        const events = [
          { text: '借助火把的光芒，你发现了一条隐藏的通道。', progress: 10 },
          { text: '在洞穴深处，你找到了一把神秘的钥匙。', item: '神秘钥匙', progress: 15 },
          { text: '你小心翼翼地避开了陷阱，安全地探索了洞穴。', progress: 8 }
        ]
        
        const event = events[Math.floor(Math.random() * events.length)]
        gameStore.addLog(event.text, 'success')
        
        if (event.item) {
          gameStore.addItem(event.item)
          gameStore.triggerEffect('fire')
        }
        
        gameStore.updateProgress(event.progress)
      } else {
        gameStore.addLog('洞穴太黑了，你需要火把才能安全探索。', 'warning')
        gameStore.triggerEffect('shake', 500)
      }
      break
    
    case 'temple':
      const templeEvents = [
        { text: '你在神庙中发现了古老的壁画，描述了宝藏的位置。', progress: 12 },
        { text: '神庙的祭坛上放着一个神秘的符文石。', item: '符文石', progress: 10 },
        { text: '你感受到了神庙中神秘力量的存在。', progress: 8 }
      ]
      
      const templeEvent = templeEvents[Math.floor(Math.random() * templeEvents.length)]
      gameStore.addLog(templeEvent.text, 'info')
      
      if (templeEvent.item) {
        gameStore.addItem(templeEvent.item)
        gameStore.triggerEffect('lightning')
      }
      
      gameStore.updateProgress(templeEvent.progress)
      break
    
    default:
      gameStore.addLog(`探索了${location.value.name}`)
      gameStore.updateProgress(5)
  }
}

const searchLocation = () => {
  const searchEvents = [
    { text: '你仔细搜寻了这个地方，发现了一些有用的线索。', progress: 3 },
    { text: '在角落里，你找到了一些闪闪发光的东西。', progress: 5 },
    { text: '搜寻没有发现什么特别的东西。', progress: 1 }
  ]
  
  const event = searchEvents[Math.floor(Math.random() * searchEvents.length)]
  gameStore.addLog(event.text, 'info')
  gameStore.updateProgress(event.progress)
}

const restAtLocation = () => {
  gameStore.addLog('你在这里休息了一会儿，恢复了一些体力。', 'success')
  gameStore.updateProgress(2)
  gameStore.triggerEffect('heal')
}

const visitShop = () => {
  gameStore.addLog('商店暂时关闭，请稍后再来。', 'info')
}

// 地点特定动作
const readBook = () => {
  if (hasItem('古书')) {
    gameStore.addLog('古书记载：宝藏被藏在神庙最深处的密室中，需要神秘钥匙才能打开。', 'success')
    gameStore.updateProgress(5)
  }
}

const decodeMap = () => {
  if (hasItem('古地图')) {
    gameStore.addLog('通过解读地图，你发现了一条通往宝藏的秘密路径！', 'success')
    gameStore.updateProgress(10)
  } else {
    gameStore.addLog('你需要先找到地图才能进行解读。', 'warning')
  }
}

const enterCave = () => {
  gameStore.addLog('你进入了洞穴深处，发现了一个隐藏的密室！', 'success')
  gameStore.updateProgress(8)
}

const prayAtTemple = () => {
  gameStore.addLog('你在神庙中祈祷，感受到了一股神秘的力量。', 'info')
  gameStore.updateProgress(3)
}

const crossRiver = () => {
  if (hasItem('木筏')) {
    gameStore.addLog('你使用木筏安全渡过了河流。', 'success')
    gameStore.updateProgress(5)
  } else {
    gameStore.addLog('河水太急，没有合适的工具无法渡河。', 'warning')
  }
}

// 音乐控制方法
const toggleMusic = () => {
  if (isPlaying.value) {
    gameStore.pauseGlobalMusic()
  } else {
    const musicFile = locationMusic[locationId.value]
    gameStore.playLocationMusic(locationId.value, musicFile)
  }
}

// 生命周期钩子
onMounted(() => {
  if (gameStore.gameActive.value && location.value) {
    gameStore.addLog(`🗺️ 访问了 ${location.value.name}`, 'info')
  }
  // 自动播放该地点的背景音乐
  const musicFile = locationMusic[locationId.value]
  gameStore.playLocationMusic(locationId.value, musicFile)
})

onUnmounted(() => {
  // 离开地点页面时停止音乐播放
  gameStore.stopGlobalMusic()
})
</script>

<style scoped>
/* 右上角按钮组 */
.top-right-buttons {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.music-btn {
  background: #FF6B35;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8em 1.2em;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  min-width: 140px;
  text-align: center;
}

.music-btn:hover {
  background: #E55A2B;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.music-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.music-btn.playing {
  background: #28A745;
  animation: pulse 2s infinite;
}

.music-btn.playing:hover {
  background: #218838;
}

@keyframes pulse {
  0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
  50% { box-shadow: 0 4px 12px rgba(40, 167, 69, 0.6); }
  100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
}

.return-game-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8em 1.2em;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  min-width: 140px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.return-game-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.return-game-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.location-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFECB3 0%, #FFB347 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.location-nav {
  background: linear-gradient(135deg, #FFE082 0%, #FFD54F 100%);
  padding: 1.5em 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid #FF8C00;
  width: 100%;
  max-width: 800px;
  border-radius: 12px 12px 0 0;
}

.nav-buttons {
  display: flex;
  gap: 1em;
}

.back-btn {
  border: none;
  border-radius: 12px;
  padding: 0.8em 1.5em;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.back-btn.primary {
  background: #4CAF50;
  color: white;
}

.back-btn.primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.back-btn.secondary {
  background: #4FC3F7;
  color: white;
}

.back-btn.secondary:hover {
  background: #29B6F6;
  transform: translateY(-2px);
}

.location-nav h1 {
  font-size: 2.5em;
  color: #8B4513;
  margin: 0;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  text-shadow: 2px 2px 0 #fff, 0 0 12px #FFD700;
}

.navbar-spacer {
  width: 120px;
}

.location-content {
  max-width: 800px;
  width: 100%;
  margin: 0;
  padding: 2em;
  background: linear-gradient(135deg, #FFFDE4 60%, #FFD700 100%);
  border-radius: 0 0 24px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 3px solid #FFD700;
  border-top: none;
  position: relative;
}

.location-description-section {
  margin-bottom: 2em;
}

.location-description-section h2 {
  color: #FF9800;
  margin-bottom: 1em;
  font-size: 1.8em;
}

.location-description-section p {
  font-size: 1.2em;
  line-height: 1.6;
  color: #4B3F1D;
}

.location-features {
  display: flex;
  gap: 1em;
  margin-bottom: 2em;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5em;
  background: rgba(255, 248, 220, 0.8);
  padding: 0.8em 1.2em;
  border-radius: 12px;
  border: 2px solid #FFD700;
}

.feature-icon {
  font-size: 1.2em;
}

.feature-text {
  font-weight: bold;
  color: #8B4513;
}

.location-actions {
  display: flex;
  gap: 1em;
  margin-bottom: 2em;
  flex-wrap: wrap;
}

.btn {
  padding: 1em 1.5em;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #8B4513;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
  transform: translateY(-2px);
}

.btn-secondary {
  background: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #29B6F6 0%, #039BE5 100%);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.inventory-hint {
  background: rgba(255, 248, 220, 0.8);
  padding: 1.5em;
  border-radius: 16px;
  border: 2px solid #FFD700;
  margin-bottom: 2em;
}

.inventory-hint h4 {
  margin: 0 0 1em 0;
  color: #8B4513;
  font-size: 1.3em;
}

.inventory-items {
  display: flex;
  gap: 0.8em;
  flex-wrap: wrap;
}

.item-tag {
  background: linear-gradient(135deg, #FFD700 60%, #FFB347 100%);
  padding: 0.6em 1em;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: bold;
  color: #4B3F1D;
  border: 2px solid #FF9800;
}

.location-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  opacity: 0.1;
}

.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, #FFD700 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #FFA500 0%, transparent 50%);
  border-radius: inherit;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .location-navbar {
    padding: 1em;
    flex-direction: column;
    gap: 1em;
  }
  
  .nav-buttons {
    flex-direction: column;
    width: 100%;
    gap: 0.5em;
  }
  
  .back-btn {
    width: 100%;
    padding: 0.6em 1em;
    font-size: 1em;
  }
  
  .location-navbar h1 {
    font-size: 2em;
    text-align: center;
  }
  
  .navbar-spacer {
    display: none;
  }
  
  .location-content {
    margin: 1em;
    padding: 1.5em;
  }
  
  .location-actions {
    justify-content: center;
  }
  
  .btn {
    flex: 1;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .location-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .location-features {
    flex-direction: column;
  }
}
</style>