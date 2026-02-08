/**
 * 常量定义
 * 包含应用程序的配置常量
 */

// 应用配置
export const CONFIG = {
  // 历史记录最大条数
  MAX_HISTORY: 50,

  // 默认整数类型
  DEFAULT_TYPE: 'INT32',

  // 默认进制（10进制）
  DEFAULT_BASE: 10,

  // 输入防抖延迟（毫秒）
  DEBOUNCE_DELAY: 100,

  // 动画持续时间（毫秒）
  ANIMATION_DURATION: 300,

  // 溢出警告显示时间（毫秒）
  OVERFLOW_WARNING_DURATION: 3000,

  // 本地存储键名
  STORAGE_KEY_HISTORY: 'calc-history',
  STORAGE_KEY_THEME: 'calc-theme',
  STORAGE_KEY_LAST_TYPE: 'calc-last-type'
};

// 进制常量
export const BASE = {
  BINARY: 2,
  DECIMAL: 10,
  HEXADECIMAL: 16
};

// 进制显示名称
export const BASE_NAMES = {
  2: 'BIN',
  10: 'DEC',
  16: 'HEX'
};

// 运算符类型
export const OPERATORS = {
  // 算术运算
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  MODULO: '%',

  // 位运算
  AND: '&',
  OR: '|',
  XOR: '^',
  NOT: '~',
  LEFT_SHIFT: '<<',
  RIGHT_SHIFT: '>>',
  UNSIGNED_RIGHT_SHIFT: '>>>',

  // 特殊操作
  EQUALS: '=',
  CLEAR: 'AC',
  DELETE: 'DEL',
  NEGATE: '±'
};

// 运算符优先级
export const OPERATOR_PRECEDENCE = {
  [OPERATORS.OR]: 1,
  [OPERATORS.XOR]: 2,
  [OPERATORS.AND]: 3,
  [OPERATORS.LEFT_SHIFT]: 4,
  [OPERATORS.RIGHT_SHIFT]: 4,
  [OPERATORS.UNSIGNED_RIGHT_SHIFT]: 4,
  [OPERATORS.ADD]: 5,
  [OPERATORS.SUBTRACT]: 5,
  [OPERATORS.MULTIPLY]: 6,
  [OPERATORS.DIVIDE]: 6,
  [OPERATORS.MODULO]: 6
};

// 键盘快捷键
export const KEYBOARD_SHORTCUTS = {
  // 进制切换
  'h': 'switch-hex',
  'H': 'switch-hex',
  'd': 'switch-dec',
  'D': 'switch-dec',
  'b': 'switch-bin',
  'B': 'switch-bin',

  // 操作
  'c': 'clear',
  'C': 'clear',
  'Enter': 'equals',
  'Escape': 'clear',
  'Backspace': 'delete',
  'Delete': 'delete',

  // 运算符
  '&': 'and',
  '|': 'or',
  '^': 'xor',
  '~': 'not',

  // 数字和基本运算
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  'a': 'A', 'A': 'A',
  'e': 'E', 'E': 'E',
  'f': 'F', 'F': 'F',
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '%': '%',
  '(': '(',
  ')': ')',
  '=': 'equals'
};

// 错误消息
export const ERROR_MESSAGES = {
  DIVISION_BY_ZERO: 'Error: Division by zero',
  INVALID_INPUT: 'Error: Invalid input',
  OVERFLOW: 'Warning: Value overflow',
  UNDERFLOW: 'Warning: Value underflow',
  INVALID_OPERATION: 'Error: Invalid operation',
  OUT_OF_RANGE: 'Error: Out of range'
};

// UI 常量
export const UI = {
  // CSS 类名
  CLASS_ACTIVE: 'active',
  CLASS_OVERFLOW: 'overflow',
  CLASS_ERROR: 'error',
  CLASS_DISABLED: 'disabled',
  CLASS_BUTTON_NUMBER: 'btn-number',
  CLASS_BUTTON_OPERATOR: 'btn-operator',
  CLASS_BUTTON_BITOP: 'btn-bitop',
  CLASS_BUTTON_FUNCTION: 'btn-function',

  // DOM ID
  ID_HEX_DISPLAY: 'hex-display',
  ID_DEC_DISPLAY: 'dec-display',
  ID_BIN_DISPLAY: 'bin-display',
  ID_HEX_VALUE: 'hex-value',
  ID_DEC_VALUE: 'dec-value',
  ID_BIN_VALUE: 'bin-value',
  ID_RANGE_DISPLAY: 'range-display',
  ID_TYPE_SELECTOR: 'type-selector',
  ID_HISTORY_LIST: 'history-list',
  ID_BUTTON_GRID: 'button-grid'
};

// 动画类名
export const ANIMATIONS = {
  SHAKE: 'shake',
  PULSE: 'pulse',
  FADE_IN: 'fade-in',
  FADE_OUT: 'fade-out'
};

// 主题
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};
