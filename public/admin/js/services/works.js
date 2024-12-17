// 作品服务
const works = {
    // 获取作品列表
    async getList(params = {}) {
        try {
            return await api.get('/api/works', params);
        } catch (error) {
            utils.logger.error('获取作品列表失败', error);
            throw error;
        }
    },

    // 获取作品详情
    async getDetail(id) {
        try {
            return await api.get(`/api/works/${id}`);
        } catch (error) {
            utils.logger.error('获取作品详情失败', error);
            throw error;
        }
    },

    // 创建作品
    async create(data) {
        try {
            ui.loading.show();
            const response = await api.post('/api/works', data);
            utils.logger.info('创建作品成功');
            return response;
        } catch (error) {
            utils.logger.error('创建作品失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新作品
    async update(id, data) {
        try {
            ui.loading.show();
            const response = await api.put(`/api/works/${id}`, data);
            utils.logger.info('更新作品成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('更新作品失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 删除作品
    async delete(id) {
        try {
            ui.loading.show();
            const response = await api.delete(`/api/works/${id}`);
            utils.logger.info('删除作品成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('删除作品失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 上传作品图片
    async uploadImage(id, file) {
        try {
            ui.loading.show();
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await api.post(`/api/works/${id}/image`, formData);
            utils.logger.info('上传作品图片成功', { id });
            return response;
        } catch (error) {
            utils.logger.error('上传作品图片失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 更新作品排序
    async updateOrder(ids) {
        try {
            ui.loading.show();
            const response = await api.put('/api/works/order', { ids });
            utils.logger.info('更新作品排序成功');
            return response;
        } catch (error) {
            utils.logger.error('更新作品排序失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 获取作品统计信息
    async getStats() {
        try {
            return await api.get('/api/works/stats');
        } catch (error) {
            utils.logger.error('获取作品统计信息失败', error);
            throw error;
        }
    },

    // 搜索作品
    async search(keyword) {
        try {
            ui.loading.show();
            const response = await api.get('/api/works/search', { keyword });
            return response;
        } catch (error) {
            utils.logger.error('搜索作品失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 导出作品
    async export(ids) {
        try {
            ui.loading.show();
            const response = await api.post('/api/works/export', { ids });
            utils.logger.info('导出作品成功', { count: ids.length });
            return response;
        } catch (error) {
            utils.logger.error('导出作品失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 导入作品
    async import(file) {
        try {
            ui.loading.show();
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.post('/works/import', formData);
            utils.logger.info('导入作品成功', { count: response.imported });
            return response;
        } catch (error) {
            utils.logger.error('导入作品失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 添加作品标签
    async addTag(id, tag) {
        try {
            ui.loading.show();
            const response = await api.post(`/works/${id}/tags`, { tag });
            utils.logger.info('添加作品标签成功', { id, tag });
            return response;
        } catch (error) {
            utils.logger.error('添加作品标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    },

    // 移除作品标签
    async removeTag(id, tag) {
        try {
            ui.loading.show();
            const response = await api.delete(`/works/${id}/tags/${tag}`);
            utils.logger.info('移除作品标签成功', { id, tag });
            return response;
        } catch (error) {
            utils.logger.error('移除作品标签失败', error);
            throw error;
        } finally {
            ui.loading.hide();
        }
    }
};

// 导出作品服务
window.works = works; 