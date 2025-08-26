const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const { logger } = require('../utils/logger');

class AppUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isUpdateAvailable = false;
    this.setupUpdater();
  }

  setupUpdater() {
    // 配置日志
    autoUpdater.logger = logger;
    autoUpdater.logger.transports.file.level = 'info';

    // 配置更新行为
    autoUpdater.autoDownload = false; // 不自动下载，让用户确认
    autoUpdater.autoInstallOnAppQuit = true; // 应用退出时自动安装

    // 设置更新服务器（GitHub Releases）
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'rakyu-vip',
      repo: 'crm-system'
    });

    this.setupEvents();
  }

  setupEvents() {
    // 检查更新出错
    autoUpdater.on('error', (error) => {
      logger.error('自动更新错误:', error);
      this.sendToRenderer('update-error', error.message);
    });

    // 检查更新中
    autoUpdater.on('checking-for-update', () => {
      logger.info('正在检查更新...');
      this.sendToRenderer('checking-for-update');
    });

    // 有可用更新
    autoUpdater.on('update-available', (info) => {
      logger.info('发现新版本:', info.version);
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
      logger.info('当前已是最新版本:', info.version);
      this.sendToRenderer('update-not-available', info);
    });

    // 下载进度
    autoUpdater.on('download-progress', (progressObj) => {
      const message = `下载进度: ${Math.round(progressObj.percent)}%`;
      logger.info(message);
      this.sendToRenderer('download-progress', {
        percent: Math.round(progressObj.percent),
        transferred: progressObj.transferred,
        total: progressObj.total,
        speed: progressObj.bytesPerSecond
      });
    });

    // 下载完成
    autoUpdater.on('update-downloaded', (info) => {
      logger.info('更新下载完成:', info.version);
      this.sendToRenderer('update-downloaded', info);
      this.showInstallDialog(info);
    });
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
        logger.info('用户选择稍后提醒');
        break;
      case 2: // 跳过此版本
        logger.info('用户选择跳过版本:', info.version);
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
      logger.info('用户选择稍后安装');
    }
  }

  // 检查更新
  checkForUpdates() {
    if (!this.isUpdateAvailable) {
      autoUpdater.checkForUpdates().catch(error => {
        logger.error('检查更新失败:', error);
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
      logger.error('手动检查更新失败:', error);
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
    logger.info('开始下载更新...');
    this.sendToRenderer('download-started');
    autoUpdater.downloadUpdate().catch(error => {
      logger.error('下载更新失败:', error);
      this.sendToRenderer('download-error', error.message);
    });
  }

  // 安装更新
  installUpdate() {
    logger.info('开始安装更新...');
    autoUpdater.quitAndInstall(false, true);
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