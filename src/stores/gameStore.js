// 游戏状态管理store - 优化后的简洁版本
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 核心游戏状态
  const gameActive = ref(false)
  const currentLocation = ref('library')
  const progress = ref(0)
  const inventory = ref([])
  const gameLog = ref([])
  const treasuresFound = ref(0)
  const gameStartTime = ref(null)
  
  // 全局音乐状态管理
  const globalAudio = ref(null)
  const pendingAudio = ref(null) // 添加待处理的音频对象引用
  const currentPlayingLocation = ref(null)
  const isMusicPlaying = ref(false)
  
  // 游戏统计数据
  const gameStatistics = ref({
    totalGames: 0,        // 总游戏次数
    treasuresFoundTotal: 0, // 总找到宝藏次数
    totalScore: 0,        // 总分数
    highestScore: 0,      // 最高分数
    perfectRuns: 0,       // 完美通关次数（拥有所有道具）
    averageTime: 0,       // 平均游戏时长
    lastPlayDate: null    // 最后游戏日期
  })
  
  // 进度阶段控制
  const currentStage = ref('initial')
  const stageCaps = {
    initial: 15,
    library: 25,
    river: 40,
    village: 55,
    cave: 75,
    temple: 95,
    complete: 100
  }
  
  // 访问记录
  const visitedLocations = ref(new Set())
  const hasVisitedCoreLocations = () => {
    const core = ['library','river','village','cave']  // 移除temple要求，降低通关难度
    return core.every(loc => visitedLocations.value.has(loc))
  }

  // 检查是否有足够的道具通关（更宽松的条件）
  const hasEnoughItemsForTreasure = () => {
    const importantItems = ['古书', '神秘钥匙', '火把']
    const hasCount = importantItems.filter(item => hasItem(item)).length
    return hasCount >= 2  // 只需要3个重要道具中的2个
  }

  // 用户管理
  const isLoggedIn = ref(false)
  const currentUser = ref(null)
  const leaderboard = ref([])

  // 选择对话框状态
  const choiceDialog = ref({
    visible: false,
    title: '',
    message: '',
    choices: [],
    selectedChoice: null
  })

  // 保存上一个选择状态，用于返回功能
  const lastChoiceState = ref({
    hasLastChoice: false,
    title: '',
    message: '',
    choices: [],
    actionFunction: null,
    actionParams: []
  })

  // 地点配置 - 扩展版本
  const locations = ref({
    library: {
      name: '古老图书馆',
      description: '布满灰尘的古老图书馆，书架上堆满了古籍。这里是冒险的起点。',
      actions: ['searchBooks', 'readAncientTexts'],
      position: { top: '25%', left: '25%' },
      icon: '📚'
    },
    forest: {
      name: '神秘森林',
      description: '茂密的原始森林，古树参天，阳光透过树叶洒下斑驳光影。',
      actions: ['exploreForest', 'collectHerbs', 'followPath'],
      position: { top: '15%', left: '40%' },
      icon: '🌲'
    },
    river: {
      name: '湍急河流',
      description: '水流湍急的河流，对岸隐约可见神秘建筑。需要想办法过河。',
      actions: ['buildRaft', 'findFord', 'swimAcross'],
      position: { top: '45%', left: '35%' },
      icon: '🌊'
    },
    waterfall: {
      name: '壮观瀑布',
      description: '从高山倾泻而下的瀑布，水声轰鸣，水雾弥漫，后面似乎有洞穴。',
      actions: ['exploreWaterfall', 'climbRocks', 'enterCave'],
      position: { top: '20%', left: '60%' },
      icon: '💧'
    },
    village: {
      name: '古老村落',
      description: '废弃的古老村落，石屋残垣中似乎还保留着先民的智慧。',
      actions: ['searchHouses', 'readTablets'],
      position: { top: '60%', left: '50%' },
      icon: '🏘️'
    },
    mountain: {
      name: '雄伟山峰',
      description: '高耸入云的山峰，山顶被云雾缭绕，传说山顶有古老的观星台。',
      actions: ['climbMountain', 'searchCaves', 'reachSummit'],
      position: { top: '10%', left: '70%' },
      icon: '⛰️'
    },
    cave: {
      name: '黑暗洞穴',
      description: '深邃的洞穴入口，里面传来阵阵凉风。墙壁上似乎刻着古老的符号。',
      actions: ['exploreCave', 'lightTorch', 'decodeSymbols'],
      position: { top: '50%', left: '60%' },
      icon: '🕳️'
    },
    desert: {
      name: '神秘沙漠',
      description: '一望无际的沙漠，沙丘起伏，远处有海市蜃楼般的建筑轮廓。',
      actions: ['crossDesert', 'findOasis', 'followStars'],
      position: { top: '70%', left: '20%' },
      icon: '🏜️'
    },
    coast: {
      name: '神秘海岸',
      description: '波涛汹涌的海岸线，礁石嶙峋，海浪拍打着古老的石柱。',
      actions: ['exploreCoast', 'searchTidePools', 'climbCliffs'],
      position: { top: '80%', left: '70%' },
      icon: '🌊'
    },
    temple: {
      name: '神秘神庙',
      description: '宏伟的神庙建筑，巨大的石柱支撑着穹顶。空气中弥漫着神圣的气息。',
      actions: ['exploreTemple', 'solvePuzzle'],
      position: { top: '30%', left: '30%' },
      icon: '🏛️'
    },
    treasure: {
      name: '宝藏密室',
      description: '隐藏在最深处的宝藏密室，传说中的宝藏就在眼前。',
      actions: ['openTreasureBox', 'inspectTreasure'],
      position: { top: '35%', left: '40%' },
      icon: '💎'
    }
  })

  // 物品系统 - 扩展版本
  const items = ref({
    '古书': { type: 'quest', value: 20, description: '记载着宝藏线索的古老书籍' },
    '神秘钥匙': { type: 'key', value: 100, description: '打开宝藏箱的神秘钥匙' },
    '火把': { type: 'tool', value: 15, description: '照亮黑暗洞穴的火把' },
    '木筏': { type: 'tool', value: 25, description: '过河用的简易木筏' },
    '神庙地图': { type: 'quest', value: 30, description: '通往神庙的详细地图' },
    '草药': { type: 'consumable', value: 10, description: '森林中采集的治疗草药' },
    '水晶': { type: 'treasure', value: 50, description: '瀑布洞穴中发现的神秘水晶' },
    '星图': { type: 'quest', value: 40, description: '山顶观星台的古老星图' },
    '沙漠玫瑰': { type: 'treasure', value: 35, description: '沙漠中罕见的矿物结晶' },
    '海螺': { type: 'tool', value: 20, description: '海岸发现的神奇海螺，能发出特殊声音' },
    '老鹰羽毛': { type: 'material', value: 15, description: '山峰上老鹰的珍贵羽毛' },
    '绳索': { type: 'tool', value: 18, description: '攀爬和探险必备的结实绳索' },
    '指南针': { type: 'tool', value: 25, description: '在迷宫般的地形中指引方向' },
    '旅行补给': { type: 'consumable', value: 12, description: '村庄购买的食物和水' },
    // 新增道具，提高通关率
    '河边石头': { type: 'material', value: 5, description: '河边捡到的光滑石头' },
    '食物补给': { type: 'consumable', value: 8, description: '村民提供的食物和水' },
    '村民礼物': { type: 'quest', value: 25, description: '村民赠送的珍贵礼物' },
    '古老壁画线索': { type: 'quest', value: 30, description: '洞穴壁画上的重要线索' },
    '守卫祝福': { type: 'blessing', value: 35, description: '神庙守卫给予的神圣祝福' }
  })

  // 计算属性
  const isGameActive = computed(() => gameActive.value)
  const currentLocationData = computed(() => locations.value[currentLocation.value])
  const gameProgress = computed(() => progress.value)
  const progressPercent = computed(() => `${Math.min(progress.value, 100)}%`)
  const userInventory = computed(() => inventory.value)
  const logEntries = computed(() => gameLog.value)
  const treasureCount = computed(() => treasuresFound.value)
  const gameDuration = computed(() => {
    if (!gameStartTime.value) return 0
    return Math.floor((Date.now() - gameStartTime.value) / 1000)
  })

  // 核心游戏逻辑
  const startGame = async () => {
    gameActive.value = true
    progress.value = 0
    treasuresFound.value = 0
    inventory.value = []
    gameLog.value = []
    currentLocation.value = 'library'
    currentStage.value = 'initial'
    visitedLocations.value = new Set()
    gameStartTime.value = Date.now()

    // 记录游戏统计
    gameStatistics.value.totalGames++
    gameStatistics.value.lastPlayDate = new Date().toISOString()
    saveStatistics()

    // 开始游戏日志
    addLog('🎮 游戏开始！欢迎来到寻宝冒险世界！', 'success')
    addLog(`📊 这是你的第 ${gameStatistics.value.totalGames} 次游戏`, 'info')
    addLog('📚 你醒来发现自己在古老的图书馆中...', 'story')

    // 初始探索
    await exploreLibrary()
    addLog('🎯 完成初步探索！点击【继续冒险】进行下一步。', 'info')
  }

  const continueGame = async () => {
    if (!gameActive.value) return

    try {
      addLog('🚀 继续你的冒险旅程...', 'info')

      // 扩展的冒险流程 - 更多地点探索
      await exploreForest()
      await delay(1000)

      await crossRiver()
      await delay(1000)

      await visitWaterfall()
      await delay(1000)

      await visitVillage()
      await delay(1000)

      await climbMountain()
      await delay(1000)

      await exploreCave()
      await delay(1000)

      await crossDesert()
      await delay(1000)

      await exploreCoast()
      await delay(1000)

      await searchTemple()
      await delay(1000)

      // 最终前往宝藏密室
      moveToLocation('treasure')
      await openTreasureBox()

    } catch (error) {
      addLog('💀 ' + error.message, 'error')
      addLog('游戏结束！点击【重置游戏】重新开始。', 'warning')
      gameActive.value = false
    }
  }

  // 各阶段游戏函数
  const startJourney = async () => {
    moveToLocation('library')
    addLog('你踏上了神秘的寻宝之旅...', 'info')
    updateProgress(10)
    await delay(1000)
    return '传说宝藏藏在远古的神庙中。'
  }

  // 图书馆探索
  const exploreLibrary = async () => {
    moveToLocation('library')
    addLog('📖 你在图书馆发现了一本古书，书中记载了宝藏的线索。', 'info')
    addToInventory('古书')
    updateProgress(10)
    return '古书记载：宝藏被藏在神庙最深处的密室中。'
  }

  const crossRiver = async () => {
    moveToLocation('river')
    addLog('🌊 你来到一条湍急的河流前，需要想办法过河。', 'info')

    const choice = await showChoices([
      { label: '寻找浅滩过河', value: 'ford' },
      { label: '制作简易木筏', value: 'raft' },
      { label: '游泳过河', value: 'swim' }
    ])

    if (choice === 'ford') {
      if (Math.random() < 0.2) {  // 降低失败率
        addLog('⚠️ 河水有些湍急，但你成功找到了安全的浅滩！', 'warning')
        updateProgress(8)
      } else {
        addLog('✅ 你成功找到了浅滩，安全过河。', 'success')
        updateProgress(12)
      }
    } else if (choice === 'raft') {
      addToInventory('木筏')
      addLog('🚣 你制作了简易木筏，顺利过河。', 'success')
      updateProgress(10)
    } else {
      if (Math.random() < 0.7) {  // 提高成功率
        addLog('🏊 你勇敢地游过河流，虽然有些疲惫但成功到达对岸！', 'success')
        updateProgress(15)
      } else {
        addLog('💦 河水太冷了，你游到一半返回了岸边，但发现了一些有用的物品。', 'warning')
        addToInventory('河边石头')
        updateProgress(5)
      }
    }
  }

  const visitVillage = async () => {
    moveToLocation('village')
    addLog('🏘️ 你来到一个古老村庄，村民对你很友好。', 'info')

    const choice = await showChoices([
      { label: '向村民打听消息', value: 'ask' },
      { label: '在村庄休息', value: 'rest' },
      { label: '帮助村民干活', value: 'help' }
    ])

    if (choice === 'ask') {
      if (Math.random() < 0.8) {  // 提高成功率
        addToInventory('神庙地图')
        addLog('🗺️ 一位老者给了你一张神庙的地图！', 'success')
        updateProgress(15)
      } else {
        addLog('💬 村民知道的不多，但你得到了一些食物补给。', 'info')
        addToInventory('食物补给')
        updateProgress(8)
      }
    } else if (choice === 'rest') {
      addLog('😴 你在村庄休息了一晚，体力恢复了。', 'success')
      updateProgress(10)
      if (Math.random() < 0.5) {
        addLog('💭 休息时你听到了一些有趣的传说故事。', 'info')
        updateProgress(5)
      }
    } else {
      addLog('🤝 你帮助村民修理房屋和农具，他们很感激。', 'success')
      if (Math.random() < 0.7) {
        addToInventory('村民礼物')
        addLog('🎁 村民送给你一件珍贵的礼物作为感谢！', 'success')
        updateProgress(18)
      } else {
        addLog('💪 虽然累了一些，但你获得了村民的友谊和尊重。', 'success')
        updateProgress(12)
      }
    }
  }

  const exploreCave = async () => {
    moveToLocation('cave')
    addLog('🕳️ 洞穴内分成了三条路，你选择哪条？', 'info')

    const choice = await showChoices([
      { label: '左边(有光亮)', value: 'left' },
      { label: '右边(阴暗狭窄)', value: 'right' },
      { label: '中间(宽敞通道)', value: 'middle' }
    ])

    if (choice === 'left') {
      addToInventory('火把')
      addLog('🔥 你在光亮处发现了一只火把！', 'success')
      updateProgress(12)
    } else if (choice === 'right') {
      if (Math.random() < 0.2) {  // 大幅降低失败率
        addLog('⚠️ 通道很狭窄，你小心翼翼地通过了！', 'warning')
        updateProgress(8)
      } else {
        addLog('🚪 小心翼翼穿过黑暗通道，找到了通往神庙的密道！', 'success')
        updateProgress(15)
      }
    } else {
      addLog('🏛️ 宽敞的通道让你轻松前进，还发现了古老的壁画！', 'success')
      if (Math.random() < 0.6) {
        addToInventory('古老壁画线索')
        addLog('🎨 壁画上的符号给了你重要线索！', 'success')
        updateProgress(18)
      } else {
        updateProgress(12)
      }
    }

    // 如果有古书，获得神秘钥匙
    if (hasItem('古书')) {
      addToInventory('神秘钥匙')
      addLog('🔑 你发现了一把神秘的钥匙！', 'treasure')
      updateProgress(10)
    }
  }

  const searchTemple = async () => {
    moveToLocation('temple')
    addLog('🏛️ 你在神庙门口遇到守卫，怎么办？', 'warning')

    const choice = await showChoices([
      { label: '展示古书证明身份', value: 'show' },
      { label: '尝试偷偷潜行', value: 'sneak' },
      { label: '与守卫友好交谈', value: 'talk' }
    ])

    if (choice === 'show') {
      if (hasItem('古书')) {
        addLog('✨ 你展示古书，守卫认出你是被选中的人！', 'success')
        updateProgress(20)
      } else {
        addLog('📚 你没有古书，但守卫看出你是真诚的探险者，允许你进入。', 'info')
        updateProgress(10)
      }
    } else if (choice === 'sneak') {
      if (Math.random() < 0.8) {  // 提高成功率
        addLog('🤫 你成功绕过守卫，悄悄进入了神庙！', 'success')
        updateProgress(15)
      } else {
        addLog('👀 守卫发现了你，但被你的勇气感动，决定让你进入。', 'warning')
        updateProgress(8)
      }
    } else {
      addLog('💬 你与守卫友好交谈，分享了你的冒险故事。', 'success')
      if (Math.random() < 0.7) {
        addToInventory('守卫祝福')
        addLog('🙏 守卫被你的故事感动，给了你神庙的祝福！', 'success')
        updateProgress(18)
      } else {
        addLog('🤝 守卫欣赏你的诚实，允许你进入神庙。', 'success')
        updateProgress(12)
      }
    }
  }

  // 新增地点探索函数
  const exploreForest = async () => {
    moveToLocation('forest')
    addLog('🌲 你进入神秘森林，古树参天，鸟语花香。', 'info')

    const choice = await showChoices([
      { label: '采集草药', value: 'herbs' },
      { label: '跟随小径', value: 'path' },
      { label: '爬上大树观察', value: 'climb' }
    ])

    if (choice === 'herbs') {
      addToInventory('草药')
      addLog('🌿 你采集到了珍贵的治疗草药！', 'success')
      updateProgress(8)
    } else if (choice === 'path') {
      if (Math.random() < 0.7) {
        addToInventory('指南针')
        addLog('🧭 你在小径上发现了一个古老的指南针！', 'success')
        updateProgress(12)
      } else {
        addLog('🌲 小径通向森林深处，你迷路了一会儿。', 'warning')
        updateProgress(5)
      }
    } else {
      addLog('🦅 从树顶你看到了整个岛屿的布局，获得了宝贵的地理知识！', 'success')
      updateProgress(10)
    }
  }

  const visitWaterfall = async () => {
    moveToLocation('waterfall')
    addLog('💧 壮观的瀑布从高处倾泻而下，水雾弥漫。', 'info')

    const choice = await showChoices([
      { label: '探索瀑布后的洞穴', value: 'cave' },
      { label: '攀爬湿滑的岩石', value: 'climb' },
      { label: '在水潭中寻找宝物', value: 'search' }
    ])

    if (choice === 'cave') {
      addToInventory('水晶')
      addLog('💎 你在瀑布后的洞穴中发现了闪闪发光的水晶！', 'treasure')
      updateProgress(15)
    } else if (choice === 'climb') {
      if (Math.random() < 0.5) {
        addLog('🧗 你成功攀爬到瀑布顶端，发现了一条隐秘通道！', 'success')
        updateProgress(12)
      } else {
        addLog('💦 岩石太滑，你掉进了水潭，但安全无恙。', 'warning')
        updateProgress(3)
      }
    } else {
      if (Math.random() < 0.6) {
        addToInventory('海螺')
        addLog('🐚 你在水潭底部找到了一个神奇的海螺！', 'success')
        updateProgress(10)
      } else {
        addLog('🌊 水潭很深，你什么也没找到。', 'info')
        updateProgress(5)
      }
    }
  }

  const climbMountain = async () => {
    moveToLocation('mountain')
    addLog('⛰️ 你开始攀登雄伟的山峰，山路崎岖险峻。', 'info')

    const choice = await showChoices([
      { label: '直接攀登到山顶', value: 'summit' },
      { label: '搜索山腰的洞穴', value: 'caves' },
      { label: '沿着山脊小心前进', value: 'ridge' }
    ])

    if (choice === 'summit') {
      if (Math.random() < 0.4) {
        addToInventory('星图')
        addLog('🌟 你登上山顶，在古老的观星台发现了星图！', 'treasure')
        updateProgress(20)
      } else {
        addLog('🌪️ 山顶风太大，你被迫返回。', 'warning')
        updateProgress(5)
      }
    } else if (choice === 'caves') {
      addToInventory('老鹰羽毛')
      addLog('🦅 你在山洞中发现了老鹰的巢穴和珍贵的羽毛！', 'success')
      updateProgress(12)
    } else {
      addToInventory('绳索')
      addLog('🪢 你在山脊上找到了登山者遗留的绳索！', 'success')
      updateProgress(10)
    }
  }

  const crossDesert = async () => {
    moveToLocation('desert')
    addLog('🏜️ 你踏入广袤的沙漠，烈日炎炎，沙丘起伏。', 'info')

    const choice = await showChoices([
      { label: '寻找绿洲', value: 'oasis' },
      { label: '跟随星星导航', value: 'stars' },
      { label: '挖掘沙丘寻宝', value: 'dig' }
    ])

    if (choice === 'oasis') {
      if (Math.random() < 0.6) {
        addToInventory('旅行补给')
        addLog('🌴 你找到了绿洲，补充了水和食物！', 'success')
        updateProgress(12)
      } else {
        addLog('🌵 那只是海市蜃楼，你继续在沙漠中跋涉。', 'warning')
        updateProgress(5)
      }
    } else if (choice === 'stars') {
      if (hasItem('星图')) {
        addLog('🌟 你用星图成功导航，找到了沙漠中的古老遗迹！', 'success')
        updateProgress(18)
      } else {
        addLog('⭐ 没有星图，你在沙漠中迷失了方向。', 'warning')
        updateProgress(3)
      }
    } else {
      addToInventory('沙漠玫瑰')
      addLog('🌹 你挖到了美丽的沙漠玫瑰矿物！', 'treasure')
      updateProgress(15)
    }
  }

  const exploreCoast = async () => {
    moveToLocation('coast')
    addLog('🌊 你来到神秘的海岸，海浪拍打着礁石。', 'info')

    const choice = await showChoices([
      { label: '探索潮汐池', value: 'pools' },
      { label: '攀爬悬崖', value: 'cliffs' },
      { label: '沿海岸线寻找', value: 'search' }
    ])

    if (choice === 'pools') {
      if (Math.random() < 0.7) {
        addLog('🦀 你在潮汐池中发现了奇特的海洋生物和贝壳！', 'success')
        updateProgress(10)
      } else {
        addLog('🌊 潮汐池很普通，没有特别的发现。', 'info')
        updateProgress(5)
      }
    } else if (choice === 'cliffs') {
      if (hasItem('绳索')) {
        addLog('🧗 你用绳索成功攀爬悬崖，发现了海盗的藏宝洞！', 'success')
        updateProgress(20)
      } else {
        addLog('⛰️ 没有绳索，悬崖太危险无法攀爬。', 'warning')
        updateProgress(3)
      }
    } else {
      if (Math.random() < 0.5) {
        addLog('🏴‍☠️ 你在海岸发现了古老的船只残骸！', 'success')
        updateProgress(15)
      } else {
        addLog('🐚 你只找到了一些普通的贝壳。', 'info')
        updateProgress(8)
      }
    }
  }

  // 宝箱开启 - 优化后的胜利条件检查
  const openTreasureBox = async () => {
    // 检查胜利条件 - 更宽松的要求
    if (currentLocation.value !== 'treasure') {
      addLog('🔒 必须在宝藏密室才能打开宝箱。', 'warning')
      return
    }
    
    // 更宽松的通关条件
    const hasKey = hasItem('神秘钥匙')
    const hasBook = hasItem('古书')
    const hasTorch = hasItem('火把')
    const visitedEnough = hasVisitedCoreLocations()
    
    // 多种通关路径
    if (!hasKey && !hasBook && !hasTorch) {
      addLog('🔑 你需要至少一件重要道具（神秘钥匙、古书或火把）才能打开宝箱。', 'warning')
      return
    }
    
    if (!visitedEnough) {
      const visited = Array.from(visitedLocations.value)
      const needed = ['library','river','village','cave'].filter(loc => !visited.includes(loc))
      addLog(`🗺️ 还需要探索这些地点：${needed.join('、')}`, 'warning')
      return
    }

    // 宝箱开启成功
    createTreasureEffects()

    // 提高宝箱成功率
    if (Math.random() < 0.9) {  // 从0.8提高到0.9
      const gems = ['钻石', '红宝石', '蓝宝石', '祖母绿', '神秘水晶', '黄金', '白银']
      const gem = gems[Math.floor(Math.random() * gems.length)]
      addLog(`💎 恭喜！你发现了一颗闪耀的${gem}！`, 'treasure')
      treasuresFound.value++
      
      // 记录找到宝藏的统计
      gameStatistics.value.treasuresFoundTotal++
      gameStatistics.value.totalScore++
      
      // 检查是否完美通关
      const isPerfectRun = hasKey && hasBook && hasTorch
      if (isPerfectRun) {
        gameStatistics.value.perfectRuns++
        gameStatistics.value.totalScore += 2  // 完美通关额外得分
        addLog('🏆 你收集了所有重要道具，获得完美通关奖励！额外得2分！', 'treasure')
      }
      
      // 更新最高分数
      if (gameStatistics.value.totalScore > gameStatistics.value.highestScore) {
        gameStatistics.value.highestScore = gameStatistics.value.totalScore
        addLog('🎉 恭喜！你创造了新的最高分记录！', 'treasure')
      }
      
      updateProgress(20)  // 增加奖励进度
      saveStatistics()
      
    } else {
      addLog('💰 宝箱里有一些金币和珍贵物品，虽然不是传说中的宝石，但也很有价值！', 'success')
      treasuresFound.value++
      gameStatistics.value.treasuresFoundTotal++
      gameStatistics.value.totalScore++
      
      if (gameStatistics.value.totalScore > gameStatistics.value.highestScore) {
        gameStatistics.value.highestScore = gameStatistics.value.totalScore
      }
      
      updateProgress(15)
      saveStatistics()
    }

    // 返回神庙结算
    addLog('🏁 返回神庙进行最终结算。', 'info')
    addLog(`📊 当前总分：${gameStatistics.value.totalScore} 分`, 'success')
    moveToLocation('temple')
    await delay(500)
    completeGame()

    return '获得宝物并完成结算'
  }

  // 玩家选择交互函数
  const showChoices = async (choices, title = '请做出选择', message = '请选择你的行动方案：') => {
    // 保存当前选择状态到历史记录
    lastChoiceState.value = {
      hasLastChoice: true,
      title: title,
      message: message,
      choices: choices
    }

    choiceDialog.value = {
      visible: true,
      choices: choices,
      title: title,
      message: message,
      selectedChoice: null
    }
    
    return new Promise((resolve) => {
      const checkChoice = () => {
        if (choiceDialog.value.selectedChoice !== null) {
          const selectedValue = choiceDialog.value.selectedChoice
          choiceDialog.value.visible = false
          resolve(selectedValue)
        } else {
          setTimeout(checkChoice, 100)
        }
      }
      checkChoice()
    })
  }

  const handleChoiceSelected = (choiceValue) => {
    choiceDialog.value.selectedChoice = choiceValue
  }

  const closeChoiceDialog = () => {
    choiceDialog.value.visible = false
  }

  // 返回到上一个选择页面
  const returnToLastChoice = () => {
    if (lastChoiceState.value.hasLastChoice) {
      choiceDialog.value = {
        visible: true,
        choices: lastChoiceState.value.choices,
        title: lastChoiceState.value.title,
        message: lastChoiceState.value.message,
        selectedChoice: null
      }
    }
  }

  // 视觉特效函数 - 简化版本
  const createTreasureEffects = () => {
    if (typeof window !== 'undefined') {
      const treasure = document.createElement('div')
      treasure.innerHTML = '💎✨'
      treasure.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 60px;
        z-index: 9999;
        animation: bounce 1s ease-out;
        pointer-events: none;
      `
      document.body.appendChild(treasure)
      
      setTimeout(() => {
        if (treasure.parentNode) {
          treasure.parentNode.removeChild(treasure)
        }
      }, 1000)
    }
  }

  const createVictoryEffects = () => {
    if (typeof window !== 'undefined') {
      const victory = document.createElement('div')
      victory.innerHTML = '🎉🏆🎉'
      victory.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 80px;
        z-index: 9999;
        animation: bounce 2s ease-out;
        pointer-events: none;
      `
      document.body.appendChild(victory)
      
      setTimeout(() => {
        if (victory.parentNode) {
          victory.parentNode.removeChild(victory)
        }
      }, 2000)
    }
  }

  const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 游戏管理函数
  const resetGame = () => {
    gameActive.value = false
    currentLocation.value = 'library'  // 确保重置到图书馆
    currentStage.value = 'initial'
    progress.value = 0
    treasuresFound.value = 0
    inventory.value = []
    visitedLocations.value.clear()
    gameLog.value = []
    gameStartTime.value = null

    addLog('🔄 游戏已重置，准备开始新的冒险！', 'info')
    addLog('📚 你回到了古老的图书馆，准备开始新的寻宝之旅...', 'story')
  }

  const moveToLocation = (locationId) => {
    if (locations.value[locationId]) {
      currentLocation.value = locationId
      visitedLocations.value.add(locationId)
      addLog(`🚶 移动到：${locations.value[locationId].name}`, 'info')
      
      // 根据访问的地点自动推进游戏阶段
      updateGameStage()
    }
  }

  // 游戏阶段推进逻辑
  const updateGameStage = () => {
    const visited = visitedLocations.value
    
    if (visited.has('library') && currentStage.value === 'initial') {
      currentStage.value = 'library'
      addLog('📚 图书馆探索完成，进入下一阶段！', 'success')
    } else if (visited.has('forest') && visited.has('river') && currentStage.value === 'library') {
      currentStage.value = 'river'
      addLog('🌊 森林和河流探索完成，冒险继续深入！', 'success')
    } else if (visited.has('waterfall') && visited.has('village') && currentStage.value === 'river') {
      currentStage.value = 'village'
      addLog('🏘️ 瀑布和村庄探索完成，距离目标更近了！', 'success')
    } else if (visited.has('mountain') && visited.has('cave') && currentStage.value === 'village') {
      currentStage.value = 'cave'
      addLog('🕳️ 山峰和洞穴探索完成，神庙就在前方！', 'success')
    } else if (visited.has('desert') && visited.has('coast') && visited.has('temple') && currentStage.value === 'cave') {
      currentStage.value = 'temple'
      addLog('🏛️ 沙漠、海岸和神庙探索完成，最终宝藏近在咫尺！', 'success')
    }
  }

  // 物品管理
  const addToInventory = (itemName) => {
    const baseItemInfo = items.value[itemName] || {
      type: 'unknown',
      value: 0,
      description: '未知物品'
    }
    
    // 确保道具对象包含name属性
    const itemInfo = {
      name: itemName,
      ...baseItemInfo
    }

    if (!inventory.value.find(item => item.name === itemName)) {
      inventory.value.push(itemInfo)
      addLog(`📦 获得物品：${itemName}`, 'success')
    }
  }

  const removeFromInventory = (itemName) => {
    const index = inventory.value.findIndex(item => item.name === itemName)
    if (index !== -1) {
      inventory.value.splice(index, 1)
      addLog(`📤 失去物品：${itemName}`, 'info')
    }
  }

  const hasItem = (itemName) => {
    return inventory.value.some(item => item.name === itemName)
  }

  // 进度更新
  const updateProgress = (points) => {
    const maxProgress = stageCaps[currentStage.value] || 100
    progress.value = Math.min(progress.value + points, maxProgress)
  }

  // 游戏完成
  const completeGame = () => {
    gameActive.value = false
    currentStage.value = 'complete'
    progress.value = 100

    createVictoryEffects()
    addLog('🎉 恭喜！你成功完成了冒险！', 'victory')
    addLog('🏆 游戏结束！点击【重置游戏】开始新的冒险。', 'info')

    const finalScore = calculateFinalScore()
    addLog(`🏆 最终得分：${finalScore}`, 'score')
  }

  const calculateFinalScore = () => {
    const baseScore = progress.value * 10
    const treasureBonus = treasuresFound.value * 100
    const timeBonus = Math.max(0, 1000 - gameDuration.value)
    return baseScore + treasureBonus + timeBonus
  }

  const addLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }
    gameLog.value.push(logEntry)

    // 限制日志数量
    if (gameLog.value.length > 100) {
      gameLog.value = gameLog.value.slice(-100)
    }
  }

  // 用户管理
  const login = (username) => {
    // 简化的登录逻辑，只需要用户名
    if (username) {
      isLoggedIn.value = true
      currentUser.value = { username, loginTime: Date.now() }
      addLog(`👋 欢迎回来，${username}！`, 'success')
      return true
    }
    return false
  }

  const logout = () => {
    isLoggedIn.value = false
    currentUser.value = null
    addLog('👋 已退出登录', 'info')
  }

  const register = (username, password) => {
    // 简单的注册逻辑
    if (username && password) {
      addLog(`🎉 注册成功！欢迎，${username}！`, 'success')
      return login(username)
    }
    return false
  }

  // 统计数据管理
  const saveStatistics = () => {
    localStorage.setItem('treasureHuntStatistics', JSON.stringify(gameStatistics.value))
  }

  const loadStatistics = () => {
    const savedStats = localStorage.getItem('treasureHuntStatistics')
    if (savedStats) {
      gameStatistics.value = JSON.parse(savedStats)
      return true
    }
    return false
  }

  const resetStatistics = () => {
    gameStatistics.value = {
      totalGames: 0,
      treasuresFoundTotal: 0,
      totalScore: 0,
      highestScore: 0,
      perfectRuns: 0,
      averageTime: 0,
      lastPlayDate: null
    }
    saveStatistics()
    addLog('📊 统计数据已重置', 'info')
  }

  // 存档管理
  const saveGame = () => {
    const gameData = {
      gameActive: gameActive.value,
      currentLocation: currentLocation.value,
      progress: progress.value,
      inventory: inventory.value,
      gameLog: gameLog.value,
      treasuresFound: treasuresFound.value,
      currentStage: currentStage.value,
      visitedLocations: Array.from(visitedLocations.value),
      gameStartTime: gameStartTime.value
    }
    
    localStorage.setItem('treasureHuntSave', JSON.stringify(gameData))
    addLog('💾 游戏已保存', 'success')
  }

  const loadGame = () => {
    const savedData = localStorage.getItem('treasureHuntSave')
    if (savedData) {
      const gameData = JSON.parse(savedData)
      
      gameActive.value = gameData.gameActive
      currentLocation.value = gameData.currentLocation
      progress.value = gameData.progress
      inventory.value = gameData.inventory
      gameLog.value = gameData.gameLog
      treasuresFound.value = gameData.treasuresFound
      currentStage.value = gameData.currentStage
      visitedLocations.value = new Set(gameData.visitedLocations)
      gameStartTime.value = gameData.gameStartTime
      
      addLog('📂 游戏已加载', 'success')
      return true
    }
    return false
  }

  const initialize = () => {
    // 初始化游戏状态
    loadStatistics()  // 加载统计数据
    addLog('🎮 游戏系统初始化完成', 'info')
  }

  // 导出所有状态和方法
  // 全局音乐管理方法
  const stopGlobalMusic = () => {
    console.log('🔇 stopGlobalMusic 被调用')
    
    // 停止正在播放的音乐
    if (globalAudio.value) {
      console.log('🔇 停止正在播放的音乐:', currentPlayingLocation.value)
      globalAudio.value.pause()
      globalAudio.value.currentTime = 0
      globalAudio.value = null
    }
    
    // 停止待处理的音乐
    if (pendingAudio.value) {
      console.log('🔇 停止待处理的音乐对象')
      pendingAudio.value.pause()
      pendingAudio.value.currentTime = 0
      pendingAudio.value = null
    }
    
    // 重置状态
    currentPlayingLocation.value = null
    isMusicPlaying.value = false
    console.log('🔇 音乐已停止，状态已重置')
    
    if (!globalAudio.value && !pendingAudio.value) {
      console.log('🔇 确认所有音频对象已清理')
    }
  }

  const playLocationMusic = (locationId, musicFile) => {
    console.log('🎵 playLocationMusic 被调用:', locationId, musicFile)
    
    // 如果已经在播放相同地点的音乐，不需要重新播放
    if (currentPlayingLocation.value === locationId && isMusicPlaying.value) {
      console.log('🎵 相同地点音乐已在播放，跳过')
      return
    }

    // 停止当前播放的音乐
    stopGlobalMusic()

    if (!musicFile) {
      addLog('该地点暂无背景音乐', 'info')
      return
    }

    try {
      console.log('🎵 创建新的音频对象')
      const audio = new Audio(musicFile)
      audio.loop = true
      audio.volume = 0.5
      
      // 先将音频对象存储到pendingAudio
      pendingAudio.value = audio
      console.log('🎵 音频对象已存储到pendingAudio')
      
      audio.addEventListener('canplay', () => {
        console.log('🎵 音频可以播放，开始播放')
        if (pendingAudio.value === audio) { // 确保这是当前待播放的音频
          audio.play()
          globalAudio.value = audio
          pendingAudio.value = null // 清除待处理状态
          currentPlayingLocation.value = locationId
          isMusicPlaying.value = true
          addLog(`🎵 开始播放背景音乐`, 'success')
          console.log('🎵 音乐播放成功，状态已更新')
        } else {
          console.log('🎵 音频对象已过期，停止播放')
          audio.pause()
        }
      })
      
      audio.addEventListener('error', (e) => {
        console.log('🎵 音频加载错误:', e)
        addLog('音乐文件加载失败', 'warning')
        if (pendingAudio.value === audio) {
          pendingAudio.value = null
        }
        stopGlobalMusic()
      })
      
    } catch (error) {
      console.log('🎵 播放音乐异常:', error)
      addLog('播放音乐时出错', 'warning')
      stopGlobalMusic()
    }
  }

  const pauseGlobalMusic = () => {
    if (globalAudio.value && isMusicPlaying.value) {
      globalAudio.value.pause()
      isMusicPlaying.value = false
      addLog('🔇 音乐已暂停', 'info')
    }
  }

  const resumeGlobalMusic = () => {
    if (globalAudio.value && !isMusicPlaying.value) {
      globalAudio.value.play()
      isMusicPlaying.value = true
      addLog('🔊 音乐已恢复', 'info')
    }
  }

  return {
    // 状态
    gameActive,
    currentLocation,
    progress,
    inventory,
    gameLog,
    treasuresFound,
    currentStage,
    visitedLocations,
    isLoggedIn,
    currentUser,
    leaderboard,
    choiceDialog,
    locations,
    items,
    gameStatistics,
    
    // 计算属性
    isGameActive,
    currentLocationData,
    gameProgress,
    progressPercent,
    userInventory,
    logEntries,
    treasureCount,
    gameDuration,
    
    // 核心游戏方法
    startGame,
    continueGame,
    resetGame,
    startJourney,
    exploreLibrary,
    exploreForest,
    crossRiver,
    visitWaterfall,
    visitVillage,
    climbMountain,
    exploreCave,
    crossDesert,
    exploreCoast,
    searchTemple,
    openTreasureBox,
    
    // 交互方法
    showChoices,
    handleChoiceSelected,
    closeChoiceDialog,
    returnToLastChoice,
    
    // 物品管理
    addToInventory,
    removeFromInventory,
    hasItem,
    
    // 进度管理
    updateProgress,
    completeGame,
    calculateFinalScore,
    addLog,
    hasVisitedCoreLocations,
    moveToLocation,
    
    // 特效
    createTreasureEffects,
    createVictoryEffects,
    delay,
    
    // 用户管理
    login,
    logout,
    register,
    
    // 存档管理
    saveGame,
    loadGame,
    initialize,
    
    // 统计数据管理
    saveStatistics,
    loadStatistics,
    resetStatistics,
    
    // 全局音乐管理
    stopGlobalMusic,
    playLocationMusic,
    pauseGlobalMusic,
    resumeGlobalMusic,
    globalAudio,
    currentPlayingLocation,
    isMusicPlaying,
    
    // 状态数据
    lastChoiceState
  }
})