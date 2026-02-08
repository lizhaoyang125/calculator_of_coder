/**
 * Input - 输入处理模块
 * 处理按钮点击、键盘输入和显示区交互
 */
import { KEYBOARD_SHORTCUTS, OPERATORS, BASE } from '../utils/constants.js';

export class Input {
  constructor(calculator) {
    this.calculator = calculator;
    this.setupEventListeners();
  }

  /**
   * 设置所有事件监听器
   */
  setupEventListeners() {
    // 按钮点击事件（使用事件委托）
    this.setupButtonEvents();

    // 键盘事件
    this.setupKeyboardEvents();

    // 进制选择器事件
    this.setupBaseSelectorEvents();
  }

  /**
   * 设置按钮点击事件
   */
  setupButtonEvents() {
    const buttonGrid = document.getElementById('button-grid');

    if (buttonGrid) {
      buttonGrid.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;

        // 数字按钮
        if (button.dataset.num !== undefined) {
          this.handleNumberClick(button.dataset.num);
        }
        // 运算符按钮
        else if (button.dataset.op !== undefined) {
          this.handleOperatorClick(button.dataset.op);
        }
        // 功能按钮
        else if (button.dataset.action !== undefined) {
          this.handleActionClick(button.dataset.action);
        }

        // 添加按钮按下效果
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 100);
      });
    }
  }

  /**
   * 处理数字按钮点击
   * @param {string} digit - 数字或字母
   */
  handleNumberClick(digit) {
    this.calculator.inputDigit(digit);
  }

  /**
   * 处理运算符按钮点击
   * @param {string} operator - 运算符
   */
  handleOperatorClick(operator) {
    this.calculator.performOperation(operator);
  }

  /**
   * 处理功能按钮点击
   * @param {string} action - 功能名称
   */
  handleActionClick(action) {
    switch (action) {
      case 'clear':
        this.calculator.clear();
        break;
      case 'delete':
        this.calculator.deleteLast();
        break;
      case 'equals':
        this.calculator.calculate();
        break;
    }
  }

  /**
   * 设置键盘事件
   */
  setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // 防止在输入框中触发快捷键
      if (e.target.tagName === 'SELECT') {
        return;
      }

      const key = e.key;

      // 检查是否是快捷键
      if (KEYBOARD_SHORTCUTS[key]) {
        e.preventDefault();

        const action = KEYBOARD_SHORTCUTS[key];

        // 进制切换快捷键
        if (action === 'switch-hex') {
          this.calculator.switchBase(BASE.HEXADECIMAL);
        } else if (action === 'switch-dec') {
          this.calculator.switchBase(BASE.DECIMAL);
        } else if (action === 'switch-bin') {
          this.calculator.switchBase(BASE.BINARY);
        }
        // 功能快捷键
        else if (action === 'clear') {
          this.calculator.clear();
        } else if (action === 'delete') {
          this.calculator.deleteLast();
        } else if (action === 'equals') {
          this.calculator.calculate();
        }
        // 运算符快捷键
        else if (action === 'and') {
          this.calculator.performOperation(OPERATORS.AND);
        } else if (action === 'or') {
          this.calculator.performOperation(OPERATORS.OR);
        } else if (action === 'xor') {
          this.calculator.performOperation(OPERATORS.XOR);
        } else if (action === 'not') {
          this.calculator.performOperation(OPERATORS.NOT);
        }
        // 数字和基本运算符
        else if (/^[0-9A-F]$/.test(action)) {
          this.calculator.inputDigit(action);
        } else if (['+', '-', '*', '/', '%'].includes(action)) {
          this.calculator.performOperation(action);
        }
      }
      // 处理左移右移
      else if (e.shiftKey && key === '<') {
        e.preventDefault();
        this.calculator.performOperation(OPERATORS.LEFT_SHIFT);
      } else if (e.shiftKey && key === '>') {
        e.preventDefault();
        this.calculator.performOperation(OPERATORS.RIGHT_SHIFT);
      }
    });
  }

  /**
   * 设置进制选择器事件
   */
  setupBaseSelectorEvents() {
    const baseSelector = document.getElementById('base-selector');
    if (baseSelector) {
      baseSelector.addEventListener('change', (e) => {
        const base = parseInt(e.target.value);
        this.calculator.switchBase(base);
      });
    }
  }
}
