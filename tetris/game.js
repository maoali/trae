// 游戏配置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

// 方块形状定义
const SHAPES = [
    [[1, 1, 1, 1]],                    // I
    [[1, 1, 1], [0, 1, 0]],            // T
    [[1, 1, 1], [1, 0, 0]],            // L
    [[1, 1, 1], [0, 0, 1]],            // J
    [[1, 1], [1, 1]],                  // O
    [[1, 1, 0], [0, 1, 1]],            // Z
    [[0, 1, 1], [1, 1, 0]]             // S
];

// 游戏状态
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let nextCanvas = document.getElementById('nextPiece');
let nextCtx = nextCanvas.getContext('2d');
let scoreElement = document.getElementById('score');
let gameOverScreen = document.getElementById('gameOver');
let finalScoreElement = document.getElementById('finalScore');
let restartButton = document.getElementById('restartButton');
let score = 0;
let grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;
let gameRunning = true;

// 方块类
class Piece {
    constructor(shape = null, color = null) {
        this.shape = shape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
        this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
        this.x = Math.floor((COLS - this.shape[0].length) / 2);
        this.y = 0;
    }

    draw(ctx, offsetX = 0, offsetY = 0, preview = false) {
        const scale = preview ? 0.8 : 1;
        const blockSize = BLOCK_SIZE * scale;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillStyle = this.color;
                    const drawX = preview ? (x + 1.5) : (this.x + x + offsetX);
                    const drawY = preview ? (y + 1.5) : (this.y + y + offsetY);
                    ctx.fillRect(drawX * blockSize,
                               drawY * blockSize,
                               blockSize - 1,
                               blockSize - 1);
                }
            });
        });
    }
}

// 获取音效元素
let rotateSound = document.getElementById('rotateSound');
let landSound = document.getElementById('landSound');
let clearSound = document.getElementById('clearSound');

// 游戏控制
function moveDown() {
    currentPiece.y++;
    if (hasCollision()) {
        currentPiece.y--;
        merge();
        landSound.play();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = new Piece();
        
        // 检查新方块是否可以放置，或者是否已经触及顶部
        if (hasCollision() || currentPiece.y < 0) {
            gameOver();
            return;
        }
    }
}

function rotate() {
    const oldShape = currentPiece.shape;
    currentPiece.shape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if (hasCollision()) {
        currentPiece.shape = oldShape;
    } else {
        rotateSound.play();
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        clearSound.play();
        score += linesCleared * 100;
        scoreElement.textContent = score;
    }
}

function moveLeft() {
    currentPiece.x--;
    if (hasCollision()) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if (hasCollision()) {
        currentPiece.x--;
    }
}

function rotate() {
    const oldShape = currentPiece.shape;
    currentPiece.shape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if (hasCollision()) {
        currentPiece.shape = oldShape;
    }
}

function hasCollision() {
    return currentPiece.shape.some((row, dy) => {
        return row.some((value, dx) => {
            let x = currentPiece.x + dx;
            let y = currentPiece.y + dy;
            return (
                value &&
                (x < 0 || x >= COLS || y >= ROWS ||
                 (y >= 0 && grid[y][x]))
            );
        });
    });
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                grid[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreElement.textContent = score;
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    // 绘制网格线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    // 绘制垂直线
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }
    // 绘制水平线
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
        ctx.stroke();
    }

    // 绘制已固定的方块
    grid.forEach((row, y) => {
        row.forEach((color, x) => {
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });

    // 绘制当前方块
    currentPiece.draw(ctx);

    // 绘制下一个方块
    nextPiece.draw(nextCtx, 1, 1, true);
}

let lastTime = 0;
const dropInterval = 1000; // 每2秒下落一次

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = score;
}

function reset() {
    gameRunning = true;
    gameOverScreen.style.display = 'none';
    grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    scoreElement.textContent = score;
    currentPiece = new Piece();
    nextPiece = new Piece();
}

function gameLoop(currentTime = 0) {
    if (!gameRunning) return;
    
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > dropInterval) {
        moveDown();
        lastTime = currentTime;
    }
    
    drawBoard();
    requestAnimationFrame(gameLoop);
}

// 键盘控制
document.addEventListener('keydown', event => {
    if (!gameRunning) return;
    
    switch (event.keyCode) {
        case 37: // 左箭头
            moveLeft();
            break;
        case 39: // 右箭头
            moveRight();
            break;
        case 40: // 下箭头
            moveDown();
            break;
        case 38: // 上箭头
            rotate();
            break;
        case 32: // 空格
            while (!hasCollision()) {
                currentPiece.y++;
            }
            currentPiece.y--;
            merge();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = new Piece();
            
            // 检查新方块是否可以放置，或者是否已经触及顶部
            if (hasCollision() || currentPiece.y < 0) {
                gameOver();
                return;
            }
            break;
    }
    drawBoard();
});

// 开始游戏
reset();
gameLoop();

restartButton.addEventListener('click', () => {
    reset();
    gameLoop();
});