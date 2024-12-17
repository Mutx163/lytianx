import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './firebase';

// 初始化 Firestore
const db = getFirestore(app);
const storage = getStorage(app);

// API 服务
const api = {
    // 通用 CRUD 操作
    async get(collectionName, id) {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        } catch (error) {
            console.error(`Error getting ${collectionName}:`, error);
            throw error;
        }
    },

    async list(collectionName, options = {}) {
        try {
            const { where: filters = [], orderBy: sorts = [] } = options;
            let q = collection(db, collectionName);

            // 添加过滤条件
            filters.forEach(([field, operator, value]) => {
                q = query(q, where(field, operator, value));
            });

            // 添加排序
            sorts.forEach(([field, direction]) => {
                q = query(q, orderBy(field, direction));
            });

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`Error listing ${collectionName}:`, error);
            throw error;
        }
    },

    async create(collectionName, data) {
        try {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error(`Error creating ${collectionName}:`, error);
            throw error;
        }
    },

    async update(collectionName, id, data) {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: new Date()
            });
            return { id, ...data };
        } catch (error) {
            console.error(`Error updating ${collectionName}:`, error);
            throw error;
        }
    },

    async delete(collectionName, id) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            return true;
        } catch (error) {
            console.error(`Error deleting ${collectionName}:`, error);
            throw error;
        }
    },

    // 文件上传
    async uploadFile(path, file) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            return { path, url };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // 文件删除
    async deleteFile(path) {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};

export default api; 