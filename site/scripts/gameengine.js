class GameEngine {
    constructor(options) {
        this.ctx = null;
        this.map;
        this.entities = [];
        this.click = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.keys = {};
        this.options = options || { debugging: false };

        // Screens
        this.winScreen = new WinScreen(this);
        this.loseScreen = new LoseScreen(this);
        this.gameOver = false;

        // Game state
        this.baseHealth = 20;
        this.playerMoney = 500;
        this.enemyCount = 0;

        // HUD
        this.hud = new HUD(this);
    }

    init(ctx, map) {
        this.ctx = ctx;
        this.map = map;
        this.startInput();
        this.timer = new Timer();
    }

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    }

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            this.mouse = getXandY(e);
            if (DEBUG.io) console.log("MOUSE MOVED: ", this.mouse);
        });
        this.ctx.canvas.addEventListener("click", e => {
            this.click = getXandY(e);
            if (DEBUG.io) console.log("CLICK: ", this.click);
            this.map.handleClick(this.click);
        });
        this.ctx.canvas.addEventListener("wheel", e => {
            e.preventDefault()
            if (DEBUG.io) console.log("WHEEL: ", e);
        });
        this.ctx.canvas.addEventListener("contextmenu", e =>{
            e.preventDefault()
            if (DEBUG.io) console.log("RIGHT CLICK: ", e);
        });

        this.ctx.canvas.addEventListener("keydown", e => {
            if (this.winScreen.handleInput(e.key)) return;
            if (this.loseScreen.handleInput(e.key)) return;
            this.keys[e.key] = true;
            if (DEBUG.io) console.log("KEY DOWN: ", e,key);
        });
        this.ctx.canvas.addEventListener("keyup", e => {
            this.keys[e.key] = false;
            if (DEBUG.io) console.log("KEY UP: ", e,key);
        });
    }

    addEntity(entity) {
        if (entity instanceof Enemy) {
            this.enemyCount++;
        }
        this.entities.push(entity);
    }

    // --- Combined update method that works with win/lose screens ---
    update() {
        if (!this.gameOver) {
            // Update map
            this.map.update(this.clockTick);
            // Update all enemies
            for (let entity of this.entities) {
                if (!entity.removeFromWorld) entity.update(this.clockTick);
            }

            // Remove enemies marked for removal
            for (let i = this.entities.length - 1; i >= 0; --i) {
                if (this.entities[i].removeFromWorld) {
                    if (this.entities[i] instanceof Enemy) {
                        this.addMoney(this.entities[i].bounty);
                        this.enemyCount--;
                    }
                    this.entities.splice(i, 1);
                }
            }

            // Check win condition
            this.winScreen.checkWinCondition();

            // Check lose condition
            if (this.baseHealth <= 0) this.loseScreen.show();

            // If either screen is visible, game is over
            if (this.winScreen.visible || this.loseScreen.visible) this.gameOver = true;
        }

        // Always update HUD and screens so they draw even after gameOver
        this.hud.update(this.clockTick);
        this.winScreen.update(this.clockTick);
        this.loseScreen.update(this.clockTick);
    }

    upgradeTower(x, y) {
        for (let tower of this.map.placedTowers) {
            if (Math.floor(tower.x / CELL_SIZE) == x && Math.floor(tower.y / CELL_SIZE) == y) {
                // TODO: replace "1" with a value from the user, via the UI
                tower.upgrade("1");
            }
        }

        this.hud.update();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        this.map.draw(this.ctx);
        for (let entity of this.entities) entity.draw(this.ctx);

        this.hud.draw(this.ctx);
        this.winScreen.draw(this.ctx);
        this.loseScreen.draw(this.ctx);
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }

    addMoney(amount) {
        this.playerMoney += amount;
    }

    spendMoney(amount) {
        if (this.playerMoney < amount) return false;
        this.playerMoney -= amount;
        return true;
    }
}
