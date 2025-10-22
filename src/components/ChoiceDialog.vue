<template>
  <div v-if="visible" class="choice-dialog-overlay" @click="closeDialog">
    <div class="choice-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeDialog">×</button>
      </div>
      <div class="dialog-content">
        <p>{{ message }}</p>
        <div class="choices-container">
          <button 
            v-for="(choice, index) in choices" 
            :key="index"
            class="choice-btn"
            @click="selectChoice(choice.value)"
            :class="{ 'selected': selectedChoice === choice.value }"
          >
            {{ choice.label }}
          </button>
        </div>
      </div>
      <div class="dialog-footer">
        <button 
          v-if="showReturnButton" 
          class="return-btn" 
          @click="returnToPrevious"
        >
          返回上一步
        </button>
        <button class="confirm-btn" @click="confirmChoice" :disabled="!selectedChoice">
          确认选择
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

const props = defineProps({
  visible: Boolean,
  title: {
    type: String,
    default: '请做出选择'
  },
  message: {
    type: String,
    default: ''
  },
  choices: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['choice-selected', 'close'])

const selectedChoice = ref(null)

// 计算是否显示返回按钮
const showReturnButton = computed(() => {
  return gameStore.lastChoiceState.hasLastChoice
})

const selectChoice = (choiceValue) => {
  selectedChoice.value = choiceValue
}

const confirmChoice = () => {
  if (selectedChoice.value) {
    emit('choice-selected', selectedChoice.value)
    closeDialog()
  }
}

const closeDialog = () => {
  selectedChoice.value = null
  emit('close')
}

const returnToPrevious = () => {
  selectedChoice.value = null
  gameStore.returnToLastChoice()
}
</script>

<style scoped>
.choice-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.choice-dialog {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.dialog-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dialog-header h3 {
  margin: 0;
  color: white;
  font-size: 1.5em;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2em;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.dialog-content {
  padding: 30px;
}

.dialog-content p {
  color: white;
  font-size: 1.1em;
  margin-bottom: 25px;
  line-height: 1.6;
  text-align: center;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.choice-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
  text-align: left;
}

.choice-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.choice-btn.selected {
  background: rgba(255, 255, 255, 0.3);
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.dialog-footer {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.return-btn {
  background: linear-gradient(45deg, #6c757d, #adb5bd);
  border: none;
  color: white;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.return-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(108, 117, 125, 0.3);
}

.confirm-btn {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  color: #333;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
}

.confirm-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(50px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .choice-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .dialog-content {
    padding: 20px;
  }
  
  .choice-btn {
    padding: 12px 15px;
    font-size: 0.95em;
  }
}
</style>