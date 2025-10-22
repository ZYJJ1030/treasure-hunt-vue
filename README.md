# 🎮 寻宝冒险游戏 - Treasure Hunt Adventure

一个基于 Vue 3 + TypeScript + Pinia 构建的交互式寻宝冒险游戏。

## ✨ 功能特性

- 🗺️ 交互式游戏地图导航
- 📖 多分支剧情选择系统
- 🎒 物品收集与背包管理
- 🎵 智能背景音乐系统
- 👥 用户管理与游戏统计
- 💾 本地数据持久化存储
- 🏆 成就与排行榜系统

## 🚀 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 部署到 GitHub Pages

1. **创建 GitHub 仓库**
   - 在 GitHub 创建名为 `treasure-hunt-vue` 的仓库
   - 确保仓库设置为 Public

2. **初始化 Git 并推送代码**
   ```bash
   git init
   git add .
   git commit -m "初始提交"
   git branch -M main
   git remote add origin https://github.com/你的用户名/treasure-hunt-vue.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

4. **访问项目**
   - 部署完成后访问: `https://你的用户名.github.io/treasure-hunt-vue/`

## 📁 项目结构

```
src/
├── components/     # 可复用组件
├── pages/          # 页面组件
├── stores/         # 状态管理
├── router.js       # 路由配置
└── main.js         # 应用入口
```

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Pinia** - 下一代 Vue 状态管理
- **Vite** - 快速构建工具
- **Vue Router** - 官方路由管理器

## 📊 游戏特性

### 核心玩法
- 探索 10+ 个独特地点
- 解决谜题和做出选择
- 收集物品完成冒险
- 达成多种游戏结局

### 技术亮点
- 🎵 智能音乐切换系统
- 📱 响应式移动端适配
- 💾 本地存储数据持久化
- ⚡ 优化的性能表现

## 🔧 开发配置

项目已配置：
- GitHub Actions 自动部署
- 生产环境优化构建
- 相对路径资源引用
- Hash 模式路由兼容

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开始您的寻宝冒险吧！** 🎯