// UI 状态管理
const ui = {
    // 加载状态
    loading: {
        show() {
            document.getElementById('loading').classList.remove('hidden');
        },
        hide() {
            document.getElementById('loading').classList.add('hidden');
        }
    },

    // 提示框
    toast: {
        show(message, type = 'info') {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toast-icon');
            const messageEl = document.getElementById('toast-message');

            // 设置图标和样式
            const styles = {
                success: {
                    icon: '✅',
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-200'
                },
                error: {
                    icon: '❌',
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    border: 'border-red-200'
                },
                warning: {
                    icon: '⚠️',
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    border: 'border-yellow-200'
                },
                info: {
                    icon: 'ℹ️',
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    border: 'border-blue-200'
                }
            };

            const style = styles[type] || styles.info;

            // 设置图标
            icon.textContent = style.icon;

            // 设置消息
            messageEl.textContent = message;

            // 设置样式
            toast.className = `fixed top-4 right-4 z-50 rounded-lg shadow-lg border ${style.border} ${style.bg} p-4 transform transition-all duration-300 ease-in-out`;
            messageEl.className = `ml-2 ${style.text}`;

            // 显示提示框
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');

            // 3秒后自动隐藏
            setTimeout(() => {
                toast.classList.remove('translate-x-0', 'opacity-100');
                toast.classList.add('translate-x-full', 'opacity-0');
            }, 3000);
        },

        success(message) {
            this.show(message, 'success');
        },

        error(message) {
            this.show(message, 'error');
        },

        warning(message) {
            this.show(message, 'warning');
        },

        info(message) {
            this.show(message, 'info');
        }
    },

    // 模态框
    modal: {
        show(content, options = {}) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            // 设置内容
            if (typeof content === 'string') {
                modalContent.innerHTML = content;
            } else if (content instanceof Element) {
                modalContent.innerHTML = '';
                modalContent.appendChild(content);
            }

            // 显示模态框
            modal.classList.remove('hidden', 'opacity-0');
            modal.classList.add('opacity-100');
            modalContent.parentElement.classList.remove('scale-95');
            modalContent.parentElement.classList.add('scale-100');

            // 添加关闭事件
            const closeModal = () => {
                modal.classList.add('opacity-0');
                modalContent.parentElement.classList.remove('scale-100');
                modalContent.parentElement.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modalContent.innerHTML = '';
                }, 300);
            };

            // 点击遮罩层关闭
            if (options.closeOnClickOutside !== false) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal();
                    }
                });
            }

            // ESC 键关闭
            if (options.closeOnEsc !== false) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        closeModal();
                    }
                });
            }

            return {
                close: closeModal,
                element: modal
            };
        },

        confirm(message, options = {}) {
            return new Promise((resolve) => {
                const content = `
                    <div class="text-center">
                        <p class="text-lg mb-4">${message}</p>
                        <div class="flex justify-center space-x-4">
                            <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors" data-action="cancel">
                                ${options.cancelText || '取消'}
                            </button>
                            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" data-action="confirm">
                                ${options.confirmText || '确定'}
                            </button>
                        </div>
                    </div>
                `;

                const modal = this.show(content, { 
                    closeOnClickOutside: false,
                    closeOnEsc: false
                });

                // 绑定按钮事件
                modal.element.querySelector('[data-action="cancel"]').onclick = () => {
                    modal.close();
                    resolve(false);
                };

                modal.element.querySelector('[data-action="confirm"]').onclick = () => {
                    modal.close();
                    resolve(true);
                };
            });
        },

        prompt(message, defaultValue = '', options = {}) {
            return new Promise((resolve) => {
                const content = `
                    <div class="text-center">
                        <p class="text-lg mb-4">${message}</p>
                        <input type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" value="${defaultValue}">
                        <div class="flex justify-center space-x-4">
                            <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors" data-action="cancel">
                                ${options.cancelText || '取消'}
                            </button>
                            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" data-action="confirm">
                                ${options.confirmText || '确定'}
                            </button>
                        </div>
                    </div>
                `;

                const modal = this.show(content, { 
                    closeOnClickOutside: false,
                    closeOnEsc: false
                });

                const input = modal.element.querySelector('input');
                input.focus();

                // 绑定按钮事件
                modal.element.querySelector('[data-action="cancel"]').onclick = () => {
                    modal.close();
                    resolve(null);
                };

                modal.element.querySelector('[data-action="confirm"]').onclick = () => {
                    modal.close();
                    resolve(input.value);
                };

                // 回车确认
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        modal.close();
                        resolve(input.value);
                    }
                };
            });
        }
    }
};

// 通知处理
const notify = {
    initialized: false,

    async init() {
        if (this.initialized) return;

        try {
            // 检查通知 API 是否可用
            if (!('Notification' in window)) {
                console.warn('此浏览器不支持桌面通知');
                return;
            }

            // 如果已经授权，直接标记为初始化完成
            if (Notification.permission === 'granted') {
                this.initialized = true;
                return;
            }

            // 如果之前没有被拒绝，请求权限
            if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                this.initialized = permission === 'granted';
            }
        } catch (error) {
            console.warn('初始化通知失败:', error);
        }
    },

    async checkPermission() {
        await this.init();
        return this.initialized;
    },

    async show(title, options = {}) {
        try {
            const hasPermission = await this.checkPermission();
            if (!hasPermission) {
                // 如果没有通知权限，回退到 toast 提示
                ui.toast.info(title);
                return;
            }

            // 确保图标路径是绝对路径
            const defaultIcon = window.location.origin + '/favicon.ico';
            const notification = new Notification(title, {
                icon: defaultIcon,
                badge: defaultIcon,
                ...options,
                // 确保在 Windows 上正确显示
                requireInteraction: false,
                silent: false
            });

            // 处理通知点击
            notification.onclick = () => {
                window.focus();
                notification.close();
                if (options.onClick) {
                    options.onClick();
                }
            };

            // 自动关闭通知
            setTimeout(() => {
                notification.close();
            }, options.duration || 5000);
        } catch (error) {
            console.warn('显示通知失败，回退到 toast:', error);
            ui.toast.info(title);
        }
    }
};

// 初始化通知
notify.init().catch(console.warn);

// 导出通知处理
window.notify = notify;

// 导出 UI 工具
window.ui = ui; 