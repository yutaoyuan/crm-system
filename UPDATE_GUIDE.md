# CRM系统自动更新功能 - 完整操作指南

## 1. 安全提醒

**⚠️ 重要：请立即更改您的GitHub密码！**

由于您在公开场合分享了密码，建议立即：
1. 登录GitHub并更改密码
2. 启用双重验证（2FA）
3. 检查账号是否有异常登录

## 2. GitHub仓库设置

### 2.1 创建GitHub仓库

1. 访问 https://github.com 并登录您的账号
2. 点击右上角 "+" → "New repository"
3. 仓库设置：
   - Repository name: `crm-system`
   - Description: `客户资料管理系统(CRM) - Electron桌面应用`
   - Visibility: Public（推荐，免费使用GitHub Actions）
   - Initialize this repository with: 勾选 "Add a README file"

### 2.2 配置仓库权限

1. 进入新创建的仓库
2. 点击 "Settings" → "Actions" → "General"
3. 在 "Workflow permissions" 部分：
   - 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

## 3. 本地项目配置

### 3.1 初始化Git仓库

在项目根目录执行：

```bash
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
```

### 3.2 安装更新依赖

```bash
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

### 3.3 首次提交代码

```bash
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

## 4. 发布和更新流程

### 4.1 准备发布新版本

1. **开发完成新功能**
2. **测试功能**确保稳定性
3. **更新版本号**：
   ```bash
   # 补丁版本（bug修复）
   npm version patch
   
   # 次要版本（新功能）
   npm version minor
   
   # 主要版本（重大更新）
   npm version major
   ```

### 4.2 发布到GitHub Releases

```bash
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

### 4.3 自动构建流程

1. **推送标签后**，GitHub Actions会自动：
   - 在Windows、macOS、Linux上构建应用
   - 创建GitHub Release
   - 上传安装包

2. **监控构建状态**：
   - 访问仓库的 "Actions" 标签页
   - 查看构建进度和日志

## 5. 客户端更新体验

### 5.1 自动更新检查

- **启动检查**：应用启动30秒后自动检查更新
- **定期检查**：每4小时检查一次更新
- **手动检查**：用户可以手动触发更新检查

### 5.2 更新流程

1. **检查更新** → 显示"正在检查更新..."
2. **发现更新** → 弹出更新通知，显示版本信息
3. **用户确认** → 选择"立即下载"或"稍后提醒"
4. **下载更新** → 显示下载进度
5. **安装更新** → 用户确认后重启应用安装

### 5.3 用户界面

更新通知会以优雅的方式显示在应用右上角，包含：
- 📱 版本信息
- 📋 更新内容
- ⬇️ 下载进度
- ✅ 操作按钮

## 6. 测试更新功能

### 6.1 本地测试

```bash
# 启动应用（生产模式）
NODE_ENV=production npm run electron

# 检查更新功能是否正常工作
```

### 6.2 发布测试版本

```bash
# 创建测试版本
npm version prerelease --preid=beta

# 推送测试版本
git push origin main --follow-tags
```

## 7. 故障排除

### 7.1 常见问题

**问题1：GitHub Actions构建失败**
- 检查构建日志找出具体错误
- 确认GitHub Actions权限设置正确

**问题2：客户端无法检查更新**
- 检查网络连接
- 确认GitHub仓库为公开状态
- 验证package.json中的仓库地址

**问题3：下载更新失败**
- 检查GitHub Release是否存在
- 确认安装包文件完整
- 检查客户端网络权限

### 7.2 调试模式

在开发环境中启用更新调试：

```javascript
// 在main.js中添加
if (process.env.ELECTRON_DEV) {
  // 开发环境下也启用更新功能（测试用）
  appUpdater = new AppUpdater(mainWindow);
}
```

## 8. 版本管理策略

### 8.1 版本号规范

采用语义化版本控制（Semantic Versioning）：
- **主版本号**：不兼容的API修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 8.2 发布渠道

- **stable**（正式版）：`v1.0.0`
- **beta**（测试版）：`v1.0.0-beta.1`
- **alpha**（内测版）：`v1.0.0-alpha.1`

## 9. 后续优化建议

1. **添加更新日志**：创建CHANGELOG.md文件
2. **增量更新**：减少下载大小
3. **回滚机制**：支持版本回退
4. **更新统计**：收集更新成功率数据
5. **离线支持**：提供离线安装包

---

## 快速开始检查清单

- [ ] 更改GitHub密码并启用2FA
- [ ] 创建GitHub仓库 `crm-system`
- [ ] 配置仓库Actions权限
- [ ] 推送代码到GitHub
- [ ] 创建第一个版本标签
- [ ] 验证自动构建功能
- [ ] 测试客户端更新功能

完成以上步骤后，您的CRM系统就具备了完整的自动更新功能！

## 联系支持

如果在配置过程中遇到问题，可以：
1. 查看GitHub Actions构建日志
2. 检查electron-updater文档
3. 验证网络连接和权限设置

祝您使用愉快！🎉
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-uparter --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p12
*.p12
EOF
```

```
# 安装electron-updater
npm install electron-updater --save-dev

# 验证安装
npm list electron-updater
```

```
# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: CRM系统基础代码"

# 推送到GitHub
git push -u origin main
```

```
# 补丁版本（bug修复）
npm version patch
   
# 次要版本（新功能）
npm version minor
   
# 主要版本（重大更新）
npm version major
```

```
# 推送代码和标签
git push origin main
git push origin --tags

# 或者一条命令推送所有
git push origin main --follow-tags
```

```
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/yutaoyuan/crm-system.git

# 创建.gitignore文件
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
certs/*.p