import { http } from '../utils/http.js';

class StatisticsService {
    // 获取仪表盘统计数据
    async getDashboardStats() {
        try {
            const response = await http.get('/api/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            throw error;
        }
    }

    // 获取访问统计数据
    async getVisitStats(period = 'day') {
        try {
            const response = await http.get('/api/stats/visits', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('Get visit stats error:', error);
            throw error;
        }
    }

    // 获取热门内容
    async getPopularContent(type = 'post', limit = 10) {
        try {
            const response = await http.get(`/api/stats/popular/${type}`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Get popular content error:', error);
            throw error;
        }
    }

    // 获取用户活动统计
    async getUserActivityStats(userId, period = 'month') {
        try {
            const response = await http.get(`/api/stats/users/${userId}/activity`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('Get user activity stats error:', error);
            throw error;
        }
    }

    // 更新访问统计
    async updateVisitCount(type, id) {
        try {
            const response = await http.post(`/api/stats/visits/${type}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Update visit count error:', error);
            throw error;
        }
    }
}

export const statisticsService = new StatisticsService(); 