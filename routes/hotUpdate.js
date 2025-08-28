/**
 * 热更新API路由
 * 提供前端资源热更新的接口
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// 获取当前应用版本
router.get('/version', isAuthenticated, (req, res) => {
  try {
    const packageInfo = require('../package.json');
    res.json({
      version: packageInfo.version,
      name: packageInfo.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('获取版本信息失败', { error: error.message });
    res.status(500).json({ error: '获取版本信息失败' });
  }
});

// 检查是否有可用更新
router.get('/check', isAuthenticated, async (req, res) => {
  try {
    const currentVersion = require('../package.json').version;
    
    // 这里应该实现实际的更新检查逻辑
    // 例如检查远程服务器或本地更新文件
    const hasUpdate = false; // 暂时设置为false
    
    res.json({
      hasUpdate,
      version: currentVersion,
      currentVersion,
      files: [], // 需要更新的文件列表
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('检查更新失败', { error: error.message });
    res.status(500).json({ error: '检查更新失败' });
  }
});

// 下载更新文件
router.get('/download', isAuthenticated, (req, res) => {
  try {
    const fileName = req.query.file;
    
    if (!fileName) {
      return res.status(400).json({ error: '缺少文件名参数' });
    }
    
    // 安全检查：防止路径遍历攻击
    const normalizedFileName = path.normalize(fileName).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, '../public', normalizedFileName);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查文件是否在允许的目录内
    const publicDir = path.join(__dirname, '../public');
    if (!filePath.startsWith(publicDir)) {
      return res.status(403).json({ error: '访问被拒绝' });
    }
    
    // 设置适当的Content-Type
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    
    // 发送文件
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error('发送文件失败', { 
          file: fileName, 
          error: err.message 
        });
        if (!res.headersSent) {
          res.status(500).json({ error: '发送文件失败' });
        }
      }
    });
  } catch (error) {
    logger.error('下载文件失败', { error: error.message });
    res.status(500).json({ error: '下载文件失败' });
  }
});

// 获取更新文件列表
router.get('/files', isAuthenticated, (req, res) => {
  try {
    // 返回需要热更新的文件列表
    const files = [
      // 这里应该动态生成需要更新的文件列表
    ];
    
    res.json({
      files,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('获取文件列表失败', { error: error.message });
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

module.exports = router;