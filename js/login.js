document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // 这里使用简单的加密方式，实际应该使用更安全的方式
            const hashedPassword = await hashPassword(password);
            
            // 检查凭据
            if (checkCredentials(username, hashedPassword)) {
                // 设置登录状态
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUsername', username);
                localStorage.setItem('loginTime', new Date().toISOString());
                
                // 跳转到管理后台
                window.location.href = 'admin.html';
            } else {
                showError('用户名或密码错误');
            }
        } catch (error) {
            showError('登录失败，请重试');
            console.error('Login error:', error);
        }
    });
});

// 简单的密码哈希函数（实际应使用更安全的方法）
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 检查凭据（示例实现，实际应该使用后端验证）
function checkCredentials(username, hashedPassword) {
    // 默认管理员账号
    const defaultAdmin = {
        username: 'admin',
        // 这是 'admin123' 的 SHA-256 哈希值
        passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
    };

    // 如果是首次使用，设置默认管理员账号
    if (!localStorage.getItem('adminPasswordHash')) {
        localStorage.setItem('adminPasswordHash', defaultAdmin.passwordHash);
    }

    const storedHash = localStorage.getItem('adminPasswordHash');
    
    return username === defaultAdmin.username && hashedPassword === storedHash;
}

// 显示错误消息
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn && loginTime) {
        // 检查登录是否过期（例如24小时）
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
            // 登录未过期，跳转到管理后台
            window.location.href = 'admin.html';
        } else {
            // 登录已过期，清除登录状态
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            localStorage.removeItem('loginTime');
        }
    }
} 