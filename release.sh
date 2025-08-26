#!/bin/bash

# CRM系统快速发布脚本
# 使用方法: ./release.sh [patch|minor|major]

set -e

# 默认为patch版本
VERSION_TYPE=${1:-patch}

echo "🚀 开始发布新版本..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 检测到未提交的更改，请先提交或暂存更改"
    git status --short
    exit 1
fi

# 检查当前分支是否为main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ 请在main分支上执行发布操作"
    echo "当前分支: $CURRENT_BRANCH"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 更新版本号
echo "📝 更新版本号 ($VERSION_TYPE)..."
npm version $VERSION_TYPE --no-git-tag-version

# 获取新版本号
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ 新版本号: v$NEW_VERSION"

# 提交版本更改
echo "💾 提交版本更改..."
git add package.json package-lock.json
git commit -m "chore: bump version to v$NEW_VERSION"

# 创建标签
echo "🏷️  创建版本标签..."
git tag "v$NEW_VERSION"

# 推送代码和标签
echo "⬆️  推送到GitHub..."
git push origin main
git push origin "v$NEW_VERSION"

echo "🎉 发布完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 访问 https://github.com/rakyu-vip/crm-system/actions 查看构建状态"
echo "2. 构建完成后检查 https://github.com/rakyu-vip/crm-system/releases"
echo "3. 客户端将在30秒-4小时内收到更新通知"
echo ""
echo "🔗 版本信息:"
echo "   版本号: v$NEW_VERSION"
echo "   标签: v$NEW_VERSION"
echo "   提交: $(git rev-parse --short HEAD)"