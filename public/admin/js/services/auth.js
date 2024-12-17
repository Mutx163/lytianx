import { initializeApp } from 'firebase/app';
import { 
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';

// Firebase 配置
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 认证服务
const authService = {
    // 登录
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();
            
            // 存储认证信息
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                id: user.uid,
                email: user.email,
                role: user.customClaims?.role || 'user'
            }));
            
            return {
                success: true,
                data: {
                    token,
                    user: {
                        id: user.uid,
                        email: user.email,
                        role: user.customClaims?.role || 'user'
                    }
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: '登录失败: ' + error.message
            };
        }
    },

    // 登出
    async logout() {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: '登出失败: ' + error.message
            };
        }
    },

    // 获取当前用户
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // 检查是否已登录
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // 监听认证状态变化
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({
                    id: user.uid,
                    email: user.email,
                    role: user.customClaims?.role || 'user'
                }));
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            callback(user);
        });
    }
};

export default authService; 