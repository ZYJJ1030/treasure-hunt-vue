<template>
  <div class="location-modal" @click.self="$emit('close')">
    <div class="location-content fade-in">
      <div class="location-header">
        <h2>{{ location.icon }} {{ location.name }}</h2>
        <button class="close-btn" @click="$emit('close')">
          ✕ 返回地图
        </button>
      </div>
      
      <div class="location-description">
        <p v-if="locationId === 'library'">
          古老的图书馆里摆满了尘封的书籍，空气中弥漫着墨水和羊皮纸的味道。
          书架上的古书记载着关于宝藏的传说和线索。
        </p>
        <p v-else-if="locationId === 'cave'">
          阴暗的洞穴深处传来滴水声，微弱的光线从洞口透入。
          洞穴深处似乎隐藏着什么秘密。
        </p>
        <p v-else-if="locationId === 'temple'">
          宏伟的神庙矗立在你面前，巨大的石柱上雕刻着神秘的图案。
          神庙入口有两尊石像守卫，传说宝藏就藏在神庙的最深处。
        </p>
        <p v-else-if="locationId === 'treasure'">
          你终于来到了传说中的宝藏密室！房间中央有一个华丽的宝箱，
          周围散落着金币和宝石。宝箱上有一个复杂的锁。
        </p>
        <p v-else-if="locationId === 'village'">
          友好的村庄里住着热情的村民，他们或许知道一些关于宝藏的信息。
          村庄的集市上可以购买补给品。
        </p>
        <p v-else-if="locationId === 'river'">
          湍急的河流挡住了去路，河水清澈见底但水流很急。
          需要想办法安全过河。
        </p>
        <p v-else-if="locationId === 'beach'">
          {{ location.description }}
        </p>
        <p v-else-if="locationId === 'forest'">
          {{ location.description }}
        </p>
        <p v-else-if="locationId === 'mountain'">
          {{ location.description }}
        </p>
        <p v-else-if="locationId === 'waterfall'">
          {{ location.description }}
        </p>
        <p v-else>
          {{ location.description }}
        </p>
      </div>
      
      <div class="location-actions">
        <!-- 通用动作 -->
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
        
        <!-- 休息选项（如果地点支持） -->
        <button 
          v-if="location.canRest"
          class="btn btn-secondary" 
          @click="restAtLocation"
          :disabled="!gameActive"
        >
          😴 休息恢复
        </button>
        
        <!-- 商店选项（如果地点有商店） -->
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
        
        <template v-else-if="locationId === 'cave'">
          <button 
            class="btn btn-secondary" 
            @click="enterLeftPath"
            :disabled="!gameActive"
          >
            ⬅️ 走左侧通道
          </button>
          <button 
            class="btn btn-secondary" 
            @click="enterRightPath"
            :disabled="!gameActive"
          >
            ➡️ 走右侧通道
          </button>
        </template>
        
        <template v-else-if="locationId === 'temple'">
          <button 
            class="btn btn-secondary" 
            @click="fightGuard"
            :disabled="!gameActive"
          >
            ⚔️ 与守卫战斗
          </button>
          <button 
            class="btn btn-secondary" 
            @click="sneakPastGuard"
            :disabled="!gameActive"
          >
            🥷 潜行绕过
          </button>
        </template>
        
        <template v-else-if="locationId === 'treasure'">
          <button 
            class="btn btn-primary" 
            @click="openTreasureBox"
            :disabled="!hasItem('神秘钥匙') || !gameActive"
          >
            🔓 打开宝箱
          </button>
          <button 
            class="btn btn-secondary" 
            @click="searchRoom"
            :disabled="!gameActive"
          >
            🔍 搜索房间
          </button>
        </template>
        
        <template v-else-if="locationId === 'village'">
          <button 
            class="btn btn-secondary" 
            @click="buySupplies"
            :disabled="!gameActive"
          >
            🛒 购买补给
          </button>
          <button 
            class="btn btn-secondary" 
            @click="askElder"
            :disabled="!gameActive"
          >
            👴 请教长老
          </button>
        </template>
        
        <template v-else-if="locationId === 'river'">
          <button 
            class="btn btn-secondary" 
            @click="buildRaft"
            :disabled="!gameActive"
          >
            🛶 制作木筏
          </button>
          <button 
            class="btn btn-secondary" 
            @click="findFord"
            :disabled="!gameActive"
          >
            🏞️ 寻找浅滩
          </button>
        </template>
      </div>
      
      <!-- 当前道具提示 -->
      <div class="inventory-hint" v-if="inventoryNames.length > 0">
        <h4>当前道具：</h4>
        <div class="inventory-items">
          <span 
            v-for="item in inventoryNames" 
            :key="item"
            class="item-tag"
          >
            {{ getItemIcon(item) }} {{ item }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const props = defineProps({
  location: {
    type: Object,
    required: true
  },
  locationId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const gameStore = useGameStore()

// 计算属性
const gameActive = computed(() => gameStore.gameActive.value)
const inventoryNames = computed(() => {
  const inv = gameStore.inventory.value
  return Array.isArray(inv) ? inv.map(i => i.name) : []
})

// 方法
const hasItem = (itemName) => {
  return gameStore.hasItem(itemName)
}

const getItemIcon = (item) => {
  const icons = {
    '古书': '📖',
    '火把': '🔥',
    '神秘钥匙': '🔑',
    '神庙地图': '🗺️',
    '木筏': '🛶'
  }
  return icons[item] || '📦'
}

// 新增通用动作函数
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
}

const visitShop = () => {
  gameStore.addLog('商店暂时关闭，请稍后再来。', 'info')
}

const decodeMap = () => {
  if (hasItem('古地图')) {
    gameStore.addLog('通过解读地图，你发现了一条通往宝藏的秘密路径！', 'success')
    gameStore.updateProgress(10)
  } else {
    gameStore.addLog('你需要先找到地图才能进行解读。', 'warning')
  }
}

// 地点动作函数：按 id 处理
const exploreLocation = () => {
  switch(props.locationId) {
    case 'library':
      gameStore.exploreLibrary()
      emit('close')
      break
    case 'cave':
      gameStore.exploreCave()
      emit('close')
      break
    case 'temple':
      gameStore.searchTemple()
      emit('close')
      break
    case 'treasure':
      gameStore.addLog(`宝箱被锁住了，需要神秘钥匙才能打开。`, 'warning')
      gameStore.updateProgress(5)
      break
    case 'village':
      gameStore.visitVillage()
      emit('close')
      break
    case 'river':
      gameStore.crossRiver()
      emit('close')
      break
    default:
      gameStore.addLog(`探索了${props.location.name}`, 'info')
      gameStore.updateProgress(5)
  }
}

const readBook = () => {
  if (hasItem('古书')) {
    gameStore.addLog('古书记载：宝藏被藏在神庙最深处的密室中，需要神秘钥匙才能打开。', 'success')
    gameStore.updateProgress(5)
  }
}

const enterLeftPath = () => {
  if (Math.random() < 0.7) {
    gameStore.addToInventory('火把')
    gameStore.addLog('你在光亮处发现了一只火把! 它会帮助你在黑暗中前进。', 'success')
    gameStore.updateProgress(10)
  } else {
    gameStore.addLog('左侧通道是个死胡同，你什么都没找到。', 'warning')
  }
}

const enterRightPath = () => {
  if (Math.random() < 0.5) {
    gameStore.addLog('你掉进了陷阱！损失了一些体力。', 'error')
    gameStore.updateProgress(-5)
  } else {
    gameStore.addLog('小心翼翼穿过黑暗通道，你找到了一条通往神庙的密道!', 'success')
    gameStore.updateProgress(15)
  }
}

const fightGuard = () => {
  if (hasItem('火把')) {
    gameStore.addLog('你用火把吓退了守卫，顺利进入神庙!', 'success')
    gameStore.updateProgress(15)
  } else {
    gameStore.addLog('守卫太强大，你被击败了...', 'error')
    gameStore.updateProgress(-10)
  }
}

const sneakPastGuard = () => {
  if (Math.random() < 0.6) {
    gameStore.addLog('你成功绕过守卫，悄悄进入了神庙!', 'success')
    gameStore.updateProgress(10)
  } else {
    gameStore.addLog('潜行失败，被守卫发现!', 'error')
    gameStore.updateProgress(-5)
  }
}

const openTreasureBox = () => {
  // 统一调用 store 的开箱逻辑，确保胜利条件一致
  gameStore.openTreasureBox()
}

const searchRoom = () => {
  if (Math.random() < 0.3) {
    gameStore.addToInventory('神秘钥匙')
    gameStore.addLog('你在房间角落发现了一把神秘的钥匙!', 'success')
  } else {
    gameStore.addLog('你搜索了整个房间，但没有找到有用的东西。', 'info')
  }
}

const buySupplies = () => {
  gameStore.addLog('你在集市购买了一些食物和药品，体力恢复了。', 'info')
  gameStore.updateProgress(5)
}

const askElder = () => {
  gameStore.addLog('长老告诉你："真正的勇气不在于战胜敌人，而在于战胜自己。"', 'info')
  gameStore.updateProgress(5)
}

const buildRaft = () => {
  gameStore.addToInventory('木筏')
  gameStore.addLog('你制作了简易木筏，顺利过河。', 'success')
  gameStore.updateProgress(10)
}

const findFord = () => {
  gameStore.addLog('你找到了浅滩，安全过河。', 'success')
  gameStore.updateProgress(5)
}
</script>

<style scoped>
.location-modal {
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

.location-content {
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

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
  gap: 1em;
}

.location-header h2 {
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

.location-description {
  font-size: 1.15em;
  line-height: 1.7;
  margin-bottom: 1.5em;
  color: #4B3F1D;
}

.location-actions {
  display: flex;
  gap: 1.2em;
  flex-wrap: wrap;
  margin-bottom: 2em;
}

.inventory-hint {
  background: rgba(255, 248, 220, 0.8);
  padding: 1em;
  border-radius: 16px;
  border: 2px solid #FFD700;
}

.inventory-hint h4 {
  margin: 0 0 0.5em 0;
  color: #8B4513;
  font-size: 1.1em;
}

.inventory-items {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}

.item-tag {
  background: linear-gradient(135deg, #FFD700 60%, #FFB347 100%);
  padding: 0.5em 1em;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: bold;
  color: #4B3F1D;
  border: 2px solid #FF9800;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .location-modal {
    padding: 1em;
  }
  
  .location-content {
    padding: 1.5em 1em;
  }
  
  .location-header {
    flex-direction: column;
    text-align: center;
  }
  
  .location-header h2 {
    font-size: 1.8em;
  }
  
  .location-actions {
    justify-content: center;
  }
  
  .location-actions button {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .location-actions {
    flex-direction: column;
  }
  
  .location-actions button {
    width: 100%;
  }
}
</style>