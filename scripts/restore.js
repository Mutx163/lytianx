const { db } = require('../config/firebase');
const { storage } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// 恢复配置
const config = {
    backupDir: path.resolve(__dirname, '../backups'),
    collections: ['users', 'posts', 'works', 'categories', 'tags', 'comments', 'settings']
};

// 主恢复函数
async function restore(backupDate) {
    try {
        console.log('开始恢复...');
        
        // 验证备份日期
        if (!backupDate || !/^\d{4}-\d{2}-\d{2}$/.test(backupDate)) {
            throw new Error('请提供有效的备份日期 (YYYY-MM-DD)');
        }
        
        const backupPath = path.join(config.backupDir, backupDate);
        if (!fs.existsSync(backupPath)) {
            throw new Error(`找不到备份: ${backupDate}`);
        }
        
        // 恢复数据前确认
        console.log('警告: 此操作将覆盖现有数据!');
        console.log('按 Ctrl+C 取消操作');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 恢复数据
        await restoreData(backupPath);
        
        // 恢复文件
        await restoreFiles(backupPath);
        
        // 恢复配置
        await restoreConfig(backupPath);
        
        console.log('恢复完成!');
        
    } catch (error) {
        console.error('恢复失败:', error);
        process.exit(1);
    }
}

// 恢复数据
async function restoreData(backupPath) {
    console.log('恢复数据...');
    
    for (const collection of config.collections) {
        console.log(`恢复集合: ${collection}`);
        
        const dataPath = path.join(backupPath, `${collection}.json`);
        if (!fs.existsSync(dataPath)) {
            console.warn(`跳过 ${collection}: 找不到备份文件`);
            continue;
        }
        
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const batch = db.batch();
        let count = 0;
        
        for (const item of data) {
            const { id, ...docData } = item;
            const docRef = db.collection(collection).doc(id);
            batch.set(docRef, docData);
            
            count++;
            if (count >= 500) { // Firestore 批量写入限制
                await batch.commit();
                count = 0;
            }
        }
        
        if (count > 0) {
            await batch.commit();
        }
    }
}

// 恢复文件
async function restoreFiles(backupPath) {
    console.log('恢复文件...');
    
    const filesPath = path.join(backupPath, 'files.json');
    if (!fs.existsSync(filesPath)) {
        console.warn('跳过文件恢复: 找不到文件列表');
        return;
    }
    
    const fileList = JSON.parse(fs.readFileSync(filesPath, 'utf8'));
    const bucket = storage.bucket();
    
    for (const file of fileList) {
        const sourcePath = path.join(backupPath, 'files', file.name);
        if (!fs.existsSync(sourcePath)) {
            console.warn(`跳过文件 ${file.name}: 找不到源文件`);
            continue;
        }
        
        await bucket.upload(sourcePath, {
            destination: file.name,
            metadata: file.metadata
        });
    }
}

// 恢复配置
async function restoreConfig(backupPath) {
    console.log('恢复配置...');
    
    const configPath = path.join(backupPath, 'config');
    if (!fs.existsSync(configPath)) {
        console.warn('跳过配置恢复: 找不到配置目录');
        return;
    }
    
    const configFiles = [
        'firebase.json',
        'firebase/firestore.rules',
        'firebase/storage.rules',
        'firebase/firestore.indexes.json',
        '.env'
    ];
    
    for (const file of configFiles) {
        const sourcePath = path.join(configPath, file);
        if (fs.existsSync(sourcePath)) {
            const destPath = path.resolve(__dirname, '..', file);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
        }
    }
}

// 获取命令行参数
const backupDate = process.argv[2];

// 执行恢复
restore(backupDate); 