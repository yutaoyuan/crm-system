#!/usr/bin/env node

/**
 * 验证构建后的应用中数据库文件是否存在
 * 用于调试数据库文件复制问题
 */

const fs = require('fs');
const path = require('path');

// 检查不同可能的路径
const possiblePaths = [
  // 开发环境路径
  path.join(__dirname, '../databaseFolder/database.db3'),
  
  // 构建后应用资源路径
  path.join(__dirname, '../dist/mac/crm.app/Contents/Resources/databaseFolder/database.db3'),
  
  // ASAR 包外路径
  path.join(__dirname, '../dist/mac/crm.app/Contents/Resources/app.asar.unpacked/databaseFolder/database.db3'),
  
  // 相对路径
  path.join(process.cwd(), 'databaseFolder/database.db3')
];

console.log('当前工作目录:', process.cwd());
console.log('脚本目录:', __dirname);
console.log('检查可能的数据库文件路径...');

possiblePaths.forEach((dbPath, index) => {
  console.log(`\n检查路径 ${index + 1}: ${dbPath}`);
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`✓ 文件存在，大小: ${stats.size} bytes`);
    
    // 检查相关文件
    const walFile = dbPath + '-wal';
    const shmFile = dbPath + '-shm';
    
    if (fs.existsSync(walFile)) {
      const walStats = fs.statSync(walFile);
      console.log(`✓ WAL 文件存在，大小: ${walStats.size} bytes`);
    } else {
      console.log('✗ WAL 文件不存在');
    }
    
    if (fs.existsSync(shmFile)) {
      const shmStats = fs.statSync(shmFile);
      console.log(`✓ SHM 文件存在，大小: ${shmStats.size} bytes`);
    } else {
      console.log('✗ SHM 文件不存在');
    }
  } else {
    console.log('✗ 文件不存在');
    
    // 检查目录是否存在
    const dir = path.dirname(dbPath);
    if (fs.existsSync(dir)) {
      console.log('  目录存在，列出目录内容:');
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => console.log(`    ${file}`));
      } catch (err) {
        console.log('  读取目录失败:', err.message);
      }
    } else {
      console.log('  目录不存在');
    }
  }
});

// 检查 ASAR 包内容
const asarPath = path.join(__dirname, '../dist/mac/crm.app/Contents/Resources/app.asar');
if (fs.existsSync(asarPath)) {
  console.log('\n检查 ASAR 包内容...');
  try {
    const asar = require('asar');
    const fileList = asar.listPackage(asarPath);
    const dbFiles = fileList.filter(file => file.includes('databaseFolder'));
    console.log('ASAR 包中的数据库相关文件:');
    dbFiles.forEach(file => console.log(`  ${file}`));
  } catch (err) {
    console.log('读取 ASAR 包失败:', err.message);
  }
} else {
  console.log('\nASAR 包不存在:', asarPath);
}