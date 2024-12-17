const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 部署配置
const config = {
    sourceDir: path.resolve(__dirname, '..'),
    publicDir: path.resolve(__dirname, '../public'),
    distDir: path.resolve(__dirname, '../dist'),
    adminDir: path.resolve(__dirname, '../admin'),
};

// 主部署函数
async function deploy() {
    try {
        console.log('开始部署...');
        
        // 1. 清理目录
        cleanDirectories();
        
        // 2. 构建项目
        buildProject();
        
        // 3. 复制文件
        copyFiles();
        
        // 4. 部署到 Firebase
        deployToFirebase();
        
        console.log('部署完成!');
        
    } catch (error) {
        console.error('部署失败:', error);
        process.exit(1);
    }
}

// 清理目录
function cleanDirectories() {
    console.log('清理目录...');
    
    // 清理 public 目录
    if (fs.existsSync(config.publicDir)) {
        fs.rmSync(config.publicDir, { recursive: true });
    }
    fs.mkdirSync(config.publicDir);
    
    // 清理 dist ��录
    if (fs.existsSync(config.distDir)) {
        fs.rmSync(config.distDir, { recursive: true });
    }
    fs.mkdirSync(config.distDir);
}

// 构建项目
function buildProject() {
    console.log('构建项目...');
    
    // 安装依赖
    execSync('npm install', { stdio: 'inherit' });
    
    // 构建前端
    execSync('npm run build', { stdio: 'inherit' });
}

// 复制文件
function copyFiles() {
    console.log('复制文件...');
    
    // 复制前端文件到 public 目录
    copyDir(config.distDir, config.publicDir);
    
    // 复制管理后台文件
    copyDir(config.adminDir, path.join(config.publicDir, 'admin'));
    
    // 复制静态资源
    copyDir(
        path.join(config.sourceDir, 'static'),
        path.join(config.publicDir, 'static')
    );
}

// 复制目录
function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 部署到 Firebase
function deployToFirebase() {
    console.log('部署到 Firebase...');
    
    // 部署 Firestore 规则
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    
    // 部署 Storage 规则
    execSync('firebase deploy --only storage:rules', { stdio: 'inherit' });
    
    // 部署 Hosting
    execSync('firebase deploy --only hosting', { stdio: 'inherit' });
}

// 执行部署
deploy(); 