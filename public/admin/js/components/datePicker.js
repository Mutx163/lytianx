// 日期选择器组件
class DatePicker {
    constructor(options = {}) {
        this.options = {
            element: null,
            format: 'YYYY-MM-DD',
            placeholder: '请选择日期',
            min: null,
            max: null,
            defaultValue: null,
            ...options
        };

        this.value = null;
        this.visible = false;
        this.currentDate = new Date();

        this.init();
    }

    // 初始化日期选择器
    init() {
        if (!this.options.element) {
            throw new Error('必须指定日期选择器容器元素');
        }

        // 创建日期选择器结构
        this.createDatePicker();

        // 设置默认值
        if (this.options.defaultValue) {
            this.setValue(this.options.defaultValue);
        }

        // 绑定事件
        this.bindEvents();
    }

    // 创建日期选择器结构
    createDatePicker() {
        const { element, placeholder } = this.options;

        // 创建输入框
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'form-input';
        this.input.placeholder = placeholder;
        this.input.readOnly = true;

        // 创建日期面板
        this.panel = document.createElement('div');
        this.panel.className = 'date-picker-panel hidden';
        this.panel.innerHTML = `
            <div class="date-picker-header">
                <button class="prev-year" title="上一年">«</button>
                <button class="prev-month" title="上个月">‹</button>
                <span class="current-date"></span>
                <button class="next-month" title="下个月">›</button>
                <button class="next-year" title="下一年">»</button>
            </div>
            <div class="date-picker-body">
                <div class="date-picker-weekdays">
                    ${['日', '一', '二', '三', '四', '五', '六']
                        .map(day => `<span>${day}</span>`).join('')}
                </div>
                <div class="date-picker-dates"></div>
            </div>
            <div class="date-picker-footer">
                <button class="today-btn">今天</button>
                <button class="clear-btn">清除</button>
            </div>
        `;

        // 添加到容器
        element.appendChild(this.input);
        element.appendChild(this.panel);

        // 更新日期面板
        this.updatePanel();
    }

    // 绑定事件
    bindEvents() {
        // 输入框点击事件
        this.input.addEventListener('click', () => {
            this.togglePanel();
        });

        // 上一年
        this.panel.querySelector('.prev-year').addEventListener('click', () => {
            this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
            this.updatePanel();
        });

        // 下一年
        this.panel.querySelector('.next-year').addEventListener('click', () => {
            this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
            this.updatePanel();
        });

        // 上个月
        this.panel.querySelector('.prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updatePanel();
        });

        // 下个月
        this.panel.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updatePanel();
        });

        // 今天按钮
        this.panel.querySelector('.today-btn').addEventListener('click', () => {
            this.setValue(new Date());
            this.hidePanel();
        });

        // 清除按钮
        this.panel.querySelector('.clear-btn').addEventListener('click', () => {
            this.setValue(null);
            this.hidePanel();
        });

        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (!this.options.element.contains(e.target)) {
                this.hidePanel();
            }
        });
    }

    // 更新日期面板
    updatePanel() {
        // 更新当前日期显示
        this.panel.querySelector('.current-date').textContent = 
            this.formatDate(this.currentDate, 'YYYY年MM月');

        // 获取当月的天数
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 获取当月第一天是星期几
        const firstDay = new Date(year, month, 1).getDay();

        // 生成日期格子
        const dates = [];
        
        // 上个月的日期
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            dates.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                type: 'prev-month'
            });
        }

        // 当月的日期
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push({
                date: new Date(year, month, i),
                type: 'current-month'
            });
        }

        // 下个月的日期
        const remainingDays = 42 - dates.length;
        for (let i = 1; i <= remainingDays; i++) {
            dates.push({
                date: new Date(year, month + 1, i),
                type: 'next-month'
            });
        }

        // 渲染日期
        const datesContainer = this.panel.querySelector('.date-picker-dates');
        datesContainer.innerHTML = dates.map(({ date, type }) => {
            const isSelected = this.value && this.isSameDay(date, this.value);
            const isToday = this.isSameDay(date, new Date());
            const isDisabled = this.isDateDisabled(date);

            return `
                <span class="date-cell ${type} ${isSelected ? 'selected' : ''} 
                    ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}"
                    data-date="${this.formatDate(date)}"
                    ${isDisabled ? 'disabled' : ''}>
                    ${date.getDate()}
                </span>
            `;
        }).join('');

        // 绑定日期点击事件
        datesContainer.querySelectorAll('.date-cell:not(.disabled)').forEach(cell => {
            cell.addEventListener('click', () => {
                const date = this.parseDate(cell.dataset.date);
                this.setValue(date);
                this.hidePanel();
            });
        });
    }

    // 显示面板
    showPanel() {
        if (this.visible) return;
        this.panel.classList.remove('hidden');
        this.visible = true;
        this.updatePanel();
    }

    // 隐藏面板
    hidePanel() {
        if (!this.visible) return;
        this.panel.classList.add('hidden');
        this.visible = false;
    }

    // 切换面板显示状态
    togglePanel() {
        if (this.visible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    // 设置值
    setValue(date) {
        this.value = date;
        this.input.value = date ? this.formatDate(date, this.options.format) : '';

        if (typeof this.options.onChange === 'function') {
            this.options.onChange(date);
        }
    }

    // 获取值
    getValue() {
        return this.value;
    }

    // 格式化日期
    formatDate(date, format = this.options.format) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return format
            .replace('YYYY', year)
            .replace('MM', month.toString().padStart(2, '0'))
            .replace('DD', day.toString().padStart(2, '0'))
            .replace('M', month)
            .replace('D', day);
    }

    // 解析日期字符串
    parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    // 判断是否是同一天
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // 判断日期是否禁用
    isDateDisabled(date) {
        const { min, max } = this.options;
        if (min && date < new Date(min)) return true;
        if (max && date > new Date(max)) return true;
        return false;
    }

    // 设置最小日期
    setMinDate(date) {
        this.options.min = date;
        this.updatePanel();
    }

    // 设置最大日期
    setMaxDate(date) {
        this.options.max = date;
        this.updatePanel();
    }

    // 销毁组件
    destroy() {
        this.options.element.innerHTML = '';
    }
}

// 导出日期选择器组件
window.DatePicker = DatePicker; 