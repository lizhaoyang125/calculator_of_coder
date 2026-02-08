# Programmer Calculator

程序员专用计算器 - 支持多进制同时显示和位运算

## 功能特性

### 核心功能
- ✅ **多进制同时显示**：二进制、十进制、十六进制自动转换
- ✅ **位运算支持**：AND (&), OR (|), XOR (^), NOT (~), 左移 (<<), 右移 (>>)
- ✅ **类型转换**：支持 INT8/16/32/64 和 UINT8/16/32/64
- ✅ **溢出检测**：自动检测并警告数值溢出
- ✅ **历史记录**：自动保存计算历史（本地存储）

### 用户体验
- 🎨 暗色主题，护眼设计
- ⌨️ 完整键盘快捷键支持
- 📱 响应式设计，支持移动端
- 🔢 等宽字体显示，易于阅读
- ✏️ 可直接编辑显示区

## 快速开始

### 方法1：使用Python内置服务器

```bash
# Python 3
python3 -m http.server 8000

# 然后在浏览器中打开
# http://localhost:8000
```

### 方法2：使用Node.js http-server

```bash
# 安装 http-server（如果还没安装）
npm install -g http-server

# 启动服务器
http-server -p 8000

# 在浏览器中打开
# http://localhost:8000
```

### 方法3：直接打开文件

在支持ES6模块的浏览器中，可以直接打开 `index.html` 文件。

**注意**：某些浏览器（如Chrome）在本地文件协议下可能会阻止ES6模块加载，建议使用HTTP服务器。

## 使用指南

### 基本操作

1. **输入数字**：点击数字按钮或使用键盘输入
2. **切换进制**：
   - 点击对应的显示区（HEX/DEC/BIN）
   - 或按快捷键 H/D/B
3. **执行运算**：点击运算符按钮，输入第二个操作数，按 = 或 Enter
4. **切换类型**：使用右上角的类型选择器

### 键盘快捷键

#### 进制切换
- `H` - 切换到十六进制模式
- `D` - 切换到十进制模式
- `B` - 切换到二进制模式

#### 功能键
- `Enter` - 计算结果
- `C` / `Escape` - 清空
- `Backspace` - 删除最后一位

#### 运算符
- `+` `-` `*` `/` `%` - 算术运算
- `&` `|` `^` `~` - 位运算
- `<` `>` (with Shift) - 左移、右移

#### 数字和字母
- `0-9` - 数字输入
- `A-F` - 十六进制字母（仅在HEX模式下）

### 直接编辑显示区

1. 点击任意显示区（HEX/DEC/BIN）的数值部分
2. 直接编辑数值
3. 按 Enter 或点击其他区域确认
4. 其他进制会自动更新

## 测试场景

### 1. 基本进制转换
```
输入：255（十进制）
验证：
  HEX = 0x000000FF
  DEC = 255
  BIN = 00000000 00000000 00000000 11111111
```

### 2. 位运算 - AND
```
输入：12 & 10
验证：
  结果 = 8
  HEX = 0x00000008
  BIN = ... 00001000
```

### 3. 位运算 - NOT
```
输入：5（INT8类型）
按 ~ 按钮
验证：
  结果 = -6
  BIN = 11111010
  HEX = 0xFA
```

### 4. 类型溢出
```
输入：255（INT32）
切换到 INT8
验证：
  显示溢出警告（红色边框）
  值截断为 127
```

### 5. 负数表示
```
输入：-5（INT8）
验证：
  DEC = -5
  BIN = 11111011（二补数）
  HEX = 0xFB
```

### 6. 十六进制输入
```
切换到 HEX 模式（按 H）
输入：FF
验证：
  DEC 自动显示 255
  BIN 自动显示 11111111
```

### 7. 历史记录
```
执行几次计算
验证：
  - 历史列表正确显示表达式和结果
  - 显示类型和时间戳
  - 点击历史项可复制结果
  - 刷新页面后历史保持
```

### 8. 键盘操作
```
按 H - 切换到 HEX
按 D - 切换到 DEC
按 B - 切换到 BIN
按 C - 清空
输入 12 + 10
按 Enter - 计算
验证：结果 = 22
```

## 项目结构

```
programmer-calculator/
├── index.html                    # 主HTML文件
├── css/
│   ├── variables.css            # CSS变量和主题
│   ├── layout.css               # 布局样式
│   └── calculator.css           # 计算器样式
├── js/
│   ├── main.js                  # 应用入口
│   ├── modules/
│   │   ├── Calculator.js        # 核心控制器
│   │   ├── NumberSystem.js      # 进制转换
│   │   ├── BitOperations.js     # 位运算
│   │   ├── TypeHandler.js       # 类型处理
│   │   ├── Display.js           # 显示管理
│   │   ├── Input.js             # 输入处理
│   │   └── History.js           # 历史记录
│   └── utils/
│       └── constants.js         # 常量定义
└── README.md                    # 本文件
```

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代样式和动画
- **ES6+ JavaScript** - 原生模块化
- **BigInt** - 支持64位整数精确计算
- **LocalStorage** - 历史记录持久化

## 浏览器兼容性

- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 88+

需要支持：
- ES6 Modules
- BigInt
- LocalStorage
- CSS Grid

## 开发调试

在浏览器控制台中，可以访问：

```javascript
// 访问计算器实例
window.calculator

// 查看当前状态
calculator.getState()

// 查看历史记录
calculator.history.getAll()

// 手动切换类型
calculator.switchType('INT8')

// 手动切换进制
calculator.switchBase(16)
```

## 已知问题

1. 某些浏览器在本地文件协议下无法加载ES6模块，建议使用HTTP服务器
2. 移动端键盘输入可能受限，建议使用按钮操作
3. 历史记录有50条限制，超出会自动删除最旧的记录

## 未来计划

- [ ] 表达式解析器（支持直接输入复杂表达式）
- [ ] 亮色主题切换
- [ ] PWA支持（离线使用）
- [ ] 八进制支持
- [ ] 导出历史记录为JSON/TXT
- [ ] 循环移位操作
- [ ] 位字段视图

## 许可证

MIT License

## 作者

Created with Claude Code
