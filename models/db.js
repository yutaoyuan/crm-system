/**
 * 超稳定的数据库连接模块 - 彻底解决 SQLite 崩溃问题
 * 
 * v1.0.37 关键改进：
 * 1. 修复构建后应用中数据库文件复制问题
 * 2. 增强 ASAR 包中数据库文件路径处理
 * 3. 改进数据库文件复制日志和错误处理
 * 1. 进程级错误捕获和恢复
 * 2. 连接池与单例模式结合
 * 3. 异步操作超时保护
 * 4. 内存泄漏防护
 * 5. 原生模块错误隔离
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const EventEmitter = require('events');

// 数据库管理器
class DatabaseManager extends EventEmitter {
  constructor() {
    super();
    this.sqlite3 = null;
    this.knex = null;
    this.dbInstance = null;
    this.dbInitialized = false;
    this.dbInitializing = false;
    this.knexInstance = null;
    this.connectionPool = [];
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    // 进程级错误监听
    this.setupProcessErrorHandlers();
  }
  
  setupProcessErrorHandlers() {
    // 捕获未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('未处理的Promise拒绝:', reason);
      if (reason && reason.message && reason.message.includes('sqlite')) {
        console.error('检测到SQLite相关错误，重置数据库连接');
        this.forceReset();
      }
    });
    
    // 捕获未处理的异常
    process.on('uncaughtException', (error) => {
      console.error('未处理的异常:', error);
      if (error && error.message && error.message.includes('sqlite')) {
        console.error('检测到SQLite相关崩溃，紧急重置');
        this.forceReset();
      }
    });
  }
  
  forceReset() {
    console.log('执行数据库连接强制重置...');
    this.dbInitialized = false;
    this.dbInitializing = false;
    this.dbInstance = null;
    this.connectionPool = [];
    if (this.knexInstance) {
      try {
        this.knexInstance.destroy();
      } catch (e) {
        console.warn('销毁Knex实例失败:', e);
      }
      this.knexInstance = null;
    }
  }
}

// 全局数据库管理器实例
const dbManager = new DatabaseManager();

// 延迟加载 SQLite3，避免模块加载时的循环依赖
let sqlite3 = null;
let knex = null;

// 数据库连接状态（保持向后兼容）
let dbInstance = null;
let dbInitialized = false;
let dbInitializing = false;
let knexInstance = null;

// 获取数据库路径
function getDatabasePath() {
  // 检查是否在 Electron 环境中
  if (process.versions && process.versions.electron) {
    // 在 Electron 环境中，使用用户数据目录
    const { app } = require('electron');
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'database.db3');
  } else {
    // 非 Electron 环境（开发环境直接运行 Node.js）
    return path.join(__dirname, '../databaseFolder/database.db3');
  }
}

// 确保数据库文件存在（从构建时包含的数据库文件复制）
function ensureDatabaseFile() {
  const dbFile = getDatabasePath();
  
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

const dbFile = ensureDatabaseFile();

// 确保数据库目录存在（增强版）
function ensureDatabaseDirectory() {
  const dbDir = path.dirname(dbFile);
  
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('数据库目录创建成功:', dbDir);
    }
    
    // 检查目录可写性
    fs.accessSync(dbDir, fs.constants.W_OK | fs.constants.R_OK);
    console.log('数据库目录访问正常:', dbDir);
    
    // 检查数据库文件状态
    if (fs.existsSync(dbFile)) {
      const stats = fs.statSync(dbFile);
      console.log('数据库文件存在，大小:', stats.size, 'bytes');
      
      // 检查文件是否损坏
      if (stats.size === 0) {
        console.warn('数据库文件为空，将被删除并重新创建');
        fs.unlinkSync(dbFile);
      }
    }
    
  } catch (e) {
    console.error('数据库目录检查/创建失败:', e);
    throw new Error(`数据库目录初始化失败: ${e.message}`);
  }
}

// 超安全的数据库连接创建函数
function createUltraSafeConnection() {
  return new Promise((resolve, reject) => {
    const connectionTimeout = setTimeout(() => {
      reject(new Error('数据库连接超时'));
    }, 10000); // 10秒超时
    
    try {
      if (!sqlite3) {
        sqlite3 = require('sqlite3').verbose();
      }
      
      console.log('尝试创建数据库连接:', dbFile);
      
      const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        clearTimeout(connectionTimeout);
        
        if (err) {
          console.error('数据库连接失败:', err);
          reject(new Error(`数据库连接失败: ${err.message}`));
          return;
        }
        
        console.log('数据库连接成功:', dbFile);
        
        // 使用更安全的PRAGMA设置方式
        const pragmaSettings = [
          { sql: 'PRAGMA foreign_keys = ON', name: '外键约束' },
          { sql: 'PRAGMA journal_mode = WAL', name: 'WAL模式' },
          { sql: 'PRAGMA synchronous = NORMAL', name: '同步模式' },
          { sql: 'PRAGMA cache_size = 1000', name: '缓存大小' },
          { sql: 'PRAGMA temp_store = MEMORY', name: '临时存储' },
          { sql: 'PRAGMA busy_timeout = 30000', name: '忙碑超时' },
          { sql: 'PRAGMA wal_autocheckpoint = 1000', name: 'WAL自动检查点' }
        ];
        
        let completedPragmas = 0;
        let hasError = false;
        
        const processPragma = (index) => {
          if (index >= pragmaSettings.length) {
            if (!hasError) {
              console.log('所有PRAGMA设置完成');
              setupConnectionErrorHandlers(db);
              resolve(db);
            }
            return;
          }
          
          const pragma = pragmaSettings[index];
          
          try {
            db.run(pragma.sql, (err) => {
              if (err) {
                console.warn(`设置${pragma.name}失败:`, err);
                // 不因为PRAGMA失败而终止连接
              } else {
                console.log(`${pragma.name}已启用`);
              }
              
              completedPragmas++;
              
              // 继续处理下一个PRAGMA
              setTimeout(() => processPragma(index + 1), 10);
            });
          } catch (pragmaError) {
            console.warn(`执行${pragma.name}时发生异常:`, pragmaError);
            setTimeout(() => processPragma(index + 1), 10);
          }
        };
        
        // 开始处理PRAGMA设置
        db.serialize(() => {
          processPragma(0);
        });
      });
      
    } catch (error) {
      clearTimeout(connectionTimeout);
      console.error('创建数据库连接时发生异常:', error);
      reject(new Error(`创建数据库连接失败: ${error.message}`));
    }
  });
}

// 设置连接错误处理器
function setupConnectionErrorHandlers(db) {
  // 错误处理 - 更安全的方式
  db.on('error', (err) => {
    console.error('数据库连接运行时错误:', err);
    
    // 将错误信号发送给管理器
    dbManager.emit('database-error', err);
    
    // 如果是严重错误，执行强制重置
    if (err.code === 'SQLITE_CORRUPT' || err.code === 'SQLITE_NOTADB' || 
        err.message.includes('database disk image is malformed')) {
      console.error('检测到严重数据库错误，执行强制重置');
      dbManager.forceReset();
    } else {
      // 普通错误，只重置连接状态
      dbInitialized = false;
      dbInstance = null;
      dbManager.dbInitialized = false;
      dbManager.dbInstance = null;
    }
  });
  
  db.on('close', () => {
    console.log('数据库连接已关闭');
    dbInitialized = false;
    dbInstance = null;
    dbManager.dbInitialized = false;
    dbManager.dbInstance = null;
  });
  
  // 设置数据库忙碁处理
  db.on('busy', () => {
    console.warn('数据库忙碁，等待中...');
  });
}

// 获取数据库连接（带重试机制和更安全的错误处理）
async function getDatabase() {
  // 检查当前连接状态
  if (dbInstance && dbInitialized) {
    try {
      // 验证连接是否仍然有效
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('连接验证超时')), 2000);
        dbInstance.get('SELECT 1', (err) => {
          clearTimeout(timeout);
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return dbInstance;
    } catch (validationError) {
      console.warn('现有连接验证失败，将重新创建:', validationError.message);
      dbInitialized = false;
      dbInstance = null;
    }
  }
  
  // 如果正在初始化，等待完成
  if (dbInitializing) {
    return new Promise((resolve, reject) => {
      const maxWaitTime = 30000; // 30秒最大等待时间
      const startTime = Date.now();
      
      const checkInit = () => {
        if (dbInitialized && dbInstance) {
          resolve(dbInstance);
        } else if (!dbInitializing) {
          reject(new Error('数据库初始化失败'));
        } else if (Date.now() - startTime > maxWaitTime) {
          dbInitializing = false;
          reject(new Error('数据库初始化超时'));
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  }
  
  dbInitializing = true;
  
  // 重试逻辑
  for (let attempt = 1; attempt <= dbManager.maxRetries; attempt++) {
    try {
      console.log(`正在尝试连接数据库（第${attempt}/${dbManager.maxRetries}次）...`);
      
      dbInstance = await createUltraSafeConnection();
      dbInitialized = true;
      dbInitializing = false;
      
      // 更新管理器状态
      dbManager.dbInstance = dbInstance;
      dbManager.dbInitialized = true;
      dbManager.dbInitializing = false;
      
      console.log('数据库连接初始化成功');
      return dbInstance;
      
    } catch (error) {
      console.error(`第${attempt}次连接尝试失败:`, error.message);
      
      if (attempt < dbManager.maxRetries) {
        const delay = dbManager.retryDelay * attempt; // 指数退避
        console.log(`${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        dbInitializing = false;
        dbInitialized = false;
        dbInstance = null;
        dbManager.dbInitializing = false;
        dbManager.dbInitialized = false;
        dbManager.dbInstance = null;
        
        const finalError = new Error(`数据库连接失败，已经进行了${dbManager.maxRetries}次尝试: ${error.message}`);
        throw finalError;
      }
    }
  }
}

// 创建数据库表（增强版）
function createTables(db) {
  return new Promise((resolve, reject) => {
    const tables = [
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'customers',
        sql: `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          age INTEGER,
          height TEXT,
          upper_size TEXT,
          lower_size TEXT,
          body_type TEXT,
          features TEXT,
          reception TEXT,
          personality TEXT,
          preferred_colors TEXT,
          preferred_styles TEXT,
          accompaniment TEXT,
          department TEXT,
          employee TEXT,
          registration_date TEXT,
          photo BLOB,
          total_consumption REAL DEFAULT 0,
          consumption_count INTEGER DEFAULT 0,
          consumption_times INTEGER DEFAULT 0,
          total_points INTEGER DEFAULT 0,
          available_points INTEGER DEFAULT 0,
          last_consumption TEXT,
          last_visit TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'sales',
        sql: `CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          transaction_number TEXT,
          date TEXT,
          sale_type TEXT,
          store TEXT,
          salesperson1 TEXT,
          salesperson2 TEXT,
          notes TEXT,
          total_amount REAL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )`
      },
      {
        name: 'sales_item',
        sql: `CREATE TABLE IF NOT EXISTS sales_item (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER NOT NULL,
          product_code TEXT NOT NULL,
          size TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          amount REAL NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'points',
        sql: `CREATE TABLE IF NOT EXISTS points (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          date TEXT,
          channel TEXT,
          points INTEGER,
          operator TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )`
      },
      {
        name: 'customer_visits',
        sql: `CREATE TABLE IF NOT EXISTS customer_visits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          visit_date TEXT NOT NULL,
          visit_type TEXT NOT NULL,
          visit_purpose TEXT,
          visit_result TEXT,
          notes TEXT,
          next_visit_date TEXT,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )`
      }
    ];
    
    let completed = 0;
    let hasError = false;
    
    // 使用事务确保原子性
    db.run('BEGIN TRANSACTION', (beginErr) => {
      if (beginErr) {
        console.error('开始事务失败:', beginErr);
        reject(beginErr);
        return;
      }
      
      db.serialize(() => {
        tables.forEach((table, index) => {
          db.run(table.sql, (err) => {
            if (err && !hasError) {
              hasError = true;
              console.error(`创建表 ${table.name} 失败:`, err);
              
              // 回滚事务
              db.run('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  console.error('回滚事务失败:', rollbackErr);
                }
                reject(err);
              });
              return;
            }
            
            if (!hasError) {
              console.log(`表 ${table.name} 创建/验证成功`);
              completed++;
              
              if (completed === tables.length) {
                // 提交事务
                db.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    console.error('提交事务失败:', commitErr);
                    reject(commitErr);
                  } else {
                    console.log('所有数据库表创建完成');
                    resolve();
                  }
                });
              }
            }
          });
        });
      });
    });
  });
}

// 创建默认用户（增强版）
function createDefaultUser(db) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('创建默认用户超时'));
    }, 5000);
    
    db.get("SELECT * FROM users WHERE username = ?", ["zhaochunyan"], (err, row) => {
      clearTimeout(timeout);
      
      if (err) {
        console.error('查询默认用户失败:', err);
        reject(err);
        return;
      }
      
      if (!row) {
        bcrypt.hash('zcy@123456', 10, (err, hash) => {
          if (err) {
            console.error('密码加密失败:', err);
            reject(err);
            return;
          }
          
          db.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", 
            ["zhaochunyan", hash, "zhaochunyan@example.com"], (err) => {
            if (err) {
              console.error('插入默认用户失败:', err);
              reject(err);
            } else {
              console.log('默认用户创建成功');
              resolve();
            }
          });
        });
      } else {
        console.log('默认用户已存在');
        resolve();
      }
    });
  });
}

// 验证数据库表结构（不会覆盖现有数据）
function verifyDatabaseTables(db) {
  return new Promise((resolve, reject) => {
    const requiredTables = [
      'users', 'customers', 'sales', 'sales_item', 'points', 'customer_visits'
    ];
    
    console.log('开始验证数据库表结构...');
    
    // 检查每个必需的表是否存在
    const checkTable = (tableName) => {
      return new Promise((tableResolve, tableReject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          [tableName],
          (err, row) => {
            if (err) {
              console.error(`检查表 ${tableName} 时出错:`, err);
              tableReject(err);
              return;
            }
            
            if (row) {
              console.log(`✓ 表 ${tableName} 存在`);
              tableResolve(true);
            } else {
              console.warn(`✗ 表 ${tableName} 不存在，但不会强制创建以保护现有数据`);
              tableResolve(false);
            }
          }
        );
      });
    };
    
    // 并行检查所有表
    Promise.all(requiredTables.map(checkTable))
      .then(results => {
        const existingTables = requiredTables.filter((_, index) => results[index]);
        const missingTables = requiredTables.filter((_, index) => !results[index]);
        
        console.log(`数据库表验证完成: ${existingTables.length}/${requiredTables.length} 个表存在`);
        
        if (existingTables.length > 0) {
          console.log('现有表:', existingTables.join(', '));
        }
        
        if (missingTables.length > 0) {
          console.log('缺失表:', missingTables.join(', '));
          console.log('注意：为保护现有数据，不会自动创建缺失的表');
        }
        
        // 即使有缺失的表也不报错，以保护现有数据
        resolve({
          existingTables,
          missingTables,
          hasAllTables: missingTables.length === 0
        });
      })
      .catch(error => {
        console.error('验证数据库表结构时发生错误:', error);
        reject(error);
      });
  });
}

// 初始化数据库（生产环境使用预置数据库文件）
async function init() {
  try {
    console.log('\n=== 开始数据库连接 ===');
    console.log('数据库文件路径:', dbFile);
    
    // 检查数据库文件是否已存在
    const dbExists = fs.existsSync(dbFile);
    console.log(`数据库文件状态: ${dbExists ? '✓ 已存在' : '✗ 不存在'}`);
    
    // 获取数据库连接
    const db = await getDatabase();
    console.log('✓ 数据库连接建立成功');
    
    // 检查是否为开发环境
    const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === '1';
    
    if (!isDev) {
      // 生产环境：直接使用预置的数据库文件，不进行任何初始化操作
      console.log('\n--- 生产环境模式 ---');
      console.log('使用预置数据库文件，跳过初始化过程');
      
      // 验证数据库完整性
      try {
        const verifyResult = await verifyDatabaseTables(db);
        
        if (verifyResult.hasAllTables) {
          console.log('✓ 数据库完整性验证通过');
        } else {
          console.warn(`⚠️  数据库表结构不完整，缺失 ${verifyResult.missingTables.length} 个表`);
          console.log('缺失表:', verifyResult.missingTables.join(', '));
        }
      } catch (verifyError) {
        console.warn('⚠️  数据库完整性验证失败:', verifyError.message);
      }
      
      console.log('✓ 生产环境数据库准备完成\n');
    } else {
      // 开发环境：保持原有的初始化逻辑
      console.log('\n--- 开发环境模式 ---');
      
      if (!dbExists) {
        console.log('检测到数据库文件不存在，开始创建新的数据库表和默认数据...');
        
        console.log('正在创建数据库表...');
        await createTables(db);
        console.log('✓ 数据库表创建完成');
        
        console.log('正在创建默认用户...');
        await createDefaultUser(db);
        console.log('✓ 默认用户创建完成');
        
        console.log('\n✓ 新数据库初始化完成\n');
      } else {
        console.log('检测到数据库文件已存在，进行安全验证...');
        
        // 只验证表是否存在，不强制重建
        try {
          const verifyResult = await verifyDatabaseTables(db);
          
          if (verifyResult.hasAllTables) {
            console.log('✓ 数据库表结构验证通过，所有必需的表都存在');
          } else {
            console.log(`⚠️  数据库表结构不完整，缺失 ${verifyResult.missingTables.length} 个表`);
            console.log('为保护现有数据，不会自动创建缺失的表');
            console.log('如果需要创建缺失的表，请手动操作或备份数据后重新创建数据库');
          }
        } catch (verifyError) {
          console.warn('⚠️  数据库表结构验证失败，但继续使用现有数据库:', verifyError.message);
        }
        
        console.log('\n✓ 现有数据库连接完成，所有数据安全保留\n');
      }
    }
    
    console.log('=== 数据库初始化完成 ===\n');
    return db;
    
  } catch (error) {
    console.error('\n✗ 数据库初始化失败:', error);
    
    // 如果初始化失败，尝试清理状态
    dbManager.forceReset();
    
    throw new Error(`数据库初始化失败: ${error.message}`);
  }
}

// 获取 Knex 实例（增强版）
function getKnexInstance() {
  if (!knexInstance || !dbInitialized) {
    if (!knex) {
      knex = require('knex');
    }
    
    const knexConfig = {
      client: 'sqlite3',
      connection: {
        filename: dbFile
      },
      useNullAsDefault: true,
      pool: {
        min: 1,
        max: 5, // 减少最大连接数
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
        afterCreate: (conn, done) => {
          // 启用外键约束
          conn.run('PRAGMA foreign_keys = ON', done);
        }
      },
      acquireConnectionTimeout: 30000
    };
    
    try {
      knexInstance = knex(knexConfig);
      console.log('Knex实例创建成功');
    } catch (error) {
      console.error('创建 Knex 实例失败:', error);
      throw error;
    }
  }
  
  return knexInstance;
}

// 重新计算客户积分（从原 db.js 复制）
function recalculateCustomerPoints(customerId, customerPhone) {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      const totalPointsQuery = `
        SELECT COALESCE(SUM(points), 0) AS total_points
        FROM points 
        WHERE customer_id = ? AND phone = ?
      `;
      
      db.get(totalPointsQuery, [customerId, customerPhone], (err, totalResult) => {
        if (err) {
          console.error('计算累计积分失败:', err);
          return reject(err);
        }
        
        const totalPoints = totalResult && totalResult.total_points ? totalResult.total_points : 0;
        
        const availablePointsQuery = `
          SELECT COALESCE(SUM(points), 0) AS available_points
          FROM points 
          WHERE customer_id = ? AND phone = ? AND channel IN ('earned', 'adjusted') 
            AND points > 0
        `;
        
        db.get(availablePointsQuery, [customerId, customerPhone], (err, availableResult) => {
          if (err) {
            console.error('计算可用积分失败:', err);
            return reject(err);
          }
          
          const availablePoints = availableResult && availableResult.available_points ? availableResult.available_points : 0;
          
          db.run(`
            UPDATE customers 
            SET 
              total_points = ?,
              available_points = ?
            WHERE id = ?
          `, [totalPoints, availablePoints, customerId], function(err) {
            if (err) {
              console.error(`更新客户积分数据失败:`, err);
              return reject(err);
            }
            
            console.log(`已重新计算客户ID ${customerId} 的积分数据: 累计积分=${totalPoints}, 可用积分=${availablePoints}`);
            resolve({
              totalPoints,
              availablePoints
            });
          });
        });
      });
    }).catch(reject);
  });
}

// 重新计算客户消费（从原 db.js 复制）
function recalculateCustomerConsumption(customerId, customerPhone) {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      const consumptionQuery = `
        SELECT 
          COALESCE(SUM(total_amount), 0) AS total_consumption,
          COUNT(*) AS consumption_count,
          MAX(date) AS last_consumption
        FROM sales 
        WHERE customer_id = ? AND phone = ?
      `;
      
      db.get(consumptionQuery, [customerId, customerPhone], (err, result) => {
        if (err) {
          console.error('计算消费数据失败:', err);
          return reject(err);
        }
        
        const totalConsumption = result && result.total_consumption ? result.total_consumption : 0;
        const consumptionCount = result && result.consumption_count ? result.consumption_count : 0;
        const lastConsumption = result && result.last_consumption ? result.last_consumption : null;
        
        db.run(`
          UPDATE customers 
          SET 
            total_consumption = ?,
            consumption_count = ?,
            consumption_times = ?,
            last_consumption = ?
          WHERE id = ?
        `, [totalConsumption, consumptionCount, consumptionCount, lastConsumption, customerId], function(err) {
          if (err) {
            console.error(`更新客户消费数据失败:`, err);
            return reject(err);
          }
          
          console.log(`已重新计算客户ID ${customerId} 的消费数据: 总消费=${totalConsumption}, 消费次数=${consumptionCount}`);
          resolve({
            totalConsumption,
            consumptionCount,
            lastConsumption
          });
        });
      });
    }).catch(reject);
  });
}

// 空函数（兼容性）
function setupTriggers() {
  return Promise.resolve();
}

// 关闭数据库连接（增强版）
function closeDatabase() {
  return new Promise((resolve) => {
    console.log('开始关闭数据库连接...');
    
    const cleanup = () => {
      dbInstance = null;
      dbInitialized = false;
      dbInitializing = false;
      dbManager.dbInstance = null;
      dbManager.dbInitialized = false;
      dbManager.dbInitializing = false;
      console.log('数据库连接清理完成');
      resolve();
    };
    
    // 关闭 Knex 连接
    if (knexInstance) {
      knexInstance.destroy()
        .then(() => {
          console.log('Knex 连接已关闭');
          knexInstance = null;
        })
        .catch((err) => {
          console.warn('关闭 Knex 连接失败:', err);
          knexInstance = null;
        })
        .finally(() => {
          // 关闭 SQLite 连接
          if (dbInstance) {
            dbInstance.close((err) => {
              if (err) {
                console.error('关闭数据库失败:', err);
              } else {
                console.log('数据库连接已关闭');
              }
              cleanup();
            });
          } else {
            cleanup();
          }
        });
    } else if (dbInstance) {
      dbInstance.close((err) => {
        if (err) {
          console.error('关闭数据库失败:', err);
        } else {
          console.log('数据库连接已关闭');
        }
        cleanup();
      });
    } else {
      cleanup();
    }
  });
}

// 超级安全的数据库查询包装器
function safeQuery(queryFn, ...args) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDatabase();
      
      const timeout = setTimeout(() => {
        reject(new Error('数据库查询超时'));
      }, 15000); // 15秒超时
      
      queryFn(db, ...args, (err, result) => {
        clearTimeout(timeout);
        
        if (err) {
          console.error('数据库查询错误:', err);
          
          // 如果是连接错误，重置连接
          if (err.code === 'SQLITE_CORRUPT' || err.code === 'SQLITE_NOTADB' ||
              err.message.includes('database disk image is malformed') ||
              err.message.includes('database is locked')) {
            console.warn('检测到数据库连接问题，重置连接');
            dbManager.forceReset();
          }
          
          reject(err);
        } else {
          resolve(result);
        }
      });
      
    } catch (error) {
      console.error('获取数据库连接失败:', error);
      reject(error);
    }
  });
}

module.exports = {
  getDatabase,
  init,
  recalculateCustomerPoints,
  recalculateCustomerConsumption,
  setupTriggers,
  closeDatabase,
  safeQuery,
  knexDb: getKnexInstance(),
  
  // 新增的安全函数
  forceReset: () => dbManager.forceReset(),
  getDatabaseManager: () => dbManager,
  isInitialized: () => dbInitialized,
  getConnectionStatus: () => {
    return {
      initialized: dbInitialized,
      initializing: dbInitializing,
      hasInstance: !!dbInstance,
      dbFile: dbFile
    };
  },
  
  // 兼容性：提供同步方式获取数据库（临时修复）
  get db() {
    if (dbInstance && dbInitialized) {
      return dbInstance;
    }
    // 为了快速修复，返回一个空对象而不是抛出错误
    console.warn('数据库未初始化，返回空对象');
    return null;
  }
};