# 🚀 项目部署指南 - 寻宝冒险游戏

## 📋 部署到 GitHub Pages 完整流程

### 1. 准备工作

#### 创建 GitHub 仓库
1. 访问 [GitHub](https://github.com) 并登录
2. 点击 "New repository" 创建新仓库
3. 仓库名: `treasure-hunt-vue` (或其他您喜欢的名称)
4. 描述: "A Vue.js based treasure hunt adventure game"
5. 选择 Public (公开)
6. 不勾选 "Initialize this repository with a README"

#### 配置本地 Git
```bash
# 初始化 Git
git init

# 添加远程仓库
git remote add origin https://github.com/您的用户名/treasure-hunt-vue.git
```

### 2. 创建部署配置文件

#### GitHub Actions 工作流
创建 `.github/workflows/deploy.yml` 文件来自动化部署。

#### 环境变量配置
在 GitHub 仓库设置中添加必要的环境变量。

### 3. 部署步骤

#### 第一次部署
```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "初始提交: 寻宝冒险游戏项目"

# 推送到 GitHub
git push -u origin main
```

#### 自动部署
推送代码后，GitHub Actions 会自动构建并部署到 GitHub Pages。

### 4. 访问项目

部署完成后，您的项目将通过以下网址访问：
`https://您的用户名.github.io/treasure-hunt-vue/`

## ⚙️ 技术配置详情

### 构建配置 (vite.config.js)
项目已配置为支持 GitHub Pages 部署：
- 基础路径: `/treasure-hunt-vue/`
- 资源路径: 相对路径
- 构建优化: 启用 gzip 压缩和代码分割

### 路由配置
使用 Hash 模式路由确保在 GitHub Pages 上正常工作。

## 🛠️ 故障排除

### 常见问题
1. **页面空白**: 检查基础路径配置
2. **资源加载失败**: 确认资源路径为相对路径
3. **路由问题**: 确保使用 Hash 模式

### 重新部署
如果部署失败，可以手动触发工作流：
1. 访问 GitHub 仓库的 "Actions" 标签页
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow"

## 📞 支持

如果遇到任何部署问题，请检查：
1. GitHub Actions 日志
2. 浏览器控制台错误信息
3. 项目配置文件中路径设置

---
**祝您部署顺利！** 🎉