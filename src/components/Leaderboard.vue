<template>
  <div class="leaderboard-modal" @click.self="$emit('close')">
    <div class="leaderboard-content fade-in">
      <div class="leaderboard-header">
        <h2>🏆 排行榜</h2>
        <button class="close-btn" @click="$emit('close')">
          ✕ 返回
        </button>
      </div>
      
      <!-- 排行榜筛选 -->
      <div class="leaderboard-filters">
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'highScore' }"
          @click="activeFilter = 'highScore'"
        >
          🥇 最高分数
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'treasuresFound' }"
          @click="activeFilter = 'treasuresFound'"
        >
          💎 宝藏数量
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: activeFilter === 'gameCount' }"
          @click="activeFilter = 'gameCount'"
        >
          🎮 游戏次数
        </button>
      </div>
      
      <!-- 排行榜列表 -->
      <div class="leaderboard-list">
        <div v-if="sortedUsers.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>暂无游戏记录</h3>
          <p>成为第一个登上排行榜的玩家吧！</p>
        </div>
        
        <div v-else>
          <!-- 前三名特殊样式 -->
          <div 
            v-for="(user, index) in sortedUsers.slice(0, 3)" 
            :key="user.id"
            class="leaderboard-item top-three"
            :class="getRankClass(index)"
          >
            <div class="rank-medal">
              {{ getRankMedal(index) }}
            </div>
            <div class="user-avatar">
              {{ getAvatarEmoji(user.username) }}
            </div>
            <div class="user-info">
              <div class="username">{{ user.username }}</div>
              <div class="user-stats">
                <span class="stat-value">{{ getStatValue(user) }}</span>
                <span class="stat-label">{{ getStatLabel() }}</span>
              </div>
            </div>
            <div class="rank-badge">
              第{{ index + 1 }}名
            </div>
          </div>
          
          <!-- 其他排名 -->
          <div 
            v-for="(user, index) in sortedUsers.slice(3)" 
            :key="user.id"
            class="leaderboard-item"
            :class="{ 'current-user': isCurrentUser(user) }"
          >
            <div class="rank-number">
              {{ index + 4 }}
            </div>
            <div class="user-avatar">
              {{ getAvatarEmoji(user.username) }}
            </div>
            <div class="user-info">
              <div class="username">{{ user.username }}</div>
              <div class="user-stats">
                <span class="stat-value">{{ getStatValue(user) }}</span>
                <span class="stat-label">{{ getStatLabel() }}</span>
              </div>
            </div>
            <div class="rank-badge">
              第{{ index + 4 }}名
            </div>
          </div>
        </div>
      </div>
      
      <!-- 当前用户排名信息 -->
      <div v-if="currentUserRank >= 0" class="current-user-rank">
        <div class="rank-info">
          <span class="rank-label">你的排名：</span>
          <span class="rank-value">第{{ currentUserRank + 1 }}名</span>
        </div>
        <div class="progress-info">
          <span class="progress-label">距离上一名：</span>
          <span class="progress-value">{{ getProgressToNextRank() }}</span>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="leaderboard-stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-title">总玩家数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalGames }}</div>
            <div class="stat-title">总游戏次数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💎</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalTreasures }}</div>
            <div class="stat-title">总宝藏数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const emit = defineEmits(['close'])

const gameStore = useGameStore()

// 响应式数据
const activeFilter = ref('highScore')

// 计算属性
const allUsers = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('treasureGameUsers') || '[]')
  } catch {
    return []
  }
})

const sortedUsers = computed(() => {
  const users = [...allUsers.value]
  
  switch (activeFilter.value) {
    case 'highScore':
      return users.sort((a, b) => (b.highScore || 0) - (a.highScore || 0))
    case 'treasuresFound':
      return users.sort((a, b) => (b.treasuresFound || 0) - (a.treasuresFound || 0))
    case 'gameCount':
      return users.sort((a, b) => (b.gameCount || 0) - (a.gameCount || 0))
    default:
      return users
  }
})

const currentUserRank = computed(() => {
  if (!gameStore.currentUser) return -1
  
  return sortedUsers.value.findIndex(user => 
    user.id === gameStore.currentUser.id
  )
})

const totalUsers = computed(() => allUsers.value.length)

const totalGames = computed(() => 
  allUsers.value.reduce((sum, user) => sum + (user.gameCount || 0), 0)
)

const totalTreasures = computed(() => 
  allUsers.value.reduce((sum, user) => sum + (user.treasuresFound || 0), 0)
)

// 方法
const getAvatarEmoji = (username) => {
  const emojis = ['👤', '👨', '👩', '🧙', '🦸', '🧝', '🧚', '🐱', '🐶', '🐼']
  const index = username.length % emojis.length
  return emojis[index]
}

const getRankClass = (index) => {
  const classes = ['gold', 'silver', 'bronze']
  return classes[index] || ''
}

const getRankMedal = (index) => {
  const medals = ['🥇', '🥈', '🥉']
  return medals[index] || '🏅'
}

const getStatValue = (user) => {
  switch (activeFilter.value) {
    case 'highScore':
      return user.highScore || 0
    case 'treasuresFound':
      return user.treasuresFound || 0
    case 'gameCount':
      return user.gameCount || 0
    default:
      return 0
  }
}

const getStatLabel = () => {
  switch (activeFilter.value) {
    case 'highScore':
      return '最高分数'
    case 'treasuresFound':
      return '宝藏数量'
    case 'gameCount':
      return '游戏次数'
    default:
      return ''
  }
}

const isCurrentUser = (user) => {
  return gameStore.currentUser && user.id === gameStore.currentUser.id
}

const getProgressToNextRank = () => {
  if (currentUserRank.value <= 0) return '已是第一名！'
  
  const currentUser = sortedUsers.value[currentUserRank.value]
  const nextUser = sortedUsers.value[currentUserRank.value - 1]
  
  const currentValue = getStatValue(currentUser)
  const nextValue = getStatValue(nextUser)
  
  const difference = nextValue - currentValue
  
  if (difference <= 0) return '即将超越！'
  
  switch (activeFilter.value) {
    case 'highScore':
      return `还需${difference}分`
    case 'treasuresFound':
      return `还需${difference}个宝藏`
    case 'gameCount':
      return `还需${difference}次游戏`
    default:
      return ''
  }
}

// 生命周期
onMounted(() => {
  // 可以在这里加载排行榜数据
})
</script>

<style scoped>
.leaderboard-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 236, 179, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2em;
}

.leaderboard-content {
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #FFFDE4 60%, #FFD700 100%);
  padding: 2.5em 2em;
  border-radius: 32px;
  box-shadow: var(--cartoon-shadow);
  border: var(--cartoon-border);
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
  gap: 1em;
}

.leaderboard-header h2 {
  font-size: 2.2em;
  color: #FF9800;
  margin: 0;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  text-shadow: 2px 2px 0 #fff, 0 0 12px #FFD700;
}

.close-btn {
  background: #F44336;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1.1em;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #FFD700;
  color: #F44336;
}

.leaderboard-filters {
  display: flex;
  gap: 0.5em;
  margin-bottom: 2em;
  background: rgba(255, 248, 220, 0.8);
  padding: 0.5em;
  border-radius: 16px;
  justify-content: center;
}

.filter-btn {
  flex: 1;
  padding: 0.8em 1em;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
}

.filter-btn.active {
  background: #FFD700;
  color: #4B3F1D;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.leaderboard-list {
  margin-bottom: 2em;
}

.empty-state {
  text-align: center;
  padding: 3em 1em;
  color: #8B4513;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 0.5em;
}

.empty-state h3 {
  margin: 0.5em 0;
  color: #FF9800;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 1em 1.5em;
  margin-bottom: 0.8em;
  background: rgba(255, 248, 220, 0.8);
  border-radius: 20px;
  border: 2px solid #FFD700;
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateY(-2px);
}

.leaderboard-item.top-three {
  padding: 1.5em;
  margin-bottom: 1em;
}

.leaderboard-item.gold {
  background: linear-gradient(135deg, #FFD700 60%, #FFB347 100%);
  border-color: #FF9800;
}

.leaderboard-item.silver {
  background: linear-gradient(135deg, #C0C0C0 60%, #A0A0A0 100%);
  border-color: #808080;
}

.leaderboard-item.bronze {
  background: linear-gradient(135deg, #CD7F32 60%, #A0522D 100%);
  border-color: #8B4513;
}

.leaderboard-item.current-user {
  background: linear-gradient(135deg, #4CAF50 60%, #45a049 100%);
  border-color: #388E3C;
  color: white;
}

.rank-medal {
  font-size: 2em;
  width: 50px;
  text-align: center;
}

.rank-number {
  width: 50px;
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
  color: #FF9800;
}

.user-avatar {
  font-size: 2em;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFD700;
  border-radius: 50%;
  border: 3px solid #FF9800;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 0.3em;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.stat-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #FF9800;
}

.stat-label {
  font-size: 0.9em;
  color: #4B3F1D;
}

.rank-badge {
  background: #FFD700;
  color: #4B3F1D;
  padding: 0.5em 1em;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9em;
}

.current-user-rank {
  background: rgba(255, 248, 220, 0.8);
  padding: 1.5em;
  border-radius: 20px;
  border: 2px solid #FFD700;
  margin-bottom: 2em;
}

.rank-info, .progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
}

.rank-label, .progress-label {
  font-weight: bold;
  color: #4B3F1D;
}

.rank-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #FF9800;
}

.progress-value {
  color: #4CAF50;
  font-weight: bold;
}

.leaderboard-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
}

.stat-card {
  background: rgba(255, 248, 220, 0.8);
  padding: 1em;
  border-radius: 16px;
  text-align: center;
  border: 2px solid #FFD700;
}

.stat-icon {
  font-size: 2em;
  margin-bottom: 0.5em;
}

.stat-number {
  font-size: 1.5em;
  font-weight: bold;
  color: #FF9800;
}

.stat-title {
  font-size: 0.9em;
  color: #4B3F1D;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .leaderboard-modal {
    padding: 1em;
  }
  
  .leaderboard-content {
    padding: 1.5em 1em;
  }
  
  .leaderboard-header {
    flex-direction: column;
    text-align: center;
  }
  
  .leaderboard-header h2 {
    font-size: 1.8em;
  }
  
  .leaderboard-filters {
    flex-direction: column;
  }
  
  .leaderboard-item {
    flex-direction: column;
    text-align: center;
    gap: 0.8em;
  }
  
  .user-info {
    text-align: center;
  }
  
  .leaderboard-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .leaderboard-item {
    padding: 1em;
  }
  
  .leaderboard-item.top-three {
    padding: 1.2em;
  }
  
  .rank-medal, .rank-number {
    width: 40px;
    font-size: 1.2em;
  }
  
  .user-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.5em;
  }
}
</style>