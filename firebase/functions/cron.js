const functions = require('firebase-functions');
const { backup } = require('../../scripts/backup');
const monitoring = require('../monitoring');

// 每天凌晨3点执行备份
exports.dailyBackup = functions.pubsub.schedule('0 3 * * *')
    .timeZone('Asia/Shanghai')
    .onRun(async (context) => {
        try {
            await backup();
            console.log('每日备份完成');
        } catch (error) {
            console.error('每日备份失败:', error);
            throw error;
        }
    });

// 每小时监控系统状态
exports.hourlyMonitoring = functions.pubsub.schedule('0 * * * *')
    .timeZone('Asia/Shanghai')
    .onRun(async (context) => {
        try {
            // 检查性能指标
            await checkPerformance();
            
            // 检查资源用量
            await checkUsage();
            
            // 检查成本
            await checkCost();
            
            console.log('系统监控完成');
        } catch (error) {
            console.error('系统监控失败:', error);
            throw error;
        }
    });

// 检查性能指标
async function checkPerformance() {
    const metrics = await monitoring.performance.getMetrics();
    
    // 检查页面加载时间
    if (metrics.pageLoadTime > monitoring.alerts.config.performance.pageLoadTime) {
        await monitoring.alerts.handlers.sendPerformanceAlert(
            'pageLoadTime',
            metrics.pageLoadTime,
            monitoring.alerts.config.performance.pageLoadTime
        );
    }
    
    // 检查 API 响应时间
    if (metrics.apiResponseTime > monitoring.alerts.config.performance.apiResponseTime) {
        await monitoring.alerts.handlers.sendPerformanceAlert(
            'apiResponseTime',
            metrics.apiResponseTime,
            monitoring.alerts.config.performance.apiResponseTime
        );
    }
    
    // 检查错误率
    if (metrics.errorRate > monitoring.alerts.config.performance.errorRate) {
        await monitoring.alerts.handlers.sendPerformanceAlert(
            'errorRate',
            metrics.errorRate,
            monitoring.alerts.config.performance.errorRate
        );
    }
}

// 检查资源用量
async function checkUsage() {
    const usage = await monitoring.usage.getMetrics();
    
    // 检查数据库操作次数
    if (usage.databaseOperations > monitoring.alerts.config.usage.maxDatabaseOperations) {
        await monitoring.alerts.handlers.sendUsageAlert(
            'databaseOperations',
            usage.databaseOperations,
            monitoring.alerts.config.usage.maxDatabaseOperations
        );
    }
    
    // 检查存储空间使用
    if (usage.storageUsage > monitoring.alerts.config.usage.maxStorageUsage) {
        await monitoring.alerts.handlers.sendUsageAlert(
            'storageUsage',
            usage.storageUsage,
            monitoring.alerts.config.usage.maxStorageUsage
        );
    }
    
    // 检查带宽使用
    if (usage.bandwidth > monitoring.alerts.config.usage.maxBandwidth) {
        await monitoring.alerts.handlers.sendUsageAlert(
            'bandwidth',
            usage.bandwidth,
            monitoring.alerts.config.usage.maxBandwidth
        );
    }
    
    // 检查并发用户数
    if (usage.concurrentUsers > monitoring.alerts.config.usage.maxConcurrentUsers) {
        await monitoring.alerts.handlers.sendUsageAlert(
            'concurrentUsers',
            usage.concurrentUsers,
            monitoring.alerts.config.usage.maxConcurrentUsers
        );
    }
}

// 检查成本
async function checkCost() {
    const costs = await monitoring.cost.getMetrics();
    
    // 检查每日成本
    if (costs.dailyCost > monitoring.alerts.config.cost.maxDailyCost) {
        await monitoring.alerts.handlers.sendCostAlert(
            'dailyCost',
            costs.dailyCost,
            monitoring.alerts.config.cost.maxDailyCost
        );
    }
    
    // 检查每月成本
    if (costs.monthlyCost > monitoring.alerts.config.cost.maxMonthlyCost) {
        await monitoring.alerts.handlers.sendCostAlert(
            'monthlyCost',
            costs.monthlyCost,
            monitoring.alerts.config.cost.maxMonthlyCost
        );
    }
} 