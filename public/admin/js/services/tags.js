// 标签服务
const tags = {
    // 获取标签列表
    async getList(params = {}) {
        try {
            ui.loading.show();
            const response = await api.get('/tags', params);
            return response;
        } catch (error) {
            utils.logger.error('获取标签列表失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取标签详情
    async getDetail(id) {
        try {
            ui.loading.show();
            const response = await api.get(`/tags/${id}`);
            return response;
        } catch (error) {
            utils.logger.error('获取标签详情失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 创建标签
    async create(data) {
        try {
            ui.loading.show();
            const response = await api.post('/tags', data);
            utils.logger.info('创建标签成功', { id: response.id });
            return response;
        } catch (error) {
            utils.logger.error('创建标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新标签
    async update(id, data) {
        try {
            ui.loading.show();
            const response = await api.put(`/tags/${id}`, data);
            utils.logger.info('更新标签成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('更新标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 删除标签
    async delete(id) {
        try {
            ui.loading.show();
            await api.delete(`/tags/${id}`);
            utils.logger.info('删除标签成功', { id });
            return true;
        } catch (error) {
            utils.logger.error('删除标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取标签统计信息
    async getStats() {
        try {
            const response = await api.get('/tags/stats');
            return response;
        } catch (error) {
            utils.logger.error('获取标签统计信息失败', error);
            throw error;
        }
    },

    // 获取热门标签
    async getHot(limit = 10) {
        try {
            const response = await api.get('/tags/hot', { limit });
            return response;
        } catch (error) {
            utils.logger.error('获取热门标签失败', error);
            throw error;
        }
    },

    // 获取标签下的文章
    async getPosts(id, params = {}) {
        try {
            ui.loading.show();
            const response = await api.get(`/tags/${id}/posts`, params);
            return response;
        } catch (error) {
            utils.logger.error('获取标签文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 批量创建标签
    async batchCreate(tags) {
        try {
            ui.loading.show();
            const response = await api.post('/tags/batch', { tags });
            utils.logger.info('批量创建标签成功', { count: tags.length });
            return response;
        } catch (error) {
            utils.logger.error('批量创建标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 批量删除标签
    async batchDelete(ids) {
        try {
            ui.loading.show();
            await api.delete('/tags/batch', { data: { ids } });
            utils.logger.info('批量删除标签成功', { count: ids.length });
            return true;
        } catch (error) {
            utils.logger.error('批量删除标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 合并标签
    async merge(sourceIds, targetId) {
        try {
            ui.loading.show();
            const response = await api.post('/tags/merge', {
                sourceIds,
                targetId
            });
            utils.logger.info('合并标签成功', { sourceIds, targetId });
            return response;
        } catch (error) {
            utils.logger.error('合并标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 搜索标签
    async search(keyword) {
        try {
            const response = await api.get('/tags/search', { keyword });
            return response;
        } catch (error) {
            utils.logger.error('搜索标签失败', error);
            throw error;
        }
    }
};

// 导出标签服务
window.tags = tags; 