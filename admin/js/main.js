import authService from './services/auth';
import api from './services/api';

// 初始化应用
async function initApp() {
    try {
        // 检查认证状态
        if (!authService.isAuthenticated()) {
            window.location.href = '/admin/login.html';
            return;
        }
        
        // 获取当前用户
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            await authService.logout();
            window.location.href = '/admin/login.html';
            return;
        }
        
        // 初始化页面
        initPage();
        
        // 加载数据
        await loadData();
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('初始化失败: ' + error.message);
    }
}

// 初始化页面
function initPage() {
    // 设置用户信息
    const user = authService.getCurrentUser();
    document.getElementById('username').textContent = user.email;
    
    // 绑定事件
    document.getElementById('logout').addEventListener('click', async () => {
        try {
            await authService.logout();
            window.location.href = '/admin/login.html';
        } catch (error) {
            console.error('登出失败:', error);
            showError('登出失败: ' + error.message);
        }
    });
}

// 加载数据
async function loadData() {
    try {
        // 加载统计数据
        const stats = await loadStats();
        updateStats(stats);
        
        // 加载最新文章
        const posts = await loadPosts();
        updatePosts(posts);
        
        // 加载最新作品
        const works = await loadWorks();
        updateWorks(works);
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('加载数据失败: ' + error.message);
    }
}

// 加载统计数据
async function loadStats() {
    const stats = await api.list('stats', {
        orderBy: [['createdAt', 'desc']],
        limit: 1
    });
    return stats[0] || {};
}

// 加载最新文章
async function loadPosts() {
    return await api.list('posts', {
        where: [['status', '==', 'published']],
        orderBy: [['createdAt', 'desc']],
        limit: 5
    });
}

// 加载最新作品
async function loadWorks() {
    return await api.list('works', {
        where: [['status', '==', 'published']],
        orderBy: [['createdAt', 'desc']],
        limit: 5
    });
}

// 更新统计数据
function updateStats(stats) {
    document.getElementById('total-posts').textContent = stats.totalPosts || 0;
    document.getElementById('total-works').textContent = stats.totalWorks || 0;
    document.getElementById('total-comments').textContent = stats.totalComments || 0;
    document.getElementById('total-views').textContent = stats.totalViews || 0;
}

// 更新文章列表
function updatePosts(posts) {
    const container = document.getElementById('latest-posts');
    container.innerHTML = posts.map(post => `
        <div class="post-item">
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 100)}...</p>
            <div class="post-meta">
                <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                <a href="/admin/posts/edit.html?id=${post.id}">编辑</a>
            </div>
        </div>
    `).join('');
}

// 更新作品列表
function updateWorks(works) {
    const container = document.getElementById('latest-works');
    container.innerHTML = works.map(work => `
        <div class="work-item">
            <img src="${work.coverImage}" alt="${work.title}">
            <h3>${work.title}</h3>
            <p>${work.description.substring(0, 100)}...</p>
            <div class="work-meta">
                <span>${new Date(work.createdAt).toLocaleDateString()}</span>
                <a href="/admin/works/edit.html?id=${work.id}">编辑</a>
            </div>
        </div>
    `).join('');
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp); 