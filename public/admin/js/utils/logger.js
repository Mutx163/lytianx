// 日志级别定义
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// 日志类别定义
const LogCategory = {
    AUTH: 'AUTH',       // 认证相关
    API: 'API',         // API 调用
    UI: 'UI',          // 界面交互
    SYSTEM: 'SYSTEM',   // 系统运行
    EDITOR: 'EDITOR',   // 编辑器相关
    STORAGE: 'STORAGE', // 存储操作
    PERF: 'PERF'       // 性能监控
};

// 性能监控点
const perfMarks = new Map();

class Logger {
    constructor() {
        this.level = LogLevel.DEBUG;
        this.history = [];
        this.maxHistory = 1000;
        this.startTime = Date.now();
        
        // 初始化性能监控
        if (window.performance && window.performance.mark) {
            this.hasPerfAPI = true;
            performance.mark('pageStart');
        }

        // 监听页面加载事件
        window.addEventListener('load', () => this.logPageLoadMetrics());
        
        // 监听未捕获的错误
        window.addEventListener('error', (event) => {
            this.error('SYSTEM', '未捕获的错误', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // 监听未处理的 Promise 拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.error('SYSTEM', '未处理的 Promise 拒绝', {
                reason: event.reason
            });
        });
    }

    // 记录日志
    log(level, category, message, data = null) {
        if (level < this.level) return;

        const entry = {
            timestamp: new Date().toISOString(),
            level: Object.keys(LogLevel)[level],
            category,
            message,
            data,
            timeFromStart: Date.now() - this.startTime
        };

        // 添加调用栈信息（仅对错误）
        if (level === LogLevel.ERROR && data instanceof Error) {
            entry.stack = data.stack;
        }

        // 控制台输出
        const style = this.getLogStyle(level);
        console.log(
            `%c${entry.timestamp} [${entry.level}] [${category}]%c ${message}`,
            style.header,
            style.message,
            data
        );

        // 保存到历史记录
        this.history.push(entry);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    // 获取日志样式
    getLogStyle(level) {
        const styles = {
            [LogLevel.DEBUG]: {
                header: 'color: #6c757d',
                message: 'color: #6c757d'
            },
            [LogLevel.INFO]: {
                header: 'color: #0d6efd',
                message: 'color: inherit'
            },
            [LogLevel.WARN]: {
                header: 'color: #ffc107; font-weight: bold',
                message: 'color: #ffc107'
            },
            [LogLevel.ERROR]: {
                header: 'color: #dc3545; font-weight: bold',
                message: 'color: #dc3545'
            }
        };
        return styles[level];
    }

    // 记录性能标记
    mark(name) {
        if (!this.hasPerfAPI) return;
        
        const markName = `mark_${name}`;
        performance.mark(markName);
        perfMarks.set(name, markName);
        
        this.debug('PERF', `性能标记: ${name}`);
    }

    // 测量两个标记之间的性能
    measure(name, startMark, endMark) {
        if (!this.hasPerfAPI) return;

        try {
            const start = perfMarks.get(startMark);
            const end = endMark ? perfMarks.get(endMark) : undefined;
            
            performance.measure(name, start, end);
            const entries = performance.getEntriesByName(name);
            const duration = entries[entries.length - 1].duration;
            
            this.info('PERF', `性能测量 ${name}: ${duration.toFixed(2)}ms`, {
                start: startMark,
                end: endMark,
                duration
            });
        } catch (error) {
            this.warn('PERF', `性能测量失败: ${name}`, error);
        }
    }

    // 记录页面加载指标
    logPageLoadMetrics() {
        if (!this.hasPerfAPI) return;

        try {
            const timing = performance.timing;
            const metrics = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                request: timing.responseStart - timing.requestStart,
                response: timing.responseEnd - timing.responseStart,
                dom: timing.domComplete - timing.domLoading,
                load: timing.loadEventEnd - timing.navigationStart,
                firstPaint: this.getFirstPaint(),
                resources: this.getResourceTiming()
            };

            this.info('PERF', '页面加载性能指标', metrics);
        } catch (error) {
            this.warn('PERF', '获取性能指标失败', error);
        }
    }

    // 获取首次渲染时间
    getFirstPaint() {
        if (!window.performance.getEntriesByType) return null;
        
        const paint = performance.getEntriesByType('paint');
        return paint.reduce((acc, entry) => {
            acc[entry.name] = entry.startTime;
            return acc;
        }, {});
    }

    // 获取资源加载时间
    getResourceTiming() {
        if (!window.performance.getEntriesByType) return [];

        return performance.getEntriesByType('resource').map(entry => ({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize
        }));
    }

    // 导出日志历史
    exportLogs() {
        return {
            logs: this.history,
            performance: this.hasPerfAPI ? {
                timing: performance.timing.toJSON(),
                navigation: performance.navigation.toJSON(),
                memory: performance.memory ? performance.memory : null,
                resources: this.getResourceTiming()
            } : null,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    // 便捷方法
    debug(category, message, data) {
        this.log(LogLevel.DEBUG, category, message, data);
    }

    info(category, message, data) {
        this.log(LogLevel.INFO, category, message, data);
    }

    warn(category, message, data) {
        this.log(LogLevel.WARN, category, message, data);
    }

    error(category, message, data) {
        this.log(LogLevel.ERROR, category, message, data);
    }
}

// 创建全局日志实例
window.utils = window.utils || {};
window.utils.logger = new Logger();
window.utils.LogCategory = LogCategory; 