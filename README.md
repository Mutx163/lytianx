# 个人主页项目

## 项目简介
这是一个基于 Firebase + LeanCloud 的个人主页项目，采用混合云架构设计，实现了高可用、低成本的个人网站解决方案。

## 技术栈
- 前端：HTML5, CSS3, JavaScript, TailwindCSS
- 后端：Node.js, Express, LeanCloud SDK
- 云服务：
  - Firebase (Hosting, Authentication)
  - LeanCloud (云引擎, 数据存储)
- 部署：GitHub Actions + Firebase CLI

## 功能特性
- 响应式设计，支持多端访问
- 用户认证和权限管理
- 内容管理系统
- 自动化部署流程
- 实时数据同步
- 性能监控和错误追踪

## 快速开始

### 环境要求
- Node.js >= 14.x
- Git
- Firebase CLI
- npm 或 yarn

### 安装步骤
1. 克隆项目
```bash
git clone https://github.com/Mutx163/personal-website
cd personal-website
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
- 复制 `.env.example` 为 `.env`
- 填写必要的配置信息

4. 本地开发
```bash
npm run dev
```

### 部署说明
使用 `deploy.bat` 脚本一键部署：
1. 运行脚本
```bash
./deploy.bat
```
2. 输入提交信息
3. 等待自动部署完成

## 项目结构
```
├── admin/                 # 管理后台
├── public/               # 前端静态文件
├── server/               # 后端服务
├── firebase/             # Firebase 配置
└── scripts/              # 部署脚本
```

## 配置说明

### Firebase 配置
在 `firebase.json` 中配置：
- Hosting 设置
- 安全规则
- API 转发规则

### LeanCloud 配置
在 `server/config` 中配置：
- 应用密钥
- 环境变量
- 云引擎设置

## 开发指南

### 本地开发
1. 启动开发服务器
```bash
npm run dev
```

2. 访问地址
- 前端页面：http://localhost:5000
- 管理后台：http://localhost:5000/admin

### 代码提交
1. 创建功能分支
```bash
git checkout -b feature/xxx
```

2. 提交代码
```bash
git add .
git commit -m "feat: xxx"
```

3. 合并主分支
```bash
git checkout main
git merge feature/xxx
```

## 维护说明

### 监控
- Firebase Console：前端监控
- LeanCloud 控制台：后端监控
- GitHub：代码版本控制

### 备份
- 数据定期备份
- 配置文件备份
- 代码仓库备份

## 常见问题

### 部署失败
- 检查 Git 配置
- 验证 Firebase 登录状态
- 确认 LeanCloud 配置

### API 错误
- 检查 API 密钥
- 验证请求格式
- 查看错误日志

## 更新日志
- 2024-01-xx：项目初始化
- 2024-01-xx：添加 Firebase 集成
- 2024-01-xx：集成 LeanCloud 服务
- 2024-01-xx：完善部署流程

## 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 发起 Pull Request

## 许可证
MIT License

## 数据库配置

本项目使用MySQL数据库进行数据存储，数据库连接信息如下：
- 数据库服务器：mysql.sqlpub.com
- 数据库名：mutx163

### 开发环境设置
1. 确保已安装Node.js和npm
2. 安装项目依赖：
```bash
npm install
```
3. 启动开发服务器：
```bash
node server.js
```

### 部署说明
- 后端服务（server/目录）部署在LeanCloud平台
- 数据库使用远程MySQL服务（mysql.sqlpub.com）
- 前端部署在Firebase平台

### 后端服务结构
```
server/
├── app.js              # 应用主入口
├── server.js           # 服务器配置
├── init-db.sql         # 数据库初始化
├── config/             # 配置文件
├── models/             # 数据模型
├── controllers/        # 控制器
├── routes/            # 路由定义
├── middlewares/       # 中间件
└── utils/             # 工具函数
```

### 技术栈
- 后端：Express.js + Node.js
- 数据库：MySQL
- 前端部署：Firebase Hosting
- 后端部署：LeanCloud（运行server目录）