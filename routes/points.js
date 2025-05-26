const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../models/db');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('../middleware/auth');
const authenticateToken = isAuthenticated;


// 获取客户列表用于下拉框
router.get('/util/customers', isAuthenticated, (req, res) => {
    db.all('SELECT id, name, phone FROM customers ORDER BY name', [], (err, customers) => {
      if (err) {
        return res.status(500).json({ message: '获取客户列表失败', error: err.message });
      }
      res.json(customers);
    });
  });

// Setup multer for file uploads
const upload = multer({ 
    dest: path.join(process.resourcesPath, 'databaseFolder', 'uploads'),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function(req, file, cb) {
        console.log('文件类型:', file.mimetype, file.originalname);
        
        // 检查文件扩展名
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
            return cb(null, true); // 允许上传
        }
        
        // 如果扩展名检查失败，检查MIME类型
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'application/vnd.ms-excel' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return cb(null, true); // 允许上传
        }
        
        // 所有检查都失败，拒绝文件
        cb(new Error('只允许上传 .csv, .xlsx 或 .xls 文件!'));
    }
});

// Get all points with pagination and search
router.get('/', authenticateToken, (req, res) => {
    try {
        console.log('GET /api/points 请求参数:', req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        
        console.log(`分页参数: page=${page}, limit=${limit}, search=${search}, offset=${offset}`);
        
        let countQuery = 'SELECT COUNT(*) as total FROM points p LEFT JOIN customers c ON p.customer_id = c.id';
        let query = `
            SELECT p.*, c.name as customer_name, c.phone as customer_phone 
            FROM points p 
            LEFT JOIN customers c ON p.customer_id = c.id`;
        
        if (search) {
            const searchCondition = `
                WHERE c.name LIKE ? OR c.phone LIKE ? OR p.notes LIKE ? OR p.channel LIKE ? OR p.name LIKE ? OR p.phone LIKE ? OR p.operator LIKE ?
            `;
            countQuery += searchCondition;
            query += searchCondition;
            
            const searchParam = `%${search}%`;
            const searchParams = Array(7).fill(searchParam);
            
            // Count total results
            db.get(countQuery, searchParams, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                
                const total = result.total;
                const totalPages = Math.ceil(total / limit);
                
                // Get paginated results
                query += ' ORDER BY p.date DESC LIMIT ? OFFSET ?';
                db.all(query, [...searchParams, limit, offset], (err, points) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    }
                    
                    console.log(`找到包含搜索条件 "${search}" 的积分记录: ${points.length}条`);
                    
                    res.json({
                        success: true,
                        data: points,
                        pagination: {
                            total,
                            totalPages,
                            currentPage: page,
                            limit
                        }
                    });
                    
                    // 添加在查询完成后打印客户-积分关联状态
                    db.all('SELECT COUNT(*) as count FROM points WHERE customer_id IS NULL', [], (err, result) => {
                        if (err) {
                            console.error('检查未关联客户积分记录错误:', err);
                            return;
                        }
                        
                        console.log(`数据库中未关联客户的积分记录数: ${result[0].count}`);
                    });
                });
            });
        } else {
            // No search, get all points with pagination
            db.get(countQuery, [], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                
                const total = result.total;
                const totalPages = Math.ceil(total / limit);
                
                query += ' ORDER BY p.date DESC LIMIT ? OFFSET ?';
                db.all(query, [limit, offset], (err, points) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    }
                    
                    console.log(`找到积分记录: ${points.length}条`);
                    
                    res.json({
                        success: true,
                        data: points,
                        pagination: {
                            total,
                            totalPages,
                            currentPage: page,
                            limit
                        }
                    });
                    
                    // 添加在查询完成后打印客户-积分关联状态
                    db.all('SELECT COUNT(*) as count FROM points WHERE customer_id IS NULL', [], (err, result) => {
                        if (err) {
                            console.error('检查未关联客户积分记录错误:', err);
                            return;
                        }
                        
                        console.log(`数据库中未关联客户的积分记录数: ${result[0].count}`);
                    });
                });
            });
        }
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Get a single point by ID
router.get('/:id', (req, res) => {
    try {
        const pointId = req.params.id;
        
        const query = `
            SELECT p.*, c.name as customer_name, c.phone as customer_phone 
            FROM points p 
            JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?
        `;
        
        db.get(query, [pointId], (err, point) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            if (!point) {
                return res.status(404).json({ success: false, message: 'Point not found' });
            }
            
            res.json({
                success: true,
                data: point
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Create a new point
router.post('/', (req, res) => {
    try {
        const { customer_id, channel, points, date, notes, operator } = req.body;
        
        // Validate required fields
        if (!customer_id || !channel || !points || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate point type
        const validChannels = ['earned', 'redeemed', 'expired', 'adjusted'];
        if (!validChannels.includes(channel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid point channel'
            });
        }
        
        // 确保积分兑换时使用负数
        let pointsValue = points;
        if (channel === 'redeemed' && pointsValue > 0) {
            pointsValue = -Math.abs(pointsValue);
        }
        
        // Validate customer exists
        db.get('SELECT id, name, phone FROM customers WHERE id = ?', [customer_id], (err, customer) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            
            // Insert the new point record
            const query = `
                INSERT INTO points (customer_id, channel, points, date, notes, name, phone, operator)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.run(query, [
                customer_id, 
                channel, 
                pointsValue, 
                date, 
                notes || '', 
                customer.name, 
                customer.phone,
                operator || ''
            ], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                
                const pointId = this.lastID;
                console.log(`已创建积分记录 ID: ${pointId}, 客户: ${customer.name}, 积分: ${pointsValue}`);
                
                // 使用recalculateCustomerPoints重新计算客户积分
                const { recalculateCustomerPoints } = require('../models/db');
                recalculateCustomerPoints(customer_id)
                    .then(() => {
                        res.status(201).json({
                            success: true,
                            message: 'Point created successfully',
                            data: { id: pointId }
                        });
                    })
                    .catch(err => {
                        console.error('重新计算积分失败:', err);
                        // 即使重新计算失败也返回成功，因为积分记录已经创建
                        res.status(201).json({
                            success: true,
                            message: 'Point created but failed to recalculate customer points',
                            data: { id: pointId }
                        });
                    });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Update a point
router.put('/:id', (req, res) => {
    try {
        const pointId = req.params.id;
        const { customer_id, channel, points, date, notes, operator } = req.body;
        
        // Validate required fields
        if (!customer_id || !channel || !points || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate point type
        const validChannels = ['earned', 'redeemed', 'expired', 'adjusted'];
        if (!validChannels.includes(channel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid point channel'
            });
        }
        
        // Check if point exists
        db.get('SELECT id FROM points WHERE id = ?', [pointId], (err, point) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            if (!point) {
                return res.status(404).json({ success: false, message: 'Point not found' });
            }
            
            // Validate customer exists
            db.get('SELECT id, name, phone FROM customers WHERE id = ?', [customer_id], (err, customer) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                
                if (!customer) {
                    return res.status(404).json({ success: false, message: 'Customer not found' });
                }
                
                // Update the point record
                const query = `
                    UPDATE points
                    SET customer_id = ?, channel = ?, points = ?, date = ?, notes = ?, name = ?, phone = ?, operator = ?
                    WHERE id = ?
                `;
                
                db.run(query, [
                    customer_id, 
                    channel, 
                    points, 
                    date, 
                    notes || '', 
                    customer.name, 
                    customer.phone, 
                    operator || '',
                    pointId
                ], function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    }
                    
                    console.log(`已更新积分记录 ID: ${pointId}, 客户: ${customer.name}, 积分: ${points}`);
                    
                    // 使用recalculateCustomerPoints重新计算客户积分
                    const { recalculateCustomerPoints } = require('../models/db');
                    recalculateCustomerPoints(customer_id)
                        .then(() => {
                            res.json({
                                success: true,
                                message: 'Point updated successfully'
                            });
                        })
                        .catch(err => {
                            console.error('重新计算积分失败:', err);
                            // 即使重新计算失败也返回成功，因为积分记录已经更新
                            res.json({
                                success: true,
                                message: 'Point updated but failed to recalculate customer points'
                            });
                        });
                });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Delete a point
router.delete('/:id', (req, res) => {
    try {
        const pointId = req.params.id;
        
        // Check if point exists
        db.get('SELECT id FROM points WHERE id = ?', [pointId], (err, point) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            if (!point) {
                return res.status(404).json({ success: false, message: 'Point not found' });
            }
            
            // 获取积分记录的详细信息，用于更新客户表
            db.get('SELECT customer_id, points, channel FROM points WHERE id = ?', [pointId], (err, pointDetails) => {
                if (err) {
                    console.error('获取积分记录详情失败:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                
                const customerId = pointDetails ? pointDetails.customer_id : null;
                
                // Delete the point
                db.run('DELETE FROM points WHERE id = ?', [pointId], function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    }
                    
                    console.log(`已删除积分记录 ID: ${pointId}`);
                    
                    // 如果有客户ID，重新计算客户积分
                    if (customerId) {
                        const { recalculateCustomerPoints } = require('../models/db');
                        recalculateCustomerPoints(customerId)
                            .then(() => {
                                res.json({
                                    success: true,
                                    message: 'Point deleted successfully'
                                });
                            })
                            .catch(err => {
                                console.error('重新计算积分失败:', err);
                                // 即使重新计算失败也返回成功，因为积分记录已经删除
                                res.json({
                                    success: true,
                                    message: 'Point deleted but failed to recalculate customer points'
                                });
                            });
                    } else {
                        res.json({
                            success: true,
                            message: 'Point deleted successfully'
                        });
                    }
                });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});



// 获取客户的可用积分
router.get('/util/customer/:customerId/points', (req, res) => {
    try {
        const customerId = req.params.customerId;
        
        // 先获取客户的电话号码
        db.get('SELECT phone FROM customers WHERE id = ?', [customerId], (err, customer) => {
            if (err) {
                console.error('获取客户电话号码失败:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            const customerPhone = customer ? customer.phone : null;
            console.log(`查询客户${customerId}的积分, 电话号码: ${customerPhone}`);
            
            // 查询客户积分总额（基于customer_id或phone）
            const query = `
                SELECT 
                    SUM(CASE 
                        WHEN channel = 'earned' OR (channel = 'adjusted' AND points > 0) THEN points 
                        ELSE 0 
                    END) - 
                    SUM(CASE 
                        WHEN channel = 'redeemed' OR channel = 'expired' OR (channel = 'adjusted' AND points < 0) THEN ABS(points) 
                        ELSE 0 
                    END) as availablePoints 
                FROM points 
                WHERE customer_id = ? OR (phone = ? AND phone IS NOT NULL AND phone != '')
            `;
            
            db.get(query, [customerId, customerPhone], (err, result) => {
                if (err) {
                    console.error('查询客户积分失败:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                
                const availablePoints = result && result.availablePoints ? result.availablePoints : 0;
                console.log(`客户${customerId}的可用积分: ${availablePoints}`);
                
                res.json({
                    success: true,
                    availablePoints: availablePoints
                });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Get all points for a customer
router.get('/customer/:customerId', (req, res) => {
    try {
        const customerId = req.params.customerId;
        
        // 先获取客户的电话号码
        db.get('SELECT phone FROM customers WHERE id = ?', [customerId], (err, customer) => {
            if (err) {
                console.error('获取客户电话号码失败:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            const customerPhone = customer ? customer.phone : null;
            
            // 查询积分记录（基于customer_id或phone）
            db.all(
                `SELECT * FROM points WHERE customer_id = ? OR (phone = ? AND phone IS NOT NULL AND phone != '') ORDER BY date DESC`,
                [customerId, customerPhone],
                (err, points) => {
                    if (err) {
                        console.error('查询客户积分记录失败:', err);
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    }
                    
                    console.log(`客户${customerId}的积分记录数: ${points.length}`);
                    
                    res.json({
                        success: true,
                        data: points
                    });
                }
            );
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Get points summary for a customer
router.get('/customer/:customerId/summary', (req, res) => {
    try {
        const customerId = req.params.customerId;
        
        // 先获取客户的电话号码
        db.get('SELECT phone FROM customers WHERE id = ?', [customerId], (err, customer) => {
            if (err) {
                console.error('获取客户电话号码失败:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }
            
            const customerPhone = customer ? customer.phone : null;
            
            // 查询积分总额（基于customer_id或phone）
            db.get(
                `SELECT 
                    SUM(CASE 
                        WHEN channel = 'earned' THEN points 
                        WHEN channel = 'adjusted' AND points > 0 THEN points
                        WHEN channel = 'redeemed' THEN points
                        WHEN channel = 'expired' THEN points
                        WHEN channel = 'adjusted' AND points < 0 THEN points
                        ELSE 0 
                    END) as total 
                FROM points 
                WHERE customer_id = ? OR (phone = ? AND phone IS NOT NULL AND phone != '')`,
                [customerId, customerPhone],
                (err, summary) => {
                    if (err) {
                        console.error('查询客户积分总额失败:', err);
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    }
                    
                    console.log(`客户${customerId}的积分总额: ${summary ? summary.total : 0}`);
                    
                    res.json({
                        success: true,
                        data: { total: summary && summary.total ? summary.total : 0 }
                    });
                }
            );
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Import points from CSV or Excel
router.post('/import', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            // 处理 multer 错误
            console.error('文件上传错误:', err.message);
            return res.status(400).json({ 
                success: false, 
                message: err.message || '文件上传失败' 
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: '未上传文件' });
            }
            
            const filePath = req.file.path;
            const importId = Date.now().toString();
            const results = [];
            
            // 创建导入状态对象
            const importStatus = {
                id: importId,
                total: 0,
                processed: 0,
                success: 0,
                failed: 0,
                current: '',
                errors: [],
                completed: false
            };
            
            // 返回导入ID
            res.status(202).json({
                success: true,
                message: '导入已开始',
                data: { importId }
            });
            
            // 处理文件逻辑
            const processFile = async () => {
                try {
                    // 根据文件类型选择处理方法
                    const fileExt = path.extname(req.file.originalname).toLowerCase();
                    const mimeType = req.file.mimetype;
                    
                    console.log('处理文件:', req.file.originalname, 'mime类型:', mimeType);
                    
                    // 判断是CSV还是Excel
                    let isCSV = fileExt === '.csv' || mimeType === 'text/csv';
                    let isExcel = fileExt === '.xlsx' || fileExt === '.xls' || 
                                 mimeType === 'application/vnd.ms-excel' || 
                                 mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    
                    if (isCSV) {
                        // 处理 CSV 文件
                        await processCSV(filePath, results);
                    } else if (isExcel) {
                        // 处理 Excel 文件
                        await processExcel(filePath, results);
                    } else {
                        throw new Error('不支持的文件类型');
                    }
                    
                    importStatus.total = results.length;
                    
                    // 批量处理参数
                    const batchSize = 100;
                    let currentBatch = [];
                    let existingCustomers = new Map(); // 用于存储已存在的客户信息
                    
                    // 首先获取所有已存在的客户电话
                    try {
                        const customers = await new Promise((resolve, reject) => {
                            db.all('SELECT id, name, phone FROM customers', [], (err, rows) => {
                                if (err) return reject(err);
                                resolve(rows);
                            });
                        });
                        
                        // 将客户信息存入Map以便快速查找
                        customers.forEach(customer => {
                            existingCustomers.set(customer.phone, customer);
                        });
                        
                        console.log(`已加载 ${existingCustomers.size} 条客户记录用于查找`);
                    } catch (err) {
                        console.error('加载客户数据失败:', err);
                        importStatus.errors.push(`加载客户数据失败: ${err.message}`);
                    }
                    
                    // 处理每一行数据，构建批处理数组
                    for (const row of results) {
                        importStatus.processed++;
                        importStatus.current = `Processing row ${importStatus.processed} of ${importStatus.total}`;
                        
                        try {
                            // Validate and provide defaults for required fields
                            // 确保积分值存在且为数字
                            if (!row.points) {
                                row.points = 0;
                                importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 缺少积分值，已设为0`);
                            }
                            
                            // 确保积分为数字
                            row.points = parseFloat(row.points) || 0;
                            
                            // 如果积分为负数，自动设置为"redeemed"（积分兑换）
                            if (row.points < 0 && (!row.channel || row.channel !== 'redeemed')) {
                                const oldChannel = row.channel || '未指定';
                                row.channel = 'redeemed';
                                importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 积分为负数(${row.points})，渠道从 "${oldChannel}" 自动调整为 "redeemed"`);
                            }
                            
                            // 确保日期存在，如果不存在，使用当前日期
                            if (!row.date) {
                                row.date = new Date().toISOString().split('T')[0]; // 使用当前日期 YYYY-MM-DD
                                importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 缺少日期，已使用当前日期(${row.date})`);
                            }
                            
                            // 确保渠道存在，如果不存在，根据积分值判断
                            if (!row.channel) {
                                row.channel = row.points >= 0 ? 'earned' : 'redeemed';
                                importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 缺少渠道，已根据积分值设为 "${row.channel}"`);
                            }
                            
                            // 处理客户信息
                            let customerInfo = null;
                            let customerId = null;
                            
                            // 如果有电话号码，尝试从缓存中查找客户
                            if (row.customer_phone) {
                                // 查找客户
                                customerInfo = existingCustomers.get(row.customer_phone);
                                if (customerInfo) {
                                    customerId = customerInfo.id;
                                } else {
                                    // 客户不存在，使用独立积分记录
                                    console.log(`积分导入 - 客户不存在，使用独立积分记录: ${row.customer_phone}`);
                                    importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 未找到客户 '${row.customer_phone}'，使用独立积分记录`);
                                }
                            } 
                            // 如果没有电话号码但有姓名和电话字段
                            else if (row.name && row.phone) {
                                // 使用直接提供的名称和电话
                                row.customer_phone = row.phone; // 保持一致性
                                
                                // 尝试从缓存中查找客户
                                customerInfo = existingCustomers.get(row.phone);
                                if (customerInfo) {
                                    customerId = customerInfo.id;
                                } else {
                                    // 客户不存在，使用独立积分记录
                                    console.log(`积分导入 - 客户不存在，使用独立积分记录: ${row.phone}`);
                                    importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 未找到客户 '${row.phone}'，使用独立积分记录`);
                                }
                            }
                            // 如果既没有customer_phone，也没有同时提供name和phone
                            else {
                                // 创建一个独立积分记录，不跳过
                                console.log(`积分导入 - 缺少客户信息，使用独立积分记录`);
                                importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 缺少客户信息，使用独立积分记录`);
                                // 确保有一个基本的名称和电话占位符
                                row.name = row.name || '未知客户';
                                row.customer_phone = row.customer_phone || '未提供';
                            }
                            
                            // Validate point type
                            const validChannels = ['earned', 'redeemed', 'expired', 'adjusted'];
                            if (validChannels.indexOf(row.channel.toLowerCase()) === -1) {
                                // 如果不是标准类型，使用默认值
                                const oldChannel = row.channel;
                                if (['获得', '获取', '增加', '奖励', '消费'].indexOf(row.channel) !== -1) {
                                    row.channel = 'earned';
                                } else if (['使用', '减少', '兑换', '消费', '兑奖'].indexOf(row.channel) !== -1) {
                                    row.channel = 'redeemed';
                                } else if (['过期'].indexOf(row.channel) !== -1) {
                                    row.channel = 'expired';
                                } else if (['调整', '修改'].indexOf(row.channel) !== -1) {
                                    row.channel = 'adjusted';
                                } else {
                                    // 默认根据积分值判断
                                    row.channel = row.points >= 0 ? 'earned' : 'redeemed';
                                }
                                importStatus.errors.push(`Row ${importStatus.processed}: 警告 - 未知渠道 "${oldChannel}"，已转换为 "${row.channel}"`);
                            }
                            
                            // 准备批量插入的数据对象
                            const pointRecord = {
                                customerId: customerId,
                                channel: row.channel,
                                points: row.points,
                                date: row.date,
                                notes: row.notes || '',
                                name: customerInfo ? customerInfo.name : row.name || '未知客户',
                                phone: customerInfo ? customerInfo.phone : row.customer_phone || '未提供',
                                operator: row.operator || ''
                            };
                            
                            // 添加到当前批次
                            currentBatch.push(pointRecord);
                            
                            // 当达到批处理大小或处理完所有记录时执行批量插入
                            if (currentBatch.length >= batchSize || importStatus.processed === importStatus.total) {
                                try {
                                    await processBatch(currentBatch, importStatus);
                                    // 清空当前批次
                                    currentBatch = [];
                                } catch (err) {
                                    importStatus.errors.push(`批量插入失败: ${err.message}`);
                                    console.error('批量插入失败:', err);
                                }
                            }
                        } catch (err) {
                            importStatus.failed++;
                            importStatus.errors.push(`Row ${importStatus.processed}: ${err.message}`);
                        }
                    }
                    
                    importStatus.completed = true;
                    importStatus.current = 'Import completed';
                } catch (err) {
                    importStatus.completed = true;
                    importStatus.current = 'Import failed: ' + err.message;
                    console.error('Import error:', err);
                } finally {
                    // Delete the temporary file
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting temp file:', err);
                    });
                }
            };
            
            // 批量处理函数
            async function processBatch(batch, importStatus) {
                if (batch.length === 0) return;
                console.log(`开始批量处理 ${batch.length} 条积分记录`);
                return new Promise((resolve, reject) => {
                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION', (err) => {
                            if (err) return reject(err);
                            const withCustomerIdStmt = db.prepare(`
                                INSERT INTO points (customer_id, channel, points, date, notes, name, phone, operator) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `);
                            const withoutCustomerIdStmt = db.prepare(`
                                INSERT INTO points (channel, points, date, notes, name, phone, operator) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `);
                            let successCount = 0;
                            let errorCount = 0;
                            let finished = 0;
                            const total = batch.length;
                            if (total === 0) {
                                withCustomerIdStmt.finalize();
                                withoutCustomerIdStmt.finalize();
                                return resolve();
                            }
                            batch.forEach((record, index) => {
                                try {
                                    const cb = function(err) {
                                        finished++;
                                        if (err) {
                                            errorCount++;
                                            importStatus.errors.push(`记录 ${importStatus.processed - batch.length + index + 1}: 插入失败: ${err.message}`);
                                            console.error(`插入积分记录失败:`, err.message, record);
                                        } else {
                                            successCount++;
                                            console.log(`成功插入积分记录, ID: ${this.lastID}`);
                                        }
                                        if (finished === total) {
                                            withCustomerIdStmt.finalize();
                                            withoutCustomerIdStmt.finalize();
                                            db.run('COMMIT', (err) => {
                                                if (err) {
                                                    db.run('ROLLBACK', () => {
                                                        console.error('事务回滚:', err);
                                                        importStatus.failed += batch.length;
                                                        reject(err);
                                                    });
                                                } else {
                                                    console.log(`批量插入完成: 成功 ${successCount} 条, 失败 ${errorCount} 条`);
                                                    importStatus.success += successCount;
                                                    importStatus.failed += errorCount;
                                                    resolve();
                                                }
                                            });
                                        }
                                    };
                                    if (record.customerId) {
                                        withCustomerIdStmt.run(
                                            record.customerId,
                                            record.channel,
                                            record.points,
                                            record.date,
                                            record.notes,
                                            record.name,
                                            record.phone,
                                            record.operator,
                                            cb
                                        );
                                    } else {
                                        withoutCustomerIdStmt.run(
                                            record.channel,
                                            record.points,
                                            record.date,
                                            record.notes,
                                            record.name,
                                            record.phone,
                                            record.operator,
                                            cb
                                        );
                                    }
                                } catch (err) {
                                    finished++;
                                    errorCount++;
                                    importStatus.errors.push(`记录 ${importStatus.processed - batch.length + index + 1}: 处理失败: ${err.message}`);
                                    console.error(`处理记录失败:`, err, record);
                                    if (finished === total) {
                            withCustomerIdStmt.finalize();
                            withoutCustomerIdStmt.finalize();
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    db.run('ROLLBACK', () => {
                                        console.error('事务回滚:', err);
                                        importStatus.failed += batch.length;
                                        reject(err);
                                    });
                                } else {
                                    console.log(`批量插入完成: 成功 ${successCount} 条, 失败 ${errorCount} 条`);
                                    importStatus.success += successCount;
                                    importStatus.failed += errorCount;
                                    resolve();
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    });
                });
            }
            
            // CSV 文件处理函数
            const processCSV = (filePath, results) => {
                return new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csv())
                        .on('data', (data) => {
                            // 确保字段名称一致性 - 支持中文字段名
                            const processedRow = {
                                // 支持多种可能的字段名
                                customer_phone: data.customer_phone || data['客户电话'] || data['电话'] || data['手机号'] || data['手机'] || 
                                               data['客户手机'] || data['phone'] || data['电话号码'] || data['联系电话'] || '',
                                
                                channel: data.channel || data['渠道'] || data['途径'] || data['类型'] || data['积分类型'] || 
                                         data['channel'] || data['type'] || data['积分途径'] || data['积分渠道'] || 
                                         data['业务类型'] || data['变更类型'] || data['获取方式'] || '',
                                
                                points: data.points || data['积分'] || data['积分值'] || data['points'] || data['积分数'] || 
                                        data['积分数量'] || data['分值'] || data['数量'] || data['变更积分'] || data['变更值'] || data['amount'] || '',
                                
                                date: data.date || data['日期'] || data['时间'] || data['创建日期'] || data['操作日期'] || 
                                      data['date'] || data['create_time'] || data['create_date'] || data['操作时间'] || data['变更日期'] || '',
                                
                                notes: data.notes || data['备注'] || data['说明'] || data['附注'] || data['notes'] || 
                                       data['remark'] || data['description'] || data['memo'] || data['comment'] || '',
                                
                                name: data.name || data['姓名'] || data['客户姓名'] || data['会员姓名'] || data['联系人'] || 
                                      data['name'] || data['customer_name'] || data['client_name'] || data['用户姓名'] || '',
                                
                                operator: data.operator || data['操作员'] || data['操作人'] || data['经办人'] || data['营业员'] || 
                                          data['operator'] || data['staff'] || data['业务员'] || data['销售员'] || ''
                            };
                            
                            // 自动处理积分值
                            // 1. 确保积分值是数字
                            if (processedRow.points !== '') {
                                // 移除非数字字符（保留负号）
                                let pointsValue = processedRow.points.toString().replace(/[^-0-9.]/g, '');
                                
                                // 处理特殊的"-"或者"负"开头的情况
                                if (processedRow.points.toString().match(/^[\s-]*负/) || 
                                    processedRow.points.toString().toLowerCase().includes('消费') ||
                                    processedRow.points.toString().toLowerCase().includes('兑换') ||
                                    processedRow.points.toString().toLowerCase().includes('使用')) {
                                    
                                    // 如果是消费/兑换相关文本但没有负号，添加负号
                                    if (!pointsValue.startsWith('-')) {
                                        pointsValue = '-' + pointsValue;
                                    }
                                }
                                
                                processedRow.points = parseFloat(pointsValue) || 0;
                                
                                // 2. 如果积分为负数，并且没有指定渠道或渠道不是redeemed，设置为redeemed
                                if (processedRow.points < 0 && 
                                   (!processedRow.channel || 
                                    !['redeemed', '积分兑换', '兑换', '使用', '扣减', '消费'].includes(processedRow.channel.toLowerCase()))) {
                                    processedRow.channel = 'redeemed';
                                }
                                
                                // 3. 如果积分为正数，并且没有指定渠道，设置为earned
                                if (processedRow.points >= 0 && !processedRow.channel) {
                                    processedRow.channel = 'earned';
                                }
                            }
                            
                            // 处理渠道名称映射
                            if (processedRow.channel) {
                                const channelLower = processedRow.channel.toLowerCase();
                                if (['积分兑换', '兑换', '使用', '扣减', '消费', '消费积分', '积分消费'].includes(channelLower)) {
                                    processedRow.channel = 'redeemed';
                                } else if (['获得积分', '获得', '增加', '奖励', '赠送', '赠予', '消费赠送'].includes(channelLower)) {
                                    processedRow.channel = 'earned';
                                } else if (['过期', '过期积分', '作废'].includes(channelLower)) {
                                    processedRow.channel = 'expired';
                                } else if (['调整', '修改', '人工调整', '纠错'].includes(channelLower)) {
                                    processedRow.channel = 'adjusted';
                                }
                            }
                            
                            // 强制根据积分值确定渠道
                            if (processedRow.points > 0) {
                                // 为正数积分设置为earned渠道
                                processedRow.channel = 'earned';
                            } else if (processedRow.points < 0) {
                                // 为负数积分设置为redeemed渠道
                                processedRow.channel = 'redeemed';
                            }
                            
                            // 记录处理的行
                            const rowIndex = results.length + 1;
                            console.log(`处理CSV第${rowIndex}行:`, JSON.stringify(processedRow));
                            
                            results.push(processedRow);
                        })
                        .on('end', () => {
                            resolve();
                        })
                        .on('error', (error) => {
                            reject(error);
                        });
                });
            };
            
            // Excel 文件处理函数
            const processExcel = (filePath, results) => {
                return new Promise((resolve, reject) => {
                    try {
                        const workbook = xlsx.readFile(filePath);
                        const sheetName = workbook.SheetNames[0]; // 使用第一个工作表
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });
                        
                        console.log('Excel数据示例:', JSON.stringify(jsonData[0]));
                        
                        // 将处理后的数据添加到结果数组
                        jsonData.forEach((row, index) => {
                            // 确保字段名称一致性 - 支持中文字段名
                            const processedRow = {
                                // 支持多种可能的字段名
                                customer_phone: row.customer_phone || row['客户电话'] || row['电话'] || row['手机号'] || row['手机'] || 
                                                row['客户手机'] || row['phone'] || row['电话号码'] || row['联系电话'] || '',
                                
                                channel: row.channel || row['渠道'] || row['途径'] || row['类型'] || row['积分类型'] || 
                                         row['channel'] || row['type'] || row['积分途径'] || row['积分渠道'] || 
                                         row['业务类型'] || row['变更类型'] || row['获取方式'] || '',
                                
                                points: row.points || row['积分'] || row['积分值'] || row['points'] || row['积分数'] || 
                                        row['积分数量'] || row['分值'] || row['数量'] || row['变更积分'] || row['变更值'] || row['amount'] || '',
                                
                                date: row.date || row['日期'] || row['时间'] || row['创建日期'] || row['操作日期'] || 
                                      row['date'] || row['create_time'] || row['create_date'] || row['操作时间'] || row['变更日期'] || '',
                                
                                notes: row.notes || row['备注'] || row['说明'] || row['附注'] || row['notes'] || 
                                       row['remark'] || row['description'] || row['memo'] || row['comment'] || '',
                                
                                name: row.name || row['姓名'] || row['客户姓名'] || row['会员姓名'] || row['联系人'] || 
                                      row['name'] || row['customer_name'] || row['client_name'] || row['用户姓名'] || '',
                                
                                operator: row.operator || row['操作员'] || row['操作人'] || row['经办人'] || row['营业员'] || 
                                          row['operator'] || row['staff'] || row['业务员'] || row['销售员'] || ''
                            };
                            
                            // 自动处理积分值
                            // 1. 确保积分值是数字
                            if (processedRow.points !== '') {
                                // 移除非数字字符（保留负号）
                                let pointsValue = processedRow.points.toString().replace(/[^-0-9.]/g, '');
                                
                                // 处理特殊的"-"或者"负"开头的情况
                                if (processedRow.points.toString().match(/^[\s-]*负/) || 
                                    processedRow.points.toString().toLowerCase().includes('消费') ||
                                    processedRow.points.toString().toLowerCase().includes('兑换') ||
                                    processedRow.points.toString().toLowerCase().includes('使用')) {
                                    
                                    // 如果是消费/兑换相关文本但没有负号，添加负号
                                    if (!pointsValue.startsWith('-')) {
                                        pointsValue = '-' + pointsValue;
                                    }
                                }
                                
                                processedRow.points = parseFloat(pointsValue) || 0;
                                
                                // 2. 如果积分为负数，并且没有指定渠道或渠道不是redeemed，设置为redeemed
                                if (processedRow.points < 0 && 
                                   (!processedRow.channel || 
                                    !['redeemed', '积分兑换', '兑换', '使用', '扣减', '消费'].includes(processedRow.channel.toLowerCase()))) {
                                    processedRow.channel = 'redeemed';
                                }
                                
                                // 3. 如果积分为正数，并且没有指定渠道，设置为earned
                                if (processedRow.points >= 0 && !processedRow.channel) {
                                    processedRow.channel = 'earned';
                                }
                            }
                            
                            // 处理渠道名称映射
                            if (processedRow.channel) {
                                const channelLower = processedRow.channel.toLowerCase();
                                if (['积分兑换', '兑换', '使用', '扣减', '消费', '消费积分', '积分消费'].includes(channelLower)) {
                                    processedRow.channel = 'redeemed';
                                } else if (['获得积分', '获得', '增加', '奖励', '赠送', '赠予', '消费赠送'].includes(channelLower)) {
                                    processedRow.channel = 'earned';
                                } else if (['过期', '过期积分', '作废'].includes(channelLower)) {
                                    processedRow.channel = 'expired';
                                } else if (['调整', '修改', '人工调整', '纠错'].includes(channelLower)) {
                                    processedRow.channel = 'adjusted';
                                }
                            }
                            
                            // 强制根据积分值确定渠道
                            if (processedRow.points > 0) {
                                // 为正数积分设置为earned渠道
                                processedRow.channel = 'earned';
                            } else if (processedRow.points < 0) {
                                // 为负数积分设置为redeemed渠道
                                processedRow.channel = 'redeemed';
                            }
                            
                            // 记录处理的行
                            console.log(`处理第${index+1}行:`, JSON.stringify(processedRow));
                            
                            results.push(processedRow);
                        });
                        
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            
            // 开始处理文件
            processFile();
            
            // Store the import status in memory for polling
            global.importStatuses = global.importStatuses || {};
            global.importStatuses[importId] = importStatus;
            
            // Clean up old import statuses after 1 hour
            setTimeout(() => {
                if (global.importStatuses && global.importStatuses[importId]) {
                    delete global.importStatuses[importId];
                }
            }, 3600000);
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    });
});

// Get import status
router.get('/import/:id/status', (req, res) => {
    try {
        const importId = req.params.id;
        
        if (!global.importStatuses || !global.importStatuses[importId]) {
            return res.status(404).json({ success: false, message: 'Import not found' });
        }
        
        res.json({
            success: true,
            data: global.importStatuses[importId]
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;