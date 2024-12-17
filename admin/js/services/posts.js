// 文章服务
const posts = {
    // 获取文章列表
    async getList(params = {}) {
        try {
            return await api.get('/api/posts', params);
        } catch (error) {
            utils.logger.error('获取文章列表失败', error);
            throw error;
        }
    },

    // 获取文章详情
    async getDetail(id) {
        try {
            return await api.get(`/api/posts/${id}`);
        } catch (error) {
            utils.logger.error('获取文章详情失败', error);
            throw error;
        }
    },

    // 创建文章
    async create(data) {
        try {
            ui.loading.show();
            const response = await api.post('/api/posts', data);
            utils.logger.info('创建文章成功');
            return response;
        } catch (error) {
            utils.logger.error('创建文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新文章
    async update(id, data) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/posts/${id}`, data);
            utils.logger.info('更新文章成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('更新文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 删除文章
    async delete(id) {
        try {
            ui.loading.show();
            const response = await api.delete(`/api/posts/${id}`);
            utils.logger.info('删除文章成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('删除文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 发布文章
    async publish(id) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/posts/${id}/publish`);
            utils.logger.info('发布文章成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('发布文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 取消发布文章
    async unpublish(id) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/posts/${id}/unpublish`);
            utils.logger.info('取消发布文章成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('取消发布文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 上传文章封面
    async uploadCover(id, file) {
        try {
            ui.loading.show();
            const formData = new FormData();
            formData.append('cover', file);
            
            const response = await api.post(`/api/posts/${id}/cover`, formData);
            utils.logger.info('上传文章封面成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('上传文章封面失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取文章统计信息
    async getStats() {
        try {
            return await api.get('/api/posts/stats');
        } catch (error) {
            utils.logger.error('获取文章统计信息失败', error);
            throw error;
        }
    },

    // 搜索文章
    async search(keyword) {
        try {
            ui.loading.show();
            const response = await api.get('/api/posts/search', { keyword });
            return response;
        } catch (error) {
            utils.logger.error('搜索文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取推荐文章
    async getRecommended(id, limit = 5) {
        try {
            const response = await api.get(`/api/posts/${id}/recommended`, { limit });
            return response;
        } catch (error) {
            utils.logger.error('获取推荐文章失败', error);
            throw error;
        }
    },

    // 获取相关文章
    async getRelated(id, limit = 5) {
        try {
            const response = await api.get(`/api/posts/${id}/related`, { limit });
            return response;
        } catch (error) {
            utils.logger.error('获取相关文章失败', error);
            throw error;
        }
    },

    // 导出文章
    async export(ids) {
        try {
            ui.loading.show();
            const response = await api.post('/posts/export', { ids });
            utils.logger.info('导出文章成功', { count: ids.length });
            return response;
        } catch (error) {
            utils.logger.error('导出文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 导入文章
    async import(file) {
        try {
            ui.loading.show();
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.post('/posts/import', formData);
            utils.logger.info('导入文章成功', { count: response.imported });
            return response;
        } catch (error) {
            utils.logger.error('导入文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    }
};

// 导出文章服务
window.posts = posts; 