const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const { winston } = require('../utils/logger'); // 使用原始的 winston logger

class AppUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isUpdateAvailable = false;
    this.isInstalling = false; // 添加安装状态跟踪
    this.setupUpdater();
  }

  setupUpdater() {
    // 配置日志
    autoUpdater.logger = winston;
    
    // 安全设置日志级别
    try {
      if (autoUpdater.logger && autoUpdater.logger.transports && autoUpdater.logger.transports.file) {
        autoUpdater.logger.transports.file.level = 'info';
      }
    } catch (error) {
      console.warn('无法设置自动更新日志级别:', error.message);
    }

    // 配置更新行为
    autoUpdater.autoDownload = false; // 不自动下载，让用户确认
    autoUpdater.autoInstallOnAppQuit = true; // 应用退出时自动安装
    
    // 配置代码签名（对于未签名的应用）
    if (process.platform === 'darwin') {
      // 在 macOS 上禁用代码签名验证，避免警告
      Object.defineProperty(autoUpdater, 'allowDowngrade', {
        value: true,
        writable: false
      });
    }

    // 设置更新服务器（GitHub Releases）
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'yutaoyuan',
      repo: 'crm-system'
    });

    this.setupEvents();
  }

  setupEvents() {
    // 检查更新出错
    autoUpdater.on('error', (error) => {
      // 特殊处理常见错误
      if (error.message.includes('status 404')) {
        winston.warn('更新文件未找到（404错误），可能是版本发布尚未完成');
        this.handleUpdateFileNotFound(error);
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        winston.warn('网络连接错误，稍后将重试');
        this.scheduleRetryCheck();
      } else if (error.message.includes('Could not get code signature')) {
        winston.debug('代码签名警告（非关键问题）:', error.message);
        // 代码签名错误不影响功能，不向用户显示，也不记录为错误
        return;
      } else {
        // 其他错误才记录为错误并显示给用户
        winston.error('自动更新错误:', error);
        this.sendToRenderer('update-error', error.message);
      }
    });

    // 检查更新中
    autoUpdater.on('checking-for-update', () => {
      winston.info('正在检查更新...');
      this.sendToRenderer('checking-for-update');
    });

    // 有可用更新
    autoUpdater.on('update-available', (info) => {
      winston.info('发现新版本:', info.version);
      this.isUpdateAvailable = true;
      this.sendToRenderer('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate
      });
      this.showUpdateDialog(info);
    });

    // 没有可用更新
    autoUpdater.on('update-not-available', (info) => {
      winston.info('当前已是最新版本:', info.version);
      this.sendToRenderer('update-not-available', info);
    });

    // 下载进度
    autoUpdater.on('download-progress', (progressObj) => {
      const message = `下载进度: ${Math.round(progressObj.percent)}%`;
      winston.info(message);
      this.sendToRenderer('download-progress', {
        percent: Math.round(progressObj.percent),
        transferred: progressObj.transferred,
        total: progressObj.total,
        speed: progressObj.bytesPerSecond
      });
    });

    // 下载完成
    autoUpdater.on('update-downloaded', (info) => {
      winston.info('更新下载完成:', info.version);
      this.sendToRenderer('update-downloaded', info);
      this.showInstallDialog(info);
    });
  }

  // 处理更新文件未找到的情况
  handleUpdateFileNotFound(error) {
    // 如果正在使用的版本就是最新的，则不显示错误
    const currentVersion = require('../package.json').version;
    winston.info(`当前版本: v${currentVersion}，更新文件未找到，可能是版本发布尚未完成`);
    
    // 延迟10分钟后重试
    setTimeout(() => {
      winston.info('重试检查更新...');
      this.checkForUpdates();
    }, 10 * 60 * 1000); // 10分钟
  }

  // 安排重试检查
  scheduleRetryCheck() {
    setTimeout(() => {
      winston.info('网络错误后重试检查更新...');
      this.checkForUpdates();
    }, 5 * 60 * 1000); // 5分钟
  }

  // 发送消息到渲染进程
  sendToRenderer(channel, data = null) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  // 显示更新确认对话框
  async showUpdateDialog(info) {
    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '发现新版本',
      message: `发现新版本 v${info.version}`,
      detail: `当前版本: v${require('../package.json').version}\n新版本: v${info.version}\n\n是否立即下载更新？`,
      buttons: ['立即下载', '稍后提醒', '跳过此版本'],
      defaultId: 0,
      cancelId: 1
    });

    switch (result.response) {
      case 0: // 立即下载
        this.downloadUpdate();
        break;
      case 1: // 稍后提醒
        winston.info('用户选择稍后提醒');
        break;
      case 2: // 跳过此版本
        winston.info('用户选择跳过版本:', info.version);
        break;
    }
  }

  // 显示安装确认对话框
  async showInstallDialog(info) {
    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '更新下载完成',
      message: `新版本 v${info.version} 已下载完成`,
      detail: '是否立即重启应用并安装更新？',
      buttons: ['立即安装', '稍后安装'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      this.installUpdate();
    } else {
      winston.info('用户选择稍后安装');
    }
  }

  // 检查更新
  checkForUpdates() {
    if (!this.isUpdateAvailable) {
      autoUpdater.checkForUpdates().catch(error => {
        winston.error('检查更新失败:', error);
      });
    }
  }

  // 手动检查更新（显示结果）
  async checkForUpdatesManually() {
    try {
      await autoUpdater.checkForUpdates();
      // 如果没有更新，显示提示
      setTimeout(() => {
        if (!this.isUpdateAvailable) {
          dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: '检查更新',
            message: '当前已是最新版本',
            detail: `当前版本: v${require('../package.json').version}`,
            buttons: ['确定']
          });
        }
      }, 3000);
    } catch (error) {
      winston.error('手动检查更新失败:', error);
      dialog.showMessageBox(this.mainWindow, {
        type: 'error',
        title: '检查更新失败',
        message: '无法检查更新',
        detail: error.message,
        buttons: ['确定']
      });
    }
  }

  // 下载更新
  downloadUpdate() {
    winston.info('开始下载更新...');
    this.sendToRenderer('download-started');
    autoUpdater.downloadUpdate().catch(error => {
      winston.error('下载更新失败:', error);
      this.sendToRenderer('download-error', error.message);
      
      // 显示用户友好的错误提示
      if (error.message.includes('status 404')) {
        dialog.showMessageBox(this.mainWindow, {
          type: 'warning',
          title: '下载错误',
          message: '更新文件暂时不可用',
          detail: '新版本可能正在发布中，请稍后再试。系统将在后台自动重试。',
          buttons: ['确定']
        });
      } else {
        dialog.showMessageBox(this.mainWindow, {
          type: 'error',
          title: '下载失败',
          message: '无法下载更新',
          detail: `错误信息: ${error.message}`,
          buttons: ['确定']
        });
      }
    });
  }

  // 安装更新
  async installUpdate() {
    winston.info('开始安装更新...');
    this.isInstalling = true; // 设置安装状态
    this.sendToRenderer('update-installing');
    
    try {
      // 通知渲染进程准备更新
      this.sendToRenderer('prepare-for-update');
      
      // 等待用户界面响应和保存状态
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      winston.info('执行 quitAndInstall...');
      
      // 在执行 quitAndInstall 前，确保所有资源都已释放
      // 发送一个特殊的 IPC 消息给渲染进程，让它知道即将退出
      this.sendToRenderer('app-will-quit-for-update');
      
      // 给渲染进程一些时间来处理这个消息
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 确保主窗口已关闭，避免更新时文件被占用
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        winston.info('关闭主窗口...');
        this.mainWindow.destroy();
        this.mainWindow = null;
      }
      
      // 尝试不同的参数组合，确保应用能正确关闭
      // 第一个参数：是否静默重启（true = 静默重启）
      // 第二个参数：是否强制关闭（true = 强制关闭）
      autoUpdater.quitAndInstall(false, true);
      
      // 如果 quitAndInstall 没有立即关闭应用，尝试手动关闭
      setTimeout(() => {
        winston.warn('quitAndInstall 未能立即关闭应用，尝试手动关闭...');
        const { app } = require('electron');
        // 强制退出应用
        app.exit(0);
      }, 10000); // 增加到10秒等待时间
      
    } catch (error) {
      winston.error('安装更新失败:', error);
      this.isInstalling = false; // 重置安装状态
      
      // 如果自动安装失败，显示手动安装提示
      const { dialog } = require('electron');
      dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: '更新安装',
        message: '更新已下载完成',
        detail: '请手动关闭应用，更新将在下次启动时自动安装。或者您也可以点击“确定”后手动关闭应用。',
        buttons: ['确定'],
        defaultId: 0
      }).then(() => {
        // 用户确认后，尝试强制关闭应用
        const { app } = require('electron');
        setTimeout(() => {
          app.exit(0);
        }, 1000);
      });
    }
  }

  // 启动时检查更新（延迟执行）
  startPeriodicChecks() {
    // 30秒后检查更新
    setTimeout(() => {
      this.checkForUpdates();
    }, 30000);

    // 每4小时检查一次更新
    setInterval(() => {
      this.checkForUpdates();
    }, 4 * 60 * 60 * 1000);
  }
}

module.exports = AppUpdater;