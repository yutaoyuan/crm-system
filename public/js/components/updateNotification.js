/**
 * 应用更新通知组件
 * 处理electron更新相关的UI交互
 */
class UpdateNotification {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.require;
    this.ipc = this.isElectron ? window.require('electron').ipcRenderer : null;
    this.currentNotification = null;
    this.downloadProgress = null;
    
    if (this.isElectron) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // 检查更新中
    this.ipc.on('checking-for-update', () => {
      this.showCheckingNotification();
    });

    // 发现新版本
    this.ipc.on('update-available', (event, info) => {
      this.showUpdateAvailableNotification(info);
    });

    // 没有更新
    this.ipc.on('update-not-available', () => {
      this.hideCheckingNotification();
    });

    // 下载开始
    this.ipc.on('download-started', () => {
      this.showDownloadNotification();
    });

    // 下载进度
    this.ipc.on('download-progress', (event, progress) => {
      this.updateDownloadProgress(progress);
    });

    // 下载完成
    this.ipc.on('update-downloaded', (event, info) => {
      this.showDownloadCompleteNotification(info);
    });

    // 更新错误
    this.ipc.on('update-error', (event, error) => {
      this.showErrorNotification(error);
    });

    // 下载错误
    this.ipc.on('download-error', (event, error) => {
      this.showDownloadErrorNotification(error);
    });
  }

  // 显示检查更新通知
  showCheckingNotification() {
    this.hideCurrentNotification();
    
    this.currentNotification = this.createNotification({
      type: 'info',
      title: '检查更新',
      message: '正在检查应用更新...',
      icon: '🔍',
      persistent: false,
      showCloseButton: false
    });
  }

  // 隐藏检查更新通知
  hideCheckingNotification() {
    if (this.currentNotification) {
      setTimeout(() => {
        this.hideCurrentNotification();
      }, 1000);
    }
  }

  // 显示发现更新通知
  showUpdateAvailableNotification(info) {
    this.hideCurrentNotification();
    
    const releaseNotes = info.releaseNotes || '新版本可用';
    
    this.currentNotification = this.createNotification({
      type: 'success',
      title: `发现新版本 v${info.version}`,
      message: `当前版本: v${this.getCurrentVersion()}\n新版本: v${info.version}\n\n更新内容:\n${releaseNotes}`,
      icon: '🎉',
      persistent: true,
      actions: [
        {
          text: '立即下载',
          action: () => this.downloadUpdate(),
          primary: true
        },
        {
          text: '稍后提醒',
          action: () => this.hideCurrentNotification()
        }
      ]
    });
  }

  // 显示下载通知
  showDownloadNotification() {
    this.hideCurrentNotification();
    
    this.currentNotification = this.createNotification({
      type: 'info',
      title: '下载更新',
      message: '正在下载更新包...',
      icon: '⬇️',
      persistent: true,
      showProgress: true,
      showCloseButton: false
    });

    this.downloadProgress = this.currentNotification.querySelector('.progress-bar');
  }

  // 更新下载进度
  updateDownloadProgress(progress) {
    if (this.downloadProgress) {
      this.downloadProgress.style.width = `${progress.percent}%`;
      
      const messageEl = this.currentNotification.querySelector('.notification-message');
      if (messageEl) {
        const speed = this.formatBytes(progress.speed);
        const transferred = this.formatBytes(progress.transferred);
        const total = this.formatBytes(progress.total);
        
        messageEl.innerHTML = `
          正在下载更新包...<br>
          <small>${transferred} / ${total} (${speed}/s)</small>
        `;
      }
    }
  }

  // 显示下载完成通知
  showDownloadCompleteNotification(info) {
    this.hideCurrentNotification();
    
    this.currentNotification = this.createNotification({
      type: 'success',
      title: '下载完成',
      message: `新版本 v${info.version} 已下载完成\n是否立即重启应用并安装更新？`,
      icon: '✅',
      persistent: true,
      actions: [
        {
          text: '立即安装',
          action: () => this.installUpdate(),
          primary: true
        },
        {
          text: '稍后安装',
          action: () => this.hideCurrentNotification()
        }
      ]
    });
  }

  // 显示错误通知
  showErrorNotification(error) {
    this.hideCurrentNotification();
    
    this.currentNotification = this.createNotification({
      type: 'error',
      title: '更新检查失败',
      message: `检查更新时出现错误:\n${error}`,
      icon: '❌',
      persistent: true,
      actions: [
        {
          text: '重试',
          action: () => this.checkForUpdates(),
          primary: true
        },
        {
          text: '关闭',
          action: () => this.hideCurrentNotification()
        }
      ]
    });
  }

  // 显示下载错误通知
  showDownloadErrorNotification(error) {
    this.hideCurrentNotification();
    
    this.currentNotification = this.createNotification({
      type: 'error',
      title: '下载失败',
      message: `下载更新时出现错误:\n${error}`,
      icon: '❌',
      persistent: true,
      actions: [
        {
          text: '重试',
          action: () => this.downloadUpdate(),
          primary: true
        },
        {
          text: '关闭',
          action: () => this.hideCurrentNotification()
        }
      ]
    });
  }

  // 创建通知元素
  createNotification(options) {
    const notification = document.createElement('div');
    notification.className = `update-notification update-notification-${options.type}`;
    
    let actionsHtml = '';
    if (options.actions && options.actions.length > 0) {
      actionsHtml = `
        <div class="notification-actions">
          ${options.actions.map(action => `
            <button class="notification-btn ${action.primary ? 'primary' : ''}" 
                    data-action="${options.actions.indexOf(action)}">
              ${action.text}
            </button>
          `).join('')}
        </div>
      `;
    }

    let progressHtml = '';
    if (options.showProgress) {
      progressHtml = `
        <div class="progress-container">
          <div class="progress-bar" style="width: 0%"></div>
        </div>
      `;
    }

    notification.innerHTML = `
      <div class="notification-icon">${options.icon}</div>
      <div class="notification-content">
        <div class="notification-title">${options.title}</div>
        <div class="notification-message">${options.message.replace(/\n/g, '<br>')}</div>
        ${progressHtml}
        ${actionsHtml}
      </div>
      ${options.showCloseButton !== false ? '<button class="notification-close">×</button>' : ''}
    `;

    // 添加事件监听
    if (options.actions) {
      options.actions.forEach((action, index) => {
        const btn = notification.querySelector(`[data-action="${index}"]`);
        if (btn) {
          btn.addEventListener('click', action.action);
        }
      });
    }

    // 关闭按钮
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideCurrentNotification());
    }

    // 添加到页面
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // 自动隐藏（非持久化通知）
    if (!options.persistent) {
      setTimeout(() => {
        if (this.currentNotification === notification) {
          this.hideCurrentNotification();
        }
      }, 5000);
    }

    return notification;
  }

  // 隐藏当前通知
  hideCurrentNotification() {
    if (this.currentNotification) {
      this.currentNotification.classList.remove('show');
      setTimeout(() => {
        if (this.currentNotification && this.currentNotification.parentNode) {
          this.currentNotification.parentNode.removeChild(this.currentNotification);
        }
        this.currentNotification = null;
        this.downloadProgress = null;
      }, 300);
    }
  }

  // 手动检查更新
  async checkForUpdates() {
    if (this.isElectron && this.ipc) {
      await this.ipc.invoke('check-for-updates');
    }
  }

  // 下载更新
  async downloadUpdate() {
    if (this.isElectron && this.ipc) {
      await this.ipc.invoke('download-update');
    }
  }

  // 安装更新
  async installUpdate() {
    if (this.isElectron && this.ipc) {
      await this.ipc.invoke('install-update');
    }
  }

  // 获取当前版本
  getCurrentVersion() {
    // 从package.json或其他地方获取版本号
    return '1.0.0'; // 这里应该从实际配置中获取
  }

  // 格式化字节大小
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 创建全局实例
const updateNotification = new UpdateNotification();

// 暴露到全局作用域
if (typeof window !== 'undefined') {
  window.updateNotification = updateNotification;
}