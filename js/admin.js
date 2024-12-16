// 在文件开头添加登录检查
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (!isLoggedIn || !loginTime) {
        window.location.href = 'login.html';
        return;
    }
    
    // 检查登录是否过期
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursSinceLogin >= 24) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    }
}

// 在页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    // 显示默认页面（例如仪表盘或个人信息）
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

// 添加登出功能
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

// 显示指定部分
function showSection(sectionId) {
    // 隐藏所有部分
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 移除所有导航项的激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 显示选中的部分
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.classList.add('active');
        // 更新 URL
        history.pushState(null, '', `#${sectionId}`);
    }
    
    // 激活对应的导航项
    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
}

// 初始化个人信息管理
function initProfileSection() {
    const profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">个人信息管理</h2>
        <form id="profile-form" class="space-y-4">
            <div>
                <label class="form-label">头像</label>
                <div class="flex items-center space-x-4">
                    <img id="avatar-preview" src="images/avatar.jpg" alt="头像预览" 
                         class="w-24 h-24 rounded-full object-cover border-2 border-gray-200">
                    <input type="file" id="avatar-input" accept="image/*" class="hidden">
                    <button type="button" onclick="document.getElementById('avatar-input').click()"
                            class="btn-primary">
                        选择图片
                    </button>
                </div>
            </div>
            <div>
                <label class="form-label">名字</label>
                <input type="text" id="name-input" class="form-input">
            </div>
            <div>
                <label class="form-label">职业</label>
                <input type="text" id="title-input" class="form-input">
            </div>
            <div>
                <label class="form-label">简介</label>
                <textarea id="bio-input" rows="4" class="form-textarea"></textarea>
            </div>
            <button type="submit" class="btn-primary w-full">保存个人信息</button>
        </form>
    `;
    
    // 处理头像上传
    initAvatarUpload();
    
    // 加载和处理个人信息表单
    initProfileForm();
}

// 初始化头像上传
function initAvatarUpload() {
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');

    if (avatarInput && avatarPreview) {
        // 恢复保存的头像
        const savedAvatar = localStorage.getItem('profileAvatar');
        if (savedAvatar) {
            avatarPreview.src = savedAvatar;
        }

        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatarData = e.target.result;
                    avatarPreview.src = avatarData;
                    localStorage.setItem('profileAvatar', avatarData);
                    alert('头像已更新！');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 初始化个人信息表单
function initProfileForm() {
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('name-input');
    const titleInput = document.getElementById('title-input');
    const bioInput = document.getElementById('bio-input');

    // 加载已保存的个人信息
    const savedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
    if (nameInput) nameInput.value = savedProfile.name || '';
    if (titleInput) titleInput.value = savedProfile.title || '';
    if (bioInput) bioInput.value = savedProfile.bio || '';

    // 处理表单提交
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const profile = {
                name: nameInput.value,
                title: titleInput.value,
                bio: bioInput.value
            };
            localStorage.setItem('profile', JSON.stringify(profile));
            alert('个人信息已保存！');
        });
    }
}

// 初始化作品管理
function initWorksSection() {
    const worksSection = document.getElementById('works-section');
    if (!worksSection) return;

    worksSection.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">作品管理</h2>
            <button onclick="showWorkForm()" class="btn-primary">
                添加作品
            </button>
        </div>
        <div id="works-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 作品列表将通过 JavaScript 动态加载 -->
        </div>
    `;

    loadWorksList();
}

// 加载作品列表
async function loadWorksList() {
    try {
        const response = await fetch(getAPIUrl('/api/works'));
        if (!response.ok) {
            throw new Error('获取作品列表失败');
        }
        const works = await response.json();
        
        const worksList = document.getElementById('works-list');
        if (!worksList) return;

        if (works.length === 0) {
            worksList.innerHTML = '<div class="text-center text-gray-500 py-8">暂无作品</div>';
            return;
        }

        worksList.innerHTML = works.map(work => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                ${work.image ? `
                    <div class="h-48 overflow-hidden">
                        <img src="${work.image}" alt="${work.title}" class="w-full h-full object-cover">
                    </div>
                ` : ''}
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-2">${work.title}</h3>
                    <p class="text-gray-600 mb-4">${work.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">
                            ${new Date(work.created_at).toLocaleDateString()}
                        </span>
                        <div class="flex gap-2">
                            <button onclick="showWorkForm(${work.id})" 
                                    class="btn-secondary">
                                编辑
                            </button>
                            <button onclick="deleteWork(${work.id})" 
                                    class="btn-danger">
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载作品列表失败:', error);
        showError('加载作品列表失败');
    }
}

// 显示作品表单
function showWorkForm(work = null) {
    const modal = document.getElementById('modal');
    if (!modal) {
        console.error('找不到模态框元素');
        return;
    }

    modal.classList.remove('hidden');
    modal.querySelector('.modal-content').innerHTML = `
        <h3 class="text-xl font-bold mb-4">${work ? '编辑作品' : '添加新作品'}</h3>
        <form id="work-form" class="space-y-4">
            <div>
                <label class="form-label">标题</label>
                <input type="text" id="work-title" class="form-input" value="${work?.title || ''}" required>
            </div>
            <div>
                <label class="form-label">描述</label>
                <textarea id="work-description" class="form-textarea" rows="4" required>${work?.description || ''}</textarea>
            </div>
            <div>
                <label class="form-label">图片链接</label>
                <input type="text" id="work-image" class="form-input" value="${work?.image || ''}" placeholder="请输入图片URL">
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="closeModal()" class="btn-secondary">取消</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    // 处理表单提交
    const form = document.getElementById('work-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveWork(work?.id);
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 保存作品
async function saveWork(id = null) {
    const title = document.getElementById('work-title').value;
    const description = document.getElementById('work-description').value;
    const image = document.getElementById('work-image').value;

    try {
        const response = await fetch('http://localhost:3000/api/works', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                image
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '保存失败');
        }

        const result = await response.json();
        console.log('作品保存成功:', result);
        
        // 关闭表单并刷新列表
        closeModal();
        loadWorksList();
        showSuccess('作品已保存');
    } catch (error) {
        console.error('保存作品失败:', error);
        showError('保存作品失败：' + error.message);
    }
}

// 删除作品
async function deleteWork(id) {
    if (!confirm('确定要删除这个作品吗？此操作不可恢复。')) {
        return;
    }

    try {
        const response = await fetch(getAPIUrl(`/api/works/${id}`), {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '删除失败');
        }

        loadWorksList();
        showSuccess('作品已删除');
    } catch (error) {
        console.error('删除作品失败:', error);
        showError('删除作品失败：' + error.message);
    }
}

// 初始化博客管理
function initBlogsSection() {
    const blogsSection = document.getElementById('blogs-section');
    loadBlogsList();

    // 添加博客按钮事件
    const addButton = blogsSection.querySelector('.btn-primary');
    addButton.addEventListener('click', function() {
        showBlogForm();
    });
}

// 加载博客列表
async function loadBlogsList() {
    try {
        const response = await fetch(getAPIUrl('/api/blogs'));
        if (!response.ok) {
            throw new Error('获取博客列表失败');
        }
        const blogs = await response.json();
        
        const blogsList = document.getElementById('blogs-list');
        if (!blogsList) return;

        if (blogs.length === 0) {
            blogsList.innerHTML = '<div class="text-center text-gray-500 py-8">暂无博客文章</div>';
            return;
        }

        blogsList.innerHTML = blogs.map(blog => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold mb-2">${blog.title}</h3>
                            <p class="text-gray-600 mb-4">${blog.content.substring(0, 200)}...</p>
                        </div>
                        <span class="bg-${blog.is_draft ? 'yellow' : 'green'}-100 
                                   text-${blog.is_draft ? 'yellow' : 'green'}-800 
                                   px-2 py-1 rounded text-sm">
                            ${blog.is_draft ? '草稿' : '已发布'}
                        </span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <div>
                            <span>${new Date(blog.created_at).toLocaleDateString()}</span>
                            <span class="mx-2">·</span>
                            <span>${blog.category_name || '未分类'}</span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="showBlogForm(${blog.id})" 
                                    class="btn-secondary">
                                编辑
                            </button>
                            <button onclick="deleteBlog(${blog.id})" 
                                    class="btn-danger">
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载博客列表失败:', error);
        showError('加载博客列表失败');
    }
}

// 显示博客表单
function showBlogForm(blog = null) {
    const modal = document.getElementById('modal');
    if (!modal) {
        console.error('找不到模态框元素');
        return;
    }

    modal.classList.remove('hidden');
    modal.querySelector('.modal-content').innerHTML = `
        <h3 class="text-xl font-bold mb-4">${blog ? '编辑博客' : '添加新博客'}</h3>
        <form id="blog-form" class="space-y-4">
            <div>
                <label class="form-label">标题</label>
                <input type="text" id="blog-title" class="form-input" value="${blog?.title || ''}" required>
            </div>
            <div>
                <label class="form-label">内容</label>
                <textarea id="blog-content" class="form-textarea" rows="8" required>${blog?.content || ''}</textarea>
            </div>
            <div>
                <label class="form-label">分类</label>
                <select id="blog-category" class="form-select">
                    <option value="">选择分类</option>
                    <!-- 分类选项将通过 JavaScript 动态加载 -->
                </select>
            </div>
            <div>
                <label class="form-label">封面图片</label>
                <input type="text" id="blog-cover" class="form-input" value="${blog?.cover_image || ''}" placeholder="请输入图片URL">
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="closeModal()" class="btn-secondary">取消</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    // 加载分类选项
    loadCategoryOptions();

    // 处理表单提交
    const form = document.getElementById('blog-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveBlog(blog?.id);
    });
}

// 保存博客
async function saveBlog(id = null, editor) {
    try {
        const title = document.getElementById('blog-title').value;
        const content = editor.value();
        const category = document.getElementById('blog-category').value;
        const tags = document.getElementById('blog-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        const isDraft = document.getElementById('blog-draft').checked;
        const cover = document.getElementById('blog-cover-preview').src;

        if (!title || !content) {
            throw new Error('标题和内容不能为空');
        }

        console.log('正在保存博客:', {
            title,
            category,
            tags,
            isDraft,
            contentLength: content.length
        });

        const response = await fetch(getAPIUrl('/api/blogs'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                content,
                category,
                tags,
                cover,
                isDraft
            })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error + (result.details ? `: ${result.details}` : ''));
        }

        closeModal();
        loadBlogsList();
        alert(result.message || '博客已保存！');
    } catch (error) {
        console.error('保存博客失败:', error);
        alert('保存失败：' + error.message);
    }
}

// 删除博客
async function deleteBlog(id) {
    if (!confirm('确定要删除这篇博客吗？此操作不可恢复。')) {
        return;
    }

    try {
        const response = await fetch(getAPIUrl(`/api/blogs/${id}`), {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '删除失败');
        }

        loadBlogsList();
        showSuccess('博客已删除');
    } catch (error) {
        console.error('删除博客失败:', error);
        showError('删除博客失败：' + error.message);
    }
}

// 初始化关于我页面管理
function initAboutSection() {
    const aboutForm = document.getElementById('about-form');
    const aboutContent = document.getElementById('about-content');

    // 初始化 SimpleMDE 编辑器
    const simplemde = new SimpleMDE({
        element: aboutContent,
        spellChecker: false,
        status: ['lines', 'words', 'cursor'],
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ]
    });

    // 加载已保存的关于我内容
    const savedAbout = localStorage.getItem('aboutContent');
    if (savedAbout) {
        simplemde.value(savedAbout);
    }

    // 处理表单提交
    if (aboutForm) {
        aboutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const content = simplemde.value();
            localStorage.setItem('aboutContent', content);
            addLog('operation', '更新关于我页面内容');
            alert('关于我页面内容已保存！');
        });
    }
}

// 初始化联系方式管理
function initContactSection() {
    const contactForm = document.getElementById('contact-info-form');
    
    // 加载已保存的联系方式
    const savedContact = JSON.parse(localStorage.getItem('contactInfo') || '{}');
    
    // 填充表单
    if (contactForm) {
        const emailInput = document.getElementById('contact-email');
        const phoneInput = document.getElementById('contact-phone');
        const twitterInput = document.getElementById('social-twitter');
        const linkedinInput = document.getElementById('social-linkedin');

        if (emailInput) emailInput.value = savedContact.email || '';
        if (phoneInput) phoneInput.value = savedContact.phone || '';
        if (twitterInput) twitterInput.value = savedContact.twitter || '';
        if (linkedinInput) linkedinInput.value = savedContact.linkedin || '';

        // 处理表单提交
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contactInfo = {
                email: emailInput?.value || '',
                phone: phoneInput?.value || '',
                twitter: twitterInput?.value || '',
                linkedin: linkedinInput?.value || ''
            };

            localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
            addLog('operation', '更新联系方式');
            alert('联系方式已保存！');
        });
    }
}

// 初始化留言管理
function initMessagesSection() {
    loadMessagesList();
    setupMessageFilters();
}

// 加载留言列表
function loadMessagesList(filter = 'all') {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const messagesList = document.getElementById('messages-list');
    
    // 根据筛选条件过滤留言
    const filteredMessages = filter === 'all' ? 
        messages : 
        messages.filter(msg => msg.status === filter);

    messagesList.innerHTML = filteredMessages.map(message => `
        <div class="glassmorphism p-4 rounded-lg ${message.status === 'unread' ? 'border-l-4 border-blue-500' : ''}">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-semibold">${message.name}</h4>
                    <p class="text-sm text-gray-500">${message.email}</p>
                </div>
                <div class="text-sm text-gray-500">
                    ${new Date(message.date).toLocaleString()}
                </div>
            </div>
            <p class="text-gray-700 mb-4">${message.message}</p>
            <div class="flex justify-between items-center">
                <div class="space-x-2">
                    <button onclick="replyMessage(${message.id})" 
                            class="text-blue-500 hover:text-blue-700">
                        回复
                    </button>
                    <button onclick="deleteMessage(${message.id})" 
                            class="text-red-500 hover:text-red-700">
                        删除
                    </button>
                </div>
                <button onclick="toggleMessageStatus(${message.id})" 
                        class="text-gray-500 hover:text-gray-700">
                    ${message.status === 'unread' ? '标记为已读' : '标记为未读'}
                </button>
            </div>
            ${message.reply ? `
                <div class="mt-4 pl-4 border-l-2 border-gray-200">
                    <p class="text-sm text-gray-600">回复：${message.reply}</p>
                    <p class="text-xs text-gray-500">
                        ${new Date(message.replyDate).toLocaleString()}
                    </p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 设置留言筛选器
function setupMessageFilters() {
    const filterButtons = document.querySelectorAll('.message-filter');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadMessagesList(this.dataset.filter);
        });
    });
}

// 回复留言
function replyMessage(id) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const message = messages.find(m => m.id === id);
    
    if (!message) return;

    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-4">回复留言</h3>
            <div class="mb-4">
                <p class="font-semibold">${message.name}</p>
                <p class="text-gray-600">${message.message}</p>
            </div>
            <form id="reply-form" class="space-y-4">
                <div>
                    <label class="form-label">回复内容</label>
                    <textarea id="reply-content" class="form-textarea" rows="4" required
                    >${message.reply || ''}</textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="closeModal()" class="btn-secondary">取消</button>
                    <button type="submit" class="btn-primary">发送回复</button>
                </div>
            </form>
        </div>
    `;

    // 处理表单提交
    const form = document.getElementById('reply-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const reply = document.getElementById('reply-content').value;
        saveReply(id, reply);
    });
}

// 保存回复
function saveReply(id, reply) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const index = messages.findIndex(m => m.id === id);
    
    if (index !== -1) {
        messages[index] = {
            ...messages[index],
            reply,
            replyDate: new Date().toISOString(),
            status: 'replied'
        };
        
        localStorage.setItem('messages', JSON.stringify(messages));
        closeModal();
        loadMessagesList();
        addLog('operation', '回复留言', `留言ID：${id}`);
        alert('回复已发送！');
    }
}

// 删除留言
function deleteMessage(id) {
    if (confirm('确定要删除这条留言吗？')) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        localStorage.setItem('messages', JSON.stringify(messages.filter(m => m.id !== id)));
        loadMessagesList();
        addLog('operation', '删除留言', `留言ID：${id}`);
        alert('留言已删除！');
    }
}

// 切换留言状态
function toggleMessageStatus(id) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const index = messages.findIndex(m => m.id === id);
    
    if (index !== -1) {
        messages[index].status = messages[index].status === 'unread' ? 'read' : 'unread';
        localStorage.setItem('messages', JSON.stringify(messages));
        loadMessagesList();
    }
}

// 编辑作品
function editWork(id) {
    const works = JSON.parse(localStorage.getItem('works') || '[]');
    const work = works.find(w => w.id === id);
    if (work) {
        showWorkForm(work);
    }
}

// 编辑���客
function editBlog(id) {
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const blog = blogs.find(b => b.id === id);
    if (blog) {
        showBlogForm(blog);
    }
}

// 添加博客预览功能
function previewBlog() {
    const title = document.getElementById('blog-title').value;
    const content = document.querySelector('.CodeMirror').CodeMirror.getValue();
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>预览 - ${title}</title>
            <link href="css/tailwind.css" rel="stylesheet">
            <link rel="stylesheet" href="styles.css">
        </head>
        <body class="bg-gray-50 p-8">
            <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 class="text-3xl font-bold mb-4">${title}</h1>
                <div class="prose max-w-none">
                    ${marked(content)}
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        </body>
        </html>
    `);
}

// 初始化分类管理
function initCategoriesSection() {
    const categoriesSection = document.getElementById('categories-section');
    loadCategoriesList();

    // 添加分类按钮事件
    const addButton = categoriesSection.querySelector('.btn-primary');
    addButton.addEventListener('click', function() {
        showCategoryForm();
    });
}

// 加载分类列表
function loadCategoriesList() {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const categoriesList = document.getElementById('categories-list');
    
    categoriesList.innerHTML = categories.map(category => `
        <div class="glassmorphism p-4 rounded-lg">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold">${category.name}</h3>
                    <p class="text-sm text-gray-500">文章数：${category.count || 0}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editCategory(${category.id})" class="text-blue-500 hover:text-blue-700">
                        编辑
                    </button>
                    <button onclick="deleteCategory(${category.id})" class="text-red-500 hover:text-red-700">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 显示分类表单
function showCategoryForm(category = null) {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-4">${category ? '编辑分类' : '添加新分类'}</h3>
            <form id="category-form" class="space-y-4">
                <div>
                    <label class="form-label">分类名称</label>
                    <input type="text" id="category-name" class="form-input" 
                           value="${category?.name || ''}" required>
                </div>
                <div>
                    <label class="form-label">描述</label>
                    <textarea id="category-description" class="form-textarea" rows="3"
                    >${category?.description || ''}</textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="closeModal()" class="btn-secondary">取消</button>
                    <button type="submit" class="btn-primary">保存</button>
                </div>
            </form>
        </div>
    `;

    // 处理表单提交
    const form = document.getElementById('category-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory(category?.id);
    });
}

// 保存分类
function saveCategory(id = null) {
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');

    if (id) {
        // 编辑现有分类
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], name, description };
        }
    } else {
        // 添加新分类
        categories.push({
            id: Date.now(),
            name,
            description,
            count: 0,
            createdAt: new Date().toISOString()
        });
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    closeModal();
    loadCategoriesList();
    addLog('operation', id ? '更新分类' : '添加新分类', `分类名称：${name}`);
    alert(id ? '分类已更新！' : '分类已添加！');
}

// 删除分类
function deleteCategory(id) {
    if (confirm('确定要删除这个分类吗？相关文章将变为未分类')) {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
        
        // 更新相关博客的分类
        const updatedBlogs = blogs.map(blog => ({
            ...blog,
            category: blog.category === categories.find(c => c.id === id)?.name ? '未分类' : blog.category
        }));
        
        localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
        localStorage.setItem('categories', JSON.stringify(categories.filter(c => c.id !== id)));
        loadCategoriesList();
        addLog('operation', '删除分类', `分类ID：${id}`);
        alert('分类已删除！');
    }
}

// 初始化标签管理
function initTagsSection() {
    loadTags();
}

// 加载标签列表
function loadTags() {
    const tagsList = document.getElementById('tags-list');
    const tags = JSON.parse(localStorage.getItem('tags') || '[]');
    
    tagsList.innerHTML = tags.map(tag => `
        <div class="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
            <span class="font-medium text-gray-700">${tag.name}</span>
            <span class="text-sm text-gray-500">(${tag.count || 0})</span>
            <div class="flex gap-2 ml-4">
                <button onclick="editTag(${tag.id})" class="text-blue-500 hover:text-blue-700">
                    编辑
                </button>
                <button onclick="deleteTag(${tag.id})" class="text-red-500 hover:text-red-700">
                    删除
                </button>
            </div>
        </div>
    `).join('');
}

// 显示标签表单
function showTagForm(tag = null) {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-4">${tag ? '编辑标签' : '添加新标签'}</h3>
            <form id="tag-form" class="space-y-4">
                <div>
                    <label class="form-label">标签名称</label>
                    <input type="text" id="tag-name" class="form-input" value="${tag?.name || ''}" required>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="closeModal()" class="btn-secondary">取消</button>
                    <button type="submit" class="btn-primary">保存</button>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById('tag-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTag(tag?.id);
    });
}

// 保存标签
function saveTag(id = null) {
    const name = document.getElementById('tag-name').value;
    const tags = JSON.parse(localStorage.getItem('tags') || '[]');

    if (id) {
        const index = tags.findIndex(t => t.id === id);
        if (index !== -1) {
            tags[index] = { ...tags[index], name };
        }
    } else {
        tags.push({
            id: Date.now(),
            name,
            count: 0
        });
    }

    localStorage.setItem('tags', JSON.stringify(tags));
    closeModal();
    loadTags();
    alert(id ? '标签已更新！' : '标签已添加！');
}

// 删除标签
function deleteTag(id) {
    if (confirm('确定要删除这个标签吗？相关文章的标签将被移除。')) {
        const tags = JSON.parse(localStorage.getItem('tags') || '[]');
        const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
        
        // 更新相关博客的标签
        const updatedBlogs = blogs.map(blog => ({
            ...blog,
            tags: (blog.tags || []).filter(tagId => tagId !== id)
        }));
        
        localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
        localStorage.setItem('tags', JSON.stringify(tags.filter(t => t.id !== id)));
        loadTags();
        alert('标签已删除！');
    }
}

// 初始化访问统计
function initStatisticsSection() {
    loadStatistics();
    initVisitsChart();
}

// 加载统计数据
function loadStatistics() {
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    
    // 计算今日访问量
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = visits.filter(v => v.date.startsWith(today)).length;
    
    // 更新统计数字
    document.getElementById('total-visits').textContent = visits.length;
    document.getElementById('today-visits').textContent = todayVisits;
    document.getElementById('total-posts').textContent = blogs.length;
    document.getElementById('total-comments').textContent = messages.length;
}

// 初始化访问图表
function initVisitsChart() {
    const ctx = document.getElementById('visits-chart').getContext('2d');
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    
    // 获取最近7天的日期
    const dates = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();
    
    // 计算每天的访问量
    const dailyVisits = dates.map(date => 
        visits.filter(v => v.date.startsWith(date)).length
    );
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '每日访问量',
                data: dailyVisits,
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '最近7天访问统计'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 记录访问
function recordVisit() {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    visits.push({
        date: new Date().toISOString(),
        page: window.location.hash || '#home'
    });
    localStorage.setItem('visits', JSON.stringify(visits));
}

// 添加博客搜索功能
document.getElementById('blog-search')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    
    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        blog.category?.toLowerCase().includes(searchTerm) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    renderBlogsList(filteredBlogs);
});

// 修改加载博客列表函数，使其可重用
function renderBlogsList(blogs) {
    const blogsList = document.getElementById('blogs-list');
    if (!blogsList) return;
    
    blogsList.innerHTML = blogs.map(blog => `
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold mb-2">${blog.title}</h3>
                    <p class="text-gray-600">${blog.content.substring(0, 200)}...</p>
                    <div class="text-sm text-gray-500 mt-2">
                        ${new Date(blog.date).toLocaleDateString()} | ${blog.category || '未分类'}
                    </div>
                    <div class="flex gap-2 mt-2">
                        ${blog.tags?.map(tag => `
                            <span class="px-2 py-1 bg-gray-100 text-sm rounded">${tag}</span>
                        `).join('') || ''}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editBlog(${blog.id})" class="text-blue-500 hover:text-blue-700">
                        编辑
                    </button>
                    <button onclick="deleteBlog(${blog.id})" class="text-red-500 hover:text-red-700">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 导出数据功能
function exportData() {
    const data = {
        blogs: JSON.parse(localStorage.getItem('blogs') || '[]'),
        works: JSON.parse(localStorage.getItem('works') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        tags: JSON.parse(localStorage.getItem('tags') || '[]'),
        profile: JSON.parse(localStorage.getItem('profile') || '{}'),
        about: localStorage.getItem('aboutContent'),
        contact: JSON.parse(localStorage.getItem('contactInfo') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 导入数据功能
async function importData(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const text = await file.text();
        const data = JSON.parse(text);
        
        // 验证数据结构
        if (!data.blogs || !Array.isArray(data.blogs)) {
            throw new Error('无效的数据格式');
        }
        
        // 导入数据
        if (data.blogs) localStorage.setItem('blogs', JSON.stringify(data.blogs));
        if (data.works) localStorage.setItem('works', JSON.stringify(data.works));
        if (data.categories) localStorage.setItem('categories', JSON.stringify(data.categories));
        if (data.tags) localStorage.setItem('tags', JSON.stringify(data.tags));
        if (data.profile) localStorage.setItem('profile', JSON.stringify(data.profile));
        if (data.about) localStorage.setItem('aboutContent', data.about);
        if (data.contact) localStorage.setItem('contactInfo', JSON.stringify(data.contact));
        
        // 刷新页面
        alert('数据导入成功！');
        window.location.reload();
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败：' + error.message);
    }
}

// 初始化系统设置
function initSettingsSection() {
    const settingsForm = document.getElementById('settings-form');
    loadSettings();
    loadAPIConfig();

    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }
}

// 加载系统设置
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    // 加载主题颜色设置
    document.getElementById('light-theme-start').value = settings.lightThemeStart || '#f5f7fa';
    document.getElementById('light-theme-end').value = settings.lightThemeEnd || '#e4e8eb';
    document.getElementById('dark-theme-start').value = settings.darkThemeStart || '#1a1a1a';
    document.getElementById('dark-theme-end').value = settings.darkThemeEnd || '#2d2d2d';
    
    // 加载其他设置
    document.getElementById('site-title').value = settings.siteTitle || '';
    document.getElementById('site-description').value = settings.siteDescription || '';
    document.getElementById('posts-per-page').value = settings.postsPerPage || 10;
    document.getElementById('auto-backup').checked = settings.autoBackup || false;
    document.getElementById('backup-frequency').value = settings.backupFrequency || 'weekly';
}

// 保存系统设置
async function saveSettings() {
    // 处理密码修改
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
            alert('新密码和确认密码不匹配！');
            return;
        }
        
        try {
            await changePassword(currentPassword, newPassword);
        } catch (error) {
            alert('密码修改失败：' + error.message);
            return;
        }
    }

    // 保存设置
    const settings = {
        // 主题颜色设置
        lightThemeStart: document.getElementById('light-theme-start').value,
        lightThemeEnd: document.getElementById('light-theme-end').value,
        darkThemeStart: document.getElementById('dark-theme-start').value,
        darkThemeEnd: document.getElementById('dark-theme-end').value,
        
        // 其他设置
        siteTitle: document.getElementById('site-title').value,
        siteDescription: document.getElementById('site-description').value,
        postsPerPage: parseInt(document.getElementById('posts-per-page').value),
        autoBackup: document.getElementById('auto-backup').checked,
        backupFrequency: document.getElementById('backup-frequency').value,
        enable2FA: document.getElementById('enable-2fa').checked,
        lastModified: new Date().toISOString()
    };

    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    // 更新主题颜色
    updateThemeColors();
    
    // 记录操作日志
    addLog('settings', '更新系统设置');
    
    alert('设置已保存！');
}

// 修改密码
async function changePassword(currentPassword, newPassword) {
    const hashedCurrent = await hashPassword(currentPassword);
    const storedHash = localStorage.getItem('adminPasswordHash');
    
    if (hashedCurrent !== storedHash) {
        throw new Error('当前密码错误');
    }
    
    const hashedNew = await hashPassword(newPassword);
    localStorage.setItem('adminPasswordHash', hashedNew);
    addLog('security', '修改密码');
}

// 初始化日志管理
function initLogsSection() {
    loadLogs();
    
    // 监听日志类型选择
    document.getElementById('log-type').addEventListener('change', function(e) {
        loadLogs(e.target.value);
    });
}

// 加载日志列表
function loadLogs(type = 'all') {
    const logsList = document.getElementById('logs-list');
    const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    
    // 根据类型筛选日志
    const filteredLogs = type === 'all' ? 
        logs : 
        logs.filter(log => log.type === type);
    
    logsList.innerHTML = filteredLogs.map(log => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(log.timestamp).toLocaleString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${getLogTypeColor(log.type)}">
                    ${log.type}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${log.user || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${log.action}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                ${log.details || '-'}
            </td>
        </tr>
    `).join('');
}

// 获取日志类型的颜色样式
function getLogTypeColor(type) {
    switch (type) {
        case 'login':
            return 'bg-blue-100 text-blue-800';
        case 'operation':
            return 'bg-green-100 text-green-800';
        case 'error':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// 添加系统日志
function addLog(type, action, details = '') {
    const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    
    logs.unshift({
        timestamp: new Date().toISOString(),
        type,
        user: localStorage.getItem('adminUsername'),
        action,
        details
    });
    
    // 只保留最近1000条日志
    if (logs.length > 1000) {
        logs.pop();
    }
    
    localStorage.setItem('systemLogs', JSON.stringify(logs));
    
    // 如果当前在日志页面，刷新显示
    if (document.querySelector('#logs-section.active')) {
        loadLogs(document.getElementById('log-type').value);
    }
}

// 清除日志
function clearLogs() {
    if (confirm('确定要清除所有日志吗？此操作不可恢复')) {
        localStorage.setItem('systemLogs', '[]');
        loadLogs();
        alert('日志已清除！');
        addLog('operation', '清除系统日志');
    }
}

// 自动备份功能
function setupAutoBackup() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    if (!settings.autoBackup) return;
    
    const lastBackup = localStorage.getItem('lastAutoBackup');
    const now = new Date();
    
    if (lastBackup) {
        const backupDate = new Date(lastBackup);
        const daysSinceBackup = (now - backupDate) / (1000 * 60 * 60 * 24);
        
        let shouldBackup = false;
        switch (settings.backupFrequency) {
            case 'daily':
                shouldBackup = daysSinceBackup >= 1;
                break;
            case 'weekly':
                shouldBackup = daysSinceBackup >= 7;
                break;
            case 'monthly':
                shouldBackup = daysSinceBackup >= 30;
                break;
        }
        
        if (shouldBackup) {
            exportData(true);
            localStorage.setItem('lastAutoBackup', now.toISOString());
            addLog('operation', '自动备份数据');
        }
    } else {
        // 首次运行，立即备份
        exportData(true);
        localStorage.setItem('lastAutoBackup', now.toISOString());
        addLog('operation', '首次自动备份');
    }
}

// 修改导出数据函数以支持自动备份
function exportData(isAutoBackup = false) {
    const data = {
        blogs: JSON.parse(localStorage.getItem('blogs') || '[]'),
        works: JSON.parse(localStorage.getItem('works') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        tags: JSON.parse(localStorage.getItem('tags') || '[]'),
        profile: JSON.parse(localStorage.getItem('profile') || '{}'),
        about: localStorage.getItem('aboutContent'),
        contact: JSON.parse(localStorage.getItem('contactInfo') || '{}'),
        settings: JSON.parse(localStorage.getItem('siteSettings') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    if (!isAutoBackup) {
        // 手动导出时下载文件
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog('operation', '手动导出数据');
    } else {
        // 自动备份时存储到 localStorage
        localStorage.setItem('autoBackup', blob);
    }
}

// 添加更新主题颜色的函数
function updateThemeColors() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const style = document.createElement('style');
    
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
    
    // 移除旧的样式
    const oldStyle = document.getElementById('theme-colors');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    // 添加新样式
    style.id = 'theme-colors';
    document.head.appendChild(style);
}

// 加载数据库配置
function loadDBConfig() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    document.getElementById('db-host').value = settings.dbHost || 'mysql.sqlpub.com';
    document.getElementById('db-port').value = settings.dbPort || '3306';
    document.getElementById('db-name').value = settings.dbName || 'mutx163';
    document.getElementById('db-user').value = settings.dbUser || 'mutx163';
    // 出于安全考虑，不加载密码
}

// 显示加载动画
function showSpinner() {
    const spinner = document.getElementById('admin-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

// 隐藏加载动画
function hideSpinner() {
    const spinner = document.getElementById('admin-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// 测试数据库连接
async function testDBConnection() {
    const config = getDBConfig();
    if (!validateDBConfig(config)) {
        alert('请填写完整的数据库配置信息');
        return;
    }

    try {
        showSpinner();
        console.log('发送测试请求:', config);
        const response = await fetch(getAPIUrl('/api/settings/test-db'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error + (result.details ? `: ${result.details}` : ''));
        }

        alert(result.message || '数据库连接成功！');
    } catch (error) {
        console.error('数据库连接测试失败:', error);
        alert('数据库连接失败：' + error.message);
    } finally {
        hideSpinner();
    }
}

// 保存数据库配置
async function saveDBConfig() {
    const config = getDBConfig();
    if (!validateDBConfig(config)) {
        alert('请填写完整的数据库配置信息');
        return;
    }

    try {
        showSpinner();
        const response = await fetch(getAPIUrl('/api/settings/db-config'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        // 保存到本地存储（不包含密码）
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        settings.dbHost = config.host;
        settings.dbPort = config.port;
        settings.dbName = config.database;
        settings.dbUser = config.user;
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        
        alert(result.message || '数据库配置已保存！');
        addLog('settings', '更新数据库配置');
    } catch (error) {
        console.error('保存数据库配置失败:', error);
        alert('保存配置失败：' + error.message);
    } finally {
        hideSpinner();
    }
}

// 获取数据库配置
function getDBConfig() {
    return {
        host: document.getElementById('db-host').value,
        port: document.getElementById('db-port').value,
        database: document.getElementById('db-name').value,
        user: document.getElementById('db-user').value,
        password: document.getElementById('db-password').value
    };
}

// 验证数据库配置
function validateDBConfig(config) {
    return config.host && 
           config.port && 
           config.database && 
           config.user && 
           config.password;
}

// 测试 API 连接
async function testAPIConnection() {
    try {
        const response = await fetch(getAPIUrl('/api/test'));
        const data = await response.json();
        console.log('API 测试结果:', data);
    } catch (error) {
        console.error('API 连接测试失败:', error);
    }
}

// 在页面加载时测试连接
document.addEventListener('DOMContentLoaded', testAPIConnection);

// 加载 API 配置
function loadAPIConfig() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    document.getElementById('api-host').value = settings.apiHost || 'http://localhost';
    document.getElementById('api-port').value = settings.apiPort || '3000';
}

// 保存 API 配置
async function saveAPIConfig() {
    const host = document.getElementById('api-host').value;
    const port = document.getElementById('api-port').value;

    if (!host || !port) {
        alert('请填写完整的服务器配置信息');
        return;
    }

    try {
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        settings.apiHost = host;
        settings.apiPort = port;
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        
        // 更新全局 API URL
        window.API_BASE_URL = `${host}:${port}`;
        
        alert('API 配置已保存！');
        addLog('settings', '更新 API 配置');
    } catch (error) {
        console.error('保存 API 配置失败:', error);
        alert('保存配置失败：' + error.message);
    }
}

// 测试 API 连接
async function testAPIConnection() {
    const host = document.getElementById('api-host').value;
    const port = document.getElementById('api-port').value;

    if (!host || !port) {
        alert('请填写完整的服务器配置信息');
        return;
    }

    try {
        showSpinner();
        const response = await fetch(`${host}:${port}/api/test`);
        const data = await response.json();
        alert('API 连接成功！' + data.message);
    } catch (error) {
        console.error('API 连接测试失败:', error);
        alert('API 连接失败：' + error.message);
    } finally {
        hideSpinner();
    }
}

// 获取 API URL
function getAPIUrl(endpoint) {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const host = settings.apiHost || 'http://localhost';
    const port = settings.apiPort || '3000';
    return `${host}:${port}${endpoint}`;
}

// 修改数据相关函数使用新的 API URL
async function testDBConnection() {
    const config = getDBConfig();
    if (!validateDBConfig(config)) {
        alert('请填写完整的数据库配置信息');
        return;
    }

    try {
        showSpinner();
        const response = await fetch(getAPIUrl('/api/settings/test-db'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || '数据库连接成功！');
    } catch (error) {
        console.error('数据库连接测试失败:', error);
        alert('数据库连接失败：' + error.message);
    } finally {
        hideSpinner();
    }
}

// 修改保存数据库配置函数
async function saveDBConfig() {
    const config = getDBConfig();
    if (!validateDBConfig(config)) {
        alert('请填写完整的数据库配置信息');
        return;
    }

    try {
        showSpinner();
        const response = await fetch(getAPIUrl('/api/settings/db-config'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        // 保存到本地存储（不包含密码）
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        settings.dbHost = config.host;
        settings.dbPort = config.port;
        settings.dbName = config.database;
        settings.dbUser = config.user;
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        
        alert(result.message || '数据库配置已保存！');
        addLog('settings', '更新数据库配置');
    } catch (error) {
        console.error('保存数据库配置失败:', error);
        alert('保存配置失败：' + error.message);
    } finally {
        hideSpinner();
    }
}

// 初始化统计图表
function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js 未加载，无法进行图表初始化');
        return;
    }

    // 访问量趋势图
    const visitCtx = document.getElementById('visit-chart');
    if (!visitCtx) return;

    new Chart(visitCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '访问量',
                data: [120, 190, 300, 250, 420, 380],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '月访问量趋势'
                }
            }
        }
    });
}

// 其他初始化函数...

// 添加基础 API URL 配置
const API_BASE_URL = 'http://localhost:3000';  // 后端服务器地址

// 修改 getAPIUrl 函数
function getAPIUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// 获取分类列表
async function getCategories() {
    try {
        const response = await fetch(getAPIUrl('/api/categories'));
        if (!response.ok) {
            throw new Error('获取分类列表失败');
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('获取分类列表失败:', error);
        return []; // 如果获取失败，返回空数组
    }
}

// 测试 API 服务器连接
async function testApiConnection() {
    const apiServer = document.getElementById('api-server').value;
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
    const apiServer = document.getElementById('api-server').value;
    if (!apiServer) {
        alert('请输入 API 服务器地址');
        return;
    }

    try {
        // 保存到 localStorage
        localStorage.setItem('API_BASE_URL', apiServer);
        
        // 更新当前页面的 API 基础地址
        window.API_BASE_URL = apiServer;
        
        alert('API 服务器配置已保存！');
        addLog('settings', '更新 API 服务器配置');
    } catch (error) {
        console.error('保存 API 配置失败:', error);
        alert('保存配置失败: ' + error.message);
    }
}

// 加载 API 配置
function loadApiConfig() {
    const apiServer = localStorage.getItem('API_BASE_URL');
    if (apiServer) {
        document.getElementById('api-server').value = apiServer;
    }
}

// 在页面加载时加载配置
document.addEventListener('DOMContentLoaded', function() {
    loadApiConfig();
    // ... 其他初始化代码 ...
});
