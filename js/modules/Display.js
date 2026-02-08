/**
 * Display - 显示管理模块
 * 负责更新所有显示区域和视觉反馈
 */
import { NumberSystem } from './NumberSystem.js';
import { UI, ANIMATIONS, CONFIG } from '../utils/constants.js';

export class Display {
  constructor() {
    // 获取表格DOM元素
    this.elements = {
      // 表格元素
      value1Hex: document.querySelector('[data-value="value1-hex"]'),
      value1Dec: document.querySelector('[data-value="value1-dec"]'),
      value1Bin: document.querySelector('[data-value="value1-bin"]'),

      value2Hex: document.querySelector('[data-value="value2-hex"]'),
      value2Dec: document.querySelector('[data-value="value2-dec"]'),
      value2Bin: document.querySelector('[data-value="value2-bin"]'),

      resultHex: document.querySelector('[data-value="result-hex"]'),
      resultDec: document.querySelector('[data-value="result-dec"]'),
      resultBin: document.querySelector('[data-value="result-bin"]'),

      operatorCell: document.querySelector('.operator-cell'),

      value1Row: document.getElementById('value1-row'),
      operatorRow: document.getElementById('operator-row'),
      value2Row: document.getElementById('value2-row'),
      resultRow: document.getElementById('result-row'),

      rangeDisplay: document.getElementById(UI.ID_RANGE_DISPLAY)
    };

    this.numberSystem = new NumberSystem();
    this.overflowTimeoutId = null;
  }

  /**
   * 更新Value1行（第一个操作数）
   * @param {bigint} value - 值
   * @param {object} typeInfo - 类型信息
   */
  updateValue1(value, typeInfo) {
    this.elements.value1Hex.textContent = this.numberSystem.decToHex(value, typeInfo.bits);
    this.elements.value1Dec.textContent = value.toString();
    this.elements.value1Bin.textContent = this.numberSystem.formatBinary(
      this.numberSystem.decToBin(value, typeInfo.bits)
    );
  }

  /**
   * 更新运算符行
   * @param {string} operator - 运算符
   */
  updateOperator(operator) {
    this.elements.operatorCell.textContent = operator || '';
  }

  /**
   * 更新Value2行（第二个操作数）
   * @param {bigint} value - 值
   * @param {object} typeInfo - 类型信息
   */
  updateValue2(value, typeInfo) {
    this.elements.value2Hex.textContent = this.numberSystem.decToHex(value, typeInfo.bits);
    this.elements.value2Dec.textContent = value.toString();
    this.elements.value2Bin.textContent = this.numberSystem.formatBinary(
      this.numberSystem.decToBin(value, typeInfo.bits)
    );
  }

  /**
   * 更新结果行
   * @param {bigint} value - 值
   * @param {object} typeInfo - 类型信息
   */
  updateResult(value, typeInfo) {
    this.elements.resultHex.textContent = this.numberSystem.decToHex(value, typeInfo.bits);
    this.elements.resultDec.textContent = value.toString();
    this.elements.resultBin.textContent = this.numberSystem.formatBinary(
      this.numberSystem.decToBin(value, typeInfo.bits)
    );
  }

  /**
   * 更新整个表达式表格
   * @param {object} expressionState - 表达式状态
   * @param {object} typeInfo - 类型信息
   */
  updateExpressionTable(expressionState, typeInfo) {
    const { value1, operator, value2, result } = expressionState;

    // 清空所有行（初始状态）
    this.clearExpressionTable();

    // 根据状态更新显示
    if (value1 !== null) {
      this.updateValue1(value1, typeInfo);
    }

    if (operator) {
      this.updateOperator(operator);
    }

    if (value2 !== null && operator) {
      this.updateValue2(value2, typeInfo);
    }

    if (result !== null) {
      this.updateResult(result, typeInfo);
    }
  }

  /**
   * 清空表达式表格（重置为初始状态）
   */
  clearExpressionTable() {
    // 清空运算符
    this.elements.operatorCell.textContent = '';

    // 清空 value2 和 result 的内容（显示空字符串）
    this.elements.value2Hex.textContent = '';
    this.elements.value2Dec.textContent = '';
    this.elements.value2Bin.textContent = '';

    this.elements.resultHex.textContent = '';
    this.elements.resultDec.textContent = '';
    this.elements.resultBin.textContent = '';
  }

  /**
   * 高亮正在编辑的行
   * @param {string} rowId - 行ID ('value1', 'value2', 'result')
   */
  highlightEditingRow(rowId) {
    // 移除所有高亮
    this.elements.value1Row.classList.remove('editing');
    this.elements.value2Row.classList.remove('editing');
    this.elements.resultRow.classList.remove('editing');

    // 添加高亮到当前行
    if (rowId === 'value1') {
      this.elements.value1Row.classList.add('editing');
    } else if (rowId === 'value2') {
      this.elements.value2Row.classList.add('editing');
    } else if (rowId === 'result') {
      this.elements.resultRow.classList.add('editing');
    }
  }

  /**
   * 更新所有显示区域（保持向后兼容）
   * @param {bigint} value - 当前值
   * @param {object} typeInfo - 类型信息
   * @param {number} activeBase - 当前激活的进制
   */
  updateAll(value, typeInfo, activeBase) {
    this.updateValue1(value, typeInfo);
    this.updateRange(typeInfo);
  }

  /**
   * 更新范围显示
   * @param {object} typeInfo - 类型信息
   */
  updateRange(typeInfo) {
    this.elements.rangeDisplay.textContent =
      `Range: ${typeInfo.min.toString()} ~ ${typeInfo.max.toString()}`;
  }

  /**
   * 高亮当前激活的进制显示区（表格模式下高亮列头）
   * @param {number} base - 进制（2, 10, 16）
   */
  highlightActive(base) {
    // 在表格模式下，可以高亮对应的列头
    const headers = document.querySelectorAll('.expression-table thead th');
    headers.forEach(th => th.classList.remove(UI.CLASS_ACTIVE));

    // 根据进制高亮对应的列头
    if (base === 16 && headers[1]) {
      headers[1].classList.add(UI.CLASS_ACTIVE); // HEX列
    } else if (base === 10 && headers[2]) {
      headers[2].classList.add(UI.CLASS_ACTIVE); // DEC列
    } else if (base === 2 && headers[3]) {
      headers[3].classList.add(UI.CLASS_ACTIVE); // BIN列
    }
  }

  /**
   * 显示溢出警告（表格模式）
   * @param {number} base - 显示溢出的进制（可选，默认全部）
   */
  showOverflowWarning(base = null) {
    // 清除之前的超时
    if (this.overflowTimeoutId) {
      clearTimeout(this.overflowTimeoutId);
    }

    // 在表格模式下，给整个表格添加溢出类
    const table = document.querySelector('.expression-table');
    if (table) {
      table.classList.add(UI.CLASS_OVERFLOW);
      table.classList.add(ANIMATIONS.SHAKE);

      // 移除抖动动画
      setTimeout(() => {
        table.classList.remove(ANIMATIONS.SHAKE);
      }, CONFIG.ANIMATION_DURATION);
    }

    // 自动移除溢出警告
    this.overflowTimeoutId = setTimeout(() => {
      this.clearOverflowWarning();
    }, CONFIG.OVERFLOW_WARNING_DURATION);
  }

  /**
   * 清除溢出警告
   */
  clearOverflowWarning() {
    const table = document.querySelector('.expression-table');
    if (table) {
      table.classList.remove(UI.CLASS_OVERFLOW);
    }

    if (this.overflowTimeoutId) {
      clearTimeout(this.overflowTimeoutId);
      this.overflowTimeoutId = null;
    }
  }

  /**
   * 显示错误信息（表格模式）
   * @param {string} message - 错误消息
   */
  showError(message) {
    // 在表格模式下，显示在result行的DEC单元格
    const resultDec = this.elements.resultDec;
    if (resultDec) {
      const originalValue = resultDec.textContent;
      resultDec.textContent = message;
      resultDec.classList.add(UI.CLASS_ERROR);

      // 3秒后恢复
      setTimeout(() => {
        resultDec.classList.remove(UI.CLASS_ERROR);
        resultDec.textContent = originalValue;
      }, 3000);
    }
  }

  /**
   * 清除错误状态
   */
  clearError() {
    const cells = document.querySelectorAll('.expression-table td');
    cells.forEach(cell => cell.classList.remove(UI.CLASS_ERROR));
  }

  /**
   * 获取当前编辑行的值元素
   * @param {string} rowId - 行ID ('value1', 'value2', 'result')
   * @param {number} base - 进制
   * @returns {HTMLElement} 值元素
   */
  getValueElement(rowId, base) {
    const dataValue = `${rowId}-${base === 16 ? 'hex' : base === 10 ? 'dec' : 'bin'}`;
    return document.querySelector(`[data-value="${dataValue}"]`);
  }

  /**
   * 设置显示值（表格模式 - 基于当前编辑行）
   * @param {string} rowId - 行ID
   * @param {number} base - 进制
   * @param {string} value - 值
   */
  setValue(rowId, base, value) {
    const element = this.getValueElement(rowId, base);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * 获取显示值（表格模式 - 基于当前编辑行）
   * @param {string} rowId - 行ID
   * @param {number} base - 进制
   * @returns {string} 显示的值
   */
  getValue(rowId, base) {
    const element = this.getValueElement(rowId, base);
    return element ? element.textContent : '';
  }

  /**
   * 添加脉冲动画效果（表格模式）
   * @param {string} rowId - 行ID（可选）
   */
  addPulseEffect(rowId = null) {
    const table = document.querySelector('.expression-table');
    if (table) {
      table.classList.add(ANIMATIONS.PULSE);
      setTimeout(() => {
        table.classList.remove(ANIMATIONS.PULSE);
      }, CONFIG.ANIMATION_DURATION);
    }
  }

  /**
   * 根据当前进制禁用不可用的按钮
   * @param {number} base - 当前进制
   */
  updateButtonStates(base) {
    // 十六进制字母按钮
    const hexButtons = document.querySelectorAll('.btn-hex');
    hexButtons.forEach(button => {
      button.disabled = base !== 16;
      if (base !== 16) {
        button.classList.add(UI.CLASS_DISABLED);
      } else {
        button.classList.remove(UI.CLASS_DISABLED);
      }
    });

    // 数字按钮（二进制模式下只能用0和1）
    if (base === 2) {
      const numberButtons = document.querySelectorAll('.btn-number');
      numberButtons.forEach(button => {
        const num = button.dataset.num;
        if (num !== '0' && num !== '1') {
          button.disabled = true;
          button.classList.add(UI.CLASS_DISABLED);
        } else {
          button.disabled = false;
          button.classList.remove(UI.CLASS_DISABLED);
        }
      });
    } else {
      // 恢复所有数字按钮
      const numberButtons = document.querySelectorAll('.btn-number');
      numberButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove(UI.CLASS_DISABLED);
      });
    }
  }
}
