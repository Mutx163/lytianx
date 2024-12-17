// 全局变量
let currentEnvironment = 'development';
let API_BASE_URL;
const APP_ID = 'AFlTg3fRukmZ8KqMl01Y78dD-MdYXbMMI';
const APP_KEY = 'N0muGm2nLMAEQQ27Mh37pVwO';

// 显示加载动画
function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

// 隐藏加载动画
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// 初始化 API 基础地址
function initApiBaseUrl() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    currentEnvironment = settings.currentEnvironment || 'development';
    
    if (window.location.hostname === 'mutx163.github.io') {
        API_BASE_URL = 'https://mutx1636.avosapps.us';  // 生产环境
    } else {
        // 检查是否有保存的 API 地址
        if (currentEnvironment === 'development' && settings.devApiServer) {
            API_BASE_URL = settings.devApiServer;
        } else if (currentEnvironment === 'production' && settings.prodApiServer) {
            API_BASE_URL = settings.prodApiServer;
        } else {
            // 默认本地开发地址
            API_BASE_URL = 'http://localhost:3000';
                
            // 保存默认配置
            settings.devApiServer = API_BASE_URL;
            settings.prodApiServer = 'https://mutx1636.avosapps.us';
            localStorage.setItem('siteSettings', JSON.stringify(settings));
        }
    }
    console.log('Current Environment:', currentEnvironment);
    console.log('Current API_BASE_URL:', API_BASE_URL);
}

// 环境配置相关函数
function switchEnvironment() {
    const envSelect = document.getElementById('env-select');
    currentEnvironment = envSelect.value;
    
    // 更新当前使用的 API 地址
    updateApiBaseUrl();
    
    // 保存环境设置
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    settings.currentEnvironment = currentEnvironment;
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    // 提示用户环境已切换
    alert(`已切换到${currentEnvironment === 'development' ? '开发' : '生产'}环境`);
}

// 更新 API 基础地址
function updateApiBaseUrl() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    API_BASE_URL = currentEnvironment === 'development' 
        ? settings.devApiServer 
        : settings.prodApiServer;
    console.log('API_BASE_URL updated to:', API_BASE_URL);
}

// 身份验证检查
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLoginForm();
        return false;
    }
    return true;
}

// 显示登录表单
function showLoginForm() {
    hideSpinner(); // 确保加载动画被隐藏
    const content = document.querySelector('main');
    if (!content) return;

    content.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        管理员登录
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        开发环境默认账号密码
                    </p>
                </div>
                <form id="login-form" class="mt-8 space-y-6">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="username" class="sr-only">用户名</label>
                            <input id="username" name="username" type="text" required 
                                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                                   placeholder="用户名"
                                   value="admin">
                            <div class="mt-1 text-sm text-gray-500 pl-2">
                                默认用户名: admin
                            </div>
                        </div>
                        <div>
                            <label for="password" class="sr-only">密码</label>
                            <input id="password" name="password" type="password" required 
                                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                                   placeholder="密码"
                                   value="admin123">
                            <div class="mt-1 text-sm text-gray-500 pl-2">
                                默认密码: admin123
                            </div>
                        </div>
                    </div>
                    <div id="login-error" class="text-red-500 text-sm text-center hidden"></div>
                    <div>
                        <button type="submit" 
                                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            登录
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // 添加登录表单提交事件
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            showSpinner();
            console.log('开始登录请求...');
            console.log('API_BASE_URL:', API_BASE_URL);
            
            const loginUrl = `${API_BASE_URL}/api/admin/login`;
            console.log('登录 URL:', loginUrl);
            
            const requestData = { username, password };
            console.log('请求数据:', { username, password: '***' });
            
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(2, 15);
            const sign = await generateSign(timestamp, nonce);
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer init_token'
                },
                mode: 'cors',
                body: JSON.stringify(requestData)
            });
            
            console.log('收到响应:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const data = await response.json();
            console.log('响应数据:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || '登录失败');
            }

            if (!data.token) {
                throw new Error('服务器响应中缺少 token');
            }

            console.log('登录成功，保存 token...');
            localStorage.setItem('adminToken', data.token);
            
            // 添加登录成功日志
            addLog('auth', '管理员登录成功');
            
            console.log('重新加载页面...');
            window.location.reload();
        } catch (error) {
            console.error('登录失败:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack
            });
            
            // 添加登录失败日志
            addLog('error', `登录失败: ${error.message}`);
            
            // 显示错误信息
            loginError.textContent = error.message || '登录失败，请检查用户名和密码';
            loginError.classList.remove('hidden');
            
            // 如果是网络错误，显示更友好的提示
            if (error instanceof TypeError && error.message.includes('fetch')) {
                loginError.textContent = '无法连接到服务器，请检查网络连接或服务器状态';
                console.log('当前 API 地址:', API_BASE_URL);
                console.log('请确保后端服务器正在运行，并且监听正确的端口');
            }
        } finally {
            hideSpinner();
        }
    });
}

// 生成签名
async function generateSign(timestamp, nonce) {
    const signStr = `${timestamp},${nonce},${APP_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hashHex},${timestamp},${nonce}`;
}

// 初始化函数
async function initAdmin() {
    try {
        // 初始化 API 基础地址
        initApiBaseUrl();
        
        // 显示加载动画
        showSpinner();
        
        // 检查登录状态
        if (!checkAuth()) {
            showLoginForm();
            hideSpinner();
            return;
        }

        // 加载必要的脚本
        await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
        
        // 创建页面基本结构
        await loadMainContent();
        
        // 初始化导航
        handleNavigation();
        
        // 根据当前 URL hash 初始化页面
        const hash = window.location.hash.slice(1) || 'profile';
        await switchToSection(hash);
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('初始化失败，请刷新页面重试');
    } finally {
        hideSpinner();
    }
}

// 加载主页面内容
async function loadMainContent() {
    try {
        // 获取主内容区域
        const mainContent = document.querySelector('main');
        if (!mainContent) {
            console.error('找不到主内容区域');
            return;
        }

        // 创建基本的 section 结构
        const sections = [
            'profile', 'works', 'blogs', 'about', 'contact', 
            'messages', 'categories', 'tags', 'settings', 'statistics', 'logs'
        ];

        // 清空当前内容
        mainContent.innerHTML = '';
        
        // 为每个部分创建 section
        sections.forEach(sectionName => {
            const section = document.createElement('section');
            section.id = `${sectionName}-section`;
            section.className = 'section hidden';
            mainContent.appendChild(section);
        });

        // 默认显示第一个 section
        const firstSection = mainContent.querySelector('.section');
        if (firstSection) {
            firstSection.classList.remove('hidden');
        }

        console.log('主页面内容加载完成');
    } catch (error) {
        console.error('加载主页面内容失败:', error);
        throw error;
    }
}

// 初始化特定部分
async function initSection(section) {
    console.log(`初始化部分: ${section}`);
    switch(section) {
        case 'profile':
            await initProfileSection();
            break;
        case 'works':
            await initWorksSection();
            break;
        case 'blogs':
            await initBlogsSection();
            break;
        case 'about':
            await initAboutSection();
            break;
        case 'contact':
            await initContactSection();
            break;
        case 'messages':
            await initMessagesSection();
            break;
        case 'categories':
            await initCategoriesSection();
            break;
        case 'tags':
            await initTagsSection();
            break;
        case 'settings':
            await initSettingsSection();
            break;
    }
}

// 导航处理函数
function handleNavigation() {
    console.log('开始设置导航事件监听器');
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`找到 ${navItems.length} 个导航项`);

    // 处理 URL hash 变化
    window.addEventListener('hashchange', async function() {
        const hash = window.location.hash.slice(1) || 'profile';
        console.log(`URL hash 变化为: ${hash}`);
        await switchToSection(hash);
    });

    navItems.forEach(item => {
        item.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log(`点击了导航项: ${item.textContent}`);
            
            // 如果是退出登录按钮，执行退出登录
            if (item.textContent === '退出登录') {
                logout();
                return;
            }

            const section = item.getAttribute('data-section');
            console.log(`目标部分: ${section}`);

            // 更新 URL（这会触发 hashchange 事件）
            window.location.hash = section;
        });
        console.log(`为 ${item.textContent} 设置了点击事件监听器`);
    });
}

// 切换到指定部分
async function switchToSection(section) {
    try {
        showSpinner();
        
        // 更新导航项状态
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.getAttribute('data-section') === section) {
                navItem.classList.add('active');
            }
        });

        // 更新内容区域
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.add('hidden');
        });

        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            // 初始化目标部分
            await initSection(section);
        } else {
            console.error(`找不到目标部分: ${section}-section`);
            // 如果找不到目标部分，切换到默认部分
            if (section !== 'profile') {
                await switchToSection('profile');
            }
        }
    } catch (error) {
        console.error('切换部分失败:', error);
        showError('切换页面失败');
    } finally {
        hideSpinner();
    }
}

// 退出登录函数
function logout() {
    localStorage.removeItem('adminToken');
    window.location.reload();
}

// 只保留一个 DOMContentLoaded 事件监听器
document.addEventListener('DOMContentLoaded', initAdmin);

// 修改导航样式
const style = document.createElement('style');
style.textContent = `
    .nav-item {
        display: block;
        padding: 0.75rem 1rem;
        color: #4B5563;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
    }
    
    .nav-item:hover {
        background-color: #F3F4F6;
        color: #1F2937;
    }
    
    .nav-item.active {
        background-color: #E5E7EB;
        color: #1F2937;
        font-weight: 600;
    }
    
    .section {
        display: none;
    }
    
    .section:not(.hidden) {
        display: block;
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// 加载外部脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 显示错误消息
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// 页面加载完后始化
document.addEventListener('DOMContentLoaded', initAdmin);

// 测试 API 服务器接
async function testApiConnection() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const apiServer = currentEnvironment === 'development' 
        ? document.getElementById('dev-api-server').value 
        : document.getElementById('prod-api-server').value;

    if (!apiServer) {
        alert('请输入 API 服务器地址');
        return;
    }

    try {
        showSpinner();
        const response = await fetch(`${apiServer}/api/test`);
        if (!response.ok) {
            throw new Error('API ���务器连接失败');
        }
        const data = await response.json();
        alert('API 服务器连接成功！');
    } catch (error) {
        console.error('API 连接测试失败:', error);
        alert('API 服务器连接失败: ' + error.message);
    } finally {
        hideSpinner();
    }
}

// 保存 API 服务器配置
function saveApiConfig() {
    const devApiServer = document.getElementById('dev-api-server').value;
    const prodApiServer = document.getElementById('prod-api-server').value;

    if (!devApiServer || !prodApiServer) {
        alert('请输入完整的 API 服务器配置');
        return;
    }

    try {
        // 保存 localStorage
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        settings.devApiServer = devApiServer;
        settings.prodApiServer = prodApiServer;
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        
        // 更新当前使用的 API 地址
        updateApiBaseUrl();
        
        alert('API 服务器配置已保存！');
        addLog('settings', '更新 API 服务器配置');
    } catch (error) {
        console.error('保存 API 配置失败:', error);
        alert('保存配置失败: ' + error.message);
    }
}

// 加载 API 配置
function loadApiConfig() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    // 设置环境
    currentEnvironment = settings.currentEnvironment || 'development';
    document.getElementById('env-select').value = currentEnvironment;
    
    // 设置 API 地址
    if (settings.devApiServer) {
        document.getElementById('dev-api-server').value = settings.devApiServer;
    }
    if (settings.prodApiServer) {
        document.getElementById('prod-api-server').value = settings.prodApiServer;
    }
    
    // 更新当前使用的 API 地址
    updateApiBaseUrl();
}

// 获取 API URL
function getAPIUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// 添加系统日
function addLog(type, message) {
    try {
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        logs.unshift({
            timestamp: new Date().toISOString(),
            type,
            message
        });
        // 只保留最近的 100 条日志
        if (logs.length > 100) {
            logs.pop();
        }
        localStorage.setItem('systemLogs', JSON.stringify(logs));
    } catch (error) {
        console.error('添加日志失败:', error);
    }
}

// 显示错误提示
function showErrorMessage(message, duration = 3000) {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, duration);
    }
}

// 显示成功提示
function showSuccessMessage(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), duration);
}

// 发送 API 请求的通用函数
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token || AUTH_TOKEN}`,
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        mode: 'cors'
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || '请求失败');
    }

    return data;
}

// 初始化个人信息部分
async function initProfileSection() {
    console.log('初始化个人信息部分');
    try {
        const response = await fetchAPI('/api/profile');
        const profile = await response.json();
        displayProfile(profile);
    } catch (error) {
        console.error('加载个人信息失败:', error);
        showError('加载个人信息失败');
    }
}

// 初始化作品部分
async function initWorksSection() {
    console.log('初始化作品部分');
    try {
        const response = await fetchAPI('/api/works');
        const works = await response.json();
        displayWorks(works);
    } catch (error) {
        console.error('加载作品失败:', error);
        showError('加载作品失败');
    }
}

// 初始化博客部分
async function initBlogsSection() {
    console.log('初始化博客部分');
    try {
        const response = await fetchAPI('/api/blogs');
        const blogs = await response.json();
        displayBlogs(blogs);
    } catch (error) {
        console.error('加载博客失败:', error);
        showError('加载博客失败');
    }
}

// 初始化关于部分
async function initAboutSection() {
    console.log('初始化关于部分');
    try {
        const response = await fetchAPI('/api/about');
        const about = await response.json();
        displayAbout(about);
    } catch (error) {
        console.error('加载关于页面内容失败:', error);
        showError('加载关于页面内容失败');
    }
}

// 初始化联系方式部分
async function initContactSection() {
    console.log('初始化联系方式部分');
    try {
        const response = await fetchAPI('/api/contact');
        const contact = await response.json();
        displayContact(contact);
    } catch (error) {
        console.error('加载联系方式失败:', error);
        showError('加载联系方式失败');
    }
}

// 初始化留言部分
async function initMessagesSection() {
    console.log('初始化留言部分');
    try {
        const response = await fetchAPI('/api/messages');
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('加载留言失败:', error);
        showError('加载留言失败');
    }
}

// 初始化分类部分
async function initCategoriesSection() {
    console.log('初始化分类部分');
    try {
        const response = await fetchAPI('/api/categories');
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('加载分类失败:', error);
        showError('加载分类失败');
    }
}

// 初始化标签部分
async function initTagsSection() {
    console.log('初始化标签部分');
    try {
        const response = await fetchAPI('/api/tags');
        const tags = await response.json();
        displayTags(tags);
    } catch (error) {
        console.error('加载标签失败:', error);
        showError('加载标签失败');
    }
}

// 初始化设置部分
async function initSettingsSection() {
    console.log('初始化设置部分');
    loadApiConfig();
}

// 初始化统计部分
async function initStatisticsSection() {
    console.log('初始化统计部分');
    try {
        const response = await fetchAPI('/api/statistics');
        const stats = await response.json();
        displayStatistics(stats);
    } catch (error) {
        console.error('加载统计数据失败:', error);
        showError('加载统计数据失败');
    }
}

// 初始化日志部分
async function initLogsSection() {
    console.log('初始化日志部分');
    try {
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        displayLogs(logs);
    } catch (error) {
        console.error('加载日志失败:', error);
        showError('加载日志失败');
    }
}

// 显示作品列表
function displayWorks(works) {
    const container = document.getElementById('works-list');
    if (!container) return;

    container.innerHTML = works.map(work => `
        <div class="bg-white rounded-lg shadow p-4">
            <img src="${work.image}" alt="${work.title}" class="w-full h-48 object-cover rounded">
            <h3 class="text-lg font-semibold mt-2">${work.title}</h3>
            <p class="text-gray-600">${work.description}</p>
            <div class="mt-4 flex justify-end">
                <button onclick="editWork(${work.id})" class="btn-secondary mr-2">编辑</button>
                <button onclick="deleteWork(${work.id})" class="btn-danger">删除</button>
            </div>
        </div>
    `).join('');
}

// 显示博客列表
function displayBlogs(blogs) {
    const container = document.getElementById('blogs-list');
    if (!container) return;

    container.innerHTML = blogs.map(blog => `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold">${blog.title}</h3>
                    <p class="text-gray-600 mt-1">${blog.category_name || '未分类'}</p>
                    <div class="flex gap-2 mt-2">
                        ${(blog.tags || []).map(tag => 
                            `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="editBlog(${blog.id})" class="btn-secondary">编辑</button>
                    <button onclick="deleteBlog(${blog.id})" class="btn-danger">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 显示留言列表
function displayMessages(messages) {
    const container = document.getElementById('messages-list');
    if (!container) return;

    container.innerHTML = messages.map(message => `
        <div class="bg-white rounded-lg shadow p-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <h3 class="font-semibold">${message.name}</h3>
                    <p class="text-gray-600 text-sm">${message.email}</p>
                </div>
                <span class="text-sm text-gray-500">${new Date(message.created_at).toLocaleString()}</span>
            </div>
            <p class="mt-2">${message.message}</p>
            ${message.reply ? `
                <div class="mt-4 bg-gray-50 p-3 rounded">
                    <p class="text-sm font-semibold">回复</p>
                    <p class="text-sm">${message.reply}</p>
                </div>
            ` : `
                <div class="mt-4">
                    <button onclick="replyToMessage(${message.id})" class="btn-secondary">回复</button>
                </div>
            `}
        </div>
    `).join('');
}

// 显示分类列表
function displayCategories(categories) {
    const container = document.getElementById('categories-list');
    if (!container) return;

    container.innerHTML = categories.map(category => `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-center">
                <h3 class="font-semibold">${category.name}</h3>
                <div class="flex gap-2">
                    <button onclick="editCategory(${category.id})" class="btn-secondary">编辑</button>
                    <button onclick="deleteCategory(${category.id})" class="btn-danger">删除</button>
                </div>
            </div>
            <p class="text-gray-600 mt-2">${category.description || '暂无描述'}</p>
        </div>
    `).join('');
}

// 显示标签列表
function displayTags(tags) {
    const container = document.getElementById('tags-list');
    if (!container) return;

    container.innerHTML = tags.map(tag => `
        <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2">
            <span>${tag.name}</span>
            <button onclick="deleteTag(${tag.id})" class="text-red-500 hover:text-red-700">×</button>
        </div>
    `).join('');
}

// 加载统计数据
async function loadStatistics() {
    try {
        const response = await fetch(getAPIUrl('/api/stats/visits'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        displayStatistics(data);
    } catch (error) {
        console.error('加载统计数据失败:', error);
        showError('加载统计数据失败');
    }
}

// 显示统计数据
function displayStatistics(data) {
    // 新访问量数据
    document.getElementById('total-visits')?.textContent = data.total || 0;
    document.getElementById('today-visits')?.textContent = data.today || 0;
    
    // 更新热门博客
    if (data.popularBlogs && data.popularBlogs.length > 0) {
        const container = document.getElementById('popular-blogs');
        if (container) {
            container.innerHTML = data.popularBlogs.map(blog => `
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold">${blog.title}</h3>
                    <p class="text-sm text-gray-600">访问量：${blog.views}</p>
                </div>
            `).join('');
        }
    }
}

// 获取用户代理信息
async function getUserAgentInfo() {
    try {
        if (navigator.userAgentData) {
            // 使用现代的 User-Agent Client Hints API
            const platformInfo = await navigator.userAgentData.getHighEntropyValues([
                "platform",
                "platformVersion",
                "architecture",
                "model",
                "uaFullVersion"
            ]);
            
            return {
                platform: platformInfo.platform,
                version: platformInfo.platformVersion,
                fullVersion: platformInfo.uaFullVersion,
                architecture: platformInfo.architecture,
                model: platformInfo.model
            };
        } else {
            // 降级处理：返回基本信息
            return {
                platform: 'unknown',
                version: 'unknown',
                fullVersion: 'unknown',
                architecture: 'unknown',
                model: 'unknown'
            };
        }
    } catch (error) {
        console.warn('获取用户代理信息失败:', error);
        return {
            platform: 'unknown',
            version: 'unknown',
            fullVersion: 'unknown',
            architecture: 'unknown',
            model: 'unknown'
        };
    }
}

// 记录访问
async function recordVisit(pageId, pageType) {
    try {
        const userAgentInfo = await getUserAgentInfo();
        const visitData = {
            page_id: pageId,
            page_type: pageType,
            platform: userAgentInfo.platform,
            device_info: JSON.stringify(userAgentInfo)
        };

        const response = await fetch(getAPIUrl('/api/stats/visit'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(visitData)
        });

        if (!response.ok) {
            throw new Error('记录访问失败');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('记录访问失败:', error);
        // 这里我们不显示错误给用户，因为这是后台统计功能
        return null;
    }
}
