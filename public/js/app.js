// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 添加被动事件监听
        addPassiveEventListeners();

        // 检查认证状态
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                console.log('用户已登录:', user.email);
                // 获取用户数据
                try {
                    const userData = await api.get('/users/me');
                    console.log('用户数据:', userData);
                } catch (error) {
                    console.error('获取用户数据失败:', error);
                }
            } else {
                console.log('用户未登录');
            }
        });

        // 加载博客列表
        const blogList = document.getElementById('blog-list');
        if (blogList) {
            try {
                const posts = await api.get('/classes/Post?where={"status":"published"}&limit=6&order=-createdAt');
                console.log('博客数据:', posts);
                if (posts && posts.results) {
                    renderBlogList(posts.results);
                } else {
                    blogList.innerHTML = '<p class="text-gray-500">暂无博客文章</p>';
                }
            } catch (error) {
                console.error('加载博客列表失败:', error);
                blogList.innerHTML = '<p class="text-red-500">加载失败，请稍后重试</p>';
            }
        }

        // 加载作品列表
        const worksList = document.getElementById('works-list');
        if (worksList) {
            try {
                const works = await api.get('/classes/Work?where={"status":"published"}&limit=6&order=-createdAt');
                console.log('作品数据:', works);
                if (works && works.results) {
                    renderWorksList(works.results);
                } else {
                    worksList.innerHTML = '<p class="text-gray-500">暂无作品展示</p>';
                }
            } catch (error) {
                console.error('加载作品列表失败:', error);
                worksList.innerHTML = '<p class="text-red-500">加载失败，请稍后重试</p>';
            }
        }

    } catch (error) {
        console.error('应用初始化失败:', error);
    }
}, { passive: true });

// 添加被动事件监听
function addPassiveEventListeners() {
    // 获取所有可滚动元素
    const scrollableElements = document.querySelectorAll('.blog-card, .work-card');
    
    // 添加被动触摸事件监听器
    scrollableElements.forEach(element => {
        element.addEventListener('touchstart', () => {}, { passive: true });
        element.addEventListener('touchmove', () => {}, { passive: true });
        element.addEventListener('touchend', () => {}, { passive: true });
        element.addEventListener('wheel', () => {}, { passive: true });
    });
}

// 渲染博客列表
function renderBlogList(posts) {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;

    const html = posts.map(post => `
        <div class="blog-card bg-white rounded-lg shadow-md overflow-hidden">
            <img src="${post.coverImage || '/images/default-blog.jpg'}" 
                 alt="${post.title}" 
                 class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${post.title}</h3>
                <p class="text-gray-600 mb-4">${post.summary || ''}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${new Date(post.createdAt).toLocaleDateString()}</span>
                    <a href="/blog/${post.objectId}" 
                       class="text-blue-500 hover:text-blue-700">阅读更多</a>
                </div>
            </div>
        </div>
    `).join('');

    blogList.innerHTML = html || '<p class="text-gray-500">暂无博客文章</p>';

    // 为新渲染的元素添加被动事件监听
    addPassiveEventListeners();
}

// 渲染作品列表
function renderWorksList(works) {
    const worksList = document.getElementById('works-list');
    if (!worksList) return;

    const html = works.map(work => `
        <div class="work-card bg-white rounded-lg shadow-md overflow-hidden">
            <img src="${work.coverImage || '/images/default-work.jpg'}" 
                 alt="${work.title}" 
                 class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${work.title}</h3>
                <p class="text-gray-600 mb-4">${work.description || ''}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${new Date(work.createdAt).toLocaleDateString()}</span>
                    <a href="${work.link}" 
                       target="_blank"
                       class="text-blue-500 hover:text-blue-700">查看项目</a>
                </div>
            </div>
        </div>
    `).join('');

    worksList.innerHTML = html || '<p class="text-gray-500">暂无作品展示</p>';

    // 为新渲染的元素添加被动事件监听
    addPassiveEventListeners();
}

// 错误处理
window.onerror = function(msg, url, line, col, error) {
    console.error('全局错误:', { msg, url, line, col, error });
    return false;
}; 