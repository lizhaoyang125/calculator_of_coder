/**
 * Main Entry Point
 * 程序员计算器应用入口
 */
import { Calculator } from './modules/Calculator.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 初始化计算器
  const calculator = new Calculator();

  // 将计算器实例挂载到window对象，方便调试
  window.calculator = calculator;

  // 显示欢迎信息（可选）
  console.log('%c Programmer Calculator ', 'background: #007acc; color: #ffffff; font-size: 16px; font-weight: bold; padding: 4px 8px;');
  console.log('Calculator initialized successfully!');
  console.log('Access calculator instance via window.calculator');
  console.log('Keyboard shortcuts:');
  console.log('  H - Switch to HEX');
  console.log('  D - Switch to DEC');
  console.log('  B - Switch to BIN');
  console.log('  C / Escape - Clear');
  console.log('  Enter - Calculate');
  console.log('  Backspace - Delete');

  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });

  // 添加页面可见性变化处理（可选）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时可以做一些清理工作
      console.log('Page hidden');
    } else {
      // 页面恢复时可以做一些恢复工作
      console.log('Page visible');
    }
  });

  // 添加离线/在线状态监听（可选）
  window.addEventListener('online', () => {
    console.log('Network online');
  });

  window.addEventListener('offline', () => {
    console.log('Network offline');
  });

  // Service Worker 注册（如果需要PWA功能）
  if ('serviceWorker' in navigator) {
    // 暂时注释掉，需要时可以启用
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => {
    //     console.log('Service Worker registered:', registration);
    //   })
    //   .catch(error => {
    //     console.error('Service Worker registration failed:', error);
    //   });
  }
});
