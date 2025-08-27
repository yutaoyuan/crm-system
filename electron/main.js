const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;
let appUpdater;

// 设置应用数据路径
let userDataPath;
// 修改逻辑：使用 Electron 的用户数据目录，而不是应用资源目录
userDataPath = app.getPath('userData');
// 确保 databaseFolder 在用户数据目录中
userDataPath = path.join(userDataPath, 'databaseFolder');

console.log('应用用户数据路径:', userDataPath);
console.log('应用资源路径:', process.resourcesPath);

// 设置用户数据路径
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
        console.log('目录创建成功:', dir);
      } catch (err) {
        console.warn(`无法创建目录 ${dir}:`, err.message);
      }
    } else {
      console.log('目录已存在:', dir);
    }
  });
}

// 在应用启动时立即创建目录
ensureDirectoriesExist();

// 检查数据库文件是否存在
function checkDatabaseFile() {
  const dbPath = path.join(userDataPath, 'database.db3');
  console.log('检查数据库文件路径:', dbPath);
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log('数据库文件存在，大小:', stats.size, 'bytes');
    return true;
  } else {
    console.log('数据库文件不存在');
    return false;
  }
}

// 创建主窗口函数
async function createWindow() {
  try {
    console.log('v1.0.21 - 开始创建窗口，使用超稳定数据库连接...');
    
    // 检查数据库文件
    checkDatabaseFile();
    
    // 等待数据库初始化完成
    const { init } = require('../models/db');
    console.log('开始初始化数据库...');
    await init();
    console.log('数据库初始化完成');
    
    // 再次检查数据库文件
    checkDatabaseFile();
    
    // 获取 Express 应用和端口
    const { app: serverApp, PORT } = require('../app');
    console.log(`准备在端口 ${PORT} 启动服务器`);

    // 创建持久化的 session
    const persistentSession = session.fromPartition('persist:main', {
      cache: true
    });

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // 先不显示，等加载完成后再显示
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
    const server = serverApp.listen(PORT, '127.0.0.1', () => {
      console.log(`服务器已在 http://127.0.0.1:${PORT} 启动`);
      
      // 服务器启动后加载应用
      mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
    });
    
    // 保存服务器引用
    serverProcess = server;

    // 窗口加载完成后显示
    mainWindow.once('ready-to-show', () => {
      console.log('主窗口准备就绪，显示窗口');
      mainWindow.show();
      
      // 初始化自动更新器（添加错误处理）
      if (!process.env.ELECTRON_DEV && !appUpdater) {
        try {
          const AppUpdater = require('./updater');
          appUpdater = new AppUpdater(mainWindow);
          appUpdater.startPeriodicChecks();
          console.log('自动更新器初始化成功');
        } catch (updateError) {
          console.error('自动更新器初始化失败:', updateError.message);
          // 不要因为更新器失败而影响主功能
        }
      }
    });
    
    // 加载失败处理
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('页面加载失败:', errorCode, errorDescription, validatedURL);
    });

    mainWindow.on('closed', function () {
      mainWindow = null;
      // 关闭服务器
      if (serverProcess) {
        serverProcess.close();
        serverProcess = null;
      }
    });
    
  } catch (error) {
    console.error('创建窗口失败:', error);
    
    // 显示更详细的错误信息
    const { dialog } = require('electron');
    const errorMessage = error.stack || error.message || '未知错误';
    
    dialog.showErrorBox('初始化失败', `应用初始化失败：\n\n${errorMessage}\n\nv1.0.21 为稳定版本，包含所有修复。\n如果问题持续出现，请重启应用或联系技术支持。`);
    
    // 如果是数据库相关错误，尝试强制重置
    if (error.message && (error.message.includes('database') || error.message.includes('sqlite'))) {
      try {
        const { forceReset } = require('../models/db');
        forceReset();
        console.log('已执行数据库强制重置');
      } catch (resetError) {
        console.error('数据库重置失败:', resetError);
      }
    }
  }
}

app.whenReady().then(async () => {
  // 设置 session 存储路径
  const sessionPath = path.join(userDataPath, 'sessions');
  session.defaultSession.setPreloads([path.join(__dirname, 'preload.js')]);

  // 在开发环境中彻底清除所有缓存和存储数据
  if (process.env.ELECTRON_DEV) {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData({
      storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
    });
    console.log('已清除开发环境所有缓存和存储数据');
  }

  // 创建主窗口
  createWindow();
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

app.on('before-quit', (event) => {
  console.log('应用即将退出，清理资源...');
  
  // 如果是更新安装引起的退出，不要阻止
  if (appUpdater && appUpdater.isInstalling) {
    console.log('正在安装更新，允许应用退出');
    // 添加更多日志来跟踪退出过程
    console.log('等待自动更新器完成安装...');
    
    // 确保服务器已关闭
    if (serverProcess) {
      try {
        console.log('关闭服务器...');
        serverProcess.close();
        console.log('服务器已关闭');
      } catch (error) {
        console.error('关闭服务器失败:', error);
      }
      serverProcess = null;
    }
    
    // 针对 macOS 的特殊处理
    if (process.platform === 'darwin') {
      console.log('执行 macOS 退出特殊处理...');
      // 在 macOS 上，可能需要先隐藏应用窗口
      try {
        if (app.dock) {
          app.dock.hide();
        }
      } catch (dockError) {
        console.warn('隐藏 dock 图标时出错:', dockError.message);
      }
    }
    
    // 不阻止退出，但添加一个小延迟确保日志能被记录
    setTimeout(() => {
      console.log('应用退出完成');
    }, 100);
    return; // 不阻止退出
  }
  
  // 正常退出流程
  if (serverProcess) {
    try {
      serverProcess.close();
      console.log('服务器已关闭');
    } catch (error) {
      console.error('关闭服务器失败:', error);
    }
    serverProcess = null;
  }
});

// 处理更新安装前的准备工作
ipcMain.handle('prepare-for-update', async () => {
  console.log('准备安装更新，保存应用状态...');
  
  // 关闭服务器
  if (serverProcess) {
    try {
      serverProcess.close();
      console.log('服务器已关闭，准备更新');
    } catch (error) {
      console.error('关闭服务器时出错:', error);
    }
    serverProcess = null;
  }
  
  return true;
});

// 添加新的 IPC 处理程序来接收来自更新器的消息
ipcMain.handle('app-will-quit-for-update', async () => {
  console.log('收到应用即将为更新而退出的通知');
  // 在这里可以执行任何需要在应用退出前完成的操作
  console.log('执行更新前的最后清理工作...');
  
  // 确保所有未保存的数据都已保存
  // 这里可以添加任何需要在更新前执行的清理工作
  
  return true;
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
    console.log('接收到安装更新请求，即将关闭应用...');
    appUpdater.installUpdate();
  }
});
