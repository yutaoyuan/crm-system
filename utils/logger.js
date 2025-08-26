/**
 * 日志系统
 * 使用Winston实现结构化日志记录
 */
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// 获取适当的日志目录
function getLogDirectory() {
  let logDir;
  
  // 在 Electron 环境中使用应用数据目录
  if (process.versions.electron) {
    const { app } = require('electron');
    // 如果在主进程中，直接使用 app.getPath
    if (app && app.getPath) {
      logDir = path.join(app.getPath('userData'), 'logs');
    } else {
      // 如果在渲染进程或者 app 还未准备好，使用 resourcesPath
      logDir = path.join(process.resourcesPath, 'databaseFolder', 'logs');
    }
  } else {
    // 在普通 Node.js 环境中使用项目目录
    logDir = path.join(process.cwd(), 'logs');
  }
  
  return logDir;
}

// 确保日志目录存在
const logDir = getLogDirectory();
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  // 如果无法创建日志目录，使用临时目录
  console.warn('无法创建日志目录，将使用临时目录:', err.message);
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// 创建传输器数组
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  })
];

// 尝试添加文件传输器
try {
  // 所有日志文件（按日期轮转）
  transports.push(new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info',
    handleExceptions: false,
    handleRejections: false
  }));
  
  // 错误日志文件
  transports.push(new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    handleExceptions: false,
    handleRejections: false
  }));
  
  // 操作审计日志
  transports.push(new DailyRotateFile({
    filename: path.join(logDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '90d',
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    handleExceptions: false,
    handleRejections: false
  }));
} catch (err) {
  console.warn('无法创建文件日志传输器，将仅使用控制台输出:', err.message);
}

// 异常和拒绝处理器
let exceptionHandlers = [];
let rejectionHandlers = [];

try {
  exceptionHandlers.push(new DailyRotateFile({
    filename: path.join(logDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d'
  }));
  
  rejectionHandlers.push(new DailyRotateFile({
    filename: path.join(logDir, 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d'
  }));
} catch (err) {
  console.warn('无法创建异常日志文件，将使用控制台输出:', err.message);
}

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'crm-system',
    pid: process.pid,
    hostname: require('os').hostname()
  },
  transports: transports,
  exceptionHandlers: exceptionHandlers.length > 0 ? exceptionHandlers : undefined,
  rejectionHandlers: rejectionHandlers.length > 0 ? rejectionHandlers : undefined,
  exitOnError: false // 不要在未捕获异常时退出
});

// 扩展日志方法
class CRMLogger {
  constructor(winstonLogger) {
    this.logger = winstonLogger;
  }

  // 基础日志方法
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  // 业务日志方法
  apiAccess(req, res) {
    const responseTime = res.getHeader('X-Response-Time') || 0;
    this.info('API访问', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.session?.user?.username || 'anonymous',
      category: 'api_access'
    });
  }

  userLogin(username, success, ip, reason = null) {
    this.info('用户登录', {
      username,
      success,
      ip,
      reason,
      category: 'user_auth'
    });
  }

  userLogout(username, ip) {
    this.info('用户登出', {
      username,
      ip,
      category: 'user_auth'
    });
  }

  dataOperation(operation, table, recordId, user, oldData = null, newData = null) {
    this.info('数据操作', {
      operation, // create, read, update, delete
      table,
      recordId,
      user,
      oldData,
      newData,
      category: 'data_operation'
    });
  }

  securityEvent(event, details, severity = 'medium') {
    this.warn('安全事件', {
      event,
      details,
      severity,
      category: 'security'
    });
  }

  performanceMetric(metric, value, unit, context = {}) {
    this.info('性能指标', {
      metric,
      value,
      unit,
      context,
      category: 'performance'
    });
  }

  businessEvent(event, details, user) {
    this.info('业务事件', {
      event,
      details,
      user,
      category: 'business'
    });
  }

  // 创建子日志记录器
  child(meta) {
    const childLogger = this.logger.child(meta);
    return new CRMLogger(childLogger);
  }

  // 获取日志统计信息
  async getLogStats(days = 7) {
    // 这里可以实现日志统计逻辑
    // 比如读取日志文件，统计错误数量、API访问量等
    return {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      apiCalls: 0,
      uniqueUsers: 0,
      period: `${days} days`
    };
  }
}

// 创建CRM日志实例
const crmLogger = new CRMLogger(logger);

// 中间件：记录API访问
const logApiAccess = (req, res, next) => {
  const start = Date.now();
  
  // 记录响应时间
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    
    // 只在响应头未发送时设置响应时间头部
    if (!res.headersSent) {
      try {
        res.setHeader('X-Response-Time', responseTime);
      } catch (error) {
        // 忽略头部设置错误
      }
    }
    
    // 只记录API请求
    if (req.originalUrl.startsWith('/api/')) {
      crmLogger.apiAccess(req, res);
    }
  });
  
  next();
};

// 中间件：记录错误
const logError = (err, req, res, next) => {
  crmLogger.error('请求处理错误', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.session?.user?.username || 'anonymous',
    category: 'error'
  });
  
  next(err);
};

module.exports = {
  logger: crmLogger,
  logApiAccess,
  logError,
  winston: logger
};