// API 配置
const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:3000',
        timeout: 30000,
        retries: 2,
        debug: true
    },
    production: {
        baseURL: 'https://mutx1636.avosapps.us',
        timeout: 60000,
        retries: 3,
        debug: false
    }
};

// 认证配置
const AUTH_CONFIG = {
    appId: 'AFlTg3fRukmZ8KqMl01Y78dD-MdYXbMMI',
    appKey: 'N0muGm2nLMAEQQ27Mh37pVwO'
};

// 获取当前环境
function getCurrentEnv() {
    return window.location.hostname === 'mutx163.github.io' ? 'production' : 'development';
}

// 获取 API 配置
function getApiConfig() {
    const env = getCurrentEnv();
    const config = {
        ...API_CONFIG[env],
        ...utils.storage.get('api_config', {})
    };

    // 从 localStorage 中获取自定义 API 地址
    const customApiUrl = utils.storage.get('custom_api_url');
    if (customApiUrl) {
        config.baseURL = customApiUrl;
    }

    return config;
}

// 生成签名
async function generateSign(timestamp, nonce) {
    const signStr = `${timestamp},${nonce},${AUTH_CONFIG.appKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hashHex},${timestamp},${nonce}`;
}

// 请求拦截器
async function requestInterceptor(config) {
    const token = utils.storage.get('token');
    
    // 生成签名
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    const sign = await generateSign(timestamp, nonce);

    config.headers = {
        ...config.headers,
        'X-LC-Id': AUTH_CONFIG.appId,
        'X-LC-Sign': sign
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
        config.params = {
            ...config.params,
            _t: timestamp
        };
    }

    // 添加调试信息
    if (API_CONFIG[getCurrentEnv()].debug) {
        console.log(`[API Request] ${config.method} ${config.url}`, {
            headers: config.headers,
            body: config.body,
            timestamp
        });
    }

    return config;
}

// 响应拦截器
async function responseInterceptor(response) {
    const config = getApiConfig();
    const responseData = await response.json();

    // 添加调试信息
    if (config.debug) {
        console.log(`[API Response] ${response.status}`, {
            url: response.url,
            data: responseData
        });
    }

    return responseData;
}

// 创建请求实例
async function request(url, options = {}, retryCount = 0) {
    const config = getApiConfig();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
    };

    // 合并选项
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        // 应用请求拦截器
        const interceptedOptions = await requestInterceptor(mergedOptions);

        if (config.debug) {
            console.log(`[API] 发起请求: ${config.baseURL}${url}`, {
                options: interceptedOptions,
                retryCount
            });
        }

        // 添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            if (config.debug) {
                console.warn(`[API] 请求超时: ${url}`);
            }
        }, interceptedOptions.timeout || 30000);

        // 发送请求
        const response = await fetch(`${config.baseURL}${url}`, {
            ...interceptedOptions,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 处理 HTTP 错误
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: response.statusText
            }));
            
            if (response.status === 401) {
                utils.storage.remove('token');
                if (config.debug) {
                    console.warn('[API] 认证失败，清除 token');
                }
                window.location.href = '/login.html';
                return;
            }

            throw {
                status: response.status,
                message: error.message || '请求失败',
                data: error
            };
        }

        // 应用响应拦截器
        return await responseInterceptor(response);
    } catch (error) {
        if (config.debug) {
            console.error('[API] 请求错误:', {
                url,
                error,
                retryCount
            });
        }

        // 处理网络错误和超时
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            if (retryCount < config.retries) {
                utils.logger.warn(`请求超时，正在重试(${retryCount + 1}/${config.retries})...`);
                // 添加延迟重试，避免立即重试
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return request(url, options, retryCount + 1);
            }
            throw new Error('请求超时，请检查网络连接');
        }

        // 处理其他网络错误
        if (error instanceof TypeError && error.message.includes('fetch')) {
            if (retryCount < config.retries) {
                utils.logger.warn(`网络错误，正在重试(${retryCount + 1}/${config.retries})...`);
                // 添加延迟重试，避免立即重试
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return request(url, options, retryCount + 1);
            }
            throw new Error('无法连接到服务器，请检查网络连接或服务器状态');
        }

        // 其他错误直接抛出
        throw error;
    }
}

// API 方法
const api = {
    // 获取 API 配置
    getApiConfig() {
        const env = getCurrentEnv();
        const config = {
            ...API_CONFIG[env],
            ...utils.storage.get('api_config', {})
        };

        // 从 localStorage 中获取自定义 API 地址
        const customApiUrl = utils.storage.get('custom_api_url');
        if (customApiUrl) {
            config.baseURL = customApiUrl;
        }

        return config;
    },

    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return request(fullUrl, { method: 'GET' });
    },

    async post(url, data = {}) {
        return request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(url, data = {}) {
        return request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(url) {
        return request(url, { method: 'DELETE' });
    },

    async upload(url, file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return request(url, {
            method: 'POST',
            headers: {
                // 不设置 Content-Type，让浏览器自动设置
            },
            body: formData,
            onUploadProgress: onProgress
        });
    }
};

// 导出 API 实例
window.api = api; 