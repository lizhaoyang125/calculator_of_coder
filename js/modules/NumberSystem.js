/**
 * NumberSystem - 进制转换核心模块
 * 处理二进制、十进制、十六进制之间的转换
 * 支持二补数表示负数
 */
export class NumberSystem {
  /**
   * 将任意进制的字符串转换为十进制
   * @param {string} input - 输入字符串
   * @param {number} base - 进制 (2, 10, 16)
   * @param {boolean} signed - 是否有符号
   * @param {number} bits - 位数
   * @returns {bigint} 十进制 BigInt 值
   */
  toDecimal(input, base, signed = true, bits = 32) {
    if (base === 2) {
      return this.binToDec(input, signed, bits);
    }
    if (base === 16) {
      return this.hexToDec(input, signed, bits);
    }
    return BigInt(input);
  }

  /**
   * 二进制转十进制
   * @param {string} binary - 二进制字符串
   * @param {boolean} signed - 是否有符号
   * @param {number} bits - 位数
   * @returns {bigint} 十进制值
   */
  binToDec(binary, signed = true, bits = 32) {
    // 移除空格
    const cleanBinary = binary.replace(/\s+/g, '');

    // 转换为十进制
    const decimal = BigInt('0b' + cleanBinary);

    // 如果是有符号类型且最高位是1（负数）
    if (signed && cleanBinary.length === bits && cleanBinary[0] === '1') {
      // 二补数: decimal - 2^bits
      return decimal - (1n << BigInt(bits));
    }

    return decimal;
  }

  /**
   * 十六进制转十进制
   * @param {string} hex - 十六进制字符串（可带0x前缀）
   * @param {boolean} signed - 是否有符号
   * @param {number} bits - 位数
   * @returns {bigint} 十进制值
   */
  hexToDec(hex, signed = true, bits = 32) {
    // 移除0x前缀和空格
    const cleanHex = hex.replace(/^0x/i, '').replace(/\s+/g, '');

    // 转换为十进制
    const decimal = BigInt('0x' + cleanHex);

    // 如果是有符号类型，检查最高位
    if (signed) {
      const maxUnsigned = (1n << BigInt(bits));
      const signBit = (1n << BigInt(bits - 1));

      // 如果值大于等于符号位，表示负数
      if (decimal >= signBit) {
        return decimal - maxUnsigned;
      }
    }

    return decimal;
  }

  /**
   * 十进制转二进制（支持二补数）
   * @param {bigint|number} decimal - 十进制值
   * @param {number} bits - 位数
   * @returns {string} 二进制字符串
   */
  decToBin(decimal, bits = 32) {
    let value = BigInt(decimal);

    // 负数转二补数: 2^bits + value
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 转换为二进制并补齐位数
    let binary = value.toString(2);

    // 如果超出位数，截取后面的bits位
    if (binary.length > bits) {
      binary = binary.slice(-bits);
    } else {
      binary = binary.padStart(bits, '0');
    }

    return binary;
  }

  /**
   * 十进制转十六进制
   * @param {bigint|number} decimal - 十进制值
   * @param {number} bits - 位数
   * @returns {string} 十六进制字符串（带0x前缀）
   */
  decToHex(decimal, bits = 32) {
    let value = BigInt(decimal);

    // 负数处理
    if (value < 0n) {
      value = (1n << BigInt(bits)) + value;
    }

    // 转换为十六进制
    const hexLength = bits / 4;
    let hex = value.toString(16).toUpperCase();

    // 如果超出位数，截取后面的部分
    if (hex.length > hexLength) {
      hex = hex.slice(-hexLength);
    } else {
      hex = hex.padStart(hexLength, '0');
    }

    return '0x' + hex;
  }

  /**
   * 格式化二进制字符串（每4位分组）
   * @param {string} binString - 二进制字符串
   * @returns {string} 格式化后的二进制字符串
   */
  formatBinary(binString) {
    // 每4位分组: "11111111" → "1111 1111"
    const groups = [];
    for (let i = 0; i < binString.length; i += 4) {
      groups.push(binString.slice(i, i + 4));
    }
    return groups.join(' ');
  }

  /**
   * 格式化十六进制字符串
   * @param {string} hexString - 十六进制字符串
   * @returns {string} 格式化后的十六进制字符串
   */
  formatHex(hexString) {
    // 确保大写并带0x前缀
    const cleaned = hexString.replace(/^0x/i, '');
    return '0x' + cleaned.toUpperCase();
  }

  /**
   * 验证输入是否符合指定进制
   * @param {string} input - 输入字符串
   * @param {number} base - 进制
   * @returns {boolean} 是否有效
   */
  isValidInput(input, base) {
    const patterns = {
      2: /^[01\s]+$/,
      10: /^-?[0-9]+$/,
      16: /^(0x)?[0-9A-Fa-f\s]+$/
    };

    return patterns[base] ? patterns[base].test(input) : false;
  }
}
