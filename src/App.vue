<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <h1 class="navbar-title">🏝️ 寻宝冒险游戏</h1>
      <div class="navbar-controls">
        <button 
          v-if="isLoggedIn" 
          class="btn btn-secondary"
          @click="showUserManagement = true"
        >
          👤 {{ currentUser.username }}
        </button>
        <button 
          v-else 
          class="btn btn-secondary"
          @click="showUserManagement = true"
        >
          🔐 登录/注册
        </button>
        <button 
          class="btn btn-secondary"
          @click="showLeaderboard = true"
        >
          🏆 排行榜
        </button>
        <button 
          class="btn btn-secondary"
          @click="showStatistics = true"
        >
          📊 统计
        </button>
        <button 
          class="navbar-music"
          :class="{ playing: musicPlaying }"
          @click="toggleMusic"
        >
          🎵 {{ musicPlaying ? '关闭音乐' : '开启音乐' }}
        </button>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 用户未登录时显示登录界面 -->
      <div v-if="!isLoggedIn" class="login-prompt">
        <div class="login-content">
          <h2>欢迎来到寻宝冒险游戏！</h2>
          <p>请先登录或注册以开始游戏</p>
          <button class="btn btn-primary" @click="showUserManagement = true">
            开始冒险
          </button>
        </div>
      </div>

      <!-- 游戏主界面 -->
      <div v-else class="game-container">
        <!-- 道具按钮（小圆形按钮，左上角） -->
        <div class="game-button inventory-btn">
          <Inventory />
        </div>

        <!-- 游戏日志按钮（小圆形按钮，右上角） -->
        <div class="game-button log-btn">
          <GameLog />
        </div>

        <!-- 地点列表按钮（小圆形按钮，左下角） -->
        <div class="game-button location-btn">
          <button class="btn btn-secondary" @click="showLocationNavigator = true">🗺️ 地点</button>
        </div>
        <!-- 主游戏区域（全屏显示） -->
        <div class="game-main">
          <router-view />
          
          <!-- 游戏统计信息栏 -->
          <div class="game-stats-bar">
            <div class="stat-item">
              <span class="stat-icon">🎮</span>
              <span class="stat-text">游戏: {{ gameStore.gameStatistics.totalGames }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💎</span>
              <span class="stat-text">宝藏: {{ gameStore.gameStatistics.treasuresFoundTotal }}</span>
            </div>
            <div class="stat-item highlight">
              <span class="stat-icon">⭐</span>
              <span class="stat-text">总分: {{ gameStore.gameStatistics.totalScore }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🏅</span>
              <span class="stat-text">最高: {{ gameStore.gameStatistics.highestScore }}</span>
            </div>
          </div>
          
          <!-- 游戏控制按钮 -->
        <div class="controls">
          <button 
            class="btn btn-primary" 
            @click="startGame"
            :disabled="gameActive"
          >
            🚀 开始寻宝
          </button>
          <button 
            class="btn btn-success" 
            @click="continueGame"
            :disabled="!gameActive || gameStore.progress < 10"
          >
            ➡️ 继续冒险
          </button>
          <button 
            class="btn btn-danger" 
            @click="resetGame"
          >
            🔄 重置游戏
          </button>
          <button 
            class="btn btn-secondary" 
            @click="saveGame"
            :disabled="!gameActive"
          >
            💾 保存游戏
          </button>
        </div>
        </div>
      </div>
    </main>

    <!-- 地点详情弹窗 -->
    <LocationDetail 
      v-if="showLocationDetail"
      :location="currentLocationData"
      @close="showLocationDetail = false"
    />

    <!-- 用户管理弹窗 -->
    <UserManagement 
      v-if="showUserManagement"
      @close="showUserManagement = false"
    />

    <!-- 排行榜弹窗 -->
    <Leaderboard 
      v-if="showLeaderboard"
      @close="showLeaderboard = false"
    />

    <!-- 游戏统计弹窗 -->
    <GameStatistics 
      v-if="showStatistics"
      @close="showStatistics = false"
    />

    <!-- 地点列表弹窗 -->
    <LocationNavigator
      v-if="showLocationNavigator"
      @close="showLocationNavigator = false"
    />
    <!-- 玩家选择对话框 -->
    <ChoiceDialog 
      v-if="gameStore.choiceDialog.visible"
      :title="gameStore.choiceDialog.title"
      :message="gameStore.choiceDialog.message"
      :choices="gameStore.choiceDialog.choices"
      @choice-selected="handleChoiceSelected"
      @close="closeChoiceDialog"
    />

    <!-- 粒子特效 -->
    <div class="particles" ref="particlesContainer"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from './stores/gameStore'
import GameMap from './components/GameMap.vue'
import LocationDetail from './components/LocationDetail.vue'
import Inventory from './components/Inventory.vue'
import GameLog from './components/GameLog.vue'
import UserManagement from './components/UserManagement.vue'
import Leaderboard from './components/Leaderboard.vue'
import GameStatistics from './components/GameStatistics.vue'
import ChoiceDialog from './components/ChoiceDialog.vue'
import LocationNavigator from './components/LocationNavigator.vue'

const gameStore = useGameStore()
const router = useRouter()
const route = useRoute()

// 响应式状态
const showLocationDetail = ref(false)
const showUserManagement = ref(false)
const showLeaderboard = ref(false)
const showStatistics = ref(false)
const musicPlaying = ref(false)
const showLocationNavigator = ref(false)

// 主页音乐相关
let mainPageAudio = null

// 主页音乐控制函数
const playMainPageMusic = () => {
  try {
    if (mainPageAudio) {
      mainPageAudio.pause()
      mainPageAudio.currentTime = 0
    }
    
    mainPageAudio = new Audio(`${import.meta.env.BASE_URL}BGM/relaxing-guitar-loop-v5-245859.mp3`)
    mainPageAudio.loop = true
    mainPageAudio.volume = 0.3
    
    mainPageAudio.addEventListener('canplay', () => {
      mainPageAudio.play()
      gameStore.addLog('🎵 主页背景音乐已开启', 'success')
    })
    
    mainPageAudio.addEventListener('error', (e) => {
      console.error('主页音乐加载失败:', e)
      gameStore.addLog('主页音乐加载失败', 'warning')
      musicPlaying.value = false
    })
    
  } catch (error) {
    console.error('播放主页音乐异常:', error)
    gameStore.addLog('播放主页音乐时出错', 'warning')
    musicPlaying.value = false
  }
}

const stopMainPageMusic = () => {
  if (mainPageAudio) {
    mainPageAudio.pause()
    mainPageAudio.currentTime = 0
    mainPageAudio = null
    gameStore.addLog('🔇 主页背景音乐已关闭', 'info')
  }
}
// 玩家选择对话框状态
const choiceDialog = ref({
  visible: false,
  title: '',
  message: '',
  choices: [],
  selectedChoice: null
})

// 计算属性
const isLoggedIn = computed(() => gameStore.isLoggedIn)
const currentUser = computed(() => gameStore.currentUser)
const gameActive = computed(() => gameStore.gameActive)
const currentLocationData = computed(() => gameStore.locations[gameStore.currentLocation])

// 方法
const startGame = async () => {
  try {
    await gameStore.startGame()
    // 游戏开始日志已经在startGame方法中添加
  } catch (error) {
    console.error('游戏启动失败:', error)
    gameStore.addLog('游戏启动失败，请重试', 'error')
  }
}

const continueGame = async () => {
  try {
    // 如果有上一个选择状态，直接返回到选择页面
    if (gameStore.lastChoiceState.hasLastChoice) {
      gameStore.returnToLastChoice()
      gameStore.addLog('🔄 返回到之前的选择页面', 'info')
    } else {
      // 否则执行正常的继续游戏逻辑
      await gameStore.continueGame()
    }
  } catch (error) {
    console.error('继续游戏失败:', error)
    gameStore.addLog('继续游戏失败，请重试', 'error')
  }
}

const resetGame = () => {
  // 简化重置逻辑，移除强制确认对话框
  gameStore.resetGame()
  gameStore.addLog('🔄 游戏已重置，可以开始新的冒险！', 'info')
}

const saveGame = () => {
  gameStore.saveGame()
  gameStore.addLog('游戏已保存', 'success')
}

const toggleMusic = () => {
  if (musicPlaying.value) {
    // 停止主页音乐
    stopMainPageMusic()
    musicPlaying.value = false
  } else {
    // 播放主页音乐
    playMainPageMusic()
    musicPlaying.value = true
  }
}

// 玩家选择处理
const handleChoiceSelected = (choiceValue) => {
  gameStore.handleChoiceSelected(choiceValue)
}

const closeChoiceDialog = () => {
  gameStore.closeChoiceDialog()
}

// 监听游戏状态变化
watch(() => gameStore.gameActive, (newValue) => {
  if (newValue) {
    // 游戏开始时创建更多粒子
    createGameParticles()
  }
})

// 监听进度变化
watch(() => gameStore.progress, (newValue, oldValue) => {
  if (newValue > oldValue) {
    // 进度增加时创建庆祝粒子
    createCelebrationParticles()
  }
})

// 监听路由变化，管理音乐播放
watch(() => route.path, (newPath, oldPath) => {
  console.log('路由变化:', { oldPath, newPath }) // 调试日志
  
  // 如果从地点页面返回到主页面，停止地点音乐
  if (oldPath && oldPath.startsWith('/location/') && newPath === '/') {
    console.log('检测到从地点页面返回主页面，停止地点音乐') // 调试日志
    gameStore.stopGlobalMusic()
    gameStore.addLog('🔇 已停止地点背景音乐', 'info')
    
    // 如果主页音乐开关是开启状态，恢复主页音乐
    if (musicPlaying.value) {
      setTimeout(() => {
        playMainPageMusic()
      }, 100) // 稍微延迟以确保地点音乐完全停止
    }
  }
  
  // 如果从主页面切换到地点页面，停止主页音乐
  if (oldPath === '/' && newPath.startsWith('/location/')) {
    console.log('检测到从主页面切换到地点页面，停止主页音乐') // 调试日志
    stopMainPageMusic()
  }
  
  // 如果切换到主页面（无论从哪里来），都停止地点音乐
  if (newPath === '/' && gameStore.isMusicPlaying) {
    console.log('切换到主页面，停止所有地点音乐') // 调试日志
    gameStore.stopGlobalMusic()
    gameStore.addLog('🔇 返回主页面，已停止地点背景音乐', 'info')
  }
}, { immediate: true })

// 初始化
onMounted(() => {
  gameStore.initialize()
  // 初始化粒子效果
  initParticles()
  
  // 尝试加载保存的游戏
  const savedGame = gameStore.loadGame()
  if (savedGame) {
    gameStore.addLog('检测到保存的游戏，已自动加载', 'info')
  }
})

// 页面卸载时清理音乐
onUnmounted(() => {
  stopMainPageMusic()
})

// 粒子效果初始化
const initParticles = () => {
  const container = document.querySelector('.particles')
  if (!container) return
  
  // 创建背景粒子
  for (let i = 0; i < 50; i++) {
    createParticle(container, {
      type: 'background',
      delay: Math.random() * 10
    })
  }
}

// 创建粒子
const createParticle = (container, options = {}) => {
  const particle = document.createElement('div')
  particle.className = 'floating-particle'
  
  // 设置粒子样式
  const types = {
    background: { emoji: '✨', size: '20px', duration: '15s' },
    celebration: { emoji: '🎉', size: '30px', duration: '3s' },
    game: { emoji: '⭐', size: '25px', duration: '8s' }
  }
  
  const type = options.type || 'background'
  const config = types[type]
  
  particle.textContent = config.emoji
  particle.style.fontSize = config.size
  particle.style.animationDuration = config.duration
  particle.style.left = Math.random() * 100 + '%'
  particle.style.animationDelay = (options.delay || Math.random() * 5) + 's'
  
  container.appendChild(particle)
  
  // 动画结束后移除粒子
  setTimeout(() => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle)
    }
  }, parseFloat(config.duration) * 1000)
}

// 创建游戏粒子
const createGameParticles = () => {
  const container = document.querySelector('.particles')
  if (!container) return
  
  for (let i = 0; i < 20; i++) {
    createParticle(container, {
      type: 'game',
      delay: Math.random() * 2
    })
  }
}

// 创建庆祝粒子
const createCelebrationParticles = () => {
  const container = document.querySelector('.particles')
  if (!container) return
  
  for (let i = 0; i < 10; i++) {
    createParticle(container, {
      type: 'celebration',
      delay: Math.random() * 1
    })
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  width: 100vw;
  background: linear-gradient(90deg, #FFD700 60%, #FFB347 100%);
  box-shadow: var(--cartoon-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 2em;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-title {
  font-size: 2.2em;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  color: #FF9800;
  letter-spacing: 2px;
  text-shadow: 2px 2px 0 #fff, 0 0 12px #FFD700;
}

.navbar-controls {
  display: flex;
  gap: 1em;
  align-items: center;
}

.navbar-music {
  font-size: 1.1em;
  background: #FFB347;
  border-radius: 12px;
  border: 2px solid #FFD700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  padding: 0.5em 1.2em;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.navbar-music.playing {
  background: #4FC3F7;
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 0;
}

.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, #FFECB3 0%, #FFB347 100%);
}

.login-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 3em;
  border-radius: 24px;
  box-shadow: var(--cartoon-shadow);
  border: var(--cartoon-border);
}

.login-content h2 {
  color: #FF9800;
  margin-bottom: 1em;
  font-size: 2em;
}

.login-content p {
  color: #4B3F1D;
  margin-bottom: 2em;
  font-size: 1.2em;
}

.game-container {
  position: relative;
  width: 100vw;
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, #FFECB3 0%, #FFB347 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-button {
  position: absolute;
  z-index: 100;
}

.inventory-btn {
  top: 20px;
  left: 20px;
}

.log-btn {
  top: 20px;
  right: 20px;
}

.location-btn {
  bottom: 20px;
  left: 20px;
}

.game-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;
}

.controls {
  margin-top: 2em;
  display: flex;
  gap: 1em;
}

/* 游戏统计信息栏样式 */
.game-stats-bar {
  display: flex;
  justify-content: center;
  gap: 1.5em;
  margin: 1.5em 0;
  padding: 1em;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #FFB347;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 1em;
  background: rgba(255, 179, 71, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 179, 71, 0.2);
  transform: translateY(-2px);
}

.stat-item.highlight {
  background: linear-gradient(135deg, #FFD700 0%, #FFB347 100%);
  color: #4B3F1D;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 179, 71, 0.3);
}

.stat-icon {
  font-size: 1.2em;
}

.stat-text {
  font-size: 0.9em;
  font-weight: 600;
  color: #4B3F1D;
}

.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.floating-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #FFD700 60%, #FFB347 100%);
  border-radius: 50%;
  animation: float 7s infinite linear;
  opacity: 0.7;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-controls {
    flex-direction: column;
    gap: 0.5em;
  }
  
  .game-button {
    top: 10px;
  }
  
  .inventory-btn {
    left: 10px;
  }
  
  .log-btn {
    right: 10px;
  }
  
  .game-main {
    padding: 1em;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  /* 移动端统计栏适配 */
  .game-stats-bar {
    flex-wrap: wrap;
    gap: 0.8em;
    margin: 1em 0;
    padding: 0.8em;
  }
  
  .stat-item {
    padding: 0.4em 0.8em;
    min-width: calc(50% - 0.4em);
    justify-content: center;
  }
  
  .stat-text {
    font-size: 0.8em;
  }
}
</style>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  width: 100vw;
  background: linear-gradient(90deg, #FFD700 60%, #FFB347 100%);
  box-shadow: var(--cartoon-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 2em;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-title {
  font-size: 2.2em;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  color: #FF9800;
  letter-spacing: 2px;
  text-shadow: 2px 2px 0 #fff, 0 0 12px #FFD700;
}

.navbar-controls {
  display: flex;
  gap: 1em;
  align-items: center;
}

.navbar-music {
  font-size: 1.1em;
  background: #FFB347;
  border-radius: 12px;
  border: 2px solid #FFD700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  padding: 0.5em 1.2em;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.navbar-music.playing {
  background: #4FC3F7;
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 0;
}

.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, #FFECB3 0%, #FFB347 100%);
}

.login-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 3em;
  border-radius: 24px;
  box-shadow: var(--cartoon-shadow);
  border: var(--cartoon-border);
}

.login-content h2 {
  color: #FF9800;
  margin-bottom: 1em;
  font-size: 2em;
}

.login-content p {
  color: #4B3F1D;
  margin-bottom: 2em;
  font-size: 1.2em;
}

.game-container {
  position: relative;
  width: 100vw;
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, #FFECB3 0%, #FFB347 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-button {
  position: absolute;
  z-index: 100;
}

.inventory-btn {
  top: 20px;
  left: 20px;
}

.log-btn {
  top: 20px;
  right: 20px;
}

.location-btn {
  bottom: 20px;
  left: 20px;
}

.game-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;
}

.controls {
  margin-top: 2em;
  display: flex;
  gap: 1em;
}

.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.floating-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #FFD700 60%, #FFB347 100%);
  border-radius: 50%;
  animation: float 7s infinite linear;
  opacity: 0.7;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-controls {
    flex-direction: column;
    gap: 0.5em;
  }
  
  .game-button {
    top: 10px;
  }
  
  .inventory-btn {
    left: 10px;
  }
  
  .log-btn {
    right: 10px;
  }
  
  .game-main {
    padding: 1em;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
}
.location-btn {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100; /* 与其他 game-button 保持一致 */
}
</style>