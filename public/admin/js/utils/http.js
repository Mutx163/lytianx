// HTTP 请求工具类
class Http {
    constructor() {
        this.baseURL = '';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // 设置基础 URL
    setBaseURL(url) {
        this.baseURL = url;
    }

    // 设置默认请求头
    setDefaultHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    // 构建完整 URL
    buildURL(path) {
        return this.baseURL ? `${this.baseURL}${path}` : path;
    }

    // 处理响应
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: response.statusText
            }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // GET 请求
    async get(path, options = {}) {
        try {
            utils.logger.debug('API', `GET 请求: ${path}`);
            const url = this.buildURL(path);
            const response = await fetch(url, {
                method: 'GET',
                headers: { ...this.defaultHeaders, ...options.headers },
                ...options
            });
            return await this.handleResponse(response);
        } catch (error) {
            utils.logger.error('API', `GET 请求失败: ${path}`, error);
            throw error;
        }
    }

    // POST 请求
    async post(path, data, options = {}) {
        try {
            utils.logger.debug('API', `POST 请求: ${path}`, data);
            const url = this.buildURL(path);
            const response = await fetch(url, {
                method: 'POST',
                headers: { ...this.defaultHeaders, ...options.headers },
                body: JSON.stringify(data),
                ...options
            });
            return await this.handleResponse(response);
        } catch (error) {
            utils.logger.error('API', `POST 请求失败: ${path}`, error);
            throw error;
        }
    }

    // PUT 请求
    async put(path, data, options = {}) {
        try {
            utils.logger.debug('API', `PUT 请求: ${path}`, data);
            const url = this.buildURL(path);
            const response = await fetch(url, {
                method: 'PUT',
                headers: { ...this.defaultHeaders, ...options.headers },
                body: JSON.stringify(data),
                ...options
            });
            return await this.handleResponse(response);
        } catch (error) {
            utils.logger.error('API', `PUT 请求失败: ${path}`, error);
            throw error;
        }
    }

    // DELETE 请求
    async delete(path, options = {}) {
        try {
            utils.logger.debug('API', `DELETE 请求: ${path}`);
            const url = this.buildURL(path);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { ...this.defaultHeaders, ...options.headers },
                ...options
            });
            return await this.handleResponse(response);
        } catch (error) {
            utils.logger.error('API', `DELETE 请求失败: ${path}`, error);
            throw error;
        }
    }
}

// 创建全局 HTTP 实例
window.utils = window.utils || {};
window.utils.http = new Http(); 