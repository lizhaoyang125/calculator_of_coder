/**
 * BitOperations - 位运算模块
 * 实现各种位运算操作（AND, OR, XOR, NOT, 移位）
 */
export class BitOperations {
  /**
   * AND 运算（按位与）
   * @param {bigint|number} a - 第一个操作数
   * @param {bigint|number} b - 第二个操作数
   * @param {number} bits - 位数
   * @returns {bigint} 运算结果
   */
  and(a, b, bits = 32) {
    const bigA = BigInt(a);
    const bigB = BigInt(b);
    const mask = (1n << BigInt(bits)) - 1n;

    // 执行AND运算并应用掩码
    return (bigA & bigB) & mask;
  }

  /**
   * OR 运算（按位或）
   * @param {bigint|number} a - 第一个操作数
   * @param {bigint|number} b - 第二个操作数
   * @param {number} bits - 位数
   * @returns {bigint} 运算结果
   */
  or(a, b, bits = 32) {
    const bigA = BigInt(a);
    const bigB = BigInt(b);
    const mask = (1n << BigInt(bits)) - 1n;

    // 执行OR运算并应用掩码
    return (bigA | bigB) & mask;
  }

  /**
   * XOR 运算（按位异或）
   * @param {bigint|number} a - 第一个操作数
   * @param {bigint|number} b - 第二个操作数
   * @param {number} bits - 位数
   * @returns {bigint} 运算结果
   */
  xor(a, b, bits = 32) {
    const bigA = BigInt(a);
    const bigB = BigInt(b);
    const mask = (1n << BigInt(bits)) - 1n;

    // 执行XOR运算并应用掩码
    return (bigA ^ bigB) & mask;
  }

  /**
   * NOT 运算（按位取反）
   * @param {bigint|number} a - 操作数
   * @param {number} bits - 位数
   * @param {boolean} signed - 是否有符号
   * @returns {bigint} 运算结果
   */
  not(a, bits = 32, signed = true) {
    let value = BigInt(a);

    // 如果是负数，先转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 创建掩码
    const mask = (1n << BigInt(bits)) - 1n;

    // 执行NOT运算（对所有位取反）
    let result = (~value) & mask;

    // 如果是有符号类型，处理符号扩展
    if (signed) {
      const signBit = 1n << BigInt(bits - 1);
      if (result >= signBit) {
        // 最高位是1，表示负数
        result = result - (1n << BigInt(bits));
      }
    }

    return result;
  }

  /**
   * 左移运算
   * @param {bigint|number} a - 操作数
   * @param {number} shiftAmount - 移位数量
   * @param {number} bits - 位数
   * @param {boolean} signed - 是否有符号
   * @returns {bigint} 运算结果
   */
  leftShift(a, shiftAmount, bits = 32, signed = true) {
    let value = BigInt(a);

    // 移位量取模（防止移位量过大）
    const shift = shiftAmount % bits;

    // 如果是负数，先转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 执行左移
    let result = (value << BigInt(shift));

    // 应用掩码（只保留bits位）
    const mask = (1n << BigInt(bits)) - 1n;
    result = result & mask;

    // 如果是有符号类型，处理符号位
    if (signed) {
      const signBit = 1n << BigInt(bits - 1);
      if (result >= signBit) {
        result = result - (1n << BigInt(bits));
      }
    }

    return result;
  }

  /**
   * 右移运算
   * @param {bigint|number} a - 操作数
   * @param {number} shiftAmount - 移位数量
   * @param {number} bits - 位数
   * @param {boolean} signed - 是否有符号（算术右移 vs 逻辑右移）
   * @returns {bigint} 运算结果
   */
  rightShift(a, shiftAmount, bits = 32, signed = true) {
    let value = BigInt(a);

    // 移位量取模
    const shift = shiftAmount % bits;

    if (signed && value < 0n) {
      // 算术右移：保持符号位
      // 先转为无符号表示
      value = (1n << BigInt(bits)) + value;

      // 执行右移
      let result = value >> BigInt(shift);

      // 填充符号位（1）
      const signBits = ((1n << BigInt(shift)) - 1n) << BigInt(bits - shift);
      result = result | signBits;

      // 应用掩码
      const mask = (1n << BigInt(bits)) - 1n;
      result = result & mask;

      // 转回有符号表示
      const signBit = 1n << BigInt(bits - 1);
      if (result >= signBit) {
        result = result - (1n << BigInt(bits));
      }

      return result;
    } else {
      // 逻辑右移：高位补0
      if (value < 0n) {
        value = (1n << BigInt(bits)) + value;
      }

      let result = value >> BigInt(shift);

      // 如果是有符号类型，处理符号位
      if (signed) {
        const signBit = 1n << BigInt(bits - 1);
        if (result >= signBit) {
          result = result - (1n << BigInt(bits));
        }
      }

      return result;
    }
  }

  /**
   * 无符号右移（逻辑右移）
   * @param {bigint|number} a - 操作数
   * @param {number} shiftAmount - 移位数量
   * @param {number} bits - 位数
   * @returns {bigint} 运算结果
   */
  unsignedRightShift(a, shiftAmount, bits = 32) {
    let value = BigInt(a);

    // 移位量取模
    const shift = shiftAmount % bits;

    // 转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 执行右移
    return value >> BigInt(shift);
  }

  /**
   * 循环左移
   * @param {bigint|number} a - 操作数
   * @param {number} shiftAmount - 移位数量
   * @param {number} bits - 位数
   * @returns {bigint} 运算结果
   */
  rotateLeft(a, shiftAmount, bits = 32) {
    let value = BigInt(a);

    // 转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 移位量取模
    const shift = shiftAmount % bits;

    // 创建掩码
    const mask = (1n << BigInt(bits)) - 1n;

    // 循环左移：将溢出的位移到右边
    const leftPart = (value << BigInt(shift)) & mask;
    const rightPart = value >> BigInt(bits - shift);

    return (leftPart | rightPart) & mask;
  }

  /**
   * 循环右移
   * @param {bigint|number} a - 操作数
   * @param {number} shiftAmount - 移位数量
   * @param {number} bits - 位数
   * @returns {bigint} 运算结果
   */
  rotateRight(a, shiftAmount, bits = 32) {
    let value = BigInt(a);

    // 转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 移位量取模
    const shift = shiftAmount % bits;

    // 创建掩码
    const mask = (1n << BigInt(bits)) - 1n;

    // 循环右移：将溢出的位移到左边
    const rightPart = value >> BigInt(shift);
    const leftPart = (value << BigInt(bits - shift)) & mask;

    return (leftPart | rightPart) & mask;
  }

  /**
   * 计算1的个数（Population Count / Hamming Weight）
   * @param {bigint|number} a - 操作数
   * @param {number} bits - 位数
   * @returns {number} 1的个数
   */
  popCount(a, bits = 32) {
    let value = BigInt(a);

    // 转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    let count = 0;
    for (let i = 0; i < bits; i++) {
      if ((value & (1n << BigInt(i))) !== 0n) {
        count++;
      }
    }

    return count;
  }

  /**
   * 获取指定位的值
   * @param {bigint|number} a - 操作数
   * @param {number} bitIndex - 位索引（0表示最低位）
   * @param {number} bits - 总位数
   * @returns {number} 0 或 1
   */
  getBit(a, bitIndex, bits = 32) {
    let value = BigInt(a);

    // 转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    return (value & (1n << BigInt(bitIndex))) !== 0n ? 1 : 0;
  }

  /**
   * 设置指定位的值
   * @param {bigint|number} a - 操作数
   * @param {number} bitIndex - 位索引
   * @param {number} bitValue - 位值（0或1）
   * @param {number} bits - 总位数
   * @param {boolean} signed - 是否有符号
   * @returns {bigint} 运算结果
   */
  setBit(a, bitIndex, bitValue, bits = 32, signed = true) {
    let value = BigInt(a);

    // 转为无符号表示
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    if (bitValue === 1) {
      // 设置为1
      value = value | (1n << BigInt(bitIndex));
    } else {
      // 设置为0
      value = value & ~(1n << BigInt(bitIndex));
    }

    // 应用掩码
    const mask = (1n << BigInt(bits)) - 1n;
    value = value & mask;

    // 如果是有符号类型，处理符号位
    if (signed) {
      const signBit = 1n << BigInt(bits - 1);
      if (value >= signBit) {
        value = value - (1n << BigInt(bits));
      }
    }

    return value;
  }
}
