/**
 * Calculator - 核心控制器
 * 统筹所有模块，管理计算器状态和逻辑
 */
import { NumberSystem } from './NumberSystem.js';
import { TypeHandler } from './TypeHandler.js';
import { BitOperations } from './BitOperations.js';
import { Display } from './Display.js';
import { Input } from './Input.js';
import { History } from './History.js';
import { CONFIG, BASE, OPERATORS, ERROR_MESSAGES } from '../utils/constants.js';

export class Calculator {
  constructor() {
    // 状态管理
    this.state = {
      currentValue: 0n,          // 当前显示的值
      previousValue: 0n,         // 上一个操作数
      operation: null,           // 当前运算符
      currentType: CONFIG.DEFAULT_TYPE,  // 当前整数类型
      activeBase: CONFIG.DEFAULT_BASE,   // 当前激活的进制
      isNewNumber: true,         // 是否是新输入的数字
      waitingForOperand: false,  // 是否在等待操作数
      expression: '',            // 当前表达式字符串

      // 新增：表达式显示状态
      expressionDisplay: {
        value1: 0n,        // 第一个操作数
        operator: null,      // 运算符
        value2: null,        // 第二个操作数
        result: null,        // 结果
        editingRow: 'value1' // 当前编辑的行
      }
    };

    // 初始化依赖模块
    this.numberSystem = new NumberSystem();
    this.typeHandler = new TypeHandler();
    this.bitOps = new BitOperations();
    this.display = new Display();
    this.input = new Input(this);
    this.history = new History();

    // 初始化
    this.init();
  }

  /**
   * 初始化计算器
   */
  init() {
    // 从localStorage恢复上次的类型设置
    const lastType = localStorage.getItem(CONFIG.STORAGE_KEY_LAST_TYPE);
    if (lastType && this.typeHandler.types[lastType]) {
      this.state.currentType = lastType;
      document.getElementById('type-selector').value = lastType;
    }

    // 初始化base selector
    const baseSelector = document.getElementById('base-selector');
    if (baseSelector) {
      baseSelector.value = this.state.activeBase.toString();
    }

    // 更新显示
    this.updateDisplay();

    // 设置类型选择器事件
    document.getElementById('type-selector').addEventListener('change', (e) => {
      this.switchType(e.target.value);
    });

    // 初始化按钮状态
    this.display.updateButtonStates(this.state.activeBase);
  }

  /**
   * 处理数字输入
   * @param {string} digit - 输入的数字或字母
   */
  inputDigit(digit) {
    const { activeBase, isNewNumber, currentValue } = this.state;
    const { editingRow } = this.state.expressionDisplay;

    // 验证输入是否有效
    if (!this.isValidDigit(digit, activeBase)) {
      this.display.showError(ERROR_MESSAGES.INVALID_INPUT);
      return;
    }

    // 获取当前显示的字符串
    let currentStr = this.display.getValue(editingRow, activeBase);

    // 清理格式化字符
    if (activeBase === 16) {
      currentStr = currentStr.replace(/^0x/i, '');
    } else if (activeBase === 2) {
      currentStr = currentStr.replace(/\s+/g, '');
    }

    // 如果是新数字或者当前值为0，替换当前值
    if (isNewNumber || currentValue === 0n) {
      currentStr = digit;
      this.state.isNewNumber = false;
    } else {
      currentStr += digit;
    }

    // 转换为十进制
    try {
      const typeInfo = this.typeHandler.getTypeInfo(this.state.currentType);
      const decimalValue = this.numberSystem.toDecimal(
        currentStr,
        activeBase,
        typeInfo.signed,
        typeInfo.bits
      );

      // 检查溢出
      const result = this.typeHandler.checkOverflow(decimalValue, this.state.currentType);

      if (result.overflow) {
        this.display.showOverflowWarning();
      } else {
        this.display.clearOverflowWarning();
      }

      this.state.currentValue = result.value;

      // 更新表达式显示状态
      if (this.state.expressionDisplay.editingRow === 'value1') {
        this.state.expressionDisplay.value1 = this.state.currentValue;
      } else if (this.state.expressionDisplay.editingRow === 'value2') {
        this.state.expressionDisplay.value2 = this.state.currentValue;
      }

      this.updateDisplay();
    } catch (error) {
      this.display.showError(ERROR_MESSAGES.INVALID_INPUT);
    }
  }

  /**
   * 验证数字是否在当前进制下有效
   * @param {string} digit - 数字字符
   * @param {number} base - 进制
   * @returns {boolean} 是否有效
   */
  isValidDigit(digit, base) {
    const digitUpper = digit.toUpperCase();

    if (base === 2) {
      return digitUpper === '0' || digitUpper === '1';
    } else if (base === 10) {
      return /^[0-9]$/.test(digitUpper);
    } else if (base === 16) {
      return /^[0-9A-F]$/.test(digitUpper);
    }

    return false;
  }

  /**
   * 处理运算符输入
   * @param {string} operator - 运算符
   */
  performOperation(operator) {
    const { currentValue, previousValue, operation } = this.state;

    // 如果有待处理的运算，先计算
    if (operation && !this.state.isNewNumber) {
      this.calculate();
    }

    // 保存当前值和运算符
    this.state.previousValue = this.state.currentValue;
    this.state.operation = operator;
    this.state.isNewNumber = true;
    this.state.expression = `${currentValue.toString()} ${operator}`;

    // 新增：更新表达式显示状态
    this.state.expressionDisplay.value1 = this.state.previousValue;
    this.state.expressionDisplay.operator = operator;
    this.state.expressionDisplay.editingRow = operator === OPERATORS.NOT ? 'result' : 'value2';
    this.state.expressionDisplay.value2 = null;
    this.state.expressionDisplay.result = null;

    // NOT是一元运算符，立即计算
    if (operator === OPERATORS.NOT) {
      this.calculate();
    } else {
      this.updateDisplay();
    }
  }

  /**
   * 计算结果
   */
  calculate() {
    const { currentValue, previousValue, operation, currentType } = this.state;

    if (!operation) {
      return;
    }

    const typeInfo = this.typeHandler.getTypeInfo(currentType);
    let result = 0n;
    let expressionStr = '';

    try {
      // 根据运算符执行相应的运算
      switch (operation) {
        // 算术运算
        case OPERATORS.ADD:
          result = previousValue + currentValue;
          expressionStr = `${previousValue} + ${currentValue}`;
          break;

        case OPERATORS.SUBTRACT:
          result = previousValue - currentValue;
          expressionStr = `${previousValue} - ${currentValue}`;
          break;

        case OPERATORS.MULTIPLY:
          result = previousValue * currentValue;
          expressionStr = `${previousValue} * ${currentValue}`;
          break;

        case OPERATORS.DIVIDE:
          if (currentValue === 0n) {
            this.display.showError(ERROR_MESSAGES.DIVISION_BY_ZERO);
            return;
          }
          result = previousValue / currentValue;
          expressionStr = `${previousValue} / ${currentValue}`;
          break;

        case OPERATORS.MODULO:
          if (currentValue === 0n) {
            this.display.showError(ERROR_MESSAGES.DIVISION_BY_ZERO);
            return;
          }
          result = previousValue % currentValue;
          expressionStr = `${previousValue} % ${currentValue}`;
          break;

        // 位运算
        case OPERATORS.AND:
          result = this.bitOps.and(previousValue, currentValue, typeInfo.bits);
          expressionStr = `${previousValue} & ${currentValue}`;
          break;

        case OPERATORS.OR:
          result = this.bitOps.or(previousValue, currentValue, typeInfo.bits);
          expressionStr = `${previousValue} | ${currentValue}`;
          break;

        case OPERATORS.XOR:
          result = this.bitOps.xor(previousValue, currentValue, typeInfo.bits);
          expressionStr = `${previousValue} ^ ${currentValue}`;
          break;

        case OPERATORS.NOT:
          result = this.bitOps.not(previousValue, typeInfo.bits, typeInfo.signed);
          expressionStr = `~${previousValue}`;
          break;

        case OPERATORS.LEFT_SHIFT:
          const leftShift = Number(currentValue);
          result = this.bitOps.leftShift(previousValue, leftShift, typeInfo.bits, typeInfo.signed);
          expressionStr = `${previousValue} << ${currentValue}`;
          break;

        case OPERATORS.RIGHT_SHIFT:
          const rightShift = Number(currentValue);
          result = this.bitOps.rightShift(previousValue, rightShift, typeInfo.bits, typeInfo.signed);
          expressionStr = `${previousValue} >> ${currentValue}`;
          break;

        default:
          return;
      }

      // 检查溢出
      const overflowResult = this.typeHandler.checkOverflow(result, currentType);

      if (overflowResult.overflow) {
        this.display.showOverflowWarning();
      } else {
        this.display.clearOverflowWarning();
      }

      // 更新状态
      this.state.currentValue = overflowResult.value;
      this.state.previousValue = 0n;
      this.state.operation = null;
      this.state.isNewNumber = true;

      // 新增：更新表达式显示状态
      this.state.expressionDisplay.result = overflowResult.value;
      this.state.expressionDisplay.editingRow = 'result';

      // 添加到历史记录
      this.history.add(expressionStr, overflowResult.value.toString(), currentType);

      // 更新显示
      this.updateDisplay();
    } catch (error) {
      this.display.showError(ERROR_MESSAGES.INVALID_OPERATION);
      console.error('Calculation error:', error);
    }
  }

  /**
   * 清空计算器
   */
  clear() {
    this.state.currentValue = 0n;
    this.state.previousValue = 0n;
    this.state.operation = null;
    this.state.isNewNumber = true;
    this.state.expression = '';

    // 新增：重置表达式显示状态
    this.state.expressionDisplay = {
      value1: 0n,
      operator: null,
      value2: null,
      result: null,
      editingRow: 'value1'
    };

    this.display.clearOverflowWarning();
    this.display.clearError();
    this.updateDisplay();
  }

  /**
   * 删除最后一位
   */
  deleteLast() {
    const { activeBase, currentValue } = this.state;
    const { editingRow } = this.state.expressionDisplay;

    // 获取当前显示的字符串
    let currentStr = this.display.getValue(editingRow, activeBase);

    // 清理格式化字符
    if (activeBase === 16) {
      currentStr = currentStr.replace(/^0x/i, '');
    } else if (activeBase === 2) {
      currentStr = currentStr.replace(/\s+/g, '');
    }

    // 删除最后一位
    if (currentStr.length > 1) {
      currentStr = currentStr.slice(0, -1);
    } else {
      currentStr = '0';
    }

    // 转换回十进制
    try {
      const typeInfo = this.typeHandler.getTypeInfo(this.state.currentType);
      const decimalValue = this.numberSystem.toDecimal(
        currentStr,
        activeBase,
        typeInfo.signed,
        typeInfo.bits
      );

      this.state.currentValue = decimalValue;

      // 更新表达式显示状态
      if (editingRow === 'value1') {
        this.state.expressionDisplay.value1 = decimalValue;
      } else if (editingRow === 'value2') {
        this.state.expressionDisplay.value2 = decimalValue;
      }

      this.updateDisplay();
    } catch (error) {
      this.state.currentValue = 0n;
      this.updateDisplay();
    }
  }

  /**
   * 切换整数类型
   * @param {string} typeName - 类型名称
   */
  switchType(typeName) {
    this.state.currentType = typeName;

    // 保存到localStorage
    localStorage.setItem(CONFIG.STORAGE_KEY_LAST_TYPE, typeName);

    // 重新检查当前值是否溢出
    const result = this.typeHandler.checkOverflow(this.state.currentValue, typeName);

    if (result.overflow) {
      this.display.showOverflowWarning();
    } else {
      this.display.clearOverflowWarning();
    }

    this.state.currentValue = result.value;
    this.updateDisplay();
  }

  /**
   * 切换激活的进制
   * @param {number} base - 进制（2, 10, 16）
   */
  switchBase(base) {
    this.state.activeBase = base;

    // 同步base-selector下拉框
    const baseSelector = document.getElementById('base-selector');
    if (baseSelector) {
      baseSelector.value = base.toString();
    }

    this.display.highlightActive(base);
    this.display.updateButtonStates(base);
  }

  /**
   * 更新所有显示
   */
  updateDisplay() {
    const typeInfo = this.typeHandler.getTypeInfo(this.state.currentType);

    // 更新表达式表格
    this.display.updateExpressionTable(
      this.state.expressionDisplay,
      typeInfo
    );

    // 高亮当前编辑行
    this.display.highlightEditingRow(this.state.expressionDisplay.editingRow);

    // 更新范围显示（保留）
    this.display.updateRange(typeInfo);
  }

  /**
   * 从显示区读取值（用于直接编辑显示区的情况）
   * @param {number} base - 进制
   */
  readFromDisplay(base) {
    const { editingRow } = this.state.expressionDisplay;
    const displayValue = this.display.getValue(editingRow, base);

    try {
      const typeInfo = this.typeHandler.getTypeInfo(this.state.currentType);
      const decimalValue = this.numberSystem.toDecimal(
        displayValue,
        base,
        typeInfo.signed,
        typeInfo.bits
      );

      const result = this.typeHandler.checkOverflow(decimalValue, this.state.currentType);

      if (result.overflow) {
        this.display.showOverflowWarning(base);
      } else {
        this.display.clearOverflowWarning();
      }

      this.state.currentValue = result.value;
      this.updateDisplay();
    } catch (error) {
      this.display.showError(ERROR_MESSAGES.INVALID_INPUT);
    }
  }

  /**
   * 获取当前状态（用于调试）
   * @returns {object} 当前状态
   */
  getState() {
    return { ...this.state };
  }
}
