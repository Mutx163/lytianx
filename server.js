const AV = require('leanengine');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// 初始化 LeanEngine
AV.init({
    appId: process.env.LEANCLOUD_APP_ID || 'AFlTg3fRukmZ8KqMl01Y78dD-MdYXbMMI',
    appKey: process.env.LEANCLOUD_APP_KEY || 'N0muGm2nLMAEQQ27Mh37pVwO',
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

// 如果不是在本地环境，则使用 masterKey
if (process.env.LEANCLOUD_APP_ENV !== 'development') {
    AV.Cloud.useMasterKey();
}

const app = express();

// 启用 CORS
app.use(cors({
    origin: [
        'http://localhost:5000',
        'https://mutx-98098.web.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 基础中间件
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API 路由
app.get('/classes/Post', async (req, res) => {
    try {
        const query = new AV.Query('Post');
        query.equalTo('status', 'published');
        query.descending('createdAt');
        query.limit(6);
        const posts = await query.find();
        res.json({
            results: posts.map(post => post.toJSON())
        });
    } catch (error) {
        console.error('获取博客列表失败:', error);
        res.status(500).json({
            error: '获取博客列表失败'
        });
    }
});

app.get('/classes/Work', async (req, res) => {
    try {
        const query = new AV.Query('Work');
        query.equalTo('status', 'published');
        query.descending('createdAt');
        query.limit(6);
        const works = await query.find();
        res.json({
            results: works.map(work => work.toJSON())
        });
    } catch (error) {
        console.error('获取作品列表失败:', error);
        res.status(500).json({
            error: '获取作品列表失败'
        });
    }
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || '服务器错误'
    });
});

// 端口配置
const PORT = process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 