const { getPerformance } = require('firebase-admin/performance');
const { getAnalytics } = require('firebase-admin/analytics');
const { logger } = require('firebase-functions');

// 初始化监控服务
const performance = getPerformance();
const analytics = getAnalytics();

// 性能监控
const performanceMonitoring = {
    // 监控页面加载
    trackPageLoad(pageName) {
        performance.startTrace(`page_load_${pageName}`);
    },

    // 监控 API 响应
    trackApiResponse(endpoint, duration) {
        performance.startTrace(`api_response_${endpoint}`)
            .putMetric('duration', duration);
    },

    // 监控资源使用
    trackResourceUsage(resourceType, usage) {
        performance.startTrace(`resource_${resourceType}`)
            .putMetric('usage', usage);
    },

    // 监控错误率
    trackError(errorType, message) {
        logger.error(`[${errorType}] ${message}`);
        analytics.logEvent('error', {
            error_type: errorType,
            message: message
        });
    }
};

// 用量监控
const usageMonitoring = {
    // 监控数据库操作
    trackDatabaseOperation(operation, collection) {
        analytics.logEvent('database_operation', {
            operation,
            collection,
            timestamp: Date.now()
        });
    },

    // 监控存储空间
    trackStorageUsage(bytes) {
        analytics.logEvent('storage_usage', {
            bytes,
            timestamp: Date.now()
        });
    },

    // 监控带宽使用
    trackBandwidthUsage(bytes) {
        analytics.logEvent('bandwidth_usage', {
            bytes,
            timestamp: Date.now()
        });
    },

    // 监控并发用户
    trackConcurrentUsers(count) {
        analytics.logEvent('concurrent_users', {
            count,
            timestamp: Date.now()
        });
    }
};

// 成本监控
const costMonitoring = {
    // 监控资源成本
    trackResourceCost(resourceType, cost) {
        analytics.logEvent('resource_cost', {
            resource_type: resourceType,
            cost,
            timestamp: Date.now()
        });
    },

    // 监控流量成本
    trackTrafficCost(cost) {
        analytics.logEvent('traffic_cost', {
            cost,
            timestamp: Date.now()
        });
    },

    // 监控存储成本
    trackStorageCost(cost) {
        analytics.logEvent('storage_cost', {
            cost,
            timestamp: Date.now()
        });
    },

    // 监控总开支
    trackTotalCost(cost) {
        analytics.logEvent('total_cost', {
            cost,
            timestamp: Date.now()
        });
    }
};

// 告警配置
const alertConfig = {
    // 性能告警阈值
    performance: {
        pageLoadTime: 3000, // 3秒
        apiResponseTime: 1000, // 1秒
        errorRate: 0.01 // 1%
    },

    // 用量告警阈值
    usage: {
        maxDatabaseOperations: 100000, // 每天
        maxStorageUsage: 5 * 1024 * 1024 * 1024, // 5GB
        maxBandwidth: 100 * 1024 * 1024 * 1024, // 100GB
        maxConcurrentUsers: 1000
    },

    // 成本告警阈值
    cost: {
        maxDailyCost: 100, // 美元
        maxMonthlyCost: 2000 // 美元
    }
};

// 告警处理
const alertHandlers = {
    // 发送性能告警
    async sendPerformanceAlert(metric, value, threshold) {
        logger.warn(`Performance Alert: ${metric} (${value}) exceeded threshold (${threshold})`);
        // 这里可以添加发送邮件或其他通知的逻辑
    },

    // 发送用量告警
    async sendUsageAlert(metric, value, threshold) {
        logger.warn(`Usage Alert: ${metric} (${value}) exceeded threshold (${threshold})`);
        // 这里可以添加发送邮件或其他通知的逻辑
    },

    // 发送成本告警
    async sendCostAlert(metric, value, threshold) {
        logger.warn(`Cost Alert: ${metric} (${value}) exceeded threshold (${threshold})`);
        // 这里可以添加发送邮件或其他通知的逻辑
    }
};

// 导出监控服务
module.exports = {
    performance: performanceMonitoring,
    usage: usageMonitoring,
    cost: costMonitoring,
    alerts: {
        config: alertConfig,
        handlers: alertHandlers
    }
}; 