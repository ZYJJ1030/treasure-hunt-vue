<template>
  <div class="statistics-modal" @click.self="$emit('close')">
    <div class="statistics-container">
      <div class="statistics-header">
        <h2>🏆 游戏统计</h2>
        <div class="header-actions">
          <button @click="resetStats" class="reset-btn" title="重置统计数据">
            🔄 重置
          </button>
          <button @click="$emit('close')" class="close-btn" title="关闭">
            ✕
          </button>
        </div>
      </div>

    <div class="stats-grid">
      <!-- 基础统计 -->
      <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div class="stat-info">
          <div class="stat-value">{{ gameStore.gameStatistics.totalGames }}</div>
          <div class="stat-label">总游戏次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💎</div>
        <div class="stat-info">
          <div class="stat-value">{{ gameStore.gameStatistics.treasuresFoundTotal }}</div>
          <div class="stat-label">找到宝藏次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value">{{ gameStore.gameStatistics.totalScore }}</div>
          <div class="stat-label">总分数</div>
        </div>
      </div>

      <div class="stat-card highlight">
        <div class="stat-icon">🏅</div>
        <div class="stat-info">
          <div class="stat-value">{{ gameStore.gameStatistics.highestScore }}</div>
          <div class="stat-label">最高分数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <div class="stat-value">{{ gameStore.gameStatistics.perfectRuns }}</div>
          <div class="stat-label">完美通关次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ successRate }}%</div>
          <div class="stat-label">成功率</div>
        </div>
      </div>
    </div>

    <!-- 评分标准说明 -->
    <div class="scoring-explanation">
      <h3>📋 评分标准说明</h3>
      <div class="scoring-rules">
        <div class="rule-item">
          <span class="rule-icon">💎</span>
          <span class="rule-text">找到宝藏：<strong>+1分</strong></span>
        </div>
        <div class="rule-item">
          <span class="rule-icon">🏆</span>
          <span class="rule-text">完美通关（拥有所有道具）：<strong>额外+2分</strong></span>
        </div>
        <div class="rule-item">
          <span class="rule-icon">🎯</span>
          <span class="rule-text">单次游戏最高可得：<strong>3分</strong></span>
        </div>
      </div>

      <div class="achievement-levels">
        <h4>🎖️ 成就等级</h4>
        <div class="level-list">
          <div class="level-item bronze">
            <span class="level-badge">🥉</span>
            <span>青铜探险家：总分 1-10 分</span>
          </div>
          <div class="level-item silver">
            <span class="level-badge">🥈</span>
            <span>白银寻宝者：总分 11-25 分</span>
          </div>
          <div class="level-item gold">
            <span class="level-badge">🥇</span>
            <span>黄金冒险家：总分 26-50 分</span>
          </div>
          <div class="level-item diamond">
            <span class="level-badge">💎</span>
            <span>钻石大师：总分 51+ 分</span>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <h4>💡 提升分数技巧</h4>
        <ul class="tips-list">
          <li>🔍 仔细探索每个地点，收集所有重要道具</li>
          <li>📚 优先获得古书，它是通关的关键道具</li>
          <li>🕯️ 在洞穴探索时选择"左边(有光亮)"获得火把</li>
          <li>🗝️ 在神庙搜索时有机会获得神秘钥匙</li>
          <li>🎯 完美通关需要同时拥有：古书、火把、神秘钥匙</li>
        </ul>
      </div>
    </div>

    <!-- 最后游戏时间 -->
    <div class="last-play" v-if="gameStore.gameStatistics.lastPlayDate">
      <span class="last-play-label">最后游戏时间：</span>
      <span class="last-play-date">{{ formatDate(gameStore.gameStatistics.lastPlayDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 计算成功率
const successRate = computed(() => {
  const total = gameStore.gameStatistics.totalGames
  const success = gameStore.gameStatistics.treasuresFoundTotal
  return total > 0 ? Math.round((success / total) * 100) : 0
})

// 重置统计数据
const resetStats = () => {
  if (confirm('确定要重置所有统计数据吗？此操作不可撤销！')) {
    gameStore.resetStatistics()
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '从未'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.statistics-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.statistics-container {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.statistics-header h2 {
  margin: 0;
  font-size: 2em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.reset-btn, .close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover, .close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.close-btn {
  background: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
}

.stat-icon {
  font-size: 2.5em;
  opacity: 0.8;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.8;
}

.scoring-explanation {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.scoring-explanation h3, .scoring-explanation h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #ffd700;
}

.scoring-rules {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.rule-icon {
  font-size: 1.5em;
}

.achievement-levels {
  margin-bottom: 25px;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.level-item.bronze { border-left: 4px solid #cd7f32; }
.level-item.silver { border-left: 4px solid #c0c0c0; }
.level-item.gold { border-left: 4px solid #ffd700; }
.level-item.diamond { border-left: 4px solid #b9f2ff; }

.level-badge {
  font-size: 1.2em;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.last-play {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.9em;
}

.last-play-label {
  opacity: 0.8;
}

.last-play-date {
  font-weight: bold;
  color: #ffd700;
}

@media (max-width: 768px) {
  .statistics-modal {
    padding: 10px;
  }
  
  .statistics-container {
    padding: 15px;
    max-height: 95vh;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .statistics-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>