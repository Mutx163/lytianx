/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {getFirestore} = require('firebase-admin/firestore');
const {initializeApp} = require("firebase-admin/app");

// 初始化 Firebase Admin
initializeApp();

// 创建 Firestore 实例
const db = getFirestore();

// API 函数
exports.api = {
    // 获取统计数据
    getStats: onRequest(async (req, res) => {
        try {
            const statsRef = db.collection("stats").doc("latest");
            const doc = await statsRef.get();
            res.json({ success: true, data: doc.data() });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
};

// 数据库触发器
exports.triggers = {
    // 更新统计数���
    updateStats: onDocumentCreated("posts/{postId}", async (event) => {
        const stats = await db.collection("stats").doc("latest").get();
        const currentStats = stats.data() || { totalPosts: 0 };
        
        await db.collection("stats").doc("latest").set({
            ...currentStats,
            totalPosts: currentStats.totalPosts + 1,
            lastUpdated: new Date(),
        });
    }),
};
