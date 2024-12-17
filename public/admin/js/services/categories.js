// 分类服务
const categories = {
    // 获取分类列表
    async getList(params = {}) {
        try {
            ui.loading.show();
            const response = await api.get('/categories', params);
            return response;
        } catch (error) {
            utils.logger.error('获取分类列表失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取分类详情
    async getDetail(id) {
        try {
            ui.loading.show();
            const response = await api.get(`/categories/${id}`);
            return response;
        } catch (error) {
            utils.logger.error('获取分类详情失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 创建分类
    async create(data) {
        try {
            ui.loading.show();
            const response = await api.post('/categories', data);
            utils.logger.info('创建分类成功', { id: response.id });
            return response;
        } catch (error) {
            utils.logger.error('创建分类失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新分类
    async update(id, data) {
        try {
            ui.loading.show();
            const response = await api.put(`/categories/${id}`, data);
            utils.logger.info('更新分类成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('更新分类失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 删除分类
    async delete(id) {
        try {
            ui.loading.show();
            await api.delete(`/categories/${id}`);
            utils.logger.info('删除分类成功', { id });
            return true;
        } catch (error) {
            utils.logger.error('删除分类失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新分类排序
    async updateOrder(ids) {
        try {
            ui.loading.show();
            const response = await api.put('/categories/order', { ids });
            utils.logger.info('更新分类排序成功');
            return response;
        } catch (error) {
            utils.logger.error('更新分类排序失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取分类统计信息
    async getStats() {
        try {
            const response = await api.get('/categories/stats');
            return response;
        } catch (error) {
            utils.logger.error('获取分类统计信息失败', error);
            throw error;
        }
    },

    // 获取分类树
    async getTree() {
        try {
            const response = await api.get('/categories/tree');
            return response;
        } catch (error) {
            utils.logger.error('获取分类树失败', error);
            throw error;
        }
    },

    // 移动分类
    async move(id, parentId) {
        try {
            ui.loading.show();
            const response = await api.put(`/categories/${id}/move`, { parentId });
            utils.logger.info('移动分类成功', { id, parentId });
            return response;
        } catch (error) {
            utils.logger.error('移动分类失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取分类下的文章
    async getPosts(id, params = {}) {
        try {
            ui.loading.show();
            const response = await api.get(`/categories/${id}/posts`, params);
            return response;
        } catch (error) {
            utils.logger.error('获取分类文章失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 批量更新分类
    async batchUpdate(ids, data) {
        try {
            ui.loading.show();
            const response = await api.put('/categories/batch', { ids, ...data });
            utils.logger.info('批量更新分类成功', { count: ids.length });
            return response;
        } catch (error) {
            utils.logger.error('批量更新分类失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 批量删除分类
    async batchDelete(ids) {
        try {
            ui.loading.show();
            await api.delete('/categories/batch', { data: { ids } });
            utils.logger.info('批量删除分类成功', { count: ids.length });
            return true;
        } catch (error) {
            utils.logger.error('批量删除分类失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    }
};

// 导出分类服务
window.categories = categories; 