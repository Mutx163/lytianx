// 编辑器组件依赖检查
const REQUIRED_DEPENDENCIES = {
    'toastui': 'Toast UI Editor 核心库',
    'toastui.Editor': 'Toast UI Editor 编辑器组件'
};

// 检查单个依赖
const checkDependency = (name, description) => {
    const parts = name.split('.');
    let obj = window;
    
    for (const part of parts) {
        obj = obj[part];
        if (!obj) {
            throw new Error(`缺少依赖: ${description} (${name})`);
        }
    }
    return true;
};

// 编辑器组件
class Editor {
    constructor(options = {}) {
        this.options = {
            element: null,
            height: '400px',
            placeholder: '请输入内容...',
            toolbarItems: [
                ['heading', 'bold', 'italic', 'strike'],
                ['hr', 'quote'],
                ['ul', 'ol', 'task', 'indent', 'outdent'],
                ['table', 'image', 'link'],
                ['code', 'codeblock']
            ],
            ...options
        };

        this.editor = null;
        this.initPromise = this.init();
    }

    // 检查依赖是否加载
    checkDependencies() {
        return new Promise((resolve, reject) => {
            let checkCount = 0;
            const maxChecks = 50; // 最多等待5秒
            
            const check = () => {
                try {
                    // 检查所有必需的依赖
                    for (const [name, description] of Object.entries(REQUIRED_DEPENDENCIES)) {
                        checkDependency(name, description);
                    }
                    resolve(true);
                } catch (error) {
                    if (checkCount >= maxChecks) {
                        utils.logger.error('EDITOR', '依赖加载失败', error);
                        reject(error);
                    } else {
                        checkCount++;
                        setTimeout(check, 100);
                    }
                }
            };
            
            check();
        });
    }

    // 初始化编辑器
    async init() {
        try {
            if (!this.options.element) {
                throw new Error('必须指定编辑器容器元素');
            }

            // 等待依赖加载
            await this.checkDependencies();
            
            utils.logger.debug('EDITOR', '开始初始化编辑器');

            // 创建编辑器实例
            this.editor = new toastui.Editor({
                el: this.options.element,
                height: this.options.height,
                initialEditType: 'markdown',
                previewStyle: 'tab',
                placeholder: this.options.placeholder,
                toolbarItems: this.options.toolbarItems,
                hooks: {
                    addImageBlobHook: this.handleImageUpload.bind(this)
                },
                customHTMLRenderer: {
                    // 自定义渲染器配置
                    image(node) {
                        return {
                            type: 'openTag',
                            tagName: 'img',
                            attributes: {
                                src: node.attrs.src,
                                alt: node.attrs.alt,
                                class: 'editor-image'
                            },
                            selfClose: true
                        };
                    }
                }
            });

            // 绑定事件
            this.editor.on('change', () => {
                if (typeof this.options.onChange === 'function') {
                    this.options.onChange(this.getValue());
                }
            });

            utils.logger.info('EDITOR', '编辑器初始化成功');
            return this.editor;
        } catch (error) {
            utils.logger.error('EDITOR', '编辑器初始化失败', error);
            throw error;
        }
    }

    // 获取编辑器内容
    async getValue() {
        await this.initPromise;
        return {
            markdown: this.editor.getMarkdown(),
            html: this.editor.getHTML()
        };
    }

    // 设置编辑器内容
    async setValue(content) {
        await this.initPromise;
        this.editor.setMarkdown(content || '');
    }

    // 处理图片上传
    async handleImageUpload(blob, callback) {
        try {
            ui.loading.show();
            
            // 创建 FormData
            const formData = new FormData();
            formData.append('image', blob);

            // 上传图片
            const response = await api.upload('/upload/image', formData);
            
            // 返回图片 URL
            callback(response.url);
        } catch (error) {
            utils.logger.error('EDITOR', '图片上传失败', error);
            ui.toast.error('图片上传失败');
        } finally {
            ui.loading.hide();
        }
    }

    // 插入内容
    async insert(content) {
        await this.initPromise;
        this.editor.insertText(content);
    }

    // 获取选中的文本
    async getSelectedText() {
        await this.initPromise;
        return this.editor.getSelectedText();
    }

    // 替换选中的文本
    async replaceSelection(content) {
        await this.initPromise;
        const range = this.editor.getSelection();
        this.editor.replaceSelection(content, range);
    }

    // 聚焦编辑器
    async focus() {
        await this.initPromise;
        this.editor.focus();
    }

    // 失焦编辑器
    async blur() {
        await this.initPromise;
        this.editor.blur();
    }

    // 清空编辑器
    async clear() {
        await this.initPromise;
        this.editor.reset();
    }

    // 禁用编辑器
    async disable() {
        await this.initPromise;
        this.editor.disable();
    }

    // 启用编辑器
    async enable() {
        await this.initPromise;
        this.editor.enable();
    }

    // 销毁编辑器
    async destroy() {
        try {
            await this.initPromise;
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }
        } catch (error) {
            utils.logger.warn('EDITOR', '销毁编辑器时发生错误', error);
        }
    }

    // 添加工具栏按钮
    addToolbarButton(options) {
        const { name, tooltip, command } = options;

        this.editor.addCommand('markdown', command);
        this.editor.addCommand('wysiwyg', command);

        this.editor.insertToolbarItem({ groupIndex: 0, itemIndex: 0 }, {
            name,
            tooltip,
            command: name
        });
    }

    // 移除工具栏按钮
    removeToolbarButton(name) {
        this.editor.removeToolbarItem(name);
    }

    // 获取字数统计
    getWordCount() {
        const text = this.editor.getMarkdown();
        return {
            characters: text.length,
            words: text.trim().split(/\s+/).length,
            lines: text.split('\n').length
        };
    }

    // 设置主题
    setTheme(theme) {
        this.editor.setTheme(theme);
    }

    // 切换预览模式
    togglePreview() {
        const mode = this.editor.getCurrentPreviewStyle();
        this.editor.changePreviewStyle(mode === 'vertical' ? 'tab' : 'vertical');
    }

    // 切换全屏模式
    toggleFullscreen() {
        const element = this.editor.getEditorElement();
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    }
}

// 创建全局编辑器实例
window.utils = window.utils || {};
window.utils.Editor = Editor; 