const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const AppUpdater = require('./updater');

let mainWindow;
let serverProcess;
let appUpdater;

// 设置应用数据路径
const userDataPath = path.join(process.resourcesPath, 'databaseFolder');
app.setPath('userData', userDataPath);

// 确保必要的目录存在
function ensureDirectoriesExist() {
  const directories = [
    userDataPath,
    path.join(userDataPath, 'uploads'),
    path.join(userDataPath, 'sessions'),
    path.join(userDataPath, 'logs')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.warn(`无法创建目录 ${dir}:`, err.message);
      }
    }
  });
}

// 在应用启动时立即创建目录
ensureDirectoriesExist();

app.whenReady().then(async () => {
  // 设置 session 存储路径
  const sessionPath = path.join(process.resourcesPath, 'databaseFolder', 'sessions');
  session.defaultSession.setPreloads([path.join(__dirname, 'preload.js')]);

  // 在开发环境中彻底清除所有缓存和存储数据
  if (process.env.ELECTRON_DEV) {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData({
      storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
    });
    console.log('已清除开发环境所有缓存和存储数据');
  }

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
      session: persistentSession,
      // 在开发环境中禁用缓存
      cache: !process.env.ELECTRON_DEV
    }
  });

  // 启动 Express 服务器
  serverApp.listen(PORT, () => {
  });

  // 加载应用
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // 初始化自动更新器
  if (!process.env.ELECTRON_DEV) {
    appUpdater = new AppUpdater(mainWindow);
    appUpdater.startPeriodicChecks();
  }

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

// IPC通信处理更新操作
ipcMain.handle('check-for-updates', async () => {
  if (appUpdater) {
    await appUpdater.checkForUpdatesManually();
  }
});

ipcMain.handle('download-update', () => {
  if (appUpdater) {
    appUpdater.downloadUpdate();
  }
});

ipcMain.handle('install-update', () => {
  if (appUpdater) {
    appUpdater.installUpdate();
  }
}); 