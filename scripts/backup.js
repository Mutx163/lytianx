const { db } = require('../config/firebase');
const { storage } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// 备份配置
const config = {
    backupDir: path.resolve(__dirname, '../backups'),
    collections: ['users', 'posts', 'works', 'categories', 'tags', 'comments', 'settings'],
    maxBackups: 7, // 保留最近7天的备份
};

// 主备份函数
async function backup() {
    try {
        console.log('开始备份...');
        const timestamp = new Date().toISOString().split('T')[0];
        
        // 创建备份目录
        const backupPath = path.join(config.backupDir, timestamp);
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        
        // 备份数据
        await backupData(backupPath);
        
        // 备份文件
        await backupFiles(backupPath);
        
        // 备份配置
        await backupConfig(backupPath);
        
        // 清理旧备份
        cleanOldBackups();
        
        console.log('备份完成!');
        
    } catch (error) {
        console.error('备份失败:', error);
        process.exit(1);
    }
}

// 备份数据
async function backupData(backupPath) {
    console.log('备份数据...');
    
    for (const collection of config.collections) {
        console.log(`备份集合: ${collection}`);
        const snapshot = await db.collection(collection).get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        fs.writeFileSync(
            path.join(backupPath, `${collection}.json`),
            JSON.stringify(data, null, 2)
        );
    }
}

// 备份文件
async function backupFiles(backupPath) {
    console.log('备份文件...');
    
    const [files] = await storage.bucket().getFiles();
    const fileList = [];
    
    for (const file of files) {
        fileList.push({
            name: file.name,
            metadata: file.metadata
        });
        
        // 下载文件
        const destPath = path.join(backupPath, 'files', file.name);
        await file.download({
            destination: destPath
        });
    }
    
    // 保存文件列表
    fs.writeFileSync(
        path.join(backupPath, 'files.json'),
        JSON.stringify(fileList, null, 2)
    );
}

// 备份配置
async function backupConfig(backupPath) {
    console.log('备份���置...');
    
    const configPath = path.join(backupPath, 'config');
    fs.mkdirSync(configPath, { recursive: true });
    
    // 复制配置文件
    const configFiles = [
        'firebase.json',
        'firebase/firestore.rules',
        'firebase/storage.rules',
        'firebase/firestore.indexes.json',
        '.env'
    ];
    
    for (const file of configFiles) {
        const sourcePath = path.resolve(__dirname, '..', file);
        if (fs.existsSync(sourcePath)) {
            const destPath = path.join(configPath, file);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
        }
    }
}

// 清理旧备份
function cleanOldBackups() {
    console.log('清理旧备份...');
    
    const backups = fs.readdirSync(config.backupDir)
        .filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name))
        .sort()
        .reverse();
    
    if (backups.length > config.maxBackups) {
        const oldBackups = backups.slice(config.maxBackups);
        for (const backup of oldBackups) {
            const backupPath = path.join(config.backupDir, backup);
            fs.rmSync(backupPath, { recursive: true });
            console.log(`删除旧备份: ${backup}`);
        }
    }
}

// 执行备份
backup(); 