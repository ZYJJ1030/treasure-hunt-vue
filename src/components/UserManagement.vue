<template>
  <div class="user-modal" @click.self="$emit('close')">
    <div class="user-content fade-in">
      <div class="user-header">
        <h2>👤 用户管理</h2>
        <button class="close-btn" @click="$emit('close')">
          ✕ 返回
        </button>
      </div>
      
      <!-- 登录/注册切换 -->
      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>
      
      <!-- 登录表单 -->
      <div v-if="activeTab === 'login'" class="auth-form">
        <div class="form-group">
          <label for="login-username">用户名：</label>
          <input 
            id="login-username"
            v-model="loginForm.username"
            type="text" 
            placeholder="请输入用户名"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="login-password">密码：</label>
          <input 
            id="login-password"
            v-model="loginForm.password"
            type="password" 
            placeholder="请输入密码"
            class="form-input"
          >
        </div>
        
        <button 
          class="btn btn-primary" 
          @click="handleLogin"
          :disabled="!loginForm.username || !loginForm.password"
        >
          🔑 登录
        </button>
        
        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>
      </div>
      
      <!-- 注册表单 -->
      <div v-else class="auth-form">
        <div class="form-group">
          <label for="register-username">用户名：</label>
          <input 
            id="register-username"
            v-model="registerForm.username"
            type="text" 
            placeholder="请输入用户名（3-12位）"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="register-password">密码：</label>
          <input 
            id="register-password"
            v-model="registerForm.password"
            type="password" 
            placeholder="请输入密码（6-20位）"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="register-confirm">确认密码：</label>
          <input 
            id="register-confirm"
            v-model="registerForm.confirmPassword"
            type="password" 
            placeholder="请再次输入密码"
            class="form-input"
          >
        </div>
        
        <button 
          class="btn btn-primary" 
          @click="handleRegister"
          :disabled="!isRegisterFormValid"
        >
          📝 注册
        </button>
        
        <div v-if="registerError" class="error-message">
          {{ registerError }}
        </div>
        
        <div v-if="registerSuccess" class="success-message">
          注册成功！请登录开始游戏。
        </div>
      </div>
      
      <!-- 用户信息显示 -->
      <div v-if="currentUser" class="user-info">
        <div class="user-card">
          <div class="user-avatar">
            {{ getAvatarEmoji(currentUser.username) }}
          </div>
          <div class="user-details">
            <h3>{{ currentUser.username }}</h3>
            <p>最高分数：{{ currentUser.highScore || 0 }}</p>
            <p>游戏次数：{{ currentUser.gameCount || 0 }}</p>
            <p>注册时间：{{ formatDate(currentUser.createdAt) }}</p>
          </div>
        </div>
        
        <div class="user-actions">
          <button class="btn btn-secondary" @click="handleLogout">
            🚪 退出登录
          </button>
          <button class="btn btn-danger" @click="handleDeleteAccount" v-if="!showDeleteConfirm">
            🗑️ 删除账号
          </button>
          
          <div v-if="showDeleteConfirm" class="delete-confirm">
            <p>确定要删除账号吗？此操作不可撤销！</p>
            <div class="confirm-actions">
              <button class="btn btn-danger" @click="confirmDeleteAccount">
                ✅ 确认删除
              </button>
              <button class="btn btn-secondary" @click="showDeleteConfirm = false">
                ❌ 取消
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 游戏统计 -->
      <div v-if="currentUser" class="game-stats">
        <h4>🎮 游戏统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ currentUser.highScore || 0 }}</span>
            <span class="stat-label">最高分数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentUser.gameCount || 0 }}</span>
            <span class="stat-label">游戏次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentUser.totalProgress || 0 }}</span>
            <span class="stat-label">总进度</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentUser.treasuresFound || 0 }}</span>
            <span class="stat-label">找到宝藏</span>
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
const activeTab = ref('login')
const loginForm = ref({
  username: '',
  password: ''
})
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})
const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref(false)
const showDeleteConfirm = ref(false)

// 计算属性
const currentUser = computed(() => gameStore.currentUser)

const isRegisterFormValid = computed(() => {
  const { username, password, confirmPassword } = registerForm.value
  return username.length >= 3 && 
         username.length <= 12 &&
         password.length >= 6 && 
         password.length <= 20 &&
         password === confirmPassword
})

// 生命周期
onMounted(() => {
  // 如果已有用户登录，显示用户信息
  if (currentUser.value) {
    activeTab.value = 'user'
  }
})

// 方法
const getAvatarEmoji = (username) => {
  const emojis = ['👤', '👨', '👩', '🧙', '🦸', '🧝', '🧚', '🐱', '🐶', '🐼']
  const index = username.length % emojis.length
  return emojis[index]
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleLogin = async () => {
  try {
    loginError.value = ''
    
    // 模拟登录验证
    const users = JSON.parse(localStorage.getItem('treasureGameUsers') || '[]')
    const user = users.find(u => 
      u.username === loginForm.value.username && 
      u.password === loginForm.value.password
    )
    
    if (user) {
      // 登录成功 - 使用gameStore的login方法
      gameStore.login(user.username)
      gameStore.addLog(`欢迎回来，${user.username}！`)
      
      // 清空表单
      loginForm.value = { username: '', password: '' }
      
      // 延迟关闭弹窗
      setTimeout(() => {
        emit('close')
      }, 1000)
    } else {
      loginError.value = '用户名或密码错误'
    }
  } catch (error) {
    loginError.value = '登录失败，请重试'
  }
}

const handleRegister = async () => {
  try {
    registerError.value = ''
    registerSuccess.value = false
    
    const { username, password } = registerForm.value
    
    // 检查用户名是否已存在
    const users = JSON.parse(localStorage.getItem('treasureGameUsers') || '[]')
    const existingUser = users.find(u => u.username === username)
    
    if (existingUser) {
      registerError.value = '用户名已存在'
      return
    }
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      highScore: 0,
      gameCount: 0,
      totalProgress: 0,
      treasuresFound: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    
    // 保存用户
    users.push(newUser)
    localStorage.setItem('treasureGameUsers', JSON.stringify(users))
    
    // 注册成功后自动登录
    gameStore.login(username)
    gameStore.addLog(`🎉 新用户 ${username} 注册成功！开始你的冒险吧！`, 'success')
    
    registerSuccess.value = true
    
    // 清空表单
    registerForm.value = { username: '', password: '', confirmPassword: '' }
    
    // 延迟关闭弹窗
    setTimeout(() => {
      emit('close')
    }, 2000)
    
  } catch (error) {
    registerError.value = '注册失败，请重试'
  }
}

const handleLogout = () => {
  gameStore.logout()
  gameStore.addLog('已退出登录')
  activeTab.value = 'login'
}

const handleDeleteAccount = () => {
  showDeleteConfirm.value = true
}

const confirmDeleteAccount = () => {
  try {
    const users = JSON.parse(localStorage.getItem('treasureGameUsers') || '[]')
    const filteredUsers = users.filter(u => u.id !== currentUser.value.id)
    
    localStorage.setItem('treasureGameUsers', JSON.stringify(filteredUsers))
    
    gameStore.logout()
    gameStore.addLog('账号已删除')
    
    showDeleteConfirm.value = false
    activeTab.value = 'login'
    
  } catch (error) {
    registerError.value = '删除账号失败'
  }
}
</script>

<style scoped>
.user-modal {
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

.user-content {
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #FFFDE4 60%, #FFD700 100%);
  padding: 2.5em 2em;
  border-radius: 32px;
  box-shadow: var(--cartoon-shadow);
  border: var(--cartoon-border);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
  gap: 1em;
}

.user-header h2 {
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

.auth-tabs {
  display: flex;
  gap: 0.5em;
  margin-bottom: 2em;
  background: rgba(255, 248, 220, 0.8);
  padding: 0.5em;
  border-radius: 16px;
}

.tab-btn {
  flex: 1;
  padding: 0.8em 1em;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #FFD700;
  color: #4B3F1D;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.form-group label {
  font-weight: bold;
  color: #4B3F1D;
}

.form-input {
  padding: 0.8em 1em;
  border: 2px solid #FFD700;
  border-radius: 12px;
  font-size: 1em;
  background: #FFFDE4;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 8px rgba(255, 152, 0, 0.3);
}

.error-message {
  background: #FFEBEE;
  color: #F44336;
  padding: 0.8em 1em;
  border-radius: 8px;
  border: 2px solid #F44336;
  font-weight: bold;
}

.success-message {
  background: #E8F5E8;
  color: #4CAF50;
  padding: 0.8em 1em;
  border-radius: 8px;
  border: 2px solid #4CAF50;
  font-weight: bold;
}

.user-info {
  margin: 2em 0;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1.5em;
  background: rgba(255, 248, 220, 0.8);
  padding: 1.5em;
  border-radius: 20px;
  border: 2px solid #FFD700;
}

.user-avatar {
  font-size: 3em;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFD700;
  border-radius: 50%;
  border: 3px solid #FF9800;
}

.user-details h3 {
  margin: 0 0 0.5em 0;
  color: #FF9800;
  font-size: 1.4em;
}

.user-details p {
  margin: 0.3em 0;
  color: #4B3F1D;
}

.user-actions {
  display: flex;
  gap: 1em;
  margin-top: 1em;
  flex-wrap: wrap;
}

.delete-confirm {
  background: #FFEBEE;
  padding: 1em;
  border-radius: 12px;
  border: 2px solid #F44336;
  margin-top: 1em;
}

.delete-confirm p {
  margin: 0 0 1em 0;
  color: #F44336;
  font-weight: bold;
}

.confirm-actions {
  display: flex;
  gap: 1em;
}

.game-stats {
  margin-top: 2em;
}

.game-stats h4 {
  color: #FF9800;
  margin-bottom: 1em;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
}

.stat-item {
  background: rgba(255, 248, 220, 0.8);
  padding: 1em;
  border-radius: 16px;
  text-align: center;
  border: 2px solid #FFD700;
}

.stat-value {
  display: block;
  font-size: 1.8em;
  font-weight: bold;
  color: #FF9800;
}

.stat-label {
  font-size: 0.9em;
  color: #4B3F1D;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-modal {
    padding: 1em;
  }
  
  .user-content {
    padding: 1.5em 1em;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-header h2 {
    font-size: 1.8em;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .auth-tabs {
    flex-direction: column;
  }
  
  .user-actions {
    flex-direction: column;
  }
  
  .confirm-actions {
    flex-direction: column;
  }
}
</style>