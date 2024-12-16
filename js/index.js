// 加载博客列表
async function loadBlogs() {
    try {
        const response = await fetch('http://localhost:3000/api/blogs');
        const blogs = await response.json();
        
        const blogList = document.getElementById('blog-list');
        blogList.innerHTML = blogs.map(blog => `
            <article class="blog-card">
                ${blog.cover_image ? `
                    <div class="blog-card-image">
                        <img src="${blog.cover_image}" alt="${blog.title}">
                    </div>
                ` : ''}
                <div class="blog-card-content">
                    <h3>${blog.title}</h3>
                    <p>${blog.content.substring(0, 200)}...</p>
                    <div class="blog-card-meta">
                        <span>${new Date(blog.created_at).toLocaleDateString()}</span>
                        <span>${blog.category || '未分类'}</span>
                    </div>
                    <div class="blog-card-tags">
                        ${JSON.parse(blog.tags || '[]').map(tag => 
                            `<span class="tag">${tag}</span>`
                        ).join('')}
                    </div>
                    <a href="#" onclick="loadBlogDetail(${blog.id})" class="read-more">阅读更多</a>
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
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`);
        const blog = await response.json();
        
        const content = document.getElementById('content');
        content.innerHTML = `
            <article class="blog-detail">
                <h1>${blog.title}</h1>
                <div class="blog-meta">
                    <span>${new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>${blog.category || '未分类'}</span>
                </div>
                ${blog.cover_image ? `
                    <div class="blog-cover">
                        <img src="${blog.cover_image}" alt="${blog.title}">
                    </div>
                ` : ''}
                <div class="blog-content">
                    ${marked(blog.content)}
                </div>
                <div class="blog-tags">
                    ${JSON.parse(blog.tags || '[]').map(tag => 
                        `<span class="tag">${tag}</span>`
                    ).join('')}
                </div>
            </article>
        `;
    } catch (error) {
        console.error('加载博客详情失败:', error);
        showError('加载博客详情失败');
    }
}

// 在页面加载时加载博客列表
document.addEventListener('DOMContentLoaded', loadBlogs); 