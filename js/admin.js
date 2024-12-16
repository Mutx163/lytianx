document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // 加载 API 配置
    loadApiConfig();
    
    // 显示默认页面
    showSection('profile');
    
    // 检查必要的依赖是否加载
    if (typeof Chart === 'undefined') {
        console.warn('正在等待 Chart.js 加载...');
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                initCharts();
            }
        }, 1000);
    }
    
    // 导航处理
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // 初始化各个部分
    initProfileSection();
    initWorksSection();
    initBlogsSection();
    initAboutSection();
    initContactSection();
    initMessagesSection();
    initCategoriesSection();
    initTagsSection();
    initSettingsSection();
    
    // 根据 URL 显示对应页面
    const hash = window.location.hash.slice(1);
    if (hash) {
        showSection(hash);
    }
});

// 环境配置相关函数
let currentEnvironment = 'development';

// 切换环境
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
    window.API_BASE_URL = currentEnvironment === 'development' 
        ? settings.devApiServer 
        : settings.prodApiServer;
}

// 测试 API 服务器连接
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
            throw new Error('API 服务器连接失败');
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
        // 保存到 localStorage
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
    return `${window.API_BASE_URL}${endpoint}`;
}
