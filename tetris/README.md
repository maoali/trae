# 俄罗斯方块游戏

一个使用HTML5 Canvas和JavaScript实现的经典俄罗斯方块游戏。

## 功能特点

- 经典的俄罗斯方块玩法
- 支持7种不同形状的方块
- 实时显示下一个方块预览
- 计分系统
- 游戏结束提示
- 方块旋转和移动音效
- 清除行音效
- 响应式界面设计

## 项目结构

```
.
├── index.html      # 游戏主页面
├── game.js         # 游戏核心逻辑
└── sounds/         # 游戏音效文件
    ├── clear.wav   # 清除行音效
    ├── land.wav    # 方块落地音效
    └── rotate.wav  # 旋转音效
```

## 安装说明

1. 克隆或下载本项目到本地
2. 使用现代浏览器（如Chrome、Firefox、Edge等）直接打开`index.html`文件即可开始游戏

## 游戏操作

- ←：左移方块
- →：右移方块
- ↑：旋转方块
- ↓：加速下落
- 空格：直接下落到底部

## 游戏规则

1. 方块会从屏幕顶部落下
2. 使用方向键控制方块移动和旋转
3. 当一行被完全填满时，该行会被消除，并获得分数
4. 每消除一行可得100分
5. 当方块堆积到屏幕顶部时，游戏结束

## 技术栈

- HTML5 Canvas
- JavaScript
- CSS3

## 开发说明

游戏使用原生JavaScript开发，不依赖任何外部库。主要使用了以下HTML5技术：

- Canvas API用于游戏渲染
- Web Audio API用于音效播放
- RequestAnimationFrame用于游戏循环

## 浏览器支持

支持所有现代浏览器，包括：

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献

欢迎提交Issue和Pull Request来改进游戏。