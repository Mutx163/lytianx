// API 基础地址配置
const API_BASE_URL = window.location.hostname === 'mutx163.github.io' 
    ? 'https://mutx1636.avosapps.us'  // 生产环境
    : 'http://localhost:3000';         // 开发环境

// 获取完整的 API URL
function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// 通用的 fetch 函数
async function fetchApi(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors'
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API 请求失败 (${endpoint}):`, error);
        // 不要立即抛出错误，而是返回空数据
        return endpoint.includes('/blogs') ? [] : null;
    }
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

// 显示加���动画
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
        
        // 据页面类型加载相应的内容
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
    // 这里可能有改变导航栏大小或位置的���码
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

// 添加加载个人信息函数
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
                    contentDiv.innerHTML = '<p class="text-red-500">加载 Markdown 解析器失</p>';
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
        const works = await fetchApi('/api/works');
        displayWorks(works);
    } catch (error) {
        console.error('加载作品列表失败:', error);
        showError('加载作品列表失败，请稍后重试');
    }
}

// 修改加载博客列表函数
async function loadBlogs() {
    try {
        const blogs = await fetchApi('/api/blogs');
        if (Array.isArray(blogs)) {
            displayBlogs(blogs);
        } else {
            displayBlogs([]);
        }
    } catch (error) {
        console.error('加载博客列表失败:', error);
        displayBlogs([]); // 显示空列表而不是错误信息
    }
}

// 加载博客详情
async function loadBlogDetail(id) {
    try {
        const blog = await fetchApi(`/api/blogs/${id}`);
        if (!blog) {
            throw new Error('博客不存在');
        }
        
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

        // 更新页面标题
        document.title = `${blog.title} - 个人博客`;
    } catch (error) {
        console.error('加载博客详情失败:', error);
        showError('加载博客详情失败');
        // 加载失败时返回博客列表
        window.location.hash = '#blog';
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
                    // 直接加载博客详情，不需要加载 blog.html
                    await loadBlogDetail(id);
                } else {
                    await loadPage('blog.html');
                    await loadBlogs();
                }
                break;
            case 'profile':
                await loadPage('profile.html');
                loadAboutContent();
                loadContactInfo();
                break;
            default:
                await loadPage('404.html');
        }

        // 添加页脚
        addFooter();
    } catch (error) {
        console.error('页面加载失败:', error);
        showError('页面加载失败');
    } finally {
        hideSpinner();
    }
}

// 添加页脚函数
function addFooter() {
    const footer = document.createElement('footer');
    footer.className = 'bg-white shadow-lg mt-16';
    footer.innerHTML = `
        <div class="max-w-6xl mx-auto py-8 px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">关于本站</h3>
                    <p class="text-gray-600">这是一个基于 Express + MySQL 的个人主页项目，包含博客、作品展示等功能。</p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-4">快速链接</h3>
                    <ul class="space-y-2">
                        <li><a href="#home" class="text-gray-600 hover:text-blue-600">首页</a></li>
                        <li><a href="#blog" class="text-gray-600 hover:text-blue-600">博客</a></li>
                        <li><a href="#profile" class="text-gray-600 hover:text-blue-600">关于我</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-4">联系方式</h3>
                    <div class="space-y-2 text-gray-600">
                        <p id="footer-email"></p>
                        <p id="footer-phone"></p>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
                <p>&copy; ${new Date().getFullYear()} 个人主页. All rights reserved.</p>
            </div>
        </div>
    `;

    // 更新页脚联系信息
    const contactInfo = JSON.parse(localStorage.getItem('contactInfo') || '{}');
    const footerEmail = footer.querySelector('#footer-email');
    const footerPhone = footer.querySelector('#footer-phone');
    
    if (footerEmail) footerEmail.textContent = contactInfo.email ? `邮���：${contactInfo.email}` : '';
    if (footerPhone) footerPhone.textContent = contactInfo.phone ? `电话：${contactInfo.phone}` : '';

    // 添加到页面
    document.body.appendChild(footer);
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

// 修改搜索索引初始化
async function initSearchIndex() {
    try {
        const blogs = await fetchApi('/api/blogs');
        if (!Array.isArray(blogs) || blogs.length === 0) {
            console.warn('没有博客数据可用于搜索索引');
            return;
        }
        
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
        console.warn('初始化搜索索引失败:', error);
        // 继续执行，不阻止页面加载
    }
}

// 处理索
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

// 修改记录访问函数
async function recordVisit(pageId, pageType) {
    try {
        await fetchApi('/api/stats/visit', {
            method: 'POST',
            body: JSON.stringify({ page_id: pageId, page_type: pageType })
        });
    } catch (error) {
        console.warn('记录访问失败:', error);
        // 忽略错误，不影响用户体验
    }
}

// 修改博客列表容器查找逻辑
async function displayBlogs(blogs) {
    // 等待一小段时间确保 DOM 已加载
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 尝试查找博客列表容器（支持主页和博客页面）
    let blogList = document.querySelector('.blogs-grid, .blog-grid');
    let retryCount = 0;
    const maxRetries = 3;
    
    // 如果没有找到容器，尝试重试几次
    while (!blogList && retryCount < maxRetries) {
        console.log(`尝试查找博客列表容器，第 ${retryCount + 1} 次`);
        await new Promise(resolve => setTimeout(resolve, 100));
        blogList = document.querySelector('.blogs-grid, .blog-grid');
        retryCount++;
    }
    
    if (!blogList) {
        console.error('找不到博客列表容器，请检查页面结构');
        return;
    }

    if (!Array.isArray(blogs) || blogs.length === 0) {
        blogList.innerHTML = '<div class="text-center text-gray-500 py-8">暂无博客文章</div>';
        return;
    }

    // 判断是否在主页
    const isHomePage = blogList.classList.contains('blog-grid');
    const maxBlogs = isHomePage ? 4 : blogs.length; // 主页只显示4篇
    const displayedBlogs = isHomePage ? blogs.slice(0, maxBlogs) : blogs;

    blogList.innerHTML = displayedBlogs.map(blog => `
        <article class="blog-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6 cursor-pointer" 
                data-blog-id="${blog.id}">
            ${blog.cover_image ? `
                <div class="blog-card-image">
                    <img src="${blog.cover_image}" 
                         alt="${blog.title}" 
                         class="w-full h-48 object-cover"
                         onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
                </div>
            ` : ''}
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${blog.title}</h3>
                <p class="text-gray-600 mb-4 line-clamp-3">${blog.content.substring(0, 200)}...</p>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <time>${new Date(blog.created_at).toLocaleDateString()}</time>
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ${blog.category_name || '未分类'}
                    </span>
                </div>
            </div>
        </article>
    `).join('');

    // 添加点击事件监听器
    const blogCards = blogList.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.addEventListener('click', async function() {
            const blogId = this.dataset.blogId;
            window.location.hash = `blog/${blogId}`;
            await loadBlogDetail(blogId);
        });
    });

    // 如果是主页且有更多博客，添加"查看更多"按钮
    if (isHomePage && blogs.length > maxBlogs) {
        blogList.insertAdjacentHTML('afterend', `
            <div class="text-center mt-8">
                <a href="#blog" class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    查看更多博客
                </a>
            </div>
        `);
    }
}

// 添加 elasticlunr 库
document.addEventListener('DOMContentLoaded', function() {
    // 添加 elasticlunr 脚本
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js';
    script.onload = initSearchIndex;
    document.head.appendChild(script);
});

// 显示作品��表
function displayWorks(works) {
    const worksGrid = document.querySelector('.works-grid');
    if (!worksGrid) {
        console.error('找不到作品列表容器');
        return;
    }

    // 如果 works 是 null 或空数组，显示无数据提示
    if (!works || works.length === 0) {
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
}

// 修改图片加载错误处��
function handleImageError(img) {
    img.onerror = null; // 防止循环
    img.src = '/images/placeholder.jpg'; // 使用占位图
}
