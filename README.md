# CRM客户资料管理系统

> 一个功能完整的客户关系管理（CRM）桌面应用程序，基于Electron开发，支持自动更新功能。

## 🌟 功能特性

### 核心功能
- 📋 **客户信息管理** - 完整的客户档案管理
- 💰 **销售记录管理** - 销售数据记录与统计
- 🎯 **积分系统管理** - 客户积分累积与兑换
- 📞 **拜访记录管理** - 客户回访记录跟踪
- 👥 **用户认证系统** - 安全的登录与权限控制

### 技术特性
- 🔄 **自动更新** - 基于GitHub Releases的无缝更新
- 💾 **本地数据库** - SQLite嵌入式数据库
- 🖥️ **跨平台支持** - Windows、macOS、Linux
- 📊 **数据导入导出** - 支持CSV、Excel格式
- 🔒 **安全防护** - 数据加密与安全传输

## 🚀 快速开始

### 环境要求
- Node.js >= 14.x
- npm >= 6.x
- Git

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yutaoyuan/crm-system.git
   cd crm-system
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **启动Electron应用**
   ```bash
   npm run electron
   ```

## 📦 构建和发布

### 本地构建
```bash
# 构建生产版本
npm run build

# 打包为安装程序
npm run pack
```

### 自动发布
```bash
# 发布新版本（自动构建和发布）
./release.sh patch   # 修复版本
./release.sh minor   # 功能版本  
./release.sh major   # 重大版本
```

## 🛠️ 技术栈

### 前端
- **HTML5 + CSS3** - 界面构建
- **原生JavaScript** - 业务逻辑
- **Ant Design风格** - UI设计规范

### 后端
- **Express.js** - Web服务框架
- **SQLite** - 嵌入式数据库
- **Knex.js** - SQL查询构建器

### 桌面端
- **Electron** - 跨平台桌面应用框架
- **electron-updater** - 自动更新功能
- **electron-builder** - 应用打包工具

### 安全与工具
- **Winston** - 日志管理
- **Helmet** - 安全中间件
- **Bcrypt** - 密码加密
- **JWT** - 身份验证

## 📋 项目结构

```
crm-system/
├── electron/              # Electron主进程
│   ├── main.js            # 应用入口
│   └── updater.js         # 自动更新模块
├── public/                # 前端资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── pages/             # HTML页面
├── routes/                # Express路由
├── middleware/            # 中间件
├── models/                # 数据模型
├── utils/                 # 工具函数
├── .github/workflows/     # GitHub Actions
└── build/                 # 构建配置
```

## 🔧 开发指南

### 开发命令
```bash
npm start          # 启动Express服务器
npm run dev        # 启动开发服务器（热重载）
npm run electron   # 启动Electron应用
npm run build      # 构建生产版本
npm test           # 运行测试（待添加）
```

### 数据库管理
```bash
npm run backup-db  # 备份数据库
npm run restore-db # 恢复数据库
```

## 📈 版本历史

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新历史。

## 🤝 贡献指南

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目链接：[https://github.com/yutaoyuan/crm-system](https://github.com/yutaoyuan/crm-system)
- 问题反馈：[Issues](https://github.com/yutaoyuan/crm-system/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

⭐ 如果这个项目对您有帮助，请给它一个Star！