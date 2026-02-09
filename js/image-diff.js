/**
 * Image Diff Tool
 * 图片对比工具
 */

class ImageDiffTool {
  constructor() {
    this.img1Data = null;
    this.img2Data = null;
    this.canvas1 = document.getElementById('canvas1');
    this.canvas2 = document.getElementById('canvas2');
    this.ctx1 = this.canvas1.getContext('2d');
    this.ctx2 = this.canvas2.getContext('2d');
    this.diffCanvas = document.getElementById('diff-canvas');
    this.diffCtx = this.diffCanvas.getContext('2d');

    this.currentView = 'side';
    this.sliderPosition = 50;

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    console.log('Image Diff Tool initialized');
  }

  cacheElements() {
    // 上传相关
    this.upload1 = document.getElementById('upload1');
    this.upload2 = document.getElementById('upload2');
    this.file1 = document.getElementById('file1');
    this.file2 = document.getElementById('file2');
    this.preview1 = document.getElementById('preview1');
    this.preview2 = document.getElementById('preview2');
    this.img1 = document.getElementById('img1');
    this.img2 = document.getElementById('img2');
    this.remove1 = document.getElementById('remove1');
    this.remove2 = document.getElementById('remove2');

    // 控制相关
    this.tolerance = document.getElementById('tolerance');
    this.toleranceValue = document.getElementById('tolerance-value');
    this.highlightColor = document.getElementById('highlight-color');
    this.opacity = document.getElementById('opacity');
    this.opacityValue = document.getElementById('opacity-value');
    this.circleRadius = document.getElementById('circle-radius');
    this.circleRadiusValue = document.getElementById('circle-radius-value');
    this.compareBtn = document.getElementById('compare-btn');
    this.clearBtn = document.getElementById('clear-btn');

    // 结果相关
    this.resultSection = document.getElementById('result-section');
    this.diffPercent = document.getElementById('diff-percent');
    this.diffPixels = document.getElementById('diff-pixels');
    this.viewBtns = document.querySelectorAll('.view-btn');

    // 滑块对比相关
    this.sliderContainer = document.getElementById('slider-container');
    this.sliderImage2 = document.getElementById('slider-image-2');
    this.sliderHandle = document.getElementById('slider-handle');

    // 并排对比相关
    this.sideImg1 = document.getElementById('side-img1');
    this.sideImg2 = document.getElementById('side-img2');

    // 滑块对比图片
    this.sliderImg1 = document.getElementById('slider-img1');
    this.sliderImg2 = document.getElementById('slider-img2');

    // 下载
    this.downloadBtn = document.getElementById('download-btn');
  }

  bindEvents() {
    // 文件上传事件
    this.file1.addEventListener('change', (e) => this.handleFileSelect(e, 1));
    this.file2.addEventListener('change', (e) => this.handleFileSelect(e, 2));

    // 拖拽上传
    this.setupDragDrop(this.upload1, 1);
    this.setupDragDrop(this.upload2, 2);

    // 移除图片
    this.remove1.addEventListener('click', () => this.removeImage(1));
    this.remove2.addEventListener('click', () => this.removeImage(2));

    // 设置滑块
    this.tolerance.addEventListener('input', (e) => {
      this.toleranceValue.textContent = e.target.value;
      if (this.img1Data && this.img2Data) {
        this.compareImages();
      }
    });

    this.opacity.addEventListener('input', (e) => {
      this.opacityValue.textContent = e.target.value + '%';
      if (this.img1Data && this.img2Data) {
        this.compareImages();
      }
    });

    this.highlightColor.addEventListener('input', () => {
      if (this.img1Data && this.img2Data) {
        this.compareImages();
      }
    });

    this.circleRadius.addEventListener('input', (e) => {
      this.circleRadiusValue.textContent = e.target.value;
      if (this.img1Data && this.img2Data) {
        this.compareImages();
      }
    });

    // 按钮事件
    this.compareBtn.addEventListener('click', () => this.compareImages());
    this.clearBtn.addEventListener('click', () => this.clearAll());

    // 视图切换
    this.viewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.mode));
    });

    // 滑块拖动
    this.setupSlider();

    // 下载
    this.downloadBtn.addEventListener('click', () => this.downloadDiff());
  }

  setupDragDrop(uploadBox, index) {
    uploadBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadBox.classList.add('drag-over');
    });

    uploadBox.addEventListener('dragleave', () => {
      uploadBox.classList.remove('drag-over');
    });

    uploadBox.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadBox.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.loadImage(file, index);
      }
    });
  }

  handleFileSelect(e, index) {
    const file = e.target.files[0];
    if (file) {
      this.loadImage(file, index);
    }
  }

  loadImage(file, index) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const preview = document.getElementById(`preview${index}`);
        const uploadBox = document.getElementById(`upload${index}`);

        // 预览图片
        document.getElementById(`img${index}`).src = e.target.result;

        // 显示预览，隐藏上传框
        preview.classList.add('active');
        uploadBox.style.display = 'none';

        // 存储图片数据
        const canvas = document.getElementById(`canvas${index}`);
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (index === 1) {
          this.img1Data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.img1Width = canvas.width;
          this.img1Height = canvas.height;
        } else {
          this.img2Data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.img2Width = canvas.width;
          this.img2Height = canvas.height;
        }

        // 检查是否两张图片都已上传
        this.checkBothImages();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(index) {
    const preview = document.getElementById(`preview${index}`);
    const uploadBox = document.getElementById(`upload${index}`);
    const fileInput = document.getElementById(`file${index}`);

    preview.classList.remove('active');
    uploadBox.style.display = 'flex';
    fileInput.value = '';

    if (index === 1) {
      this.img1Data = null;
    } else {
      this.img2Data = null;
    }

    this.checkBothImages();
  }

  checkBothImages() {
    if (this.img1Data && this.img2Data) {
      this.compareBtn.disabled = false;
    } else {
      this.compareBtn.disabled = true;
      this.resultSection.style.display = 'none';
    }
  }

  compareImages() {
    if (!this.img1Data || !this.img2Data) {
      return;
    }

    // 调整画布大小以适应较小的图片
    const width = Math.min(this.img1Width, this.img2Width);
    const height = Math.min(this.img1Height, this.img2Height);

    this.diffCanvas.width = width;
    this.diffCanvas.height = height;

    // 创建调整大小后的图像数据
    const scaledImg1 = this.scaleImageData(this.img1Data, width, height, this.img1Width, this.img1Height);
    const scaledImg2 = this.scaleImageData(this.img2Data, width, height, this.img2Width, this.img2Height);

    // 设置图片源
    this.sideImg1.src = this.img1.src;
    this.sideImg2.src = this.img2.src;
    this.sliderImg1.src = this.img1.src;
    this.sliderImg2.src = this.img2.src;

    // 计算差异
    const tolerance = parseInt(this.tolerance.value);
    const opacity = parseInt(this.opacity.value) / 100;
    const highlightColor = this.hexToRgb(this.highlightColor.value);
    const circleRadius = parseInt(this.circleRadius?.value || '10');

    // 先绘制第一张图作为背景
    const bgData = this.diffCtx.createImageData(width, height);
    for (let i = 0; i < bgData.data.length; i += 4) {
      bgData.data[i] = scaledImg1.data[i];
      bgData.data[i + 1] = scaledImg1.data[i + 1];
      bgData.data[i + 2] = scaledImg1.data[i + 2];
      bgData.data[i + 3] = 255;
    }
    this.diffCtx.putImageData(bgData, 0, 0);

    // 找出差异像素
    const diffPixels = new Set();
    let diffCount = 0;

    for (let i = 0; i < scaledImg1.data.length; i += 4) {
      const r1 = scaledImg1.data[i];
      const g1 = scaledImg1.data[i + 1];
      const b1 = scaledImg1.data[i + 2];

      const r2 = scaledImg2.data[i];
      const g2 = scaledImg2.data[i + 1];
      const b2 = scaledImg2.data[i + 2];

      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

      if (diff > tolerance * 3) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        diffPixels.add(`${x},${y}`);
        diffCount++;
      }
    }

    // 使用圆圈标记差异区域
    this.diffCtx.strokeStyle = `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${opacity})`;
    this.diffCtx.lineWidth = 2;

    // 对差异像素进行聚类，减少圆圈数量
    const circles = this.clusterDiffPixels(diffPixels, width, height, circleRadius);

    // 绘制圆圈
    circles.forEach(circle => {
      this.diffCtx.beginPath();
      this.diffCtx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      this.diffCtx.stroke();

      // 半透明填充
      this.diffCtx.fillStyle = `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${opacity * 0.3})`;
      this.diffCtx.fill();
    });

    // 更新统计
    const totalPixels = width * height;
    const diffPercentage = ((diffCount / totalPixels) * 100).toFixed(2);
    this.diffPercent.textContent = `差异: ${diffPercentage}%`;
    this.diffPixels.textContent = `差异像素: ${diffCount}`;

    // 高亮显示差异百分比
    if (diffPercentage > 10) {
      this.diffPercent.classList.add('highlight');
    } else {
      this.diffPercent.classList.remove('highlight');
    }

    // 显示结果区域
    this.resultSection.style.display = 'block';
  }

  clusterDiffPixels(diffPixels, width, height, circleRadius) {
    const visited = new Set();
    const circles = [];
    const pixelsArray = Array.from(diffPixels);

    // 将差异像素按位置分组
    const grid = new Map();
    const gridSize = circleRadius * 2;

    pixelsArray.forEach(pixel => {
      const [x, y] = pixel.split(',').map(Number);
      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);
      const key = `${gridX},${gridY}`;

      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key).push({ x, y });
    });

    // 对每个网格计算一个圆圈
    grid.forEach((pixels) => {
      if (pixels.length === 0) return;

      // 计算中心点
      const centerX = Math.round(pixels.reduce((sum, p) => sum + p.x, 0) / pixels.length);
      const centerY = Math.round(pixels.reduce((sum, p) => sum + p.y, 0) / pixels.length);

      // 计算半径（基于像素分布）
      const maxDist = pixels.reduce((max, p) => {
        const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
        return Math.max(max, dist);
      }, 0);

      circles.push({
        x: centerX,
        y: centerY,
        radius: Math.max(circleRadius, Math.min(maxDist + circleRadius, circleRadius * 3))
      });
    });

    return circles;
  }

  scaleImageData(imageData, newWidth, newHeight, oldWidth, oldHeight) {
    const scaledData = new ImageData(newWidth, newHeight);

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * (oldWidth / newWidth));
        const srcY = Math.floor(y * (oldHeight / newHeight));
        const srcIndex = (srcY * oldWidth + srcX) * 4;
        const destIndex = (y * newWidth + x) * 4;

        scaledData.data[destIndex] = imageData.data[srcIndex];
        scaledData.data[destIndex + 1] = imageData.data[srcIndex + 1];
        scaledData.data[destIndex + 2] = imageData.data[srcIndex + 2];
        scaledData.data[destIndex + 3] = imageData.data[srcIndex + 3];
      }
    }

    return scaledData;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 0, b: 0 };
  }

  switchView(mode) {
    this.currentView = mode;

    // 更新按钮状态
    this.viewBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      }
    });

    // 更新视图显示
    document.getElementById('view-side').style.display = mode === 'side' ? 'block' : 'none';
    document.getElementById('view-slider').style.display = mode === 'slider' ? 'block' : 'none';
    document.getElementById('view-diff').style.display = mode === 'diff' ? 'block' : 'none';

    // 下载按钮只在差异标记模式下可用
    this.downloadBtn.style.display = mode === 'diff' ? 'inline-flex' : 'none';
  }

  setupSlider() {
    let isDragging = false;

    const updateSlider = (e) => {
      const rect = this.sliderContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

      this.sliderPosition = percent;
      this.sliderImage2.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      this.sliderHandle.style.left = `${percent}%`;
    };

    this.sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateSlider(e);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // 触摸支持
    this.sliderContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      const touch = e.touches[0];
      const rect = this.sliderContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

      this.sliderPosition = percent;
      this.sliderImage2.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      this.sliderHandle.style.left = `${percent}%`;
    });

    this.sliderContainer.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.sliderContainer.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

        this.sliderPosition = percent;
        this.sliderImage2.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        this.sliderHandle.style.left = `${percent}%`;
      }
    });

    this.sliderContainer.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  downloadDiff() {
    const link = document.createElement('a');
    link.download = 'image-diff.png';
    link.href = this.diffCanvas.toDataURL('image/png');
    link.click();
  }

  clearAll() {
    this.removeImage(1);
    this.removeImage(2);
    this.resultSection.style.display = 'none';

    // 重置设置
    this.tolerance.value = 10;
    this.toleranceValue.textContent = '10';
    this.highlightColor.value = '#ff0000';
    this.opacity.value = 70;
    this.opacityValue.textContent = '70%';
    this.circleRadius.value = 10;
    this.circleRadiusValue.textContent = '10';
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ImageDiffTool();

  // 欢迎消息
  console.log('%c Image Diff Tool ', 'background: #007acc; color: #ffffff; font-size: 16px; font-weight: bold; padding: 4px 8px;');
  console.log('图片对比工具已加载');
  console.log('功能:');
  console.log('  - 上传两张图片进行对比');
  console.log('  - 调整差异容忍度和显示颜色');
  console.log('  - 三种查看模式：并排、滑块、差异标记');
  console.log('  - 下载差异标注图');
});
