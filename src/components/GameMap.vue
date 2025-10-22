<template>
  <div class="game-map">
    <!-- 地图标题 -->
    <div class="map-title">神秘大陆探险地图</div>
    
    <!-- 地图容器 -->
    <div class="map-container">
      <!-- 地图背景 -->
      <div class="map-background"></div>
      
      <!-- 地形元素 -->
      <div class="terrain">
        <!-- 山脉 -->
        <div class="mountains">
          <div class="mountain-peak" style="left: 15%; top: 20%;"></div>
          <div class="mountain-peak" style="left: 35%; top: 10%;"></div>
          <div class="mountain-peak" style="left: 55%; top: 25%;"></div>
          <div class="mountain-peak" style="left: 75%; top: 15%;"></div>
        </div>
        
        <!-- 森林 -->
        <div class="forest">
          <div class="tree" style="left: 10%; top: 30%;"></div>
          <div class="tree" style="left: 25%; top: 50%;"></div>
          <div class="tree" style="left: 40%; top: 20%;"></div>
          <div class="tree" style="left: 60%; top: 45%;"></div>
          <div class="tree" style="left: 80%; top: 35%;"></div>
        </div>
        
        <!-- 河流路径 -->
        <div class="river-path">
          <div class="river-wave" style="left: 20%;"></div>
          <div class="river-wave" style="left: 40%;"></div>
          <div class="river-wave" style="left: 60%;"></div>
          <div class="river-wave" style="left: 80%;"></div>
        </div>
        
        <!-- 云朵 -->
        <div class="clouds">
          <div class="cloud" style="left: 20%; top: 15%;"></div>
          <div class="cloud" style="left: 70%; top: 25%;"></div>
          <div class="cloud" style="left: 45%; top: 10%;"></div>
        </div>
      </div>
      
      <!-- 全景地形图区域 -->
      <div class="terrain-map-area">
        <!-- 地形背景层 -->
        <div class="terrain-background">
          <!-- 山脉区域 -->
          <div class="mountain-range" style="top: 10%; left: 15%; width: 30%; height: 25%;"></div>
          <div class="mountain-range" style="top: 20%; left: 60%; width: 25%; height: 20%;"></div>
          
          <!-- 森林区域 -->
          <div class="forest-area" style="top: 40%; left: 10%; width: 35%; height: 30%;"></div>
          <div class="forest-area" style="top: 50%; left: 70%; width: 25%; height: 25%;"></div>
          

          
          <!-- 湖泊 -->
          <div class="lake" style="top: 65%; left: 45%; width: 15%; height: 12%;"></div>
          
          <!-- 沙漠区域 -->
          <div class="desert-area" style="top: 75%; left: 70%; width: 25%; height: 20%;"></div>
          
          <!-- 海岸线 -->
          <div class="coastline" style="bottom: 0; left: 0; width: 100%; height: 8%;"></div>
          

        </div>
        
        <!-- 地点标记 -->
        <div 
          v-for="(location, id) in locations" 
          :key="id"
          class="location-marker"
          :class="[`${id}-marker`]"
          :style="{ 
            top: location.position.top, 
            left: location.position.left,
            display: 'block !important',
            visibility: 'visible !important',
            opacity: '1 !important',
            pointerEvents: 'auto !important',
            zIndex: '100 !important'
          }"
          @mouseenter="showLocationOptions(id)"
          @mouseleave="hideLocationOptions"
          @click.prevent="handleLocationClick(id)"
        >
          <div class="marker-icon" @click.stop.prevent="handleLocationClick(id)">{{ location.icon }}</div>
          <div class="marker-label" @click.stop.prevent="handleLocationClick(id)">{{ location.name }}</div>
          
          <!-- 悬停选项菜单 -->
          <div 
            v-if="hoveredLocation === id" 
            class="location-options"
          >
            <div class="options-title">{{ location.name }}</div>
            <div class="options-list">
              <button 
                class="option-btn main-btn"
                @click.stop="openLocation(id)"
              >
                🏛️ 进入地点
              </button>
              <button 
                class="option-btn explore-btn"
                @click.stop="exploreLocation(id)"
              >
                🔍 探索
              </button>
              <button 
                class="option-btn search-btn"
                @click.stop="searchLocation(id)"
              >
                🔎 搜寻宝藏
              </button>
              <button 
                v-if="location.canRest"
                class="option-btn rest-btn"
                @click.stop="restAtLocation(id)"
              >
                😴 休息
              </button>
              <button 
                v-if="location.hasShop"
                class="option-btn shop-btn"
                @click.stop="visitShop(id)"
              >
                🛒 商店
              </button>
            </div>
          </div>
        </div>
      </div>
      

      
      <!-- 玩家移动轨迹 -->
      <div class="player-trail">
        <div 
          v-for="(point, index) in playerTrail" 
          :key="`trail-${index}`"
          class="trail-point"
          :class="{ 'trail-fade': index < playerTrail.length - 5 }"
          :style="{
            top: point.top,
            left: point.left,
            opacity: Math.max(0.2, (index + 1) / playerTrail.length)
          }"
        ></div>
      </div>
      
      <!-- 玩家位置 -->
      <div 
        class="player"
        :style="{
          top: playerPosition.top,
          left: playerPosition.left
        }"
      ></div>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercent }"></div>
      </div>
      <div class="progress-text">探险进度: {{ progressPercent }}</div>
    </div>
  </div>
  
  <!-- 选择对话框 -->
  <ChoiceDialog
    :visible="activeChoiceDialog.visible"
    :title="activeChoiceDialog.title"
    :message="activeChoiceDialog.message"
    :choices="activeChoiceDialog.choices"
    @choice-selected="onChoiceSelected"
    @close="onChoiceClose"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import ChoiceDialog from './ChoiceDialog.vue'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

// 响应式数据
const hoveredLocation = ref(null)
const choiceDialog = ref({
  visible: false,
  title: '',
  message: '',
  choices: [],
  currentAction: null,
  currentLocationId: null,
  flowStep: 0
})

// 计算属性
const locations = computed(() => gameStore.locations)
const progressPercent = computed(() => gameStore.progressPercent)
const currentLocation = computed(() => gameStore.currentLocation)
const playerTrail = computed(() => gameStore.playerTrail)
const activeChoiceDialog = computed(() => (
  gameStore.choiceDialog.visible ? gameStore.choiceDialog : choiceDialog.value
))

// 玩家位置计算
const playerPosition = computed(() => {
  const location = gameStore.locations[gameStore.currentLocation]
  if (location && location.position) {
    return {
      top: location.position.top,
      left: location.position.left
    }
  }
  return { top: '50%', left: '50%' }
})

// 悬停相关方法
const showLocationOptions = (locationId) => {
  hoveredLocation.value = locationId
}

const hideLocationOptions = () => {
  hoveredLocation.value = null
}

// 地点交互方法
const exploreLocation = (locationId) => {
  const location = gameStore.locations[locationId]
  
  // 显示选择对话框
  choiceDialog.value = {
    visible: true,
    title: `探索${location.name}`,
    message: `你来到了${location.name}，你想要如何探索这个地方？`,
    choices: [
      { label: "仔细搜索周围", value: "search" },
      { label: "快速浏览一遍", value: "quick" },
      { label: "谨慎前进", value: "careful" }
    ],
    currentAction: 'explore',
    currentLocationId: locationId
  }
  
  hideLocationOptions()
}

// 选择对话框处理方法
const handleChoiceSelected = (choiceValue) => {
  const { currentAction, currentLocationId, flowStep } = choiceDialog.value
  const location = gameStore.locations[currentLocationId]
  
  // 仅在第一步移动到地点并添加轨迹
  if (!flowStep || flowStep === 1) {
    gameStore.moveToLocation(currentLocationId)
    gameStore.addPlayerTrailPoint(currentLocationId)
  }
  
  let keepOpen = false
  
  // 根据动作类型和选择值执行不同逻辑
  switch (currentAction) {
    case 'enter':
      // 顶层选择：根据玩家选择进入对应的二级操作
      if (choiceValue === 'explore') {
        exploreLocation(currentLocationId)
        return
      }
      if (choiceValue === 'search') {
        searchLocation(currentLocationId)
        return
      }
      if (choiceValue === 'rest') {
        restAtLocation(currentLocationId)
        return
      }
      if (choiceValue === 'shop') {
        visitShop(currentLocationId)
        return
      }
      break
    case 'river':
      keepOpen = !!handleRiverChoice(choiceValue, location)
      break
    case 'village':
      keepOpen = !!handleVillageChoice(choiceValue, location)
      break
    case 'cave':
      keepOpen = !!handleCaveChoice(choiceValue, location)
      break
    case 'explore':
      handleExploreChoice(choiceValue, location)
      break
    case 'search':
      handleSearchChoice(choiceValue, location)
      break
    case 'rest':
      handleRestChoice(choiceValue, location)
      break
    case 'shop':
      handleShopChoice(choiceValue, location)
      break
    case 'temple':
      keepOpen = !!handleTempleChoice(choiceValue, location)
      break
    case 'waterfall':
      keepOpen = !!handleWaterfallChoice(choiceValue, location)
      break
    case 'mountain':
      keepOpen = !!handleMountainChoice(choiceValue, location)
      break
    case 'beach':
      keepOpen = !!handleBeachChoice(choiceValue, location)
      break
    case 'forest':
      keepOpen = !!handleForestChoice(choiceValue, location)
      break
    case 'library':
      keepOpen = !!handleLibraryChoice(choiceValue, location)
      break
    case 'treasure':
      keepOpen = !!handleTreasureChoice(choiceValue, location)
      break
  }
  
  if (!keepOpen) {
    closeChoiceDialog()
  }
}

const closeChoiceDialog = () => {
  choiceDialog.value.visible = false
}

// 统一选择与关闭事件的分发至 store 或本地逻辑
const onChoiceSelected = (choiceValue) => {
  if (gameStore.choiceDialog.visible) {
    gameStore.handleChoiceSelected(choiceValue)
  } else {
    handleChoiceSelected(choiceValue)
  }
}
const onChoiceClose = () => {
  if (gameStore.choiceDialog.visible) {
    gameStore.closeChoiceDialog()
  } else {
    closeChoiceDialog()
  }
}

// 打开下一步的链式选择对话框
const openNextStep = (title, message, choices, actionKey) => {
  const prev = choiceDialog.value
  choiceDialog.value = {
    visible: true,
    title,
    message,
    choices,
    currentAction: actionKey,
    currentLocationId: prev.currentLocationId,
    flowStep: (prev.flowStep || 1) + 1
  }
}

// 探索选择处理
const handleExploreChoice = (choice, location) => {
  switch (choice) {
    case 'search':
      if (Math.random() < 0.6) {
        const items = ['古老地图', '神秘符文', '历史文物', '魔法水晶']
        const foundItem = items[Math.floor(Math.random() * items.length)]
        gameStore.addToInventory(foundItem)
        gameStore.addLog(`🔍 仔细搜索后，你在${location.name}发现了${foundItem}！`, 'success')
        gameStore.updateProgress(15)
      } else {
        gameStore.addLog(`🔍 你仔细搜索了${location.name}，但没有发现特别的东西`, 'info')
        gameStore.updateProgress(5)
      }
      break
    case 'quick':
      gameStore.addLog(`⚡ 你快速浏览了${location.name}，获得了基本信息`, 'info')
      gameStore.updateProgress(8)
      if (Math.random() < 0.3) {
        gameStore.addLog(`⚠️ 匆忙中你错过了一些重要线索`, 'warning')
      }
      break
    case 'careful':
      gameStore.addLog(`🛡️ 你谨慎地探索了${location.name}，避免了潜在危险`, 'info')
      gameStore.updateProgress(10)
      if (Math.random() < 0.4) {
        gameStore.addLog(`✨ 谨慎的态度让你发现了隐藏的秘密通道`, 'success')
        gameStore.updateProgress(5)
      }
      break
  }
}

// 搜寻选择处理
const handleSearchChoice = (choice, location) => {
  let successRate = 0.4
  let treasures = ['金币', '宝石', '古董', '魔法道具', '稀有矿石']
  
  switch (choice) {
    case 'dig':
      successRate = 0.5
      treasures = ['埋藏的金币', '古老的宝箱', '神秘的骨头', '地下水晶']
      gameStore.addLog(`⛏️ 你开始在${location.name}挖掘...`, 'info')
      break
    case 'hidden':
      successRate = 0.6
      treasures = ['隐藏的宝石', '秘密文件', '魔法卷轴', '珍贵药草']
      gameStore.addLog(`🔦 你搜索${location.name}的隐蔽角落...`, 'info')
      break
    case 'detect':
      successRate = 0.7
      treasures = ['探测到的宝藏', '能量水晶', '魔法装备', '远古遗物']
      gameStore.addLog(`📡 你使用探测工具扫描${location.name}...`, 'info')
      break
  }
  
  if (Math.random() < successRate) {
    const foundTreasure = treasures[Math.floor(Math.random() * treasures.length)]
    gameStore.addToInventory(foundTreasure)
    gameStore.addLog(`🎉 在${location.name}发现了${foundTreasure}！`, 'success')
    gameStore.triggerEffect('lightning')
    gameStore.updateProgress(20)
    
    // 如果在宝藏密室找到宝物，判定胜利并结束游戏
    const locId = choiceDialog.value.currentLocationId
    if (locId === 'treasure') {
      // 改为调用 store 的宝箱开启逻辑，避免本地直接终局
      gameStore.openTreasureBox()
    }
  } else {
    // 未找到宝藏，有小概率触发失败终局
    const locId = choiceDialog.value.currentLocationId
    const failChance = choice === 'dig' ? 0.1 : choice === 'hidden' ? 0.05 : 0.03
    if (Math.random() < failChance) {
      gameStore.triggerEffect('lightning')
      gameStore.addLog('💥 你触发了危险的陷阱，但设法逃脱。', 'warning')
      gameStore.updateProgress(-10)
      // 不再直接结束游戏，继续探索由玩家决定
    } else {
      gameStore.addLog(`😞 在${location.name}没有找到宝藏`, 'warning')
      gameStore.updateProgress(5)
    }
  }
}

// 休息选择处理
const handleRestChoice = (choice, location) => {
  switch (choice) {
    case 'short':
      gameStore.addLog(`😌 你在${location.name}短暂休息，恢复了一些体力`, 'info')
      gameStore.updateProgress(5)
      break
    case 'long':
      gameStore.addLog(`😴 你在${location.name}充分休息，完全恢复了体力`, 'success')
      gameStore.updateProgress(10)
      if (Math.random() < 0.3) {
        gameStore.addLog(`💭 休息时你想起了一些重要线索`, 'info')
        gameStore.updateProgress(5)
      }
      break
    case 'meditate':
      gameStore.addLog(`🧘 你在${location.name}冥想，获得了内心的平静`, 'success')
      gameStore.updateProgress(12)
      if (Math.random() < 0.4) {
        const insights = ['直觉增强', '感知提升', '智慧启发', '心灵净化']
        const insight = insights[Math.floor(Math.random() * insights.length)]
        gameStore.addLog(`✨ 冥想中你获得了${insight}`, 'success')
        gameStore.updateProgress(8)
      }
      break
  }
}

// 商店选择处理
const handleShopChoice = (choice, location) => {
  switch (choice) {
    case 'buy':
      const items = ['治疗药水', '探险工具', '魔法护符', '食物补给']
      const item = items[Math.floor(Math.random() * items.length)]
      gameStore.addToInventory(item)
      gameStore.addLog(`🛒 你在${location.name}购买了${item}`, 'success')
      gameStore.updateProgress(8)
      break
    case 'sell':
      if (gameStore.inventory.length > 0) {
        const soldItem = gameStore.inventory[Math.floor(Math.random() * gameStore.inventory.length)]
        gameStore.addLog(`💰 你在${location.name}出售了${soldItem}，获得了金币`, 'success')
        gameStore.updateProgress(10)
      } else {
        gameStore.addLog(`🤷 你没有可以出售的物品`, 'warning')
        gameStore.updateProgress(2)
      }
      break
    case 'info':
      const infos = ['宝藏位置的线索', '危险区域的警告', '隐藏通道的秘密', '古老传说的故事']
      const info = infos[Math.floor(Math.random() * infos.length)]
      gameStore.addLog(`💬 商人告诉你关于${info}`, 'info')
      gameStore.updateProgress(12)
      break
  }
}

// 地点选择处理（按treasureTest.html剧情）
const handleRiverChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  
  if (step === 1) {
    switch (choice) {
      case 'ford':
        if (Math.random() < 0.4) {
          gameStore.triggerEffect('lightning')
          gameStore.addLog('⚡ 河水突然暴涨，你被冲走了！', 'error')
          gameStore.updateProgress(-15)
          // 不直接结束游戏，允许玩家继续从其他路线尝试
          return false
        } else {
          gameStore.addLog('🌊 你找到了浅滩，顺利涉水过河', 'success')
          gameStore.updateProgress(12)
          openNextStep(
            '过河后行动',
            `你已到达对岸(${location.name})，下一步选择：`,
            [
              { label: '沿岸探索', value: 'river_explore_shore' },
              { label: '前往村庄', value: 'river_go_village' },
              { label: '在河边休息', value: 'river_rest' }
            ],
            'river'
          )
          return true
        }
      case 'raft':
        gameStore.addToInventory('木筏')
        gameStore.addLog('🛶 你制作了一只简易木筏并安全渡河', 'success')
        gameStore.updateProgress(15)
        openNextStep(
          '过河后行动',
          '你顺利登岸，决定接下来怎么做：',
          [
            { label: '沿岸探索', value: 'river_explore_shore' },
            { label: '前往村庄', value: 'river_go_village' },
            { label: '在河边休息', value: 'river_rest' }
          ],
          'river'
        )
        return true
      case 'detour':
        gameStore.addLog('🗺️ 你选择绕道，虽然安全但花费时间', 'info')
        gameStore.updateProgress(-5)
        openNextStep(
          '遇到分岔路',
          '你来到岔路口，选择你的方向：',
          [
            { label: '去瀑布', value: 'river_to_waterfall' },
            { label: '去村庄', value: 'river_go_village' },
            { label: '返回原路', value: 'river_back' }
          ],
          'river'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'river_explore_shore':
        gameStore.addLog('🏖️ 你沿岸探索，发现了奇特的石头与贝壳', 'success')
        gameStore.addToInventory('奇特石头')
        gameStore.updateProgress(10)
        return false
      case 'river_go_village':
        openLocation('village')
        return true
      case 'river_rest':
        gameStore.addLog('😴 你在河边短暂休息，恢复体力', 'info')
        gameStore.updateProgress(6)
        return false
      case 'river_to_waterfall':
        openLocation('waterfall')
        return true
      case 'river_back':
        gameStore.addLog('↩️ 你决定返回，暂时不冒险', 'info')
        gameStore.updateProgress(2)
        return false
    }
  }
  return false
}

const handleVillageChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  
  if (step === 1) {
    switch (choice) {
      case 'ask':
        if (Math.random() < 0.7) {
          gameStore.addToInventory('神庙地图')
          gameStore.addLog('🗺️ 村民告诉你线索，并赠予“神庙地图”', 'success')
          gameStore.updateProgress(10)
        } else {
          gameStore.addLog('🍞 村民给了你些食物，但没有更多线索', 'info')
          gameStore.updateProgress(6)
        }
        openNextStep(
          '继续在村庄的行动',
          '你可以继续做以下事情：',
          [
            { label: '购买补给', value: 'village_buy' },
            { label: '参加祭坛仪式', value: 'village_ritual' },
            { label: '前往洞穴', value: 'village_go_cave' }
          ],
          'village'
        )
        return true
      case 'rest':
        gameStore.addLog('😴 你在村庄好好休整，恢复体力', 'success')
        gameStore.updateProgress(8)
        openNextStep(
          '休整后下一步',
          '精神恢复，你准备继续：',
          [
            { label: '继续打听', value: 'village_continue_ask' },
            { label: '前往山峰', value: 'village_go_mountain' },
            { label: '离开村庄', value: 'village_leave' }
          ],
          'village'
        )
        return true
      case 'leave':
        openNextStep(
          '村外岔路',
          '你走出村庄，来到岔路口：',
          [
            { label: '前往河流', value: 'village_to_river' },
            { label: '前往瀑布', value: 'village_to_waterfall' },
            { label: '返回森林', value: 'village_to_forest' }
          ],
          'village'
        )
        gameStore.updateProgress(4)
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'village_buy':
        gameStore.addToInventory('旅行补给')
        gameStore.addLog('🛍️ 你购买了旅行补给，状态更佳', 'success')
        gameStore.updateProgress(5)
        return false
      case 'village_ritual':
        gameStore.triggerEffect('sparkle')
        gameStore.addLog('✨ 你参加了祭坛仪式，获得神秘祝福', 'success')
        gameStore.updateProgress(10)
        return false
      case 'village_go_cave':
        openLocation('cave')
        return true
      case 'village_continue_ask':
        gameStore.addLog('🗣️ 你继续打听，获得关于神庙的更多线索', 'info')
        gameStore.updateProgress(6)
        return false
      case 'village_go_mountain':
        openLocation('mountain')
        return true
      case 'village_leave':
        gameStore.addLog('👣 你离开了村庄，准备继续冒险', 'info')
        return false
      case 'village_to_river':
        openLocation('river')
        return true
      case 'village_to_waterfall':
        openLocation('waterfall')
        return true
      case 'village_to_forest':
        openLocation('forest')
        return true
    }
  }
  return false
}

const handleCaveChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  
  if (step === 1) {
    switch (choice) {
      case 'left':
        gameStore.addToInventory('火把')
        gameStore.triggerEffect('fire')
        gameStore.addLog('🔥 在光亮处找到一支火把，照亮前路', 'success')
        gameStore.updateProgress(10)
        openNextStep(
          '洞内行动',
          '火把在手，你准备：',
          [
            { label: '深入洞穴', value: 'cave_deeper' },
            { label: '返回村庄', value: 'cave_back_village' },
            { label: '观察壁画', value: 'cave_wall' }
          ],
          'cave'
        )
        return true
      case 'right':
        if (Math.random() < 0.5) {
          gameStore.triggerEffect('lightning')
          gameStore.addLog('💥 你掉进陷阱，但成功脱困。', 'warning')
          gameStore.updateProgress(-20)
          return false
        } else {
          gameStore.addLog('🕳️ 你穿过狭窄通道，找到通往神庙的密道', 'success')
          gameStore.updateProgress(15)
          openNextStep(
            '密道选择',
            '是否进入密道？',
            [
              { label: '直接前往神庙', value: 'cave_to_temple' },
              { label: '返回洞穴口', value: 'cave_back' }
            ],
            'cave'
          )
          return true
        }
      case 'entrance':
        const hasBook = Array.isArray(gameStore.inventory) && gameStore.inventory.some && gameStore.inventory.some(item => item.name === '古书')
        if (hasBook) {
          gameStore.addToInventory('神秘钥匙')
          gameStore.triggerEffect('sparkle')
          gameStore.addLog('🔑 你在洞穴入口找到一把神秘的钥匙！', 'success')
          gameStore.updateProgress(12)
          openNextStep(
            '入口后续',
            '你打算如何使用钥匙？',
            [
              { label: '使用钥匙', value: 'cave_use_key' },
              { label: '查询壁画', value: 'cave_wall' },
              { label: '返回', value: 'cave_back' }
            ],
            'cave'
          )
          return true
        } else {
          gameStore.addLog('🖼️ 洞穴入口有古老壁画，但暂时没有收获', 'info')
          gameStore.updateProgress(6)
          openNextStep(
            '壁画线索',
            '你可以：',
            [
              { label: '记下符号', value: 'cave_mark' },
              { label: '返回洞穴', value: 'cave_back' }
            ],
            'cave'
          )
          return true
        }
    }
  } else if (step === 2) {
    switch (choice) {
      case 'cave_deeper':
        gameStore.addLog('🕯️ 你深入洞穴，发现新的通道', 'info')
        gameStore.updateProgress(12)
        return false
      case 'cave_back_village':
        openLocation('village')
        return true
      case 'cave_wall':
        gameStore.addLog('📜 你观察壁画，记录了一些重要符号', 'info')
        gameStore.updateProgress(6)
        return false
      case 'cave_to_temple':
        openLocation('temple')
        return true
      case 'cave_back':
        gameStore.addLog('↩️ 你决定暂时撤退', 'info')
        return false
      case 'cave_use_key':
        gameStore.addLog('🔓 你使用钥匙打开了一扇隐藏的石门', 'success')
        gameStore.updateProgress(18)
        openLocation('temple')
        return true
      case 'cave_mark':
        gameStore.addLog('✍️ 你记下了壁画符号，或许稍后会有用', 'info')
        gameStore.updateProgress(5)
        return false
    }
  }
  return false
}

const handleTempleChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  
  if (step === 1) {
    switch (choice) {
      case 'fight':
        if (Array.isArray(gameStore.inventory) && gameStore.inventory.some && gameStore.inventory.some(i => i.name === '火把') && Math.random() > 0.4) {
          gameStore.triggerEffect('fire')
          gameStore.addLog('你用火把吓退了守卫，顺利进入神庙!', 'success')
          gameStore.updateProgress(15)
          openNextStep(
            '内殿行动',
            '你进入内殿，下一步：',
            [
              { label: '解谜机关', value: 'temple_puzzle' },
              { label: '供奉祭坛', value: 'temple_offering' },
              { label: '搜索内殿', value: 'temple_search' }
            ],
            'temple'
          )
          return true
        } else {
          gameStore.addLog('守卫太强大，你被击退，暂避锋芒。', 'warning')
          gameStore.updateProgress(-15)
          return false
        }
      case 'sneak':
        if (Math.random() < 0.6) {
          gameStore.addLog('你成功绕过守卫，悄悄进入了神庙!', 'success')
          gameStore.updateProgress(12)
          openNextStep(
            '内殿行动',
            '你进入内殿，下一步：',
            [
              { label: '解谜机关', value: 'temple_puzzle' },
              { label: '供奉祭坛', value: 'temple_offering' },
              { label: '搜索内殿', value: 'temple_search' }
            ],
            'temple'
          )
          return true
        } else {
          gameStore.addLog('潜行失败，被守卫发现！你撤退重整。', 'warning')
          gameStore.updateProgress(-10)
          return false
        }
      case 'bribe':
        if (Array.isArray(gameStore.inventory) && gameStore.inventory.some && gameStore.inventory.some(i => i.name === '古书')) {
          gameStore.addLog('你展示古书，守卫认出你是被选中的人，让你进入神庙!', 'success')
          gameStore.updateProgress(15)
          openNextStep(
            '内殿行动',
            '你进入内殿，下一步：',
            [
              { label: '解谜机关', value: 'temple_puzzle' },
              { label: '供奉祭坛', value: 'temple_offering' },
              { label: '搜索内殿', value: 'temple_search' }
            ],
            'temple'
          )
          return true
        } else {
          gameStore.addLog('你没有足够贵重的东西贿赂守卫!', 'error')
          gameStore.updateProgress(-8)
          return false
        }
    }
  } else if (step === 2) {
    switch (choice) {
      case 'temple_puzzle':
        if (Math.random() < 0.7) {
          gameStore.triggerEffect('sparkle')
          gameStore.addLog('🧩 你解开了神庙机关，密室开启！', 'success')
          gameStore.updateProgress(30)
          openLocation('treasure')
          return true
        } else {
          gameStore.addLog('❌ 机关太复杂，你暂时无法破解', 'warning')
          gameStore.updateProgress(5)
          return false
        }
      case 'temple_offering':
        gameStore.addLog('🙏 你进行供奉，获得神秘祝福', 'info')
        gameStore.updateProgress(12)
        return false
      case 'temple_search':
        gameStore.addLog('🔎 你搜索内殿，发现了通向密室的暗门', 'success')
        gameStore.updateProgress(20)
        openLocation('treasure')
        return true
    }
  }
  return false
}

const handleWaterfallChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  
  if (step === 1) {
    switch (choice) {
      case 'swimBehind':
        if (Math.random() < 0.5) {
          gameStore.addLog('你成功游到瀑布后，发现了隐蔽的入口!', 'success')
          gameStore.updateProgress(12)
          openNextStep(
            '隐藏入口',
            '你要如何探索隐藏入口？',
            [
              { label: '探查洞穴', value: 'waterfall_cave' },
              { label: '标记路线', value: 'waterfall_mark' },
              { label: '返回', value: 'waterfall_back' }
            ],
            'waterfall'
          )
          return true
        } else {
          gameStore.addLog('水流太急，你被迫返回岸边', 'warning')
          gameStore.updateProgress(4)
          return false
        }
      case 'searchPool':
        if (Math.random() < 0.7) {
          gameStore.addToInventory('闪亮的水晶')
          gameStore.triggerEffect('sparkle')
          gameStore.addLog('你在水潭中找到了闪亮的水晶!', 'success')
          gameStore.updateProgress(14)
          openNextStep(
            '水潭后续',
            '继续在水潭进行：',
            [
              { label: '继续搜寻', value: 'waterfall_more_search' },
              { label: '用水晶尝试召唤', value: 'waterfall_crystal' },
              { label: '返回', value: 'waterfall_back' }
            ],
            'waterfall'
          )
          return true
        } else {
          gameStore.addLog('你在水潭中没有找到有用的东西', 'info')
          gameStore.updateProgress(5)
          return false
        }
      case 'followRiver':
        gameStore.addLog('你沿河而下，发现了一个小型入口通向丛林', 'info')
        gameStore.updateProgress(10)
        openNextStep(
          '沿河而下',
          '你来到丛林边缘，下一步：',
          [
            { label: '进入森林', value: 'waterfall_to_forest' },
            { label: '搭建临时营地', value: 'waterfall_camp' },
            { label: '继续前进', value: 'waterfall_go_on' }
          ],
          'waterfall'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'waterfall_cave':
        openLocation('cave')
        return true
      case 'waterfall_mark':
        gameStore.addLog('📍 你用石头标记了路径', 'info')
        gameStore.updateProgress(5)
        return false
      case 'waterfall_back':
        gameStore.addLog('↩️ 你返回到瀑布前的安全地带', 'info')
        return false
      case 'waterfall_more_search':
        gameStore.addLog('🔍 你继续在水潭搜寻，发现了奇怪涟漪', 'info')
        gameStore.updateProgress(6)
        return false
      case 'waterfall_crystal':
        gameStore.addLog('🔮 你尝试用水晶召唤，水面短暂发光', 'info')
        gameStore.updateProgress(8)
        return false
      case 'waterfall_to_forest':
        openLocation('forest')
        return true
      case 'waterfall_camp':
        gameStore.addLog('⛺ 你搭建了临时营地，稍作休息', 'info')
        gameStore.updateProgress(7)
        return false
      case 'waterfall_go_on':
        gameStore.addLog('🚶 你决定继续前进，沿着河道探索', 'info')
        gameStore.updateProgress(9)
        return false
    }
  }
  return false
}

const handleMountainChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  
  if (step === 1) {
    switch (choice) {
      case 'climbPeak':
        if (Math.random() < 0.5) {
          gameStore.addLog('你登上山顶，俯瞰全岛，获得重要视野!', 'success')
          gameStore.updateProgress(15)
          openNextStep(
            '山顶行动',
            '你在山顶准备：',
            [
              { label: '观察地形', value: 'mountain_observe' },
              { label: '插上旗帜', value: 'mountain_flag' },
              { label: '沿山脊前行', value: 'mountain_ridge' }
            ],
            'mountain'
          )
          return true
        } else {
          gameStore.triggerEffect('shake')
          gameStore.addLog('风太大，你差点滑落，只好原路返回', 'warning')
          gameStore.updateProgress(3)
          return false
        }
      case 'searchCliff':
        if (Math.random() < 0.6) {
          gameStore.addToInventory('老鹰羽毛')
          gameStore.addLog('你在峭壁附近发现了老鹰的巢穴与羽毛', 'success')
          gameStore.updateProgress(12)
          openNextStep(
            '峭壁后续',
            '你在峭壁附近准备：',
            [
              { label: '下到洞穴', value: 'mountain_to_cave' },
              { label: '收集羽毛', value: 'mountain_collect' },
              { label: '返回', value: 'mountain_back' }
            ],
            'mountain'
          )
          return true
        } else {
          gameStore.addLog('峭壁危险重重，暂时没有收获', 'info')
          gameStore.updateProgress(5)
          return false
        }
      case 'useTelescope':
        gameStore.addLog('你使用望远镜，远处神庙的入口清晰可见', 'info')
        if (Math.random() < 0.5) {
          gameStore.addToInventory('神庙线索')
          gameStore.addLog('你标记了通往神庙的安全路径', 'success')
          gameStore.updateProgress(10)
        } else {
          gameStore.updateProgress(6)
        }
        openNextStep(
          '望远镜后续',
          '根据视野，你可以：',
          [
            { label: '标记神庙路径', value: 'mountain_mark_temple' },
            { label: '侦查村庄', value: 'mountain_scout_village' },
            { label: '返回', value: 'mountain_back' }
          ],
          'mountain'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'mountain_observe':
        gameStore.addLog('🔭 你观察地形，确认了几条安全路线', 'info')
        gameStore.updateProgress(8)
        return false
      case 'mountain_flag':
        gameStore.addLog('🚩 你插上了旗帜，记录下坐标', 'info')
        gameStore.updateProgress(6)
        return false
      case 'mountain_ridge':
        gameStore.addLog('⛰️ 你沿山脊前行，见到新的景象', 'info')
        gameStore.updateProgress(10)
        return false
      case 'mountain_to_cave':
        openLocation('cave')
        return true
      case 'mountain_collect':
        gameStore.addLog('🪶 你收集了一些羽毛', 'info')
        gameStore.updateProgress(5)
        return false
      case 'mountain_back':
        gameStore.addLog('↩️ 你决定返回山脚', 'info')
        return false
      case 'mountain_mark_temple':
        gameStore.addLog('🗺️ 你标记了前往神庙的路径', 'success')
        gameStore.updateProgress(10)
        openLocation('temple')
        return true
      case 'mountain_scout_village':
        gameStore.addLog('🔎 你在望远镜中观察到村庄的活动', 'info')
        gameStore.updateProgress(6)
        openLocation('village')
        return true
    }
  }
  return false
}

const handleBeachChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  if (step === 1) {
    switch (choice) {
      case 'beach_explore':
        gameStore.addLog('🏖️ 你沿海探索，发现了奇特岩洞与潮汐线索', 'info')
        gameStore.updateProgress(10)
        openNextStep(
          '沿海后续',
          '接下来你要：',
          [
            { label: '观察潮汐', value: 'beach_tide' },
            { label: '前往村庄', value: 'beach_to_village' },
            { label: '返回', value: 'beach_back' }
          ],
          'beach'
        )
        return true
      case 'beach_shells':
        if (Math.random() < 0.5) {
          gameStore.addToInventory('贝壳')
          gameStore.addLog('🐚 你收集到漂亮的贝壳', 'success')
          if (Math.random() < 0.3) {
            gameStore.addToInventory('藏宝图碎片')
            gameStore.addLog('🧩 你在贝壳堆里发现了“藏宝图碎片”！', 'success')
          }
          gameStore.updateProgress(12)
        } else {
          gameStore.addLog('沙滩上暂时没有收获', 'info')
          gameStore.updateProgress(5)
        }
        openNextStep(
          '贝壳后续',
          '你可以：',
          [
            { label: '制作护符', value: 'beach_amulet' },
            { label: '卖给商人', value: 'beach_sell' },
            { label: '返回', value: 'beach_back' }
          ],
          'beach'
        )
        return true
      case 'beach_talk':
        gameStore.addLog('👴 渔夫分享了海流与潮汐的情报', 'info')
        gameStore.updateProgress(8)
        openNextStep(
          '渔夫建议',
          '下一步选择：',
          [
            { label: '乘小舟探河口', value: 'beach_boat_river' },
            { label: '购买鱼干', value: 'beach_buy_food' },
            { label: '返回', value: 'beach_back' }
          ],
          'beach'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'beach_tide':
        gameStore.addLog('🌊 你记录了潮汐变化，找到安全时机', 'info')
        gameStore.updateProgress(6)
        return false
      case 'beach_to_village':
        openLocation('village')
        return true
      case 'beach_back':
        gameStore.addLog('↩️ 你暂时离开沙滩', 'info')
        return false
      case 'beach_amulet':
        gameStore.addToInventory('护符')
        gameStore.addLog('🧿 你用贝壳制作了护符', 'success')
        gameStore.updateProgress(8)
        return false
      case 'beach_sell':
        gameStore.addLog('💰 你把贝壳卖给商人，获得金币', 'success')
        gameStore.addToInventory('金币')
        gameStore.updateProgress(8)
        return false
      case 'beach_boat_river':
        gameStore.addToInventory('木筏')
        gameStore.addLog('⛵ 渔夫借你小舟，你可以在河流处使用', 'info')
        openLocation('river')
        return true
      case 'beach_buy_food':
        gameStore.addToInventory('食物')
        gameStore.addLog('🍞 你购买了鱼干与食物补给', 'info')
        gameStore.updateProgress(5)
        return false
    }
  }
  return false
}

const handleForestChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  if (step === 1) {
    switch (choice) {
      case 'forest_climb':
        gameStore.addLog('🌲 你攀上树梢，视野开阔', 'info')
        gameStore.updateProgress(10)
        openNextStep(
          '树顶视野',
          '你准备：',
          [
            { label: '前往山峰', value: 'forest_to_mountain' },
            { label: '标记路线', value: 'forest_mark' },
            { label: '返回', value: 'forest_back' }
          ],
          'forest'
        )
        return true
      case 'forest_ruins':
        if (Math.random() < 0.6) {
          gameStore.addToInventory('神秘钥匙')
          gameStore.addLog('🏛️ 你在遗迹中找到“神秘钥匙”', 'success')
          gameStore.updateProgress(14)
        } else if (Math.random() < 0.2) {
          gameStore.triggerEffect('lightning')
          gameStore.addLog('💀 你触发了遗迹陷阱，受伤撤退', 'error')
          gameStore.updateProgress(-8)
          return false
        } else {
          gameStore.addLog('遗迹破败不堪，未有收获', 'info')
          gameStore.updateProgress(6)
        }
        openNextStep(
          '遗迹后续',
          '继续：',
          [
            { label: '前往神庙', value: 'forest_to_temple' },
            { label: '深入遗迹', value: 'forest_ruins_deeper' },
            { label: '返回', value: 'forest_back' }
          ],
          'forest'
        )
        return true
      case 'forest_gather':
        gameStore.addToInventory('药草')
        gameStore.addLog('🌿 你采集了药草', 'success')
        gameStore.updateProgress(10)
        openNextStep(
          '采集后续',
          '你可以：',
          [
            { label: '配制药剂', value: 'forest_make_potion' },
            { label: '返回村庄', value: 'forest_to_village' },
            { label: '返回', value: 'forest_back' }
          ],
          'forest'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'forest_to_mountain':
        openLocation('mountain')
        return true
      case 'forest_mark':
        gameStore.addLog('📍 你在树上刻下标记', 'info')
        gameStore.updateProgress(5)
        return false
      case 'forest_back':
        gameStore.addLog('↩️ 你从森林撤离', 'info')
        return false
      case 'forest_to_temple':
        openLocation('temple')
        return true
      case 'forest_ruins_deeper':
        gameStore.addLog('🕳️ 你深入遗迹，但暂未发现更多', 'info')
        gameStore.updateProgress(7)
        return false
      case 'forest_make_potion':
        gameStore.addToInventory('药剂')
        gameStore.addLog('🧪 你配制出回复药剂', 'success')
        gameStore.updateProgress(8)
        return false
      case 'forest_to_village':
        openLocation('village')
        return true
    }
  }
  return false
}

const handleLibraryChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  if (step === 1) {
    switch (choice) {
      case 'library_search':
        if (Math.random() < 0.6) {
          gameStore.addToInventory('古书')
          gameStore.addLog('📚 你在书架里找到一本古书', 'success')
          gameStore.updateProgress(12)
        } else {
          gameStore.addLog('书架上多为普通书籍', 'info')
          gameStore.updateProgress(6)
        }
        openNextStep(
          '书架后续',
          '你要：',
          [
            { label: '继续检索', value: 'library_search_more' },
            { label: '解读地图', value: 'library_decode_map' },
            { label: '返回', value: 'library_back' }
          ],
          'library'
        )
        return true
      case 'library_read':
        if ((gameStore.hasItem && gameStore.hasItem('古书')) || (gameStore.inventory && gameStore.inventory.includes('古书'))) {
          gameStore.addLog('📖 你研读古书，获得神庙线索', 'success')
          gameStore.addToInventory('神庙线索')
          gameStore.updateProgress(14)
          openNextStep(
            '研读后续',
            '你要：',
            [
              { label: '前往神庙', value: 'library_to_temple' },
              { label: '记录笔记', value: 'library_note' },
              { label: '返回', value: 'library_back' }
            ],
            'library'
          )
          return true
        } else {
          gameStore.addLog('你没有古书，无法研读', 'warning')
          return false
        }
      case 'library_decode':
        gameStore.addLog('🗺️ 你尝试解读古地图，标出关键路径', 'info')
        gameStore.updateProgress(10)
        openNextStep(
          '地图后续',
          '你要：',
          [
            { label: '前往神庙', value: 'library_to_temple' },
            { label: '分享给村民', value: 'library_share' },
            { label: '返回', value: 'library_back' }
          ],
          'library'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'library_search_more':
        gameStore.addLog('🔎 你继续检索，收集了更多参考资料', 'info')
        gameStore.updateProgress(6)
        return false
      case 'library_decode_map':
        gameStore.addLog('🧭 你解读出一条通往神庙的捷径', 'success')
        gameStore.updateProgress(10)
        return false
      case 'library_back':
        gameStore.addLog('↩️ 你离开图书馆的书架区域', 'info')
        return false
      case 'library_to_temple':
        openLocation('temple')
        return true
      case 'library_note':
        gameStore.addLog('📝 你记录下重要线索', 'info')
        gameStore.updateProgress(5)
        return false
      case 'library_share':
        gameStore.addLog('👥 你与村民分享线索，获得反馈', 'info')
        gameStore.updateProgress(7)
        openLocation('village')
        return true
    }
  }
  return false
}

const handleTreasureChoice = (choice, location) => {
  const step = choiceDialog.value.flowStep || 1
  if (step === 1) {
    switch (choice) {
      case 'treasure_check':
        gameStore.addLog('⚙️ 你仔细检查机关，判断可行方式', 'info')
        gameStore.updateProgress(10)
        openNextStep(
          '机关后续',
          '你要：',
          [
            { label: '使用钥匙', value: 'treasure_use_key' },
            { label: '尝试破解机关', value: 'treasure_puzzle' },
            { label: '返回', value: 'treasure_back' }
          ],
          'treasure'
        )
        return true
      case 'treasure_open':
        if ((gameStore.hasItem && gameStore.hasItem('神秘钥匙')) || (gameStore.inventory && gameStore.inventory.includes('神秘钥匙'))) {
          // 改为调用 store.openTreasureBox 统一胜利流程
          gameStore.openTreasureBox()
          return true
        } else {
          if (Math.random() < 0.4) {
            gameStore.triggerEffect('lightning')
            gameStore.addLog('⚠️ 你触发了陷阱，受到重伤但仍能脱身。', 'warning')
            gameStore.updateProgress(-20)
            return false
          } else {
            gameStore.addLog('🔒 宝箱被锁住，需要钥匙', 'warning')
            openNextStep(
              '开箱后续',
              '下一步：',
              [
                { label: '返回检查机关', value: 'treasure_check_again' },
                { label: '离开密室', value: 'treasure_back' }
              ],
              'treasure'
            )
            return true
          }
        }
      case 'treasure_calm':
        gameStore.addLog('🧘 你平稳呼吸，冷静下来', 'info')
        gameStore.updateProgress(5)
        openNextStep(
          '冷静后继续',
          '下一步：',
          [
            { label: '检查机关', value: 'treasure_check_again' },
            { label: '返回', value: 'treasure_back' }
          ],
          'treasure'
        )
        return true
    }
  } else if (step === 2) {
    switch (choice) {
      case 'treasure_use_key':
        if ((gameStore.hasItem && gameStore.hasItem('神秘钥匙')) || (gameStore.inventory && gameStore.inventory.includes('神秘钥匙'))) {
          // 统一调用 store 的宝箱开启逻辑
          gameStore.openTreasureBox()
          return true
        } else {
          gameStore.addLog('你没有钥匙，无法开启', 'warning')
          return false
        }
      case 'treasure_puzzle':
        if (Math.random() < 0.6) {
          gameStore.addLog('✅ 你成功破解机关，打开了宝箱！', 'success')
          gameStore.openTreasureBox()
          return true
        } else {
          gameStore.addLog('❌ 机关太复杂，你暂时无法破解', 'warning')
          gameStore.updateProgress(5)
          return false
        }
      case 'treasure_back':
        gameStore.addLog('↩️ 你暂时离开宝藏密室', 'info')
        return false
      case 'treasure_check_again':
        openNextStep(
          '机关后续',
          '你要：',
          [
            { label: '使用钥匙', value: 'treasure_use_key' },
            { label: '尝试破解机关', value: 'treasure_puzzle' },
            { label: '返回', value: 'treasure_back' }
          ],
          'treasure'
        )
        return true
    }
  }
  return false
}

const searchLocation = (locationId) => {
  const location = gameStore.locations[locationId]
  
  // 显示选择对话框
  choiceDialog.value = {
    visible: true,
    title: `搜寻${location.name}的宝藏`,
    message: `你决定在${location.name}搜寻宝藏，选择你的搜寻方式：`,
    choices: [
      { label: "挖掘地面", value: "dig" },
      { label: "搜索隐蔽处", value: "hidden" },
      { label: "使用探测工具", value: "detect" }
    ],
    currentAction: 'search',
    currentLocationId: locationId
  }
  
  hideLocationOptions()
}

const restAtLocation = (locationId) => {
  const location = gameStore.locations[locationId]
  
  // 显示选择对话框
  choiceDialog.value = {
    visible: true,
    title: `在${location.name}休息`,
    message: `你感到有些疲惫，想要在${location.name}休息一下：`,
    choices: [
      { label: "短暂休息", value: "short" },
      { label: "充分休息", value: "long" },
      { label: "冥想恢复", value: "meditate" }
    ],
    currentAction: 'rest',
    currentLocationId: locationId
  }
  
  hideLocationOptions()
}

const visitShop = (locationId) => {
  const location = gameStore.locations[locationId]
  
  // 显示选择对话框
  choiceDialog.value = {
    visible: true,
    title: `访问${location.name}的商店`,
    message: `欢迎来到${location.name}的商店，你想要做什么？`,
    choices: [
      { label: "购买物品", value: "buy" },
      { label: "出售物品", value: "sell" },
      { label: "打听消息", value: "info" }
    ],
    currentAction: 'shop',
    currentLocationId: locationId
  }
  
  hideLocationOptions()
}

// 统一的地点点击处理函数
const handleLocationClick = (locationId) => {
  console.log('=== handleLocationClick DEBUG START ===')
  console.log('locationId:', locationId)
  console.log('Event triggered by handleLocationClick')
  
  // 立即调用openLocation
  openLocation(locationId)
  
  console.log('=== handleLocationClick DEBUG END ===')
}

// 进入地点：地点定制的剧情选择（河流、村庄、洞穴优先）
const openLocation = (locationId) => {
  console.log('=== openLocation DEBUG START ===')
  console.log('locationId:', locationId)
  console.log('typeof locationId:', typeof locationId)
  console.log('Router instance:', router)
  console.log('Current route:', router.currentRoute.value)
  
  // 检查地点是否存在
  const location = gameStore.locations[locationId]
  console.log('Location data:', location)
  
  if (!location) {
    console.error('Location not found:', locationId)
    return
  }
  
  try {
    console.log('Attempting router push...')
    
    // 尝试多种路由跳转方式
    const targetPath = `/location/${locationId}`
    console.log('Target path:', targetPath)
    
    // 方式1: 使用路径
    router.push(targetPath).then(() => {
      console.log('Router push by path successful')
    }).catch(error => {
      console.error('Router push by path failed:', error)
      
      // 方式2: 使用name和params
      return router.push({ name: 'location', params: { id: locationId } })
    }).then(() => {
      console.log('Router push by name successful')
    }).catch(error => {
      console.error('Router push by name failed:', error)
    })
    
  } catch (error) {
    console.error('Router push exception:', error)
  }
  
  hideLocationOptions()
  
  // 如果游戏已开始，记录访问日志
  if (gameStore.gameActive) {
    if (location) {
      gameStore.addLog(`🗺️ 前往 ${location.name}`, 'info')
    }
  }
  
  console.log('=== openLocation DEBUG END ===')
}

// 地点事件触发
const triggerLocationEvent = (locationId) => {
  const location = gameStore.locations[locationId]
  if (!location || !location.events || location.events.length === 0) return
  
  // 随机选择一个事件触发
  const randomEvent = location.events[Math.floor(Math.random() * location.events.length)]
  
  switch (randomEvent) {
    case 'findMessage':
      gameStore.addLog('你在沙滩上发现了一个漂流瓶，里面有一张藏宝图碎片！', 'success')
      gameStore.addToInventory('藏宝图碎片')
      break
    case 'meetFisherman':
      gameStore.addLog('你遇到了一位老渔夫，他告诉你关于宝藏的传说。', 'info')
      break
    case 'findAncientMap':
      gameStore.addLog('你在森林深处发现了一张古老的地图！', 'success')
      gameStore.addToInventory('古老地图')
      break
    case 'encounterWildAnimal':
      gameStore.addLog('一只野生动物挡住了你的去路，你需要想办法绕过它。', 'warning')
      break
    case 'findTreasureChest':
      gameStore.addLog('你在洞穴深处发现了一个宝箱！', 'success')
      gameStore.addToInventory('古老金币')
      gameStore.treasuresFound++
      break
    case 'triggerTrap':
      gameStore.addLog('你触发了一个古老的陷阱，幸好你反应迅速，躲了过去。', 'warning')
      break
    default:
      gameStore.addLog(`你探索了${location.name}，但没有发现特别的东西。`, 'info')
  }
  
  // 根据位置更新游戏进度
  switch (locationId) {
    case 'library':
      gameStore.updateProgress(5)
      break
    case 'cave':
      gameStore.updateProgress(10)
      break
    case 'temple':
      gameStore.updateProgress(15)
      break
    case 'treasure':
      gameStore.updateProgress(20)
      break
    case 'village':
      gameStore.updateProgress(8)
      break
    case 'river':
      gameStore.updateProgress(5)
      break
    default:
      gameStore.updateProgress(3)
      break
  }
}

// 地点事件函数
const exploreLibrary = () => {
  gameStore.addItem('古书')
  gameStore.updateProgress(10)
  gameStore.addLog('你在图书馆发现了一本古书，书中记载了宝藏的线索。', 'info')
}

const exploreCave = () => {
  gameStore.addLog('洞穴内分成了两条路，左边有微弱光亮，右边阴暗狭窄。', 'info')
  gameStore.updateProgress(5)
  
  // 随机获得火把
  if (Math.random() < 0.7) {
    gameStore.addItem('火把')
    gameStore.addLog('你在光亮处发现了一只火把!', 'success')
  }
}

const searchTemple = () => {
  gameStore.addLog('你在神庙中发现了古老的壁画，描绘了宝藏的位置。', 'info')
  gameStore.updateProgress(10)
  
  // 随机获得钥匙
  if (Math.random() < 0.4) {
    gameStore.addItem('神秘钥匙')
    gameStore.addLog('你在壁画后面发现了一把神秘的钥匙!', 'success')
  }
}

const openTreasureBox = () => {
  if (gameStore.inventory.includes('神秘钥匙')) {
    const gems = ['钻石', '红宝石', '蓝宝石', '祖母绿', '神秘水晶']
    const gem = gems[Math.floor(Math.random() * gems.length)]
    gameStore.addLog(`恭喜! 你找到了璀璨的${gem}!`, 'success')
    gameStore.updateProgress(30)
    
    // 更新用户分数
    gameStore.updateUserScore(gameStore.progress)
  } else {
    gameStore.addLog('宝箱被锁住了，需要神秘钥匙才能打开。', 'warning')
  }
}

const visitVillage = () => {
  if (Math.random() < 0.7) {
    gameStore.addItem('神庙地图')
    gameStore.addLog('一位老者给了你一张神庙的地图，这会对你有帮助！', 'success')
  } else {
    gameStore.addLog('村民们知道的不多，但你得到了一些食物补给。', 'info')
  }
  gameStore.updateProgress(5)
}

const crossRiver = () => {
  if (Math.random() < 0.4) {
    gameStore.addLog('河水突然暴涨，你被冲走了！', 'error')
    gameStore.updateProgress(-10)
  } else {
    gameStore.addLog('你成功游过了河流！', 'success')
    gameStore.updateProgress(10)
  }
}
</script>

<style scoped>
.game-map {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-title {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2.5em;
  font-family: 'Baloo 2', 'Comic Sans MS', cursive;
  color: #8B4513;
  text-shadow: 3px 3px 0 #FFF8DC, 6px 6px 0 rgba(139, 69, 19, 0.3);
  z-index: 4;
  background: linear-gradient(135deg, rgba(255,248,220,0.9) 0%, rgba(255,228,181,0.8) 100%);
  padding: 15px 40px;
  border-radius: 30px;
  border: 4px solid #D2691E;
  backdrop-filter: blur(10px);
}

.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
  border-radius: 32px;
  overflow: hidden;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(180deg, #87CEEB 0%, #B0E2FF 30%, #98FB98 70%, #32CD32 100%),
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 2%, transparent 5%),
    radial-gradient(circle at 80% 30%, rgba(255,255,255,0.6) 3%, transparent 6%),
    radial-gradient(circle at 40% 70%, rgba(255,255,255,0.7) 2%, transparent 4%);
  z-index: 1;
}

/* 山峰细节 */
.mountain-peak {
  position: absolute;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #F5F5DC 0%, #D2B48C 100%);
  border-radius: 50% 50% 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mountain-peak::after {
  content: "⛰️";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
}

/* 树木细节 */
.tree {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #228B22;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tree::after {
  content: "🌲";
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
}

/* 河流波浪 */
.river-wave {
  position: absolute;
  width: 8px;
  height: 4px;
  background: #87CEEB;
  border-radius: 50%;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

/* 云朵 */
.cloud {
  position: absolute;
  width: 40px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  animation: float 4s ease-in-out infinite;
}

.cloud::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 10px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 岛屿细节样式 */
.beach {
  position: absolute;
  background: linear-gradient(180deg, #F4A460 0%, #DEB887 100%);
  border-radius: 20px 20px 0 0;
}

.path {
  position: absolute;
  background: #8B7355;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.rock {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #696969;
  border-radius: 30% 70% 70% 30%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.vegetation {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #9ACD32;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.vegetation::after {
  content: "🌿";
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
}

.waterfall {
  position: absolute;
  width: 6px;
  height: 30px;
  background: linear-gradient(180deg, #B0E0E6 0%, #87CEEB 100%);
  border-radius: 3px;
  animation: flow 1.5s ease-in-out infinite;
}

@keyframes flow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.terrain {
  position: absolute;
  z-index: 2;
}

.mountains {
  position: absolute;
  top: 30%;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(180deg, #8B7355 0%, #A0522D 100%);
  clip-path: polygon(0% 100%, 10% 40%, 20% 70%, 30% 30%, 40% 60%, 50% 20%, 60% 50%, 70% 30%, 80% 70%, 90% 40%, 100% 100%);
}

.forest {
  bottom: 30%;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(180deg, #228B22 0%, #006400 100%);
  clip-path: polygon(0% 100%, 5% 20%, 15% 80%, 25% 30%, 35% 90%, 45% 40%, 55% 70%, 65% 25%, 75% 85%, 85% 35%, 95% 75%, 100% 100%);
}

.river-path {
  top: 45%;
  left: 8%;
  width: 84%;
  height: 8px;
  background: linear-gradient(90deg, transparent 0%, #1E90FF 20%, #1E90FF 80%, transparent 100%);
  border-radius: 4px;
  opacity: 0.8;
}

.terrain-map-area {
  position: absolute;
  top: 80px;
  left: 0;
  width: 100%;
  height: calc(100% - 80px);
  z-index: 3;
}

.terrain-background {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 山脉区域 */
.mountain-range {
  position: absolute;
  background: linear-gradient(135deg, #8B7355 0%, #A0522D 50%, #D2691E 100%);
  border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%;
  box-shadow: 
    inset 0 0 20px rgba(139, 115, 85, 0.5),
    0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.mountain-range::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 20%;
  width: 60%;
  height: 40%;
  background: linear-gradient(135deg, #F5F5DC 0%, #DEB887 100%);
  border-radius: 50% 50% 0 0 / 80% 80% 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.mountain-range::after {
  content: '⛰️';
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 森林区域 */
.forest-area {
  position: absolute;
  background: linear-gradient(135deg, #228B22 0%, #32CD32 50%, #9ACD32 100%);
  border-radius: 30% 70% 60% 40% / 40% 60% 30% 70%;
  box-shadow: 
    inset 0 0 15px rgba(34, 139, 34, 0.4),
    0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.forest-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, #006400 8%, transparent 12%),
    radial-gradient(circle at 60% 20%, #006400 6%, transparent 10%),
    radial-gradient(circle at 80% 70%, #006400 10%, transparent 14%),
    radial-gradient(circle at 30% 80%, #006400 7%, transparent 11%);
  border-radius: inherit;
}

.forest-area::after {
  content: '🌲🌳🌲';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 河流系统 */
.river-system {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.river-segment {
  position: absolute;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #1E90FF 10%, 
    #87CEEB 50%, 
    #1E90FF 90%, 
    transparent 100%);
  border-radius: 50px;
  box-shadow: 
    inset 0 0 5px rgba(30, 144, 255, 0.6),
    0 2px 6px rgba(0, 0, 0, 0.2);
  animation: riverFlow 3s ease-in-out infinite;
}

@keyframes riverFlow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* 湖泊 */
.lake {
  position: absolute;
  background: radial-gradient(ellipse at center, #1E90FF 0%, #4682B4 70%, #2F4F4F 100%);
  border-radius: 50%;
  box-shadow: 
    inset 0 0 20px rgba(30, 144, 255, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.lake::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 30%;
  width: 40%;
  height: 30%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: lakeShimmer 4s ease-in-out infinite;
}

@keyframes lakeShimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* 沙漠区域 */
.desert-area {
  position: absolute;
  background: linear-gradient(135deg, #F4A460 0%, #DEB887 50%, #D2B48C 100%);
  border-radius: 20% 80% 60% 40% / 30% 70% 40% 60%;
  box-shadow: 
    inset 0 0 25px rgba(244, 164, 96, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.desert-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 30% 40%, rgba(255, 228, 181, 0.6) 5%, transparent 8%),
    radial-gradient(circle at 70% 20%, rgba(255, 228, 181, 0.4) 8%, transparent 12%),
    radial-gradient(circle at 50% 80%, rgba(255, 228, 181, 0.5) 6%, transparent 10%);
  border-radius: inherit;
}

.desert-area::after {
  content: '🏜️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 海岸线 */
.coastline {
  position: absolute;
  background: linear-gradient(180deg, 
    #F4A460 0%, 
    #DEB887 30%, 
    #87CEEB 70%, 
    #4682B4 100%);
  border-radius: 50px 50px 0 0;
  box-shadow: 
    inset 0 0 15px rgba(135, 206, 235, 0.4),
    0 -3px 10px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.coastline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    repeating-linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.3) 2%, 
      transparent 4%);
  animation: waves 2s ease-in-out infinite;
}

@keyframes waves {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}

/* 道路网络 */
.road-network {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.road {
  position: absolute;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #8B7355 10%, 
    #A0522D 50%, 
    #8B7355 90%, 
    transparent 100%);
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.road::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 1px;
  background: repeating-linear-gradient(90deg, 
    #F5F5DC 0%, 
    #F5F5DC 5px, 
    transparent 5px, 
    transparent 10px);
}

.location-marker {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  text-align: center;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
  width: 60px;
  height: 60px;
  margin-top: -30px;
  margin-left: -30px;
  display: block !important; /* 强制显示地点标记 */
  visibility: visible !important; /* 确保可见性 */
  opacity: 1 !important; /* 确保不透明 */
}

.location-marker:hover {
  transform: scale(1.3);
  filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.7));
}

.location-marker:hover .marker-label {
  transform: translateX(-50%) translateY(5px) scale(1.1);
}

.marker-icon {
  font-size: 2.2em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.marker-label {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  color: #8B4513;
  border: 2px solid #FFD700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: block; /* 始终显示地点名称 */
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 5px;
  z-index: 12;
}

/* 悬停选项菜单样式 */
.location-options {
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 220, 0.95) 100%);
  border: 3px solid #FFD700;
  border-radius: 15px;
  padding: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  z-index: 15;
  min-width: 160px;
  backdrop-filter: blur(5px);
  animation: optionsAppear 0.3s ease-out;
}

@keyframes optionsAppear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.options-title {
  font-size: 0.9em;
  font-weight: bold;
  color: #8B4513;
  text-align: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 2px solid #FFD700;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-btn {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.8em;
  font-weight: bold;
  color: #8B4513;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.option-btn:hover {
  background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.main-btn:hover {
  background: linear-gradient(135deg, #4169E1 0%, #1E90FF 100%);
  color: white;
}

.explore-btn:hover {
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  color: white;
}

.search-btn:hover {
  background: linear-gradient(135deg, #FF6347 0%, #DC143C 100%);
  color: white;
}

.rest-btn:hover {
  background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
  color: white;
}

.shop-btn:hover {
  background: linear-gradient(135deg, #DDA0DD 0%, #9370DB 100%);
  color: white;
}

.map-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(90deg, #FFD70022 0 2px, transparent 2px 20px), 
                    repeating-linear-gradient(0deg, #FFD70022 0 2px, transparent 2px 20px);
  border-radius: 32px;
  z-index: 4;
}

.player {
  position: absolute;
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--primary-color);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 11;
  border: 2px solid rgba(255, 255, 255, 0.8);
  margin-top: -12px;
  margin-left: -12px;
}

.player::after {
  content: "▲";
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--primary-color);
  font-size: 12px;
  text-shadow: 0 0 5px black;
}

.player-trail {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 9;
}

.trail-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--primary-color);
  transition: opacity 0.5s ease;
  margin-top: -4px;
  margin-left: -4px;
}

.trail-point.trail-fade {
  opacity: 0.3;
}

.progress-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  z-index: 5;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  border: 2px solid #FFD700;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #FFD700 0%, #FFB347 100%);
  transition: width 0.5s ease;
  border-radius: 8px;
}

.progress-text {
  font-size: 1.2em;
  font-weight: bold;
  color: #8B4513;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-title {
    font-size: 1.8em;
    padding: 10px 20px;
  }
  
  .marker-icon {
    font-size: 2em;
  }
  
  .marker-label {
    font-size: 0.9em;
    padding: 6px 12px;
  }
}
</style>