class GameEngine {
    constructor(options) {
        this.ctx = null;
        this.map;
        this.entities = [];
        this.click = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.keys = {};
        this.options = options || { debugging: false };

        // Game Speed
        this.speedLevels = [0.5, 1, 2, 3];
        this.currentSpeed = 1;
        this.gameSpeed = this.speedLevels[this.currentSpeed];
        this.speedButton = {
            width: 90,
            height: 40,
            padding: 15
        };

        // Screens
        this.winScreen = new WinScreen(this);
        this.loseScreen = new LoseScreen(this);
        this.gameOver = false;

        // Game state
        this.baseHealth = 20;
        this.playerMoney = 500;
        this.enemyCount = 0;
        this.selectedTower = null;

        // Auto Wave
        this.autoStartWaves = false;
        this.waitingForAutoWave = false;

        // HUD
        this.hud = new HUD(this);

        // Menu
        this.state = "MENU";

        // Pause
        this.isPaused = false;
        this.pauseButton = {
            width: 50,
            height: 50,
            padding: 15
        };
    }

    init(ctx, map) {
        this.ctx = ctx;
        this.map = map;
        this.startInput();
        this.timer = new Timer();

        // Start music on first interaction
        const startMusicOnce = () => {
            music.playMenuMusic();
            window.removeEventListener("click", startMusicOnce);
            window.removeEventListener("keydown", startMusicOnce);
        };

        window.addEventListener("click", startMusicOnce);
        window.addEventListener("keydown", startMusicOnce);
    }

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    }

    startGame(mapFileName) {
        if (mapFileName) {
            const mapData = ASSET_MANAGER.getAsset(`./data/${mapFileName}`);
            this.map = new TowerDefenseMap(mapData, ASSET_MANAGER, this);
            
            this.entities = [];
            
            this.baseHealth = 20;
            this.playerMoney = 500;
            this.enemyCount = 0;
            this.selectedTower = null;
        }

        this.state = "PLAYING";
        music.playMapMusic();
        this.gameOver = false;
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
            // Menu
            if (this.state == "MENU") {
                this.menu.handleClick(this.click);
                return;
            }

            // Pause Button
            if (this.state === "PLAYING" && !this.gameOver) {
                if (insideBox(this.click, this.pauseButton)) {
                    this.isPaused = true;
                    return;
                }
                // next wave button
                if (!this.entities.reduce((acc, val) => acc || val instanceof Enemy, false) && insideBox(this.click, {x: 1024 - 65, y: 768 - 65, width: 50, height: 50})) {
                    this.map.isSpawning = true;
                }
            }

            // Pause Menu Buttons
            if (this.isPaused && this.pauseButtons) {
                for (let btn of this.pauseButtons) {
                    if (insideBox(this.click, btn)) {
                        switch (btn.action) {
                            case "resume":
                                this.isPaused = false;
                                break;
                            case "restart":
                                location.reload(); // quick restart
                                break;
                            case "music":
                                music.toggle();
                                break;
                            case "exit":
                                this.isPaused = false;
                                this.state = "MENU";
                                this.menu.menuState = "MAIN";
                                music.playMenuMusic();
                                break;
                        }
                        return;
                    }
                }
            }
            if (this.isPaused) return;

            if (this.state === "PLAYING" && !this.gameOver) {
                if (insideBox(this.click, this.speedButton)) {
                    this.currentSpeed++;
                    if (this.currentSpeed >= this.speedLevels.length) {
                        this.currentSpeed = 0;
                    }
                    this.gameSpeed = this.speedLevels[this.currentSpeed];
                    return;
                }
            }
            
            if (insideBox(this.click, {x: 0, y: 768, width: 1024, height: 256})) {
                this.hud.handleClick(this.click);
            } else {
                this.map.handleClick(this.click);
            }
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

            // Shortcut for Toggle Next Wave: Cmd + P or Ctrl + P
            if ((e.key === "p" || e.key === "P") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (this.state === "PLAYING" && !this.gameOver) {
                    this.map.isSpawning = true;
                    console.log("Next wave toggled via shortcut");
                }
                return;
            }

            if ((e.key === "p" || e.key === "P") && this.state === "PLAYING" && !this.gameOver) {
                this.isPaused = !this.isPaused;
                return;
            }
            
            // Press N to manually start next wave
            if (e.key === "n" || e.key === "N") {
                if (this.state === "PLAYING" && !this.gameOver) {
                    if (!this.map.waveInProgress) {
                        this.map.isSpawning = true;
                    }
                }
                return;
            }

            // Press M to toggle auto waves
            if (e.key === "m" || e.key === "M") {
                if (this.state === "PLAYING" && !this.gameOver) {
                    this.autoStartWaves = !this.autoStartWaves;
                    console.log("Auto Waves:", this.autoStartWaves ? "ON" : "OFF");
                }
                return;
            }

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
        if (this.state !== "PLAYING") return;
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

            // Auto Wave Logic
            if (this.state === "PLAYING" && !this.gameOver) {
                const noEnemiesAlive = !this.entities.some(e => e instanceof Enemy);
                // Wave finished spawning AND no enemies left
                if (!this.map.waveInProgress && !this.map.isSpawning && noEnemiesAlive) {
                    this.waitingForAutoWave = true;
                }

                if (this.autoStartWaves && this.waitingForAutoWave) {
                    if (this.map.waves.length > 0 || this.map.isEndless) {
                        this.map.isSpawning = true;
                        this.waitingForAutoWave = false;
                    }
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
        if (!this.map.isEndless) {
            // only win if we're not in endless mode
            this.winScreen.update(this.clockTick);
        }
        this.loseScreen.update(this.clockTick);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        this.map.draw(this.ctx);

        if (this.state === "MENU") {
            this.menu.draw(this.ctx);
            return;
        }
        
        for (let entity of this.entities) entity.draw(this.ctx);
        
        this.map.popup?.draw(this.ctx);

        // Draw pause button (only while playing)
        if (this.state === "PLAYING" && !this.gameOver) {
            const btn = this.pauseButton;
            const x = this.ctx.canvas.width - btn.width - btn.padding;
            const y = btn.padding;

            btn.x = x;
            btn.y = y;

            this.ctx.fillStyle = "#222";
            this.ctx.fillRect(x, y, btn.width, btn.height);

            this.ctx.strokeStyle = "white";
            this.ctx.strokeRect(x, y, btn.width, btn.height);

            // Pause icon (two bars)
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(x + 15, y + 12, 6, 25);
            this.ctx.fillRect(x + 29, y + 12, 6, 25);
        }

        // draw speed button
        if (this.state === "PLAYING" && !this.gameOver) {
            const btn = this.speedButton;

            const x = this.pauseButton.x - btn.width - 10;
            const y = this.pauseButton.y;

            btn.x = x;
            btn.y = y;

            this.ctx.fillStyle = "#222";
            this.ctx.fillRect(x, y, btn.width, btn.height);

            this.ctx.strokeStyle = "white";
            this.ctx.strokeRect(x, y, btn.width, btn.height);

            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(`${this.gameSpeed}x`, x + btn.width / 2, y + 25);
        }
        
        // draw the next wave button
        this.ctx.fillStyle = "rgba(0,0,0,0.6)";
        this.ctx.fillRect(1024 - 65, 768 - 65, 50, 50);
        this.ctx.strokeRect(1024 - 65, 768 - 65, 50, 50);
        
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.moveTo(1024 - 60, 768 - 60);
        this.ctx.lineTo(1024 - 60, 768 - 20);
        this.ctx.lineTo(1024 - 20, 768 - 40);
        this.ctx.fill();

        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(
            `Auto Waves: ${this.autoStartWaves ? "ON" : "OFF"} (M)`,
            20,
            30
        );

        this.hud.draw(this.ctx);
        this.winScreen.draw(this.ctx);
        this.loseScreen.draw(this.ctx);
        
        
        if (DEBUG.tools) {
            let elem;
            for (elem of DEBUG_ELEMENTS) {
                elem.style.visibility = "visible";
            }
        }
        
        if (DEBUG.tools) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "12pt serif";
            this.ctx.fillText(`(${Math.round(this.mouse.x)}, ${Math.round(this.mouse.y)})`, this.mouse.x, this.mouse.y);
        }

        if (this.isPaused && this.state === "PLAYING" && !this.gameOver) {
            const ctx = this.ctx;
            ctx.save();

            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            const boxWidth = 400;
            const boxHeight = 350;
            const boxX = ctx.canvas.width / 2 - boxWidth / 2;
            const boxY = ctx.canvas.height / 2 - boxHeight / 2 - 125;
            
            this.pauseMenu = {
                x: boxX,
                y: boxY,
                width: boxWidth,
                height: boxHeight
            };

            // Box
            ctx.fillStyle = "#222";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeStyle = "white";
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = "white";
            ctx.font = "32px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Game Paused", ctx.canvas.width / 2, boxY + 50);

            // Buttons
            const buttonWidth = 250;
            const buttonHeight = 50;
            const spacing = 20;
            const startY = boxY + 90;

            const buttons = [
                { label: "Resume", action: "resume" },
                { label: "Restart", action: "restart" },
                { label: music.currentTrack.paused ? "Play Music 🔊" : "Pause Music 🔇", action: "music" },
                { label: "Exit to Menu", action: "exit" }
            ];

            this.pauseButtons = [];

            for (let i = 0; i < buttons.length; i++) {
                const x = ctx.canvas.width / 2 - buttonWidth / 2;
                const y = startY + i * (buttonHeight + spacing);

                const btn = {
                    x,
                    y,
                    width: buttonWidth,
                    height: buttonHeight,
                    action: buttons[i].action
                };

                this.pauseButtons.push(btn);

                ctx.fillStyle = "#444";
                ctx.fillRect(x, y, buttonWidth, buttonHeight);
                ctx.strokeStyle = "white";
                ctx.strokeRect(x, y, buttonWidth, buttonHeight);

                ctx.fillStyle = "white";
                ctx.font = "20px Arial";
                ctx.fillText(buttons[i].label, ctx.canvas.width / 2, y + 32);
            }
            this.ctx.restore();
        }
    }

    loop() {
        this.clockTick = this.isPaused ? 0 : this.timer.tick() * this.gameSpeed;
        this.update();
        this.draw();
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
    
    /**
     * @param x coordinate in pixels of the center of the circle
     * @param y coordinate in pixels of the center of the circle
     * @param radius of the circle in pixels
     * @return array of enemies inside the circle defined by x, y, and the radius, sorted nearest first
     */
    getEnemiesInRadius(x, y, radius) {
        let inRange = this.entities.filter((a) => a instanceof Enemy && getDistance({x, y}, a) <= radius);
        inRange.sort((a, b) => getDistance({x, y}, a) - getDistance({x, y}, b));
        return inRange;
    }

    addMoney(amount) {
        this.playerMoney += amount;
    }

    spendMoney(amount) {
        if (this.playerMoney < amount) return false;
        this.playerMoney -= amount;
        return true;
    }
    
    takeDamage(damage) {
        this.baseHealth -= damage;
    }
}