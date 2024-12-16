// API 基础地址配置
const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://mutx163.github.io/api');  // 替换为你的后端服务器地址

// 获取完整的 API URL
function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// 全局变量
const spinner = document.querySelector('.loading-spinner');
const errorMessage = document.getElementById('error-message');
const pageContent = document.getElementById('page-content');

// 显示错误消息
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// 显示加载动画
function showSpinner() {
    spinner.style.display = 'block';
}

// 隐藏加载动画
function hideSpinner() {
    spinner.style.display = 'none';
}

// 动态加载页面内容
async function loadPage(page) {
    showSpinner();
    console.log('Loading page:', page);
    
    try {
        const response = await fetch(page);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        
        // 将内容放入页面内容区域
        pageContent.innerHTML = content;
        
        // 等待 DOM 更新完成
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // ���据页面类型加载相应的内容
        const pageType = window.location.hash.slice(1).split('?')[0];
        switch(pageType) {
            case 'profile':
                loadAboutContent();
                loadContactInfo();
                handleContactForm();
                break;
            case 'home':
                loadProfileInfo();
                await fetchLatestBlogs();
                loadWorks();
                break;
            case 'blog':
                loadBlogs();
                break;
            case 'blog-detail':
                loadBlogDetail();
                break;
        }
        
        // 更新头像
        updateProfileAvatar();
        
        // 更新活动导航项
        updateActiveNavItem(page);
        
    } catch (error) {
        console.error('Error loading page:', error);
        showError('加载页面时出错，请稍后重试');
    } finally {
        hideSpinner();
    }
}

// 更新活动导航项
function updateActiveNavItem(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
}

// 处理浏览器的前进/后退
window.onpopstate = function(event) {
    const page = event.state?.page || 'home.html';
    console.log('Popstate triggered, loading:', page);
    loadPage(page);
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 配置 marked
    marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false
    });
    
    // 更新头像
    updateProfileAvatar();
    
    // 处理导航链接点击
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('href')?.slice(1) || 'home';
            const targetPage = page + '.html';
            
            // 更新活动状态
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 加载页面
            loadPage(targetPage);
            history.pushState({ page: targetPage }, '', '#' + page);
        });
    });

    // 检查并应用主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
        }
    }
    
    // 加载初始页面
    const hash = window.location.hash.slice(1) || 'home';
    const page = hash + '.html';
    
    // 加载页面
    loadPage(page).then(() => {
        if (hash === 'home' || !hash) {
            loadProfileInfo();
            fetchLatestBlogs().then(blogs => displayBlogs(blogs));
            loadWorks();
        }
    });

    // 应用主题颜色
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const style = document.createElement('style');
    style.id = 'theme-colors';
    style.textContent = `
        body {
            background: linear-gradient(135deg, 
                ${settings.lightThemeStart || '#f5f7fa'} 0%, 
                ${settings.lightThemeEnd || '#e4e8eb'} 100%);
        }
        
        .dark-theme {
            background: linear-gradient(135deg, 
                ${settings.darkThemeStart || '#1a1a1a'} 0%, 
                ${settings.darkThemeEnd || '#2d2d2d'} 100%);
        }
    `;
    document.head.appendChild(style);
});

// 切换主题
function switchTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // 新主题图标
    const themeIcon = document.getElementById('theme-icon');
    if (isDark) {
        themeIcon.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    } else {
        themeIcon.setAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
    }
}

// 检查是否有类似的代码在页面加载后修改导航栏
window.addEventListener('load', function() {
    // 这里可能有改变导航栏大小或位置的代码
    // ...
})

// 在现有代码后添加新函数
async function fetchLatestBlogs() {
    try {
        const response = await fetch(getApiUrl('/api/blogs?limit=4'));
        if (!response.ok) {
            throw new Error('获取最新博客失败');
        }
        const blogs = await response.json();
        return blogs;
    } catch (error) {
        console.error('加载最新博客失败:', error);
        return []; // 返回空数组而不是抛出错误
    }
}

// 格式化日期的辅助函数
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN');
}

// 添加一个函数来更新所有页面的头像
function updateProfileAvatar() {
    const profileImages = document.querySelectorAll('.profile-image, .hero img');
    const savedAvatar = localStorage.getItem('profileAvatar');
    if (savedAvatar) {
        profileImages.forEach(img => {
            img.src = savedAvatar;
        });
    }
}

// 添加加载个人信息的函数
function loadProfileInfo() {
    const savedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
    
    // 更新主页上的个人信息
    const nameElement = document.querySelector('.hero h1');
    const bioElement = document.querySelector('.hero p');
    
    if (nameElement && savedProfile.name) {
        nameElement.textContent = `欢迎来到 ${savedProfile.name} 的个人主页`;
    }
    
    if (bioElement && savedProfile.bio) {
        bioElement.textContent = savedProfile.bio;
    }
}

// 加载关于我页面内容
function loadAboutContent() {
    const aboutContent = localStorage.getItem('aboutContent');
    if (aboutContent) {
        const contentDiv = document.querySelector('.about-content');
        if (contentDiv) {
            try {
                // 确保 marked 已载
                if (typeof marked === 'undefined') {
                    console.error('Marked library not loaded');
                    contentDiv.innerHTML = '<p class="text-red-500">加载 Markdown 解析器失败</p>';
                    return;
                }
                
                // 使用 DOMPurify 清理 HTML，然后使用 marked 渲染 Markdown
                const cleanHtml = DOMPurify.sanitize(marked.parse(aboutContent));
                contentDiv.innerHTML = cleanHtml;
            } catch (error) {
                console.error('Error rendering markdown:', error);
                contentDiv.innerHTML = '<p class="text-red-500">内容加载失败</p>';
            }
        }
    }
}

// 加载联系方式
function loadContactInfo() {
    const contactInfo = JSON.parse(localStorage.getItem('contactInfo') || '{}');
    
    // 更新联系信息
    const emailElement = document.getElementById('contact-email-display');
    const phoneElement = document.getElementById('contact-phone-display');
    const twitterElement = document.getElementById('social-twitter-link');
    const linkedinElement = document.getElementById('social-linkedin-link');

    if (emailElement) emailElement.textContent = contactInfo.email || '未置';
    if (phoneElement) phoneElement.textContent = contactInfo.phone || '未设置';
    
    // 更新社交媒体链接
    if (twitterElement) {
        if (contactInfo.twitter) {
            twitterElement.href = contactInfo.twitter;
            twitterElement.classList.remove('hidden');
        } else {
            twitterElement.classList.add('hidden');
        }
    }
    
    if (linkedinElement) {
        if (contactInfo.linkedin) {
            linkedinElement.href = contactInfo.linkedin;
            linkedinElement.classList.remove('hidden');
        } else {
            linkedinElement.classList.add('hidden');
        }
    }
}

// 添加留言处函数
function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const message = {
                id: Date.now(),
                name: this.name.value,
                email: this.email.value,
                message: this.message.value,
                date: new Date().toISOString()
            };

            // 保存留言
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));

            // 清空表单并显示成功消息
            this.reset();
            alert('留言已发送！');
        });
    }
}

// 加载作品列表
async function loadWorks() {
    try {
        const response = await fetch(getApiUrl('/api/works'));
        if (!response.ok) {
            throw new Error('获取作品列表失败');
        }
        const works = await response.json();
        
        const worksGrid = document.querySelector('.works-grid');
        if (!worksGrid) {
            console.error('找不到作品列表容器');
            return;
        }

        if (works.length === 0) {
            worksGrid.innerHTML = '<div class="text-center text-gray-500 py-8">暂无作品展示</div>';
            return;
        }

        worksGrid.innerHTML = works.map(work => `
            <article class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div class="flex items-center mb-6">
                    ${work.image ? `
                        <div class="w-24 h-24 rounded-lg overflow-hidden mr-6">
                            <img src="${work.image}" alt="${work.title}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                    <div>
                        <h3 class="text-2xl font-bold mb-2">${work.title}</h3>
                        <time class="text-sm text-gray-500">
                            ${new Date(work.created_at).toLocaleDateString()}
                        </time>
                    </div>
                </div>
                <p class="text-gray-600">${work.description}</p>
            </article>
        `).join('');
    } catch (error) {
        console.error('加载作品列表失败:', error);
        showError('加载作品列表失败');
    }
}

// 加载博客列表
async function loadBlogs() {
    try {
        const response = await fetch('http://localhost:3000/api/blogs');
        if (!response.ok) {
            throw new Error('获取博客列表失败');
        }
        const blogs = await response.json();
        
        const blogList = document.querySelector('.blogs-grid');
        if (!blogList) {
            console.error('找不到博客列表容器');
            return;
        }

        if (blogs.length === 0) {
            blogList.innerHTML = '<div class="text-center text-gray-500 py-8">暂无博客文章</div>';
            return;
        }

        blogList.innerHTML = blogs.map(blog => `
            <article class="blog-card cursor-pointer" onclick="window.location.hash = 'blog/${blog.id}'">
                ${blog.cover_image ? `
                    <div class="blog-card-image">
                        <img src="${blog.cover_image}" alt="${blog.title}" class="w-full h-48 object-cover">
                    </div>
                ` : ''}
                <div class="blog-card-content">
                    <h3 class="text-xl font-bold mb-2">${blog.title}</h3>
                    <p class="text-gray-600 mb-4">${blog.content.substring(0, 200)}...</p>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <time>${new Date(blog.created_at).toLocaleDateString()}</time>
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            ${blog.category_name || '未分类'}
                        </span>
                    </div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('加载博客列表失败:', error);
        showError('加载博客列表失败');
    }
}

// 加载博客详情
async function loadBlogDetail(id) {
    try {
        const response = await fetch(getApiUrl(`/api/blogs/${id}`));
        if (!response.ok) {
            throw new Error('获取博客详情失败');
        }
        const blog = await response.json();
        
        const content = document.getElementById('page-content');
        if (!content) {
            console.error('找不到内容容器');
            return;
        }

        content.innerHTML = `
            <section class="max-w-4xl mx-auto py-8 px-4">
                <div class="mb-8">
                    <a href="#blog" class="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        返回博客列表
                    </a>
                </div>
                
                <article class="blog-detail bg-white rounded-lg shadow-lg p-8">
                    <h1 class="text-3xl font-bold mb-4">${blog.title}</h1>
                    <div class="flex items-center justify-between text-gray-500 text-sm mb-8">
                        <time>${new Date(blog.created_at).toLocaleDateString()}</time>
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            ${blog.category_name || '未分类'}
                        </span>
                    </div>
                    ${blog.cover_image ? `
                        <div class="mb-8">
                            <img src="${blog.cover_image}" alt="${blog.title}" class="w-full h-64 object-cover rounded">
                        </div>
                    ` : ''}
                    <div class="prose max-w-none">
                        ${marked(DOMPurify.sanitize(blog.content))}
                    </div>
                </article>
            </section>
        `;
    } catch (error) {
        console.error('加载博客详情失败:', error);
        showError('加载博客详情失败');
    }
}

// 在页面加载时加载博客列表
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash.startsWith('#blog/')) {
        const id = hash.split('/')[1];
        loadBlogDetail(id);
    } else if (hash === '#blog' || !hash) {
        loadBlogs();
    }
});

// 添加加载博客页面的函数
function loadBlogPage() {
    history.pushState({ page: 'blog.html' }, '', '#blog');
    loadPage('blog.html');
}

// 路由处理
async function handleRoute() {
    const hash = window.location.hash || '#home';
    const [page, id] = hash.slice(1).split('/');
    
    try {
        showSpinner();
        
        // 记录访问
        try {
            if (id) {
                await recordVisit(id, page);
            } else {
                await recordVisit(null, page);
            }
        } catch (error) {
            console.warn('记录访问失败:', error);
            // 继续执行，不影响主要功能
        }

        const content = document.getElementById('page-content');
        if (!content) {
            console.warn('找不到内容容器，创建新容器');
            const newContent = document.createElement('div');
            newContent.id = 'page-content';
            document.body.appendChild(newContent);
        }

        switch (page) {
            case 'home':
            case '':
                await loadPage('home.html');
                await Promise.all([
                    loadProfileInfo(),
                    fetchLatestBlogs().then(blogs => displayBlogs(blogs)),
                    loadWorks()
                ]);
                break;
            case 'blog':
                if (id) {
                    await loadBlogDetail(id);
                } else {
                    await loadPage('blog.html');
                    await loadBlogs();
                }
                break;
            case 'about':
            case 'profile':
                await loadPage('profile.html');
                loadAboutContent();
                loadContactInfo();
                break;
            default:
                await loadPage('404.html');
        }
    } catch (error) {
        console.error('页面加载失败:', error);
        showError('页面加载失败');
    } finally {
        hideSpinner();
    }
}

// 页面加载函数
async function loadPage(pageName) {
    if (!pageName) {
        console.warn('未指定页面名称，加载首页');
        pageName = 'home.html';
    }
    
    showSpinner();
    console.log('Loading page:', pageName);
    
    try {
        const response = await fetch(pageName);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        
        // 将内容放入页面内容区域
        const pageContent = document.getElementById('page-content');
        if (!pageContent) {
            console.warn('找不到页面内容容器，创建新容器');
            const newContent = document.createElement('div');
            newContent.id = 'page-content';
            document.body.appendChild(newContent);
        }
        pageContent.innerHTML = content;
        
        // 等待 DOM 更新完成
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // 根据页面类型加载相应的内容
        const pageType = pageName.replace('.html', '');
        switch(pageType) {
            case 'profile':
                loadAboutContent();
                loadContactInfo();
                handleContactForm();
                break;
            case 'home':
                loadProfileInfo();
                await fetchLatestBlogs().then(blogs => displayBlogs(blogs));
                loadWorks();
                break;
            case 'blog':
                loadBlogs();
                break;
        }
        
        // 更新头像
        updateProfileAvatar();
        
    } catch (error) {
        console.error('Error loading page:', error);
        showError('加载页面时出错，请稍后重试');
    } finally {
        hideSpinner();
    }
}

// 在页面加载时初始化路由
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// 搜索功能
let searchIndex;

// 初始化搜索索引
async function initSearchIndex() {
    try {
        const response = await fetch('http://localhost:3000/api/blogs');
        const blogs = await response.json();
        
        searchIndex = elasticlunr(function() {
            this.addField('title');
            this.addField('content');
            this.addField('category_name');
            this.setRef('id');
        });

        blogs.forEach(blog => {
            searchIndex.addDoc({
                id: blog.id,
                title: blog.title,
                content: blog.content,
                category_name: blog.category_name
            });
        });
    } catch (error) {
        console.error('初始化搜索索引失败:', error);
    }
}

// 处理搜索
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput?.addEventListener('input', debounce(function(e) {
    const query = e.target.value.trim();
    
    if (!query) {
        searchResults.classList.add('hidden');
        return;
    }

    const results = searchIndex.search(query, {
        fields: {
            title: {boost: 2},
            content: {boost: 1},
            category_name: {boost: 1}
        }
    });

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="p-4 text-gray-500">未找到相关内容</div>';
    } else {
        searchResults.innerHTML = results.slice(0, 5).map(result => `
            <a href="#blog/${result.ref}" 
               class="block p-4 hover:bg-gray-50 border-b last:border-0">
                <div class="font-medium">${highlight(result.doc.title, query)}</div>
                <div class="text-sm text-gray-600 mt-1">
                    ${highlight(result.doc.content.substring(0, 100), query)}...
                </div>
            </a>
        `).join('');
    }

    searchResults.classList.remove('hidden');
}, 300));

// 评论功能
async function loadComments(blogId) {
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${blogId}`);
        const comments = await response.json();
        
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="text-gray-500">暂无评论</div>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment bg-gray-50 p-4 rounded">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">${comment.name}</span>
                    <time class="text-sm text-gray-500">
                        ${new Date(comment.created_at).toLocaleDateString()}
                    </time>
                </div>
                <p class="text-gray-700">${comment.content}</p>
            </div>
        `).join('');

        // 更新评论数
        const commentCount = document.getElementById('comment-count');
        if (commentCount) {
            commentCount.textContent = comments.length;
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        showError('加载评论失败');
    }
}

// 提交评论
const commentForm = document.getElementById('comment-form');
commentForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const blogId = window.location.hash.split('/')[1];
    const name = document.getElementById('comment-name').value;
    const content = document.getElementById('comment-content').value;

    try {
        const response = await fetch('http://localhost:3000/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                blog_id: blogId,
                name,
                content
            })
        });

        if (!response.ok) {
            throw new Error('提交评论失败');
        }

        // 清空表单
        this.reset();
        
        // 重新加载评论
        await loadComments(blogId);
        
        showSuccess('评论已提交');
    } catch (error) {
        console.error('提交评论失败:', error);
        showError('提交评论失败');
    }
});

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function highlight(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// 在页面加载时初始化搜索索引
document.addEventListener('DOMContentLoaded', initSearchIndex);

// 记录访问
async function recordVisit(pageId, pageType) {
    try {
        await fetch('http://localhost:3000/api/stats/visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_id: pageId,
                page_type: pageType
            })
        });
    } catch (error) {
        console.error('记录访问失败:', error);
    }
}

// 修改博客列表容器查找逻辑
function displayBlogs(blogs) {
    if (!blogs || blogs.length === 0) {
        console.warn('没有博客数据可显示');
        return;
    }

    const blogListContainer = document.querySelector('.blog-grid, #blogList, .blogs-grid');
    if (!blogListContainer) {
        console.warn('找不到博客列表容器，创建新容器');
        const newContainer = document.createElement('div');
        newContainer.className = 'grid gap-6';
        document.querySelector('main')?.appendChild(newContainer);
        return;
    }

    blogListContainer.innerHTML = blogs.map(blog => `
        <article class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
            <div class="flex items-center mb-6">
                ${blog.cover_image ? `
                    <div class="w-24 h-24 rounded-lg overflow-hidden mr-6">
                        <img src="${blog.cover_image}" alt="${blog.title}" class="w-full h-full object-cover">
                    </div>
                ` : ''}
                <div>
                    <h3 class="text-2xl font-bold mb-2 text-gray-900 hover:text-blue-600">${blog.title}</h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <time>${new Date(blog.created_at).toLocaleDateString()}</time>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            ${blog.category_name || '未分类'}
                        </span>
                    </div>
                </div>
            </div>
            <p class="text-gray-600 mb-4">${blog.content.substring(0, 200)}...</p>
            <div class="flex flex-wrap gap-2">
                ${blog.tags ? blog.tags.map(tag => `
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${tag}</span>
                `).join('') : ''}
            </div>
        </article>
    `).join('');

    // 添加点击事件
    blogListContainer.querySelectorAll('article').forEach((article, index) => {
        article.addEventListener('click', () => {
            const blog = blogs[index];
            window.location.hash = `blog/${blog.id}`;
        });
    });
}

// 添加 elasticlunr 库
document.addEventListener('DOMContentLoaded', function() {
    // 添加 elasticlunr 脚本
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js';
    script.onload = initSearchIndex;
    document.head.appendChild(script);
});
