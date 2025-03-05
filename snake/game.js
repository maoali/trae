// 游戏配置
const config = {
    gridSize: 20,      // 网格大小
    speed: 150,        // 初始游戏速度（毫秒）
    speedIncrease: 5,  // 每吃一个食物增加的速度
    maxSpeed: 50       // 最快速度限制
};

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval;
let gameRunning = false;

// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const finalScore = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// 计算画布网格尺寸
const gridWidth = canvas.width / config.gridSize;
const gridHeight = canvas.height / config.gridSize;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameRunning = true;
    
    // 更新分数显示
    updateScore();
    
    // 生成第一个食物
    generateFood();
    
    // 隐藏游戏结束屏幕
    gameOverScreen.style.display = 'none';
    
    // 开始游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, config.speed);
}

// 游戏主循环
function gameLoop() {
    // 更新蛇的方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // 如果没吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 绘制游戏
    drawGame();
}

// 移动蛇
function moveSnake() {
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动蛇头
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 处理边界穿越
    if (head.x < 0) {
        head.x = gridWidth - 1;
    } else if (head.x >= gridWidth) {
        head.x = 0;
    }
    
    if (head.y < 0) {
        head.y = gridHeight - 1;
    } else if (head.y >= gridHeight) {
        head.y = 0;
    }
    
    // 添加新的蛇头
    snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 只检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 吃食物
function eatFood() {
    // 增加分数
    score += 10;
    updateScore();
    
    // 生成新食物
    generateFood();
    
    // 增加游戏速度
    if (config.speed > config.maxSpeed) {
        config.speed -= config.speedIncrease;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, config.speed);
    }
}

// 更新分数显示
function updateScore() {
    scoreDisplay.textContent = `得分: ${score}`;
    finalScore.textContent = score;
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    gameOverScreen.style.display = 'block';
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50'; // 深绿色蛇头
        } else {
            ctx.fillStyle = '#8BC34A'; // 浅绿色蛇身
        }
        
        ctx.fillRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize - 1,
            config.gridSize - 1
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5722'; // 橙红色食物
    ctx.fillRect(
        food.x * config.gridSize,
        food.y * config.gridSize,
        config.gridSize - 1,
        config.gridSize - 1
    );
    
    // 绘制网格（可选，取消注释以显示网格）
    
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    
    // 防止蛇立即向反方向移动（无法直接掉头）
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 重新开始按钮事件
restartButton.addEventListener('click', initGame);

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);