/**
 * 热更新管理器
 * 实现前端资源的热更新，无需重启应用
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { logger } = require('./logger');

class HotUpdater {
  constructor(options = {}) {
    this.options = {
      // 更新服务器地址
      updateServer: options.updateServer || 'https://github.com/yutaoyuan/crm-system/releases/download',
      // 当前版本
      currentVersion: options.currentVersion || require('../package.json').version,
      // 资源目录
      resourceDir: options.resourceDir || path.join(__dirname, '../public'),
      // 检查间隔（毫秒）
      checkInterval: options.checkInterval || 30 * 60 * 1000, // 30分钟
      ...options
    };
    
    this.isUpdating = false;
    this.updateCallbacks = [];
  }
  
  // 初始化热更新
  init() {
    logger.info('热更新管理器初始化', { version: this.options.currentVersion });
    
    // 启动定期检查更新
    this.startPeriodicChecks();
    
    return this;
  }
  
  // 添加更新回调
  onUpdate(callback) {
    if (typeof callback === 'function') {
      this.updateCallbacks.push(callback);
    }
  }
  
  // 触发更新回调
  triggerUpdateCallbacks(updateInfo) {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(updateInfo);
      } catch (error) {
        logger.error('执行更新回调失败', { error: error.message });
      }
    });
  }
  
  // 检查更新
  async checkForUpdates() {
    if (this.isUpdating) {
      logger.warn('更新检查已在进行中');
      return;
    }
    
    this.isUpdating = true;
    logger.info('开始检查热更新');
    
    try {
      // 这里应该实现实际的更新检查逻辑
      // 例如检查远程服务器上的更新信息
      const updateInfo = await this.fetchUpdateInfo();
      
      if (updateInfo && this.isNewerVersion(updateInfo.version, this.options.currentVersion)) {
        logger.info('发现新版本资源', { 
          current: this.options.currentVersion, 
          latest: updateInfo.version 
        });
        
        // 触发更新回调
        this.triggerUpdateCallbacks(updateInfo);
        
        return updateInfo;
      } else {
        logger.info('当前已是最新版本资源', { version: this.options.currentVersion });
        return null;
      }
    } catch (error) {
      logger.error('检查热更新失败', { error: error.message });
      return null;
    } finally {
      this.isUpdating = false;
    }
  }
  
  // 获取更新信息
  async fetchUpdateInfo() {
    // 模拟获取更新信息
    // 实际实现应该从服务器获取更新信息
    return {
      version: this.options.currentVersion,
      files: [],
      timestamp: Date.now()
    };
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
      logger.error('版本号比较失败', { error: error.message });
      return false;
    }
  }
  
  // 下载更新文件
  async downloadUpdateFile(fileInfo) {
    return new Promise((resolve, reject) => {
      const url = `${this.options.updateServer}/v${fileInfo.version}/${fileInfo.name}`;
      const filePath = path.join(this.options.resourceDir, fileInfo.path || fileInfo.name);
      
      logger.info('开始下载更新文件', { url, filePath });
      
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const file = fs.createWriteStream(filePath);
      
      const protocol = url.startsWith('https') ? https : http;
      const request = protocol.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            logger.info('文件下载完成', { filePath });
            resolve(filePath);
          });
        } else {
          reject(new Error(`下载失败: ${response.statusCode}`));
        }
      });
      
      request.on('error', (error) => {
        fs.unlink(filePath, () => {}); // 删除部分下载的文件
        reject(error);
      });
      
      file.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  // 应用更新
  async applyUpdate(updateInfo) {
    if (this.isUpdating) {
      logger.warn('更新应用已在进行中');
      return false;
    }
    
    this.isUpdating = true;
    logger.info('开始应用热更新', { version: updateInfo.version });
    
    try {
      // 下载更新文件
      if (updateInfo.files && updateInfo.files.length > 0) {
        for (const fileInfo of updateInfo.files) {
          try {
            await this.downloadUpdateFile(fileInfo);
          } catch (error) {
            logger.error('下载文件失败', { 
              file: fileInfo.name, 
              error: error.message 
            });
            throw error;
          }
        }
      }
      
      // 更新版本号
      this.options.currentVersion = updateInfo.version;
      
      logger.info('热更新应用成功', { version: updateInfo.version });
      return true;
    } catch (error) {
      logger.error('应用热更新失败', { error: error.message });
      return false;
    } finally {
      this.isUpdating = false;
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
    
    logger.info('已启动定期热更新检查', { 
      interval: `${this.options.checkInterval / 1000 / 60}分钟` 
    });
  }
  
  // 获取当前版本
  getCurrentVersion() {
    return this.options.currentVersion;
  }
  
  // 获取资源目录
  getResourceDir() {
    return this.options.resourceDir;
  }
}

module.exports = HotUpdater;