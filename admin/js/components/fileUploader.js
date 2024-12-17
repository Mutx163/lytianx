// 文件上传组件
class FileUploader {
    constructor(options = {}) {
        this.options = {
            element: null,
            url: '/upload',
            accept: '*/*',
            multiple: false,
            maxSize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
            autoUpload: true,
            ...options
        };

        this.files = new Map();
        this.uploadQueue = [];
        this.uploading = false;

        this.init();
    }

    // 初始化上传组件
    init() {
        if (!this.options.element) {
            throw new Error('必须指定上传组件容器元素');
        }

        // 创建上传区域
        this.createUploadArea();

        // 绑定事件
        this.bindEvents();
    }

    // 创建上传区域
    createUploadArea() {
        const { element, accept, multiple } = this.options;

        // 创建隐藏的文件输入框
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = accept;
        this.fileInput.multiple = multiple;
        this.fileInput.style.display = 'none';

        // 创建拖放区域
        this.dropZone = document.createElement('div');
        this.dropZone.className = 'upload-zone';
        this.dropZone.innerHTML = `
            <div class="upload-zone-content">
                <div class="upload-icon">📁</div>
                <div class="upload-text">
                    点击或拖放文件到此处上传
                    <div class="upload-hint text-sm text-gray-500">
                        支持的文件类型: ${accept}
                        ${this.options.maxSize ? `，单个文件最大 ${this.formatSize(this.options.maxSize)}` : ''}
                    </div>
                </div>
            </div>
        `;

        // 创建文件列表
        this.fileList = document.createElement('div');
        this.fileList.className = 'upload-list hidden';

        // 添加到容器
        element.appendChild(this.fileInput);
        element.appendChild(this.dropZone);
        element.appendChild(this.fileList);
    }

    // 绑定事件
    bindEvents() {
        // 点击上传区域时触发文件选择
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // 文件选择变化
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            // 清空选择，以便可以重复选择同一个文件
            this.fileInput.value = '';
        });

        // 拖放事件
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
    }

    // 处理文件
    handleFiles(fileList) {
        const files = Array.from(fileList);
        const validFiles = files.filter(file => this.validateFile(file));

        // 检查文件数量限制
        if (this.options.maxFiles && this.files.size + validFiles.length > this.options.maxFiles) {
            ui.toast.error(`最多只能上传 ${this.options.maxFiles} 个文件`);
            return;
        }

        // 添加文件到列表
        validFiles.forEach(file => {
            const fileId = this.generateFileId();
            this.files.set(fileId, {
                id: fileId,
                file,
                status: 'pending',
                progress: 0
            });

            // 添加到上传队列
            this.uploadQueue.push(fileId);

            // 显示文件
            this.renderFile(fileId);
        });

        // 显示文件列表
        if (this.files.size > 0) {
            this.fileList.classList.remove('hidden');
        }

        // 自动上传
        if (this.options.autoUpload) {
            this.startUpload();
        }
    }

    // 验证文件
    validateFile(file) {
        // 检查文件类型
        if (this.options.accept !== '*/*') {
            const acceptTypes = this.options.accept.split(',').map(type => type.trim());
            const fileType = file.type || `application/${file.name.split('.').pop()}`;
            if (!acceptTypes.some(type => {
                if (type.endsWith('/*')) {
                    return fileType.startsWith(type.replace('/*', '/'));
                }
                return type === fileType;
            })) {
                ui.toast.error(`不支持的文件类型: ${file.name}`);
                return false;
            }
        }

        // 检查文件大小
        if (this.options.maxSize && file.size > this.options.maxSize) {
            ui.toast.error(`文件过大: ${file.name}`);
            return false;
        }

        return true;
    }

    // 渲染文件
    renderFile(fileId) {
        const fileInfo = this.files.get(fileId);
        if (!fileInfo) return;

        const fileElement = document.createElement('div');
        fileElement.className = 'upload-item';
        fileElement.dataset.fileId = fileId;
        fileElement.innerHTML = `
            <div class="upload-item-info">
                <div class="upload-item-name">${fileInfo.file.name}</div>
                <div class="upload-item-size">${this.formatSize(fileInfo.file.size)}</div>
            </div>
            <div class="upload-item-status">
                <div class="upload-progress">
                    <div class="upload-progress-bar" style="width: ${fileInfo.progress}%"></div>
                </div>
                <div class="upload-actions">
                    <button class="upload-action-remove" title="删除">❌</button>
                </div>
            </div>
        `;

        // 绑定删除按钮事件
        fileElement.querySelector('.upload-action-remove').addEventListener('click', () => {
            this.removeFile(fileId);
        });

        this.fileList.appendChild(fileElement);
    }

    // 更新文件状态
    updateFileStatus(fileId, status, progress = 0) {
        const fileInfo = this.files.get(fileId);
        if (!fileInfo) return;

        fileInfo.status = status;
        fileInfo.progress = progress;

        const fileElement = this.fileList.querySelector(`[data-file-id="${fileId}"]`);
        if (!fileElement) return;

        // 更新进度条
        const progressBar = fileElement.querySelector('.upload-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // 更新状态样式
        fileElement.dataset.status = status;
    }

    // 开始上传
    async startUpload() {
        if (this.uploading || this.uploadQueue.length === 0) return;

        this.uploading = true;

        while (this.uploadQueue.length > 0) {
            const fileId = this.uploadQueue.shift();
            await this.uploadFile(fileId);
        }

        this.uploading = false;
    }

    // 上传单个文件
    async uploadFile(fileId) {
        const fileInfo = this.files.get(fileId);
        if (!fileInfo || fileInfo.status === 'uploaded') return;

        try {
            const formData = new FormData();
            formData.append('file', fileInfo.file);

            const response = await api.upload(this.options.url, formData, (progress) => {
                this.updateFileStatus(fileId, 'uploading', progress);
            });

            this.updateFileStatus(fileId, 'uploaded', 100);
            
            if (typeof this.options.onSuccess === 'function') {
                this.options.onSuccess(response, fileInfo);
            }
        } catch (error) {
            this.updateFileStatus(fileId, 'error');
            utils.logger.error('文件上传失败', error);
            
            if (typeof this.options.onError === 'function') {
                this.options.onError(error, fileInfo);
            }
        }
    }

    // 移除文件
    removeFile(fileId) {
        const fileInfo = this.files.get(fileId);
        if (!fileInfo) return;

        // 从队列中移除
        const queueIndex = this.uploadQueue.indexOf(fileId);
        if (queueIndex > -1) {
            this.uploadQueue.splice(queueIndex, 1);
        }

        // 从文件列表中移除
        this.files.delete(fileId);

        // 移除 DOM 元素
        const fileElement = this.fileList.querySelector(`[data-file-id="${fileId}"]`);
        if (fileElement) {
            fileElement.remove();
        }

        // 如果没有文件了，隐藏文件列表
        if (this.files.size === 0) {
            this.fileList.classList.add('hidden');
        }

        if (typeof this.options.onRemove === 'function') {
            this.options.onRemove(fileInfo);
        }
    }

    // 清空文件列表
    clear() {
        this.uploadQueue = [];
        this.files.clear();
        this.fileList.innerHTML = '';
        this.fileList.classList.add('hidden');
    }

    // 生成文件 ID
    generateFileId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 格式化文件大小
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 导出文件上传组件
window.FileUploader = FileUploader; 