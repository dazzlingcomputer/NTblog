# 个人博客 - Cloudflare Pages 部署指南

## 简介

这是一个现代化的个人博客系统，支持文章管理、用户认证、音乐播放、GitHub数据同步等功能。本指南将帮助你在 Cloudflare Pages 上部署此博客。

## 功能特色

- ✨ **现代化界面** - 支持亮色/暗色主题，动画流畅
- 📝 **富文本编辑** - Markdown 编辑器，代码高亮，复制功能
- 👥 **用户系统** - 注册登录，人机验证，权限管理
- 💬 **评论系统** - 支持登录评论，管理员审核
- 🎵 **音乐播放** - 背景音乐，自动播放设置
- 🎨 **自定义背景** - 支持上传自定义壁纸
- 🔗 **社交链接** - 支持多种社交平台
- 💾 **GitHub 同步** - 数据备份到 GitHub 仓库
- 📱 **响应式设计** - 完美适配移动端

## 部署步骤

### 1. 准备工作

确保你已经有以下账号：
- [GitHub 账号](https://github.com)
- [Cloudflare 账号](https://cloudflare.com)

### 2. 代码仓库设置

1. 将博客代码推送到你的 GitHub 仓库
2. 确保仓库是 public 或者 Cloudflare 有访问权限

### 3. Cloudflare Pages 部署

1. **登录 Cloudflare Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 选择 "Pages" 服务

2. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 连接你的 GitHub 账号
   - 选择博客项目仓库

3. **配置构建设置**
   ```
   Framework preset: None (或选择 React)
   Build command: npm run build:cloudflare
   Build output directory: dist
   Root directory: /
   ```

4. **环境变量设置**（可选）
   如果需要，可以设置以下环境变量：
   ```
   NODE_VERSION=18
   NPM_VERSION=8
   ```

5. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（通常需要3-5分钟）

### 4. 自定义域名（可选）

1. 在 Cloudflare Pages 项目设置中
2. 选择 "Custom domains"
3. 添加你的域名
4. 按照提示配置 DNS 记录

## 项目配置

### GitHub 数据同步设置

1. **创建 GitHub Personal Access Token**
   - 访问 GitHub Settings > Developer settings > Personal access tokens
   - 创建新 token，勾选 `repo` 权限
   - 保存 token（只显示一次）

2. **在博客中配置**
   - 登录管理员账号
   - 进入 "数据同步" 页面
   - 填写 GitHub 配置信息：
     - 仓库所有者：你的 GitHub 用户名
     - 仓库名称：存储博客数据的仓库名
     - 分支名称：main 或 master
     - 访问令牌：刚创建的 Personal Access Token

3. **同步数据**
   - 配置完成后，可以手动同步数据到 GitHub
   - 定期备份，防止数据丢失

### 音乐功能设置

1. **上传音乐文件**
   - 管理员登录后，进入 "音乐管理"
   - 点击 "上传音乐" 上传音频文件
   - 支持 MP3、WAV 等常见格式

2. **配置播放设置**
   - 在 "网站设置" 中配置音乐播放选项
   - 设置自动播放条件和播放模式

### 自定义背景

1. **上传壁纸**
   - 在 "网站设置" > "背景设置" 中
   - 点击 "上传壁纸" 上传图片
   - 选择图片作为当前背景

## 技术架构

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **编辑器**: @uiw/react-md-editor
- **代码高亮**: react-syntax-highlighter
- **状态管理**: React Context + useReducer
- **数据存储**: localStorage + GitHub API
- **部署平台**: Cloudflare Pages

## 默认管理员账号

- **用户名**: xdazzl
- **密码**: czl737476534?!

⚠️ **重要**: 部署后请立即修改默认密码！

## 注意事项

1. **数据持久化**: 数据存储在 localStorage 中，建议定期同步到 GitHub
2. **文件上传**: 音乐和图片文件通过 Object URL 存储，重新部署后会丢失
3. **生产环境**: 建议使用 GitHub 同步功能进行数据备份
4. **安全性**: 管理员密码请使用强密码，启用人机验证

## 故障排除

### 构建失败
- 检查 Node.js 版本是否为 18+
- 确保所有依赖都已正确安装
- 查看构建日志中的具体错误信息

### 页面加载问题
- 确保 `_redirects` 文件已正确复制到 dist 目录
- 检查 Cloudflare Pages 的路由配置

### GitHub 同步失败
- 验证 Personal Access Token 权限
- 确保仓库存在且有写入权限
- 检查网络连接和 API 限制

## 技术支持

如遇问题，可以：
1. 查看浏览器控制台错误信息
2. 检查 Cloudflare Pages 构建日志
3. 参考 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

---

© 2025 个人博客系统. Built with ❤️ by MiniMax Agent.
