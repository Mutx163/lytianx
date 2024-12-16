// 检查是否已经初始化过
function checkInitialized() {
    return localStorage.getItem('dataInitialized') === 'true';
}

// 初始化示例数据
function initSampleData() {
    if (checkInitialized()) {
        alert('示例数据已存在！');
        return;
    }

    // 示例作品数据
    const works = [
        {
            id: 1,
            title: '个人博客网站',
            description: '使用 HTML、CSS 和 JavaScript 开发的响应式个人博客网站。包含文章展示、分类浏览、搜索等功能。采用现代化的设计风格，注重用户体验。\n\n技术栈：HTML5, CSS3, JavaScript, Tailwind CSS',
            date: '2023-12-15'
        },
        {
            id: 2,
            title: '天气预报应用',
            description: '基于 Vue.js 开发的天气预报应用。支持全球主要城市的天气查询，提供7天预报、实时天气更新、温度趋势图表等功能。\n\n技术栈：Vue.js, Axios, Chart.js, OpenWeather API',
            date: '2023-11-20'
        },
        {
            id: 3,
            title: '任务管理系统',
            description: '团队协作任务管理系统，支持项目创建、任务分配、进度跟踪、文件共享等功能。采用 React 和 Node.js 开发，使用 MongoDB 存储数据。\n\n技术栈：React, Node.js, Express, MongoDB, Socket.IO',
            date: '2023-10-05'
        }
    ];

    // 示例博客数据
    const blogs = [
        {
            id: 1,
            title: '前端开发最佳实践',
            content: '在现代前端开发中，遵循最佳实践对于提高代码质量和维护性至关重要...',
            date: '2023-12-10'
        },
        {
            id: 2,
            title: 'JavaScript 异步编程详解',
            content: '异步编程是 JavaScript 中的重要概念，本文将详细介绍 Promise、async/await 的使用...',
            date: '2023-11-25'
        },
        {
            id: 3,
            title: 'CSS Grid 布局入门指南',
            content: 'CSS Grid 是一个强大的布局工具，本文将介绍其基本概念和实际应用...',
            date: '2023-11-15'
        }
    ];

    // 将数据保存到 localStorage
    localStorage.setItem('works', JSON.stringify(works));
    localStorage.setItem('blogs', JSON.stringify(blogs));

    // 返回初始化的数据数量，用于显示确认消息
    return {
        worksCount: works.length,
        blogsCount: blogs.length
    };

    localStorage.setItem('dataInitialized', 'true');
    alert('示例数据已成功添加！');
}

// 清除所有数据
function clearAllData() {
    if (confirm('确定要清除所有数据吗？')) {
        localStorage.clear();
        alert('所有数据已清除！');
    }
}
