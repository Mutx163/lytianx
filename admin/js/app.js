// 应用初始化
class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        try {
            utils.logger.mark('appInit');
            utils.logger.info('SYSTEM', '开始初始化应用');

            // 初始化工具
            utils.logger.mark('utilsInit');
            await this.initUtils();
            utils.logger.measure('工具初始化', 'utilsInit');

            // 初始化认证
            utils.logger.mark('authInit');
            await this.initAuth();
            utils.logger.measure('认证初始化', 'authInit');

            // 初始化UI组件
            utils.logger.mark('uiInit');
            await this.initUI();
            utils.logger.measure('UI初始化', 'uiInit');

            // 初始化路由
            utils.logger.mark('routerInit');
            await this.initRouter();
            utils.logger.measure('路由初始化', 'routerInit');

            this.initialized = true;
            utils.logger.measure('应用总初始化', 'appInit');
            utils.logger.info('SYSTEM', '应用初始化完成');
        } catch (error) {
            utils.logger.error('SYSTEM', '应用初始化失败', error);
            ui.toast.error('应用加载失败，请刷新页面重试');
            throw error;
        }
    }

    async initUtils() {
        try {
            // 检查必要的全局对象
            if (!window.utils) {
                throw new Error('工具对象未定义');
            }

            const requiredUtils = ['logger', 'storage', 'http'];
            for (const util of requiredUtils) {
                if (!window.utils[util]) {
                    throw new Error(`缺少必要的工具: ${util}`);
                }
            }

            utils.logger.info('SYSTEM', '工具初始化成功');
        } catch (error) {
            utils.logger.error('SYSTEM', '工具初始化失败', error);
            throw error;
        }
    }

    async initAuth() {
        try {
            utils.logger.mark('authCheck');
            const isAuthenticated = await auth.checkAuth();
            utils.logger.measure('认证检查', 'authCheck');

            const currentPath = window.location.pathname;
            const isLoginPage = currentPath === '/admin/login';

            if (!isAuthenticated && !isLoginPage) {
                utils.logger.info('AUTH', '用户未登录，重定向到登录页面');
                window.location.href = '/admin/login';
                return;
            }

            if (isAuthenticated && isLoginPage) {
                utils.logger.info('AUTH', '用户已登录，重定向到管理后台');
                window.location.href = '/admin';
                return;
            }

            utils.logger.info('AUTH', '用户认证成功');
        } catch (error) {
            utils.logger.error('AUTH', '认证初始化失败', error);
            throw error;
        }
    }

    async initUI() {
        try {
            // 初始化导航栏
            utils.logger.mark('navInit');
            await this.initNav();
            utils.logger.measure('导航栏初始化', 'navInit');

            // 初始化主题
            utils.logger.mark('themeInit');
            await this.initTheme();
            utils.logger.measure('主题初始化', 'themeInit');

            utils.logger.info('UI', 'UI组件初始化成功');
        } catch (error) {
            utils.logger.error('UI', 'UI初始化失败', error);
            throw error;
        }
    }

    async initNav() {
        try {
            // 更新用户名显示
            const usernameEl = document.querySelector('#username');
            if (!usernameEl) {
                throw new Error('用户名显示元素未找到');
            }

            // 加载用户信息
            utils.logger.mark('userInfoLoad');
            const userInfo = await auth.getCurrentUser();
            utils.logger.measure('用户信息加载', 'userInfoLoad');

            // 更新用户信息显示
            usernameEl.textContent = userInfo.username;

            // 绑定登出按钮事件
            const logoutBtn = document.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        await auth.logout();
                        window.location.href = '/admin/login';
                    } catch (error) {
                        utils.logger.error('AUTH', '登出失败', error);
                        ui.toast.error('登出失败，请重试');
                    }
                });
            }

            utils.logger.info('UI', '导航栏初始化成功');
        } catch (error) {
            utils.logger.error('UI', '导航栏初始化失败', error);
            throw error;
        }
    }

    async initTheme() {
        try {
            const theme = utils.storage.get('theme') || 'light';
            document.body.setAttribute('data-theme', theme);
            utils.logger.info('UI', `主题初始化成功: ${theme}`);
        } catch (error) {
            utils.logger.error('UI', '主题初始化失败', error);
            throw error;
        }
    }

    async initRouter() {
        try {
            const routes = {
                '/admin': () => this.loadDashboard(),
                '/admin/login': () => this.loadLoginPage(),
                '/admin/posts': () => this.loadPostsPage(),
                '/admin/works': () => this.loadWorksPage(),
                '/admin/categories': () => this.loadCategoriesPage(),
                '/admin/tags': () => this.loadTagsPage(),
                '/admin/comments': () => this.loadCommentsPage(),
                '/admin/profile': () => this.loadProfilePage(),
                '/admin/settings': () => this.loadSettingsPage()
            };

            // 获取当前路径
            let path = window.location.pathname;
            
            // 如果路径以 .html 结尾，重定向到正确的路径
            if (path.endsWith('.html')) {
                const newPath = path.replace('.html', '');
                window.history.replaceState(null, '', newPath);
                path = newPath;
            }

            // 如果路径是根路径，重定向到 /admin
            if (path === '/' || path === '') {
                window.history.replaceState(null, '', '/admin');
                path = '/admin';
            }

            utils.logger.debug('SYSTEM', '当前路由路径', { path });

            // 查找匹配的路由
            const route = routes[path];

            if (route) {
                utils.logger.mark('pageLoad');
                await route();
                utils.logger.measure('页面加载', 'pageLoad');
            } else {
                utils.logger.warn('SYSTEM', `未找到路由: ${path}`);
                // 重定向到管理后台首页
                window.history.replaceState(null, '', '/admin');
                await this.loadDashboard();
            }

            // 监听 popstate 事件处理浏览器前进后退
            window.addEventListener('popstate', async () => {
                const currentPath = window.location.pathname;
                const currentRoute = routes[currentPath];

                if (currentRoute) {
                    utils.logger.mark('pageLoad');
                    await currentRoute();
                    utils.logger.measure('页面加载', 'pageLoad');
                } else {
                    window.history.replaceState(null, '', '/admin');
                    await this.loadDashboard();
                }
            });

            // 拦截所有导航链接点击
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.getAttribute('href').startsWith('/admin')) {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    window.history.pushState(null, '', href);
                    const routeHandler = routes[href];
                    if (routeHandler) {
                        routeHandler();
                    }
                }
            });
        } catch (error) {
            utils.logger.error('SYSTEM', '路由初始化失败', error);
            throw error;
        }
    }

    // 页面加载方法
    async loadLoginPage() {
        utils.logger.info('SYSTEM', '加载登录页面');
        const content = document.querySelector('#content');
        if (content) {
            content.innerHTML = `
                <div class="min-h-screen flex items-center justify-center">
                    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                        <h2 class="text-2xl font-bold mb-6 text-center">登录管理后台</h2>
                        <form id="login-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">用户名</label>
                                <input type="text" name="username" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">密码</label>
                                <input type="password" name="password" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            </div>
                            <button type="submit"
                                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                登录
                            </button>
                        </form>
                    </div>
                </div>
            `;

            // 绑定登录表单提交事件
            const form = document.querySelector('#login-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    try {
                        await auth.login(formData.get('username'), formData.get('password'));
                        window.location.href = '/admin';
                    } catch (error) {
                        utils.logger.error('AUTH', '登录失败', error);
                        ui.toast.error('登录失败，请检查用户名和密码');
                    }
                });
            }
        }
    }

    // ... 其他页面加载方法 ...
}

// 创建应用实例并初始化
const app = new App();
app.init().catch(error => {
    console.error('应用初始化失败:', error);
}); 