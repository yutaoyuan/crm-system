// 设置控制台编码
process.env.LANG = 'zh_CN.UTF-8';
process.env.LC_ALL = 'zh_CN.UTF-8';

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const cors = require('cors');
const { db, init, setupTriggers } = require('./models/db');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { isAuthenticated } = require('./middleware/auth');
const net = require('net');

// 导入路由
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const salesRoutes = require('./routes/sales');
const pointsRoutes = require('./routes/points');
const visitsRoutes = require('./routes/visits');

const app = express();
let PORT = process.env.PORT || 3002;

// 查找可用端口的函数
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
}

// 配置中间件
app.use(logger('dev', {
  charset: 'utf-8'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

// 更详细的CORS配置
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // 允许所有来源
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 添加调试中间件，打印所有请求
app.use((req, res, next) => {
  console.log('======= 请求详情 =======');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Session ID:', req.sessionID);
  console.log('User:', req.session?.user?.username || 'none');
  console.log('===========================');
  next();
});

// 配置会话
const sessionStorePath = path.join(process.resourcesPath, 'databaseFolder');
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: sessionStorePath
  }),
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1天
  }
}));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/visits', visitsRoutes);

// 前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Setup a simple route to ensure server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the customers page
app.get('/customers', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'customers.html'));
});

// Serve the points page
app.get('/points', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'points.html'));
});

// Serve the points page from /pages/points path (for compatibility)
app.get('/pages/points', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'points.html'));
});

// Serve the sales page
app.get('/sales', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'sales.html'));
});

// Serve the sales page from /pages/sales path (for compatibility)
app.get('/pages/sales', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'sales.html'));
});

// Serve the customers page from /pages/customers path (for compatibility)
app.get('/pages/customers', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'customers.html'));
});

// Serve the visits page
app.get('/visits', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'visits.html'));
});

// Serve the visits page from /pages/visits path (for compatibility)
app.get('/pages/visits', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'visits.html'));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // Render the error page
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// 初始化数据库和启动服务器
init()
  .then(async () => {
    try {
      PORT = await findAvailablePort(PORT);
      app.listen(PORT, () => {
      });
    } catch (err) {
      console.error('启动服务器失败:', err);
    }
  })
  .catch(err => {
    console.error('数据库初始化失败:', err);
  });

module.exports = { app, PORT }; 