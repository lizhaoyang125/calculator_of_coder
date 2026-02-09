/**
 * Home Page JavaScript
 * 主页交互逻辑
 */

class HomePage {
  constructor() {
    this.currentFilter = 'all';
    this.toolCards = [];
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.animateCards();
  }

  cacheElements() {
    this.toolsGrid = document.getElementById('tools-grid');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.toolCards = document.querySelectorAll('.tool-card:not(.tool-card-coming-soon)');
  }

  bindEvents() {
    // 分类过滤器点击事件
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterClick(e));
    });

    // 工具卡片悬停动画
    this.toolCards.forEach(card => {
      card.addEventListener('mouseenter', () => this.handleCardHover(card));
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  handleFilterClick(e) {
    const clickedBtn = e.target;
    const filter = clickedBtn.dataset.filter;

    // 更新按钮状态
    this.filterBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });

    // 过滤工具卡片
    this.filterTools(filter);
  }

  filterTools(filter) {
    this.currentFilter = filter;

    this.toolCards.forEach(card => {
      const category = card.dataset.category;

      if (filter === 'all' || category === filter) {
        card.style.display = '';
        card.style.animation = 'none';
        // 强制重绘
        card.offsetHeight;
        card.style.animation = 'fade-in 0.3s ease-out';
      } else {
        card.style.display = 'none';
      }
    });
  }

  handleCardHover(card) {
    // 可以在这里添加额外的悬停逻辑
    // 目前通过 CSS 处理
  }

  handleKeyboard(e) {
    // 数字键快速切换过滤器
    if (e.key === '1') {
      this.triggerFilter('all');
    } else if (e.key === '2') {
      this.triggerFilter('utility');
    } else if (e.key === '3') {
      this.triggerFilter('converter');
    } else if (e.key === '4') {
      this.triggerFilter('generator');
    }
  }

  triggerFilter(filter) {
    const btn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (btn) {
      btn.click();
    }
  }

  animateCards() {
    // 为工具卡片添加交错动画
    this.toolCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-in');
    });
  }
}

// 初始化主页
document.addEventListener('DOMContentLoaded', () => {
  new HomePage();

  // 欢迎消息
  console.log('%c Developer Tools ', 'background: #007acc; color: #ffffff; font-size: 16px; font-weight: bold; padding: 4px 8px;');
  console.log('欢迎访问开发者工具箱!');
  console.log('快捷键:');
  console.log('  1 - 显示全部工具');
  console.log('  2 - 实用工具');
  console.log('  3 - 转换工具');
  console.log('  4 - 生成器');

  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
});
