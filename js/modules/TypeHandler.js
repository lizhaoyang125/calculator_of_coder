/**
 * TypeHandler - 整数类型处理模块
 * 处理不同整数类型的范围限制和溢出检测
 */
export class TypeHandler {
  constructor() {
    /**
     * 支持的整数类型配置
     * 每个类型包含：位数、是否有符号、最小值、最大值
     */
    this.types = {
      'INT8': {
        bits: 8,
        signed: true,
        min: -128n,
        max: 127n,
        displayName: 'INT8'
      },
      'UINT8': {
        bits: 8,
        signed: false,
        min: 0n,
        max: 255n,
        displayName: 'UINT8'
      },
      'INT16': {
        bits: 16,
        signed: true,
        min: -32768n,
        max: 32767n,
        displayName: 'INT16'
      },
      'UINT16': {
        bits: 16,
        signed: false,
        min: 0n,
        max: 65535n,
        displayName: 'UINT16'
      },
      'INT32': {
        bits: 32,
        signed: true,
        min: -2147483648n,
        max: 2147483647n,
        displayName: 'INT32'
      },
      'UINT32': {
        bits: 32,
        signed: false,
        min: 0n,
        max: 4294967295n,
        displayName: 'UINT32'
      },
      'INT64': {
        bits: 64,
        signed: true,
        min: -9223372036854775808n,
        max: 9223372036854775807n,
        displayName: 'INT64'
      },
      'UINT64': {
        bits: 64,
        signed: false,
        min: 0n,
        max: 18446744073709551615n,
        displayName: 'UINT64'
      }
    };
  }

  /**
   * 获取类型信息
   * @param {string} typeName - 类型名称
   * @returns {object} 类型信息对象
   */
  getTypeInfo(typeName) {
    return this.types[typeName] || this.types['INT32'];
  }

  /**
   * 获取所有支持的类型名称
   * @returns {Array<string>} 类型名称数组
   */
  getAllTypeNames() {
    return Object.keys(this.types);
  }

  /**
   * 检查值是否在类型范围内
   * @param {bigint|number} value - 要检查的值
   * @param {string} typeName - 类型名称
   * @returns {boolean} 是否在范围内
   */
  isInRange(value, typeName) {
    const type = this.getTypeInfo(typeName);
    const bigValue = BigInt(value);
    return bigValue >= type.min && bigValue <= type.max;
  }

  /**
   * 检查溢出并返回处理后的值
   * @param {bigint|number} value - 输入值
   * @param {string} typeName - 类型名称
   * @returns {object} { overflow: boolean, value: bigint, wrappedValue: bigint }
   */
  checkOverflow(value, typeName) {
    const type = this.getTypeInfo(typeName);
    const bigValue = BigInt(value);

    // 检查是否溢出
    if (bigValue > type.max || bigValue < type.min) {
      const wrappedValue = this.wrap(bigValue, typeName);

      // 对于 unsigned 类型，使用环绕值（模拟真实的CPU行为）
      // 对于 signed 类型，使用饱和截断
      const resultValue = type.signed
        ? (bigValue > type.max ? type.max : type.min)
        : wrappedValue;

      return {
        overflow: true,
        value: resultValue,
        wrappedValue: wrappedValue,
        originalValue: bigValue
      };
    }

    return {
      overflow: false,
      value: bigValue,
      wrappedValue: bigValue,
      originalValue: bigValue
    };
  }

  /**
   * 将值限制在类型范围内（饱和截断）
   * @param {bigint|number} value - 输入值
   * @param {string} typeName - 类型名称
   * @returns {bigint} 限制后的值
   */
  clamp(value, typeName) {
    const type = this.getTypeInfo(typeName);
    const bigValue = BigInt(value);

    if (bigValue > type.max) return type.max;
    if (bigValue < type.min) return type.min;
    return bigValue;
  }

  /**
   * 环绕处理（模拟CPU溢出行为）
   * @param {bigint|number} value - 输入值
   * @param {string} typeName - 类型名称
   * @returns {bigint} 环绕后的值
   */
  wrap(value, typeName) {
    const type = this.getTypeInfo(typeName);
    let bigValue = BigInt(value);

    const range = type.max - type.min + 1n;

    // 将值映射到 [0, range) 范围
    bigValue = ((bigValue - type.min) % range + range) % range;

    // 映射回 [min, max] 范围
    return bigValue + type.min;
  }

  /**
   * 获取类型的范围字符串
   * @param {string} typeName - 类型名称
   * @returns {string} 范围字符串，如 "-128 ~ 127"
   */
  getRange(typeName) {
    const type = this.getTypeInfo(typeName);
    return `${type.min.toString()} ~ ${type.max.toString()}`;
  }

  /**
   * 获取类型的范围对象
   * @param {string} typeName - 类型名称
   * @returns {object} { min: bigint, max: bigint }
   */
  getRangeValues(typeName) {
    const type = this.getTypeInfo(typeName);
    return {
      min: type.min,
      max: type.max
    };
  }

  /**
   * 转换值到指定类型（应用类型的位掩码）
   * @param {bigint|number} value - 输入值
   * @param {string} typeName - 类型名称
   * @returns {bigint} 转换后的值
   */
  convertToType(value, typeName) {
    const type = this.getTypeInfo(typeName);
    let bigValue = BigInt(value);

    // 创建位掩码
    const mask = (1n << BigInt(type.bits)) - 1n;

    // 应用掩码（截断到指定位数）
    bigValue = bigValue & mask;

    // 如果是有符号类型，处理符号扩展
    if (type.signed) {
      const signBit = 1n << BigInt(type.bits - 1);
      if (bigValue >= signBit) {
        // 负数：减去 2^bits
        bigValue = bigValue - (1n << BigInt(type.bits));
      }
    }

    return bigValue;
  }

  /**
   * 验证并转换输入值
   * @param {bigint|number|string} input - 输入值
   * @param {string} typeName - 类型名称
   * @returns {object} { valid: boolean, value: bigint, error: string }
   */
  validateAndConvert(input, typeName) {
    try {
      const value = typeof input === 'string' ? BigInt(input) : BigInt(input);
      const result = this.checkOverflow(value, typeName);

      return {
        valid: true,
        value: result.value,
        overflow: result.overflow,
        error: result.overflow ? 'Value overflow' : null
      };
    } catch (error) {
      return {
        valid: false,
        value: 0n,
        overflow: false,
        error: error.message
      };
    }
  }
}
