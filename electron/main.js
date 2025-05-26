const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

// 设置应用数据路径
const userDataPath = path.join(process.resourcesPath, 'databaseFolder');
app.setPath('userData', userDataPath);

// 确保必要的目录存在
function ensureDirectoriesExist() {
  const directories = [
    userDataPath,
    path.join(userDataPath, 'uploads'),
    path.join(userDataPath, 'sessions')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
      }
    }
  });
}

// 在应用启动时立即创建目录
ensureDirectoriesExist();

app.whenReady().then(() => {
  // 设置 session 存储路径
  const sessionPath = path.join(process.resourcesPath, 'databaseFolder', 'sessions');
  session.defaultSession.setPreloads([path.join(__dirname, 'preload.js')]);

  const { app: serverApp, PORT } = require('../app');

  // 创建持久化的 session
  const persistentSession = session.fromPartition('persist:main', {
    cache: true
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // 使用持久化的 session
      session: persistentSession
    }
  });

  // 启动 Express 服务器
  serverApp.listen(PORT, () => {
  });

  // 加载应用
  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
}); 