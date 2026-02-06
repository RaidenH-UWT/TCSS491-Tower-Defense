class GameEngine {
    constructor(options) {
        this.ctx = null;
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
        this.baseHealth = 3;
        this.playerMoney = 500;

        // HUD
        this.hud = new HUD(this);
    }

    init(ctx) {
        this.ctx = ctx;
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

        this.ctx.canvas.addEventListener("mousemove", e => { this.mouse = getXandY(e); });
        this.ctx.canvas.addEventListener("click", e => { this.click = getXandY(e); });
        this.ctx.canvas.addEventListener("wheel", e => e.preventDefault());
        this.ctx.canvas.addEventListener("contextmenu", e => e.preventDefault());

        this.ctx.canvas.addEventListener("keydown", e => {
            if (this.winScreen.handleInput(e.key)) return;
            if (this.loseScreen.handleInput(e.key)) return;
            this.keys[e.key] = true;
        });
        this.ctx.canvas.addEventListener("keyup", e => this.keys[e.key] = false);
    }

    addEntity(entity) { this.entities.push(entity); }

    // --- Combined update method that works with win/lose screens ---
    update() {
        if (!this.gameOver) {
            // Update all entities
            for (let entity of this.entities) {
                if (!entity.removeFromWorld) entity.update(this.clockTick);
            }

            // Remove entities marked for removal
            for (let i = this.entities.length - 1; i >= 0; --i) {
                if (this.entities[i].removeFromWorld) this.entities.splice(i, 1);
            }

            // Check win condition
            this.winScreen.checkWinCondition();

            // Check lose condition
            if (this.baseHealth <= 0) this.loseScreen.show();

            // If either screen is visible, game is over
            if (this.winScreen.visible || this.loseScreen.visible) this.gameOver = true;
        }

        // Always update HUD and screens so they draw even after gameOver
        this.hud.update();
        this.winScreen.update(this.clockTick);
        this.loseScreen.update(this.clockTick);
    }

    // --- Add upgradeTower method back ---
    upgradeTower(x, y) {
        for (let entity of this.entities[0].placedTowers) {
            if (Math.floor(entity.x / CELL_SIZE) == x && Math.floor(entity.y / CELL_SIZE) == y) {
                entity.upgrade("1");
            }
        }

        this.hud.update();
        this.winScreen.update(this.clockTick);
        this.loseScreen.update(this.clockTick);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

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
}
