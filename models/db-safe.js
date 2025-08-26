/**
 * 安全的数据库初始化模块
 * 处理 Electron 环境下的 SQLite 兼容性问题
 */

const path = require('path');
const fs = require('fs');

// 数据库安全初始化函数
function initializeDatabaseSafely() {
  return new Promise((resolve, reject) => {
    try {
      // 动态加载 SQLite，避免初始化时的循环依赖
      const sqlite3 = require('sqlite3').verbose();
      
      // 判断是否为开发环境
      const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === '1';
      
      // 获取数据库路径
      let dbPath;
      if (isDev) {
        dbPath = path.join(__dirname, '../databaseFolder/database.db3');
      } else {
        if (process.resourcesPath) {
          dbPath = path.join(process.resourcesPath, 'databaseFolder', 'database.db3');
        } else {
          const os = require('os');
          const userDataPath = path.join(os.homedir(), '.crm-system');
          dbPath = path.join(userDataPath, 'database.db3');
        }
      }
      
      // 确保目录存在
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      console.log('安全数据库初始化 - 数据库路径:', dbPath);
      
      // 创建数据库连接
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          reject(err);
          return;
        }
        
        console.log('数据库连接成功');
        
        // 启用外键约束
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.warn('启用外键约束失败:', err);
          }
        });
        
        // 设置性能优化
        db.run('PRAGMA journal_mode = WAL');
        db.run('PRAGMA synchronous = NORMAL');
        db.run('PRAGMA cache_size = 1000');
        db.run('PRAGMA temp_store = MEMORY');
        
        resolve(db);
      });
      
      // 错误处理
      db.on('error', (err) => {
        console.error('数据库运行时错误:', err);
      });
      
    } catch (error) {
      console.error('数据库模块加载失败:', error);
      reject(error);
    }
  });
}

// 创建表的安全函数
function createTablesIfNotExists(db) {
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
    
    let completedTables = 0;
    const totalTables = tables.length;
    
    tables.forEach(table => {
      db.run(table.sql, (err) => {
        if (err) {
          console.error(`创建表 ${table.name} 失败:`, err);
          reject(err);
          return;
        }
        
        console.log(`表 ${table.name} 创建/验证成功`);
        completedTables++;
        
        if (completedTables === totalTables) {
          resolve();
        }
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
        const bcrypt = require('bcrypt');
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

module.exports = {
  initializeDatabaseSafely,
  createTablesIfNotExists,
  createDefaultUser
};