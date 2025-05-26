# CRM 系统

客户资料管理系统 (Customer Relationship Management system)

## 安装与使用

### 环境要求

*   Node.js (版本 X.X.X 或更高)
*   npm (版本 X.X.X 或更高)

### 开发模式

1.  克隆仓库：
    ```bash
    git clone https://example.com/your-repo.git
    ```
2.  进入项目目录：
    ```bash
    cd crm
    ```
3.  安装依赖：
    ```bash
    npm install
    ```
4.  以开发模式运行应用：
    ```bash
    npm run dev
    ```
    Electron 开发模式：
    ```bash
    npm run electron
    ```

### 生产模式

1.  参照开发模式的步骤安装依赖。
2.  启动应用：
    ```bash
    npm start
    ```

## 项目结构

*   `electron/`: 包含 Electron 特定的代码，例如主进程文件 (`main.js`)。
*   `middleware/`: 包含 Express.js 路由的自定义中间件。
*   `models/`: 包含数据库相关文件，例如数据库结构定义和数据库连接设置。
*   `public/`: 包含前端静态资源，例如 HTML、CSS、JavaScript 文件和图片。
*   `routes/`: 包含 Express.js API 的路由定义。
*   `app.js`: Node.js Express 应用的主入口文件。
*   `package.json`: 列出项目依赖和脚本。

## 技术栈

*   **后端:** Node.js, Express.js
*   **前端:** HTML, CSS, JavaScript, Ant Design
*   **数据库:** SQLite (使用 `sqlite3` 和 `knex`)
*   **桌面应用框架:** Electron
*   **认证:** bcrypt (用于密码哈希), express-session, JSON Web Tokens (JWT)
*   **其他主要库:**
    *   `axios` 用于 HTTP 请求
    *   `cors` 用于跨域资源共享
    *   `csv-parser`, `exceljs`, `xlsx` 用于处理 CSV 和 Excel 文件
    *   `multer` 用于处理文件上传
    *   `morgan` 用于 HTTP 请求日志

## 项目构建

要构建生产环境的 Electron 应用，请运行以下命令：

```bash
npm run build
```

这将在 `dist/` 目录中生成打包好的应用。

如果想创建一个可分发版本但不运行完整的构建过程（用于测试打包过程），可以使用：
```bash
npm run pack
```
这也将在 `dist/` 目录中创建一个未打包的版本。有关构建配置的更多详细信息，请查看 `package.json` 中的 `build` 部分。

## 贡献代码

欢迎贡献！如果您想为项目做出贡献，请遵循以下通用指南：

1.  Fork 本仓库。
2.  为您的功能或错误修复创建一个新分支：
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  进行更改并使用清晰描述性的信息提交它们。
4.  将您的更改推送到您的 Fork 仓库。
5.  向主仓库的 `main` 或 `master` 分支创建一个拉取请求 (Pull Request)。

请确保您的代码遵循现有的编码风格，并在适用的情况下包含测试。
