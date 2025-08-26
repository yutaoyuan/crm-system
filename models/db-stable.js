/**
 * 稳定的数据库连接模块 - 专门解决 SQLite 崩溃问题
 * 
 * 主要改进：
 * 1. 同步执行 PRAGMA 语句
 * 2. 更好的错误处理和恢复机制
 * 3. 连接池管理
 * 4. 防止并发操作冲突
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// 延迟加载 SQLite3，避免模块加载时的循环依赖
let sqlite3 = null;
let knex = null;

// 数据库连接状态
let dbInstance = null;
let dbInitialized = false;
let dbInitializing = false;
let knexInstance = null;

// 获取数据库路径
function getDatabasePath() {
  const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === '1';
  
  if (isDev) {
    return path.join(__dirname, '../databaseFolder/database.db3');
  } else {
    if (process.resourcesPath) {
      return path.join(process.resourcesPath, 'databaseFolder', 'database.db3');
    } else {
      const os = require('os');
      const userDataPath = path.join(os.homedir(), '.crm-system');
      return path.join(userDataPath, 'database.db3');
    }
  }
}

const dbFile = getDatabasePath();

// 确保数据库目录存在
function ensureDatabaseDirectory() {
  const dbDir = path.dirname(dbFile);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('数据库目录创建成功:', dbDir);
    } catch (e) {
      console.error('创建数据库目录失败:', e);
      throw e;
    }
  }
  
  try {
    fs.accessSync(dbDir, fs.constants.W_OK);
    console.log('数据库目录可写:', dbDir);
  } catch (e) {
    console.error('数据库目录不可写:', dbDir, e);
    throw e;
  }
}

// 安全的数据库连接函数
function createSafeConnection() {
  return new Promise((resolve, reject) => {
    if (!sqlite3) {
      sqlite3 = require('sqlite3').verbose();
    }
    
    ensureDatabaseDirectory();
    
    const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('数据库连接失败:', err);
        reject(err);
        return;
      }
      
      console.log('数据库连接成功:', dbFile);
      
      // 使用 serialize 确保 PRAGMA 语句按顺序执行
      db.serialize(() => {
        // 启用外键约束
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.warn('启用外键约束失败:', err);
          } else {
            console.log('外键约束已启用');
          }
        });
        
        // 设置 WAL 模式（写前日志）
        db.run('PRAGMA journal_mode = WAL', (err) => {
          if (err) {
            console.warn('设置WAL模式失败:', err);
          } else {
            console.log('WAL模式已启用');
          }
        });
        
        // 设置同步模式
        db.run('PRAGMA synchronous = NORMAL', (err) => {
          if (err) {
            console.warn('设置同步模式失败:', err);
          } else {
            console.log('同步模式已设置');
          }
        });
        
        // 设置缓存大小
        db.run('PRAGMA cache_size = 1000', (err) => {
          if (err) {
            console.warn('设置缓存大小失败:', err);
          } else {
            console.log('缓存大小已设置');
          }
        });
        
        // 设置临时存储
        db.run('PRAGMA temp_store = MEMORY', (err) => {
          if (err) {
            console.warn('设置临时存储失败:', err);
          } else {
            console.log('临时存储已设置');
          }
        });
        
        resolve(db);
      });
    });
    
    // 错误处理
    db.on('error', (err) => {
      console.error('数据库运行时错误:', err);
      // 重置连接状态，允许重新连接
      dbInitialized = false;
      dbInstance = null;
    });
    
    db.on('close', () => {
      console.log('数据库连接已关闭');
      dbInitialized = false;
      dbInstance = null;
    });
  });
}

// 获取数据库连接（带重试机制）
async function getDatabase() {
  if (dbInstance && dbInitialized) {
    return dbInstance;
  }
  
  if (dbInitializing) {
    // 等待正在进行的初始化
    return new Promise((resolve, reject) => {
      const checkInit = () => {
        if (dbInitialized && dbInstance) {
          resolve(dbInstance);
        } else if (!dbInitializing) {
          reject(new Error('Database initialization failed'));
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  }
  
  dbInitializing = true;
  
  try {
    dbInstance = await createSafeConnection();
    dbInitialized = true;
    dbInitializing = false;
    return dbInstance;
  } catch (error) {
    dbInitializing = false;
    dbInitialized = false;
    dbInstance = null;
    throw error;
  }
}

// 创建数据库表
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
    
    db.serialize(() => {
      tables.forEach((table, index) => {
        db.run(table.sql, (err) => {
          if (err) {
            console.error(`创建表 ${table.name} 失败:`, err);
            reject(err);
            return;
          }
          
          console.log(`表 ${table.name} 创建/验证成功`);
          completed++;
          
          if (completed === tables.length) {
            resolve();
          }
        });
      });
    });
  });
}

// 创建默认用户
function createDefaultUser(db) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", ["zhaochunyan"], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        bcrypt.hash('zcy@123456', 10, (err, hash) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", 
            ["zhaochunyan", hash, "zhaochunyan@example.com"], (err) => {
            if (err) {
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

// 初始化数据库
async function init() {
  try {
    console.log('开始初始化数据库...');
    const db = await getDatabase();
    
    console.log('创建数据库表...');
    await createTables(db);
    
    console.log('创建默认用户...');
    await createDefaultUser(db);
    
    console.log('数据库初始化完成');
    return db;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 获取 Knex 实例
function getKnexInstance() {
  if (!knexInstance) {
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
        max: 10,
        afterCreate: (conn, done) => {
          // 启用外键约束
          conn.run('PRAGMA foreign_keys = ON', done);
        }
      }
    };
    
    knexInstance = knex(knexConfig);
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

// 关闭数据库连接
function closeDatabase() {
  return new Promise((resolve) => {
    if (dbInstance) {
      dbInstance.close((err) => {
        if (err) {
          console.error('关闭数据库失败:', err);
        } else {
          console.log('数据库连接已关闭');
        }
        dbInstance = null;
        dbInitialized = false;
        resolve();
      });
    } else {
      resolve();
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
  knexDb: getKnexInstance(),
  // 兼容性：提供同步方式获取数据库（不推荐在新代码中使用）
  get db() {
    if (dbInstance && dbInitialized) {
      return dbInstance;
    }
    throw new Error('Database not initialized. Use getDatabase() instead.');
  }
};