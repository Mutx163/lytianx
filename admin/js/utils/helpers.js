// 初始化全局工具对象
window.utils = window.utils || {};

// 日期格式化
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
        );
    }
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 存储工具类
const storage = {
    // 设置数据
    set(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(key, data);
            utils.logger.debug('STORAGE', `存储数据: ${key}`, { value });
        } catch (error) {
            utils.logger.error('STORAGE', '存储数据失败', error);
            throw error;
        }
    },

    // 获取数据
    get(key) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) {
                return null;
            }
            try {
                return JSON.parse(data);
            } catch (e) {
                // 如果解析失败，返回原始字符串
                return data;
            }
        } catch (error) {
            utils.logger.error('STORAGE', '读取存储数据失败', error);
            return null;
        }
    },

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(key);
            utils.logger.debug('STORAGE', `删除数据: ${key}`);
        } catch (error) {
            utils.logger.error('STORAGE', '删除数据失败', error);
            throw error;
        }
    },

    // 清空所有数据
    clear() {
        try {
            localStorage.clear();
            utils.logger.debug('STORAGE', '清空所有数据');
        } catch (error) {
            utils.logger.error('STORAGE', '清空数据失败', error);
            throw error;
        }
    }
};

// 更新工具函数
Object.assign(window.utils, {
    formatDate,
    debounce,
    throttle,
    deepClone,
    generateId,
    storage
}); 