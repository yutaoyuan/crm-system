#!/usr/bin/env node

/**
 * 测试数据库文件复制功能
 * 模拟首次安装应用的情况
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 模拟 Electron 环境
const mockElectron = {
  app: {
    getPath: (name) => {
      if (name === 'userData') {
        // 模拟用户数据目录
        return path.join(os.homedir(), 'Library', 'Application Support', 'crm-test');
      }
      return '';
    }
  }
};

// 模拟 process.versions.electron
process.versions.electron = '32.3.3';

// 模拟 process.resourcesPath
process.resourcesPath = path.join(__dirname, '../dist/mac/crm.app/Contents/Resources');

console.log('模拟 Electron 环境');
console.log('用户数据路径:', mockElectron.app.getPath('userData'));
console.log('资源路径:', process.resourcesPath);

// 模拟 db.js 中的函数
function getDatabasePath() {
  // 检查是否在 Electron 环境中
  if (process.versions && process.versions.electron) {
    // 在 Electron 环境中，使用用户数据目录
    const userDataPath = mockElectron.app.getPath('userData');
    return path.join(userDataPath, 'database.db3');
  } else {
    // 非 Electron 环境（开发环境直接运行 Node.js）
    return path.join(__dirname, '../databaseFolder/database.db3');
  }
}

function ensureDatabaseFile() {
  const dbFile = getDatabasePath();
  
  // 清理测试目录
  const testDir = path.dirname(dbFile);
  if (fs.existsSync(testDir)) {
    console.log('清理测试目录:', testDir);
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  
  console.log('目标数据库文件路径:', dbFile);
  
  // 检查数据库文件是否已存在
  if (!fs.existsSync(dbFile)) {
    console.log('数据库文件不存在，尝试从构建时包含的文件复制...');
    
    // 在 Electron 环境中，尝试从应用资源目录复制数据库文件
    if (process.versions && process.versions.electron) {
      // 获取应用资源目录中的数据库文件路径
      let sourceDbPath;
      
      // 尝试不同的路径
      if (process.resourcesPath) {
        sourceDbPath = path.join(process.resourcesPath, 'databaseFolder', 'database.db3');
        console.log('尝试从 resourcesPath 查找源数据库文件:', sourceDbPath);
      } else {
        sourceDbPath = path.join(__dirname, '../databaseFolder/database.db3');
        console.log('尝试从 __dirname 查找源数据库文件:', sourceDbPath);
      }
      
      // 如果在 ASAR 包中，需要特殊处理
      if (sourceDbPath.includes('.asar')) {
        // 从 ASAR 包外查找数据库文件
        const asarPath = sourceDbPath.split('.asar')[0] + '.asar';
        const relativePath = sourceDbPath.split('.asar')[1];
        sourceDbPath = path.join(path.dirname(asarPath), relativePath);
        console.log('修正 ASAR 路径后的源数据库文件路径:', sourceDbPath);
      }
      
      // 检查源文件是否存在
      if (fs.existsSync(sourceDbPath)) {
        try {
          // 确保目标目录存在
          const dbDir = path.dirname(dbFile);
          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('创建目标目录:', dbDir);
          }
          
          // 复制数据库文件
          fs.copyFileSync(sourceDbPath, dbFile);
          console.log('数据库文件复制成功:', sourceDbPath, '->', dbFile);
          
          // 同时复制相关的 WAL 和 SHM 文件（如果存在）
          const walFile = sourceDbPath + '-wal';
          const shmFile = sourceDbPath + '-shm';
          
          if (fs.existsSync(walFile)) {
            fs.copyFileSync(walFile, dbFile + '-wal');
            console.log('WAL文件复制成功');
          }
          
          if (fs.existsSync(shmFile)) {
            fs.copyFileSync(shmFile, dbFile + '-shm');
            console.log('SHM文件复制成功');
          }
          
          // 验证复制结果
          if (fs.existsSync(dbFile)) {
            const stats = fs.statSync(dbFile);
            console.log('✓ 目标数据库文件存在，大小:', stats.size, 'bytes');
          } else {
            console.log('✗ 目标数据库文件复制失败');
          }
        } catch (copyError) {
          console.error('复制数据库文件失败:', copyError);
        }
      } else {
        console.log('源数据库文件不存在:', sourceDbPath);
        // 列出可能的源目录内容以帮助调试
        try {
          const sourceDir = path.dirname(sourceDbPath);
          if (fs.existsSync(sourceDir)) {
            const files = fs.readdirSync(sourceDir);
            console.log('源目录内容:', files);
          } else {
            console.log('源目录不存在:', sourceDir);
          }
        } catch (dirError) {
          console.error('读取源目录失败:', dirError);
        }
      }
    }
  } else {
    console.log('数据库文件已存在，无需复制');
  }
  
  return dbFile;
}

// 执行测试
console.log('开始测试数据库文件复制功能...');
ensureDatabaseFile();
console.log('测试完成');