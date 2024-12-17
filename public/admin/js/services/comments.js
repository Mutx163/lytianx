// 评论服务
const comments = {
    // 获取评论列表
    async getList(params = {}) {
        try {
            return await api.get('/api/comments', params);
        } catch (error) {
            utils.logger.error('获取评论列表失败', error);
            throw error;
        }
    },

    // 获取评论详情
    async getDetail(id) {
        try {
            return await api.get(`/api/comments/${id}`);
        } catch (error) {
            utils.logger.error('获取评论详情失败', error);
            throw error;
        }
    },

    // 创建评论
    async create(data) {
        try {
            ui.loading.show();
            const response = await api.post('/api/comments', data);
            utils.logger.info('创建评论成功');
            return response;
        } catch (error) {
            utils.logger.error('创建评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新评论
    async update(id, data) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/comments/${id}`, data);
            utils.logger.info('更新评论成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('更新评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 删除评论
    async delete(id) {
        try {
            ui.loading.show();
            const response = await api.delete(`/api/comments/${id}`);
            utils.logger.info('删除评论成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('删除评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 审核评论
    async approve(id) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/comments/${id}/approve`);
            utils.logger.info('审核评论成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('审核评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 拒绝评论
    async reject(id, reason = '') {
        try {
            ui.loading.show();
            const response = await api.put(`/api/comments/${id}/reject`, { reason });
            utils.logger.info('拒绝评论成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('拒绝评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 标记垃圾评论
    async markAsSpam(id) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/comments/${id}/spam`);
            utils.logger.info('标记垃圾评论成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('标记垃圾评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取评论统计信息
    async getStats() {
        try {
            return await api.get('/api/comments/stats');
        } catch (error) {
            utils.logger.error('获取评论统计信息失败', error);
            throw error;
        }
    },

    // 批量审核评论
    async batchApprove(ids) {
        try {
            ui.loading.show();
            const response = await api.put('/api/comments/batch/approve', { ids });
            utils.logger.info('批量审核评论成功', { count: ids.length });
            return response;
        } catch (error) {
            utils.logger.error('批量审核评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 批量拒绝评论
    async batchReject(ids, reason = '') {
        try {
            ui.loading.show();
            const response = await api.put('/api/comments/batch/reject', { ids, reason });
            utils.logger.info('批量拒绝评论成功', { count: ids.length });
            return response;
        } catch (error) {
            utils.logger.error('批量拒绝评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 批量删除评论
    async batchDelete(ids) {
        try {
            ui.loading.show();
            await api.delete('/comments/batch', { data: { ids } });
            utils.logger.info('批量删除评论成功', { count: ids.length });
            return true;
        } catch (error) {
            utils.logger.error('批量删除评论失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取评论回复
    async getReplies(id) {
        try {
            const response = await api.get(`/comments/${id}/replies`);
            return response;
        } catch (error) {
            utils.logger.error('获取评论回复失败', error);
            throw error;
        }
    },

    // 获取最新评论
    async getRecent(limit = 5) {
        try {
            const response = await api.get('/comments/recent', { limit });
            return response;
        } catch (error) {
            utils.logger.error('获取最新评论失败', error);
            throw error;
        }
    }
};

// 导出评论服务
window.comments = comments; 