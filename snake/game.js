// 游戏核心配置参数
const config = {
    gridSize: 20,      // 游戏网格的大小（像素），决定蛇和食物的显示尺寸
    speed: 300,        // 初始游戏速度（毫秒/帧），数值越小移动越快
    speedIncrease: 1,  // 每吃一个食物后速度增加的值（毫秒/帧）
    maxSpeed: 50       // 游戏最快速度限制（毫秒/帧），防止游戏难度过高
};

// 游戏运行时状态变量
let snake = [];          // 蛇身体segments数组，每个元素包含x,y坐标
let food = {};          // 食物对象，包含位置和类型信息
let direction = 'right'; // 蛇当前移动方向
let nextDirection = 'right'; // 下一帧的移动方向，用于防止快速按键导致的自身碰撞
let score = 0;          // 当前游戏得分
let gameInterval;       // 游戏主循环的interval引用
let gameRunning = false; // 游戏运行状态标志

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

// 根据当前方向移动蛇的位置
// 实现了边界穿越功能：当蛇到达画布边界时，会从对面出现
function moveSnake() {
    // 创建新的蛇头，基于当前蛇头的位置
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据当前移动方向更新蛇头的坐标
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
    
    // 处理水平方向的边界穿越
    if (head.x < 0) {
        head.x = gridWidth - 1;  // 从右边界出现
    } else if (head.x >= gridWidth) {
        head.x = 0;  // 从左边界出现
    }
    
    // 处理垂直方向的边界穿越
    if (head.y < 0) {
        head.y = gridHeight - 1;  // 从下边界出现
    } else if (head.y >= gridHeight) {
        head.y = 0;  // 从上边界出现
    }
    
    // 将新的蛇头添加到蛇身数组的开头
    snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 食物类型
const FOOD_TYPES = {
    APPLE: 'apple',
    BANANA: 'banana',
    ORANGE: 'orange'
};

let currentFoodType = FOOD_TYPES.APPLE;

// 生成食物
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight),
            type: Object.values(FOOD_TYPES)[Math.floor(Math.random() * 3)]
        };
        
        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
    currentFoodType = food.type;
    
    // 更新光波动画
    waveX = food.x * config.gridSize + config.gridSize/2;
    waveY = food.y * config.gridSize + config.gridSize/2;
}

// 处理蛇吃到食物后的逻辑
function eatFood() {
    // 增加游戏得分（每个食物10分）
    score += 10;
    updateScore();
    
    // 在新位置生成食物
    generateFood();
    
    // 根据配置增加游戏速度，提高难度
    if (config.speed > config.maxSpeed) {
        config.speed -= config.speedIncrease;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, config.speed);
    }
}

// 更新游戏分数显示
function updateScore() {
    // 更新实时分数显示
    scoreDisplay.textContent = `得分: ${score}`;
    // 更新游戏结束时显示的最终分数
    finalScore.textContent = score;
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    gameOverScreen.style.display = 'block';
    
    // 触发烟花爆炸
    createFireworks(snake[0].x * config.gridSize, snake[0].y * config.gridSize);
}

// 烟花粒子系统
class Particle {
    constructor(x, y) {
        this.pos = {x, y};
        this.vel = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.color = `hsl(${Math.random()*360}, 100%, 50%)`;
    }

    update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.alpha -= 0.02;
        this.vel.y += 0.1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

let particles = [];

function createFireworks(x, y) {
    for(let i=0; i<50; i++) {
        particles.push(new Particle(x, y));
    }
}

// 在drawGame中添加粒子更新
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制动态背景
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, 'rgba(240, 206, 245, 0.6)'); // 浅灰色
    bgGradient.addColorStop(1, 'rgba(203, 201, 203, 0.4)'); // 更浅的灰色
    
    // 网格动画
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgb(155, 155, 146)'; // 浅灰色网格线
    for(let x=0; x<gridWidth; x++){
        ctx.beginPath();
        ctx.moveTo(x * config.gridSize + 0.5, 0);
        ctx.lineTo(x * config.gridSize + 0.5, canvas.height);
        ctx.stroke();
    }
    for(let y=0; y<gridHeight; y++){
        ctx.beginPath();
        ctx.moveTo(0, y * config.gridSize + 0.5);
        ctx.lineTo(canvas.width, y * config.gridSize + 0.5);
        ctx.stroke();
    }
    
    // 绘制蛇
    const gradient = ctx.createLinearGradient(
        snake[0].x * config.gridSize,
        snake[0].y * config.gridSize,
        snake[snake.length-1].x * config.gridSize,
        snake[snake.length-1].y * config.gridSize
    );
    gradient.addColorStop(0, 'rgb(134, 165, 245)');
    gradient.addColorStop(0.5, 'rgb(142, 240, 163)');
    gradient.addColorStop(1, 'rgb(195, 245, 204)');

    snake.forEach((segment, index) => {
        //ctx.shadowColor = 'rgb(240, 224, 227)';
        ctx.shadowBlur = index === 0 ? 15 : 8;
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.roundRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize - 1,
            config.gridSize - 1,
            index === 0 ? 8 : 5
        );
        ctx.fill();
    });
    
    // 绘制动态食物
    drawFood();
    
    // 添加环绕粒子
    // ctx.fillStyle = `rgba(244, 15, 53, 0.4)`;
    // const particleCount = 6;
    // for(let i=0; i<particleCount; i++){
    //     const angle = Date.now()/100 + i * Math.PI*2/particleCount;
    //     const radius = Math.sin(Date.now()/200)*2 + 4;
    //     ctx.beginPath();
    //     ctx.arc(
    //         food.x * config.gridSize + config.gridSize/2 + Math.cos(angle)*10,
    //         food.y * config.gridSize + config.gridSize/2 + Math.sin(angle)*10,
    //         radius/2,
    //         0,
    //         Math.PI*2
    //     );
    //     ctx.fill();
    // }
    
    // 更新绘制粒子
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    #game-container {
        position: relative;
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(0, 128, 255, 0.2);
    }
    
    #game-canvas {
        filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
    }
`;
document.head.appendChild(style);


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


let waveRadius = 0;
let waveX = 0;
let waveY = 0;

// 触发光波动画
// 初始化光波动画参数
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    generateFood();
    
    // 初始化光波动画参数
    waveRadius = 1;
    waveX = food.x * config.gridSize + config.gridSize/2;
    waveY = food.y * config.gridSize + config.gridSize/2;
});

// 绘制动态食物
function drawFood() {
    const foodSize = config.gridSize * (0.8 + Math.abs(Math.sin(Date.now()/200)) * 0.2);
    
    ctx.save();
    ctx.translate(
        food.x * config.gridSize + config.gridSize/2,
        food.y * config.gridSize + config.gridSize/2
    );
    ctx.rotate(Date.now()/300);
    
    switch(currentFoodType) {
        case FOOD_TYPES.APPLE:
            drawApple(foodSize);
            break;
        case FOOD_TYPES.BANANA:
            drawBanana(foodSize);
            break;
        case FOOD_TYPES.ORANGE:
            drawOrange(foodSize);
            break;
    }
    
    ctx.restore();
}

function drawApple(size) {
    // 设置苹果的红色
    ctx.fillStyle = 'rgb(255, 59, 48)';
    ctx.shadowColor = 'rgb(180, 0, 0)';
    ctx.shadowBlur = 20;
    
    // 绘制苹果主体
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制苹果叶子
    ctx.fillStyle = 'rgb(76, 217, 100)';
    ctx.beginPath();
    ctx.ellipse(-size/8, -size/2, size/6, size/4, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawBanana(size) {
    // 设置香蕉的黄色
    ctx.fillStyle = 'rgb(255, 204, 0)';
    ctx.shadowColor = 'rgb(180, 140, 0)';
    ctx.shadowBlur = 20;
    
    // 绘制弧形香蕉
    ctx.beginPath();
    ctx.ellipse(0, 0, size/2, size/4, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawOrange(size) {
    // 设置橘子的橙色
    ctx.fillStyle = 'rgb(255, 149, 0)';
    ctx.shadowColor = 'rgb(180, 90, 0)';
    ctx.shadowBlur = 20;
    
    // 绘制橘子主体
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制橘子表面纹理
    ctx.strokeStyle = 'rgba(255, 159, 10, 0.8)';
    ctx.lineWidth = 2;
    for(let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const angle = (i * Math.PI/4);
        ctx.lineTo(Math.cos(angle) * size/2, Math.sin(angle) * size/2);
        ctx.stroke();
    }
}