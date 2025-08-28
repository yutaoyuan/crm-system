/**
 * 前端热更新组件
 * 实现浏览器端资源的动态更新
 */
class HotUpdateManager {
  constructor(options = {}) {
    this.options = {
      // 检查更新的API端点
      checkUpdateUrl: options.checkUpdateUrl || '/api/hot-update/check',
      // 下载更新的API端点
      downloadUpdateUrl: options.downloadUpdateUrl || '/api/hot-update/download',
      // 检查间隔（毫秒）
      checkInterval: options.checkInterval || 30 * 60 * 1000, // 30分钟
      // 是否启用自动更新
      autoUpdate: options.autoUpdate !== false,
      // 更新成功后的回调
      onUpdateSuccess: options.onUpdateSuccess || null,
      // 更新失败后的回调
      onUpdateError: options.onUpdateError || null,
      ...options
    };
    
    this.isUpdating = false;
    this.currentVersion = this.getCurrentVersion();
    this.init();
  }
  
  // 初始化
  init() {
    console.log('热更新管理器初始化', { version: this.currentVersion });
    
    // 启动定期检查更新
    if (this.options.autoUpdate) {
      this.startPeriodicChecks();
    }
  }
  
  // 获取当前版本
  getCurrentVersion() {
    // 从全局变量或meta标签获取版本信息
    if (window.APP_VERSION) {
      return window.APP_VERSION;
    }
    
    // 从meta标签获取
    const metaVersion = document.querySelector('meta[name="app-version"]');
    if (metaVersion) {
      return metaVersion.getAttribute('content');
    }
    
    // 默认版本
    return '1.0.0';
  }
  
  // 检查更新
  async checkForUpdates() {
    if (this.isUpdating) {
      console.warn('更新检查已在进行中');
      return;
    }
    
    this.isUpdating = true;
    console.log('开始检查前端热更新');
    
    try {
      const response = await fetch(this.options.checkUpdateUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const updateInfo = await response.json();
        
        if (updateInfo.hasUpdate && this.isNewerVersion(updateInfo.version, this.currentVersion)) {
          console.log('发现新版本前端资源', { 
            current: this.currentVersion, 
            latest: updateInfo.version 
          });
          
          // 自动应用更新
          if (this.options.autoUpdate) {
            await this.applyUpdate(updateInfo);
          }
          
          return updateInfo;
        } else {
          console.log('当前前端资源已是最新版本', { version: this.currentVersion });
          return null;
        }
      } else {
        throw new Error(`检查更新失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('检查前端热更新失败', { error: error.message });
      if (this.options.onUpdateError) {
        this.options.onUpdateError(error);
      }
      return null;
    } finally {
      this.isUpdating = false;
    }
  }
  
  // 比较版本号
  isNewerVersion(newVersion, currentVersion) {
    try {
      const newParts = newVersion.split('.').map(Number);
      const currentParts = currentVersion.split('.').map(Number);
      
      for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
        const newNum = newParts[i] || 0;
        const currentNum = currentParts[i] || 0;
        
        if (newNum > currentNum) return true;
        if (newNum < currentNum) return false;
      }
      
      return false;
    } catch (error) {
      console.error('版本号比较失败', { error: error.message });
      return false;
    }
  }
  
  // 应用更新
  async applyUpdate(updateInfo) {
    if (this.isUpdating) {
      console.warn('更新应用已在进行中');
      return false;
    }
    
    this.isUpdating = true;
    console.log('开始应用前端热更新', { version: updateInfo.version });
    
    try {
      // 下载更新文件
      if (updateInfo.files && updateInfo.files.length > 0) {
        for (const fileInfo of updateInfo.files) {
          try {
            await this.downloadAndUpdateFile(fileInfo);
          } catch (error) {
            console.error('更新文件失败', { 
              file: fileInfo.name, 
              error: error.message 
            });
            throw error;
          }
        }
      }
      
      // 更新版本号
      this.currentVersion = updateInfo.version;
      
      console.log('前端热更新应用成功', { version: updateInfo.version });
      
      // 执行更新成功回调
      if (this.options.onUpdateSuccess) {
        this.options.onUpdateSuccess(updateInfo);
      }
      
      // 刷新页面以应用更新
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('应用前端热更新失败', { error: error.message });
      if (this.options.onUpdateError) {
        this.options.onUpdateError(error);
      }
      return false;
    } finally {
      this.isUpdating = false;
    }
  }
  
  // 下载并更新文件
  async downloadAndUpdateFile(fileInfo) {
    const url = `${this.options.downloadUpdateUrl}?file=${encodeURIComponent(fileInfo.name)}`;
    
    console.log('开始下载更新文件', { url });
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      if (fileInfo.type === 'js') {
        // 更新JavaScript文件
        const content = await response.text();
        this.updateJavaScriptFile(fileInfo.name, content);
      } else if (fileInfo.type === 'css') {
        // 更新CSS文件
        const content = await response.text();
        this.updateCSSFile(fileInfo.name, content);
      } else {
        // 其他文件类型，保存到本地存储
        const blob = await response.blob();
        this.saveFileToCache(fileInfo.name, blob);
      }
      
      console.log('文件更新完成', { file: fileInfo.name });
    } else {
      throw new Error(`下载文件失败: ${response.status} ${response.statusText}`);
    }
  }
  
  // 更新JavaScript文件
  updateJavaScriptFile(fileName, content) {
    // 移除旧的脚本标签
    const oldScripts = document.querySelectorAll(`script[data-hot-update="${fileName}"]`);
    oldScripts.forEach(script => script.remove());
    
    // 创建新的脚本标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = content;
    script.setAttribute('data-hot-update', fileName);
    script.setAttribute('data-hot-update-time', Date.now());
    
    // 添加到页面
    document.head.appendChild(script);
  }
  
  // 更新CSS文件
  updateCSSFile(fileName, content) {
    // 移除旧的样式标签
    const oldStyles = document.querySelectorAll(`link[data-hot-update="${fileName}"]`);
    oldStyles.forEach(style => style.remove());
    
    // 创建新的样式标签
    const style = document.createElement('style');
    style.textContent = content;
    style.setAttribute('data-hot-update', fileName);
    style.setAttribute('data-hot-update-time', Date.now());
    
    // 添加到页面
    document.head.appendChild(style);
  }
  
  // 保存文件到缓存
  saveFileToCache(fileName, blob) {
    try {
      // 使用localStorage或sessionStorage保存小文件
      if (blob.size < 5 * 1024 * 1024) { // 5MB以下
        const reader = new FileReader();
        reader.onload = function() {
          localStorage.setItem(`hot_update_${fileName}`, reader.result);
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.warn('保存文件到缓存失败', { file: fileName, error: error.message });
    }
  }
  
  // 启动定期检查
  startPeriodicChecks() {
    // 立即检查一次
    setTimeout(() => {
      this.checkForUpdates();
    }, 10000); // 10秒后检查
    
    // 定期检查
    setInterval(() => {
      this.checkForUpdates();
    }, this.options.checkInterval);
    
    console.log('已启动定期前端热更新检查', { 
      interval: `${this.options.checkInterval / 1000 / 60}分钟` 
    });
  }
  
  // 手动触发更新检查
  checkForUpdatesManually() {
    return this.checkForUpdates();
  }
}

// 导出全局变量
window.HotUpdateManager = HotUpdateManager;

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  window.hotUpdateManager = new HotUpdateManager();
});

// 如果使用模块系统
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotUpdateManager;
}