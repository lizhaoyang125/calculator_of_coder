/**
 * History - 历史记录模块
 * 管理计算历史记录，支持本地存储
 */
import { CONFIG } from '../utils/constants.js';
import { NumberSystem } from './NumberSystem.js';
import { TypeHandler } from './TypeHandler.js';

export class History {
  constructor() {
    this.records = [];
    this.maxRecords = CONFIG.MAX_HISTORY;
    this.isExpanded = true;

    // 新增：历史显示进制
    this.displayBase = 10; // 默认十进制
    this.numberSystem = new NumberSystem();
    this.typeHandler = new TypeHandler();

    // 从localStorage加载历史记录
    this.loadFromStorage();
    this.loadDisplayBase();

    // 初始化UI
    this.init();
  }

  /**
   * 初始化历史记录UI
   */
  init() {
    // 渲染历史记录
    this.render();

    // 设置切换按钮
    const toggleButton = document.getElementById('history-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        this.toggle();
      });
    }

    // 设置清空按钮
    const clearButton = document.getElementById('history-clear');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clear();
      });
    }

    // 新增：设置进制选择器
    const baseSelector = document.getElementById('history-base-selector');
    if (baseSelector) {
      baseSelector.value = this.displayBase.toString();
      baseSelector.addEventListener('change', (e) => {
        this.switchDisplayBase(parseInt(e.target.value));
      });
    }
  }

  /**
   * 添加历史记录
   * @param {string} expression - 表达式
   * @param {string} result - 结果
   * @param {string} type - 类型
   */
  add(expression, result, type) {
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      expression: expression,
      result: result,
      type: type,
      date: new Date().toLocaleString()
    };

    // 添加到记录数组的开头
    this.records.unshift(record);

    // 限制记录数量
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(0, this.maxRecords);
    }

    // 保存到localStorage
    this.saveToStorage();

    // 更新显示
    this.render();
  }

  /**
   * 清空历史记录
   */
  clear() {
    if (this.records.length === 0) return;

    // 确认清空
    if (confirm('Clear all history?')) {
      this.records = [];
      this.saveToStorage();
      this.render();
    }
  }

  /**
   * 删除指定的历史记录
   * @param {number} id - 记录ID
   */
  remove(id) {
    this.records = this.records.filter(record => record.id !== id);
    this.saveToStorage();
    this.render();
  }

  /**
   * 切换历史记录显示/隐藏
   */
  toggle() {
    this.isExpanded = !this.isExpanded;

    const historyList = document.getElementById('history-list');
    const toggleIcon = document.querySelector('#history-toggle .icon');

    if (historyList) {
      if (this.isExpanded) {
        historyList.style.display = 'block';
        if (toggleIcon) toggleIcon.textContent = '▼';
      } else {
        historyList.style.display = 'none';
        if (toggleIcon) toggleIcon.textContent = '▶';
      }
    }
  }

  /**
   * 渲染历史记录列表
   */
  render() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    // 清空当前列表
    historyList.innerHTML = '';

    // 如果没有记录
    if (this.records.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No history yet</div>';
      return;
    }

    // 渲染每条记录
    this.records.forEach(record => {
      const item = this.createHistoryItem(record);
      historyList.appendChild(item);
    });
  }

  /**
   * 创建历史记录项元素
   * @param {object} record - 记录对象
   * @returns {HTMLElement} 历史记录项元素
   */
  createHistoryItem(record) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.dataset.id = record.id;

    const expression = document.createElement('div');
    expression.className = 'history-expression';
    expression.textContent = record.expression;

    const result = document.createElement('div');
    result.className = 'history-result';
    const formattedResult = this.formatValueInBase(record.result, record.type);
    result.textContent = `= ${formattedResult}`;

    const meta = document.createElement('div');
    meta.className = 'history-meta';
    meta.innerHTML = `
      <span class="history-type">${record.type}</span>
      <span class="history-time">${this.formatTime(record.timestamp)}</span>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Delete this record';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.remove(record.id);
    });

    item.appendChild(expression);
    item.appendChild(result);
    item.appendChild(meta);
    item.appendChild(deleteBtn);

    item.addEventListener('click', () => {
      this.copyToClipboard(formattedResult);
      this.showCopyFeedback(item);
    });

    return item;
  }

  switchDisplayBase(base) {
    this.displayBase = base;
    this.saveDisplayBase();
    this.render();
  }

  saveDisplayBase() {
    try {
      localStorage.setItem('calc-history-base', this.displayBase.toString());
    } catch (error) {
      console.error('Failed to save history display base:', error);
    }
  }

  loadDisplayBase() {
    try {
      const stored = localStorage.getItem('calc-history-base');
      if (stored) {
        this.displayBase = parseInt(stored);
      }
    } catch (error) {
      console.error('Failed to load history display base:', error);
    }
  }

  formatValueInBase(decimalStr, type) {
    const typeInfo = this.typeHandler.getTypeInfo(type);

    try {
      const value = BigInt(decimalStr);

      if (this.displayBase === 16) {
        return this.numberSystem.decToHex(value, typeInfo.bits);
      } else if (this.displayBase === 2) {
        const binStr = this.numberSystem.decToBin(value, typeInfo.bits);
        return this.numberSystem.formatBinary(binStr);
      } else {
        return decimalStr;
      }
    } catch (error) {
      return decimalStr;
    }
  }

  /**
   * 格式化时间戳
   * @param {string} isoString - ISO时间字符串
   * @returns {string} 格式化后的时间
   */
  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   */
  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
      });
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  /**
   * 显示复制反馈
   * @param {HTMLElement} element - 要显示反馈的元素
   */
  showCopyFeedback(element) {
    const originalText = element.querySelector('.history-result').textContent;
    const resultElement = element.querySelector('.history-result');

    resultElement.textContent = '✓ Copied!';
    resultElement.style.color = '#4ec9b0';

    setTimeout(() => {
      resultElement.textContent = originalText;
      resultElement.style.color = '';
    }, 1000);
  }

  /**
   * 从localStorage加载历史记录
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_HISTORY);
      if (stored) {
        this.records = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load history from storage:', error);
      this.records = [];
    }
  }

  /**
   * 保存历史记录到localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY_HISTORY,
        JSON.stringify(this.records)
      );
    } catch (error) {
      console.error('Failed to save history to storage:', error);
    }
  }

  /**
   * 导出历史记录为JSON
   * @returns {string} JSON字符串
   */
  exportToJSON() {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * 从JSON导入历史记录
   * @param {string} jsonString - JSON字符串
   */
  importFromJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        this.records = imported;
        this.saveToStorage();
        this.render();
      }
    } catch (error) {
      console.error('Failed to import history:', error);
    }
  }

  /**
   * 获取历史记录数量
   * @returns {number} 记录数量
   */
  getCount() {
    return this.records.length;
  }

  /**
   * 获取所有历史记录
   * @returns {Array} 历史记录数组
   */
  getAll() {
    return [...this.records];
  }
}
