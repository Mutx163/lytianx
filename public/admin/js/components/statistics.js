import { statisticsService } from '../services/statistics.js';
import { ui } from '../utils/ui.js';

class StatisticsComponent {
    constructor() {
        this.charts = {};
    }

    // 初始化仪表盘统计
    async initDashboardStats() {
        try {
            const stats = await statisticsService.getDashboardStats();
            this.renderDashboardStats(stats);
        } catch (error) {
            ui.showError('加载仪表盘统计失败');
        }
    }

    // 渲染仪表盘统计
    renderDashboardStats(stats) {
        const { posts, works, comments, categories, tags } = stats;

        // 更新统计卡片
        document.querySelector('#total-posts').textContent = posts.total;
        document.querySelector('#published-posts').textContent = posts.published;
        document.querySelector('#total-works').textContent = works.total;
        document.querySelector('#total-comments').textContent = comments.total;
        document.querySelector('#total-categories').textContent = categories.total;
        document.querySelector('#total-tags').textContent = tags.total;
    }

    // 初始化访问统计图���
    async initVisitChart(period = 'day') {
        try {
            const stats = await statisticsService.getVisitStats(period);
            this.renderVisitChart(stats);
        } catch (error) {
            ui.showError('加载访问统计失败');
        }
    }

    // 渲染访问统计图表
    renderVisitChart(stats) {
        const ctx = document.querySelector('#visit-chart').getContext('2d');
        
        if (this.charts.visitChart) {
            this.charts.visitChart.destroy();
        }

        this.charts.visitChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: stats.dates,
                datasets: [
                    {
                        label: '访问量',
                        data: stats.visitCounts,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: '独立访客',
                        data: stats.uniqueVisitors,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: '访问统计'
                    }
                }
            }
        });
    }

    // 初始化热门内容列表
    async initPopularContent(type = 'post') {
        try {
            const content = await statisticsService.getPopularContent(type);
            this.renderPopularContent(content, type);
        } catch (error) {
            ui.showError('加载热门内容失败');
        }
    }

    // 渲染热门内容列表
    renderPopularContent(content, type) {
        const container = document.querySelector(`#popular-${type}s`);
        container.innerHTML = '';

        content.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${item.title}</span>
                <span class="badge bg-primary rounded-pill">${item.view_count}</span>
            `;
            container.appendChild(li);
        });
    }

    // 初始化用户活动统计
    async initUserActivityStats(userId) {
        try {
            const stats = await statisticsService.getUserActivityStats(userId);
            this.renderUserActivityStats(stats);
        } catch (error) {
            ui.showError('加载用户活动统计失败');
        }
    }

    // 渲染用户活动统计
    renderUserActivityStats(stats) {
        document.querySelector('#user-posts').textContent = stats.postCount;
        document.querySelector('#user-comments').textContent = stats.commentCount;
        document.querySelector('#last-login').textContent = 
            stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : '从未登录';
    }

    // 更新访问统计
    async updateVisitCount(type, id) {
        try {
            await statisticsService.updateVisitCount(type, id);
        } catch (error) {
            console.error('Update visit count error:', error);
        }
    }

    // 绑定事件
    bindEvents() {
        // 切换访问统计周期
        document.querySelectorAll('[data-period]').forEach(button => {
            button.addEventListener('click', () => {
                const period = button.dataset.period;
                this.initVisitChart(period);
            });
        });

        // 切换热门内容类型
        document.querySelectorAll('[data-content-type]').forEach(button => {
            button.addEventListener('click', () => {
                const type = button.dataset.contentType;
                this.initPopularContent(type);
            });
        });
    }

    // 初始化组件
    async init() {
        await Promise.all([
            this.initDashboardStats(),
            this.initVisitChart(),
            this.initPopularContent('post'),
            this.initPopularContent('work')
        ]);
        this.bindEvents();
    }
}

export const statistics = new StatisticsComponent(); 