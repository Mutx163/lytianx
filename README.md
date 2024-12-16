# 个人主页项目

这是一个基于 Express + MySQL 的个人主页项目，包含博客、作品展示等功能。

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js, Express
- 数据库：MySQL
- 部署：GitHub Pages (前端) + LeanCloud (后端)

## 环境要求

- Node.js >= 18.0.0
- MySQL >= 5.7

## 开发环境配置

1. 克隆项目：
```bash
git clone https://github.com/mutx163/mutx163.github.io.git
cd mutx163.github.io
```

2. 安装依赖：
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

3. 配置环境变量：
- 复制 `server/.env.example` 为 `server/.env`
- 修改数据库配置：
  ```
  DB_HOST=mysql.sqlpub.com
  DB_PORT=3306
  DB_USER=mutx163
  DB_PASSWORD=865xqu8GKm0crj9N
  DB_NAME=mutx163
  ```

4. 启动开发服务器：
```bash
# 在 server 目录下
npm run dev
```

开发环境说明：
- 前端访问地址：`http://localhost:5500`（使用 Live Server）
- 后端 API 地址：`http://localhost:3000`
- 使用 MySQL 数据库存储数据

## 生产环境部署

项目采用前后端分离部署：

### 前端部署 (GitHub Pages)

1. 推送代码到 GitHub：
```bash
git add .
git commit -m "更新内容"
git push origin main
```

2. 前端自动部署到 GitHub Pages：`https://mutx163.github.io`

### 后端部署 (LeanCloud)

1. 在 LeanCloud 创建应用
2. 配置环境变量：
   - `LEANCLOUD_APP_ID`
   - `LEANCLOUD_APP_KEY`
   - `LEANCLOUD_APP_MASTER_KEY`
   - `NODE_ENV=production`

3. 部署后端代码到 LeanCloud：
   - 后端服务地址：`https://mutx1636.avosapps.us`

生产环境说明：
- 前端通过 GitHub Pages 提供服务
- 后端部署在 LeanCloud
- 数据库使用相同的 MySQL 实例

## 目录结构

```
├── index.html              # 主页
├── js/                     # JavaScript 文件
│   └── script.js          # 主要脚本文件
├── css/                    # 样式文件
├── images/                # 图片资源
├── server/                # 后端代码
│   ├── app.js            # 主应用文件
│   ├── config/           # 配置文件
│   ├── middleware/       # 中间件
│   └── package.json      # 后端依赖
└── README.md             # 项目说明文档
```

## 功能特性

- 响应式设计，支持移动端访问
- 博客文章管理
- 作品展示
- 留言板功能
- 访问统计
- 评论系统
- 黑暗模式支持
- 搜索功能

## 开发注意事项

1. 本地开发时使用 `npm run dev` 启动后端服务
2. 前端开发使用 Live Server 或类似工具
3. 确保数据库配置正确
4. 文件上传功能在开发环境保存到本地，生产环境使用 LeanCloud 存储

## 部署注意事项

1. 确保 LeanCloud 环境变量配置正确
2. 前端代码中的 API 地址会根据环境自动切换
3. 数据库连接信息保持不变
4. 文件上传路径会根据环境自动切换

## 更新记录

### 2024-01-16
- 优化了开发环境配置
- 统一了数据库配置
- 完善了部署文档

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License