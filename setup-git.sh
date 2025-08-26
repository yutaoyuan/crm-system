#!/bin/bash

# Git仓库初始化脚本
# 使用方法: ./setup-git.sh

set -e

echo "🚀 开始初始化Git仓库..."

# 检查是否已经是Git仓库
if [ -d ".git" ]; then
    echo "ℹ️  已经是Git仓库，跳过初始化"
else
    echo "📁 初始化Git仓库..."
    git init
fi

# 检查是否已添加远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    echo "ℹ️  远程仓库已存在: $(git remote get-url origin)"
else
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/yutaoyuan/crm-system.git
fi

# 设置默认分支为main
echo "🌳 设置默认分支为main..."
git branch -M main

# 检查用户配置
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    echo "👤 请配置Git用户信息："
    echo "git config user.name \"您的姓名\""
    echo "git config user.email \"rakyu@vip.qq.com\""
    echo ""
    echo "或全局配置："
    echo "git config --global user.name \"您的姓名\""
    echo "git config --global user.email \"rakyu@vip.qq.com\""
    echo ""
    read -p "是否现在配置？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入您的姓名: " username
        git config user.name "$username"
        git config user.email "rakyu@vip.qq.com"
        echo "✅ 用户配置完成"
    fi
fi

# 检查是否有未跟踪的文件
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "📝 添加文件到Git..."
    git add .
    
    echo "💾 创建初始提交..."
    git commit -m "feat: 初始提交 - 添加自动更新功能的CRM系统

- 集成electron-updater自动更新功能
- 配置GitHub Actions自动构建和发布
- 添加更新通知UI组件
- 支持Windows、macOS、Linux多平台
- 包含完整的项目文档和配置文件"
    
    echo "✅ 初始提交完成"
else
    if [ -z "$(git log --oneline -1 2>/dev/null)" ]; then
        echo "📝 添加文件到Git..."
        git add .
        git commit -m "feat: 初始提交 - CRM系统基础代码"
        echo "✅ 初始提交完成"
    else
        echo "ℹ️  没有新的更改需要提交"
    fi
fi

echo ""
echo "🎉 Git仓库初始化完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 确保您已在GitHub上创建了 'crm-system' 仓库"
echo "2. 运行以下命令推送代码："
echo "   git push -u origin main"
echo ""
echo "3. 发布第一个版本："
echo "   ./release.sh patch"
echo ""
echo "4. 查看仓库状态："
echo "   git status"
echo "   git log --oneline -5"