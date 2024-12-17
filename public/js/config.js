// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyBjxXAGZPXvI_mhDtPV7t5erXUHnUYPUxw",
    authDomain: "mutx-98098.firebaseapp.com",
    projectId: "mutx-98098",
    storageBucket: "mutx-98098.appspot.com",
    messagingSenderId: "1098099332574",
    appId: "1:1098099332574:web:e8e6f3b6e8f3b6e8f3b6e8"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 导出 Firebase 实例
const auth = firebase.auth();
const db = firebase.firestore();

// LeanCloud API 配置
const leanCloudConfig = {
    baseUrl: 'https://stg-mutx1636.avosapps.us/1.1',
    headers: {
        'X-LC-Id': 'AFlTg3fRukmZ8KqMl01Y78dD-MdYXbMMI',
        'X-LC-Key': 'N0muGm2nLMAEQQ27Mh37pVwO',
        'Content-Type': 'application/json'
    }
};

// API 请求工具
const api = {
    async request(endpoint, options = {}) {
        const token = await auth.currentUser?.getIdToken();
        const defaultOptions = {
            mode: 'cors',
            headers: {
                ...leanCloudConfig.headers,
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };

        try {
            const response = await fetch(`${leanCloudConfig.baseUrl}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || response.statusText);
            }

            return response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    // 获取数据
    async get(endpoint) {
        return this.request(endpoint, { 
            method: 'GET'
        });
    },

    // 创建数据
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 更新数据
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // 删除数据
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// 导出配置和工具
window.firebaseConfig = firebaseConfig;
window.leanCloudConfig = leanCloudConfig;
window.api = api; 