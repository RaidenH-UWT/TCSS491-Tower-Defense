const CELL_SIZE = 64;
const CELL_DESIGN = {
  O: "white", // empty cell
  B: "green", // buildable cell
  F: "blue", // start cell
  G: "red", // goal cell
  N: "./assets/path_north.png", // north path
  S: "./assets/path_south.png", // south path
  E: "./assets/path_east.png", // east path
  W: "./assets/path_west.png" // west path
};

class TowerDefenseMap {
  constructor(json, assetManager, gameEngine) {
    this.name = json.name;
    this.background = "./assets/" + json.background;
    this.cost = json.cost;
    this.cells = json.cells;
    this.rows = this.cells.length;
    this.cols = this.cells[0].length;

    this.placedTowers = [];
    this.selectedCell = null;
    
    this.isSpawning = false;
    this.spawnTimer = 0;
    
    this.assetManager = assetManager;
    this.gameEngine = gameEngine;
    this.portal;
    this.portalOpened = false;

    // waves
    this.waves = json.waves;
    this.totalWaves = json.waves.length;
    this.currentWave = 0;
    this.wavesCompleted = 0;              // FIX 1: track completed waves separately
    this.waveInProgress = false;
    this.isEndless = json.isEndless ?? false; // FIX 2: read from JSON instead of hardcoding false
  }

  update(clockTick) {
    // update all towers
    for (let i = 0; i < this.placedTowers.length; i++) {
      if (this.placedTowers[i].removeFromWorld) {
        this.placedTowers.splice(i, 1);
      } else {
        this.placedTowers[i].update(clockTick);
      }
    }
    
    if (this.portal) {
      this.portal.update(clockTick);
    }
    
    if (this.popup?.removeFromWorld) {
      this.popup = null;
    }
    
    if (this.isEndless && this.waves.length == 0) {
      this.waves.push(this.generateWave());
      if (DEBUG.wave) console.log("Added new wave", this.waves);
    }
    
    // wave spawning logic
    if (this.isSpawning && this.waves.length > 0) {  
      // detect start of a new wave
      if (!this.waveInProgress) {
        this.currentWave++;
        this.waveInProgress = true;
      }

      // Wave just started → ensure portal exists
      if (!this.portal) {
        this.spawnPortal();
        this.portalOpened = true;
      }
      
      this.spawnTimer += clockTick;

      if (this.spawnTimer >= this.waves[0][0].delay) {
        if (DEBUG.wave) console.log("spawning enemy");

        const enemyData = this.waves[0].shift();
        this.gameEngine.addEntity(new Enemy(this.assetManager.getAsset(`./data/${enemyData.enemy}.json`), this, this.gameEngine));
        this.spawnTimer = 0;
        
        if (DEBUG.wave) console.log("waves left: " + this.waves[0].length);
        
        if (this.waves[0].length == 0) {
          // we've finished a wave
          this.waves.shift();
          this.wavesCompleted++;          // FIX 3: increment completed counter
          this.isSpawning = false;
          this.waveInProgress = false;
          if (DEBUG.wave) console.log("wave done");
          if (DEBUG.wave) console.log(this.waves);

          this.removePortal();
        }
      }
    }
    
    if (this.portalOpened && this.waves.length == 0 && this.portal) {
      this.removePortal();
    }
    
    if (this.popup != null) {
      this.popup.update(clockTick);
    }
  }

  draw(ctx) {
    const bgImg = this.assetManager.getAsset(this.background);
    if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, 1024, 768); 
    }
    for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.cells[r][c];
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;

                if (cell === "B" || cell === "O") {
                    continue; 
                }

                if (DEBUG.tools) {
                    if (cell === "E") ctx.drawImage(this.assetManager.getAsset("./assets/path_east.png"), x, y, CELL_SIZE, CELL_SIZE);
                    else if (cell === "W") ctx.drawImage(this.assetManager.getAsset("./assets/path_west.png"), x, y, CELL_SIZE, CELL_SIZE);
                    else if (cell === "N") ctx.drawImage(this.assetManager.getAsset("./assets/path_north.png"), x, y, CELL_SIZE, CELL_SIZE);
                    else if (cell === "S") ctx.drawImage(this.assetManager.getAsset("./assets/path_south.png"), x, y, CELL_SIZE, CELL_SIZE);
                }
            }
    }
    for (let tower of this.placedTowers) {
            tower.draw(ctx);
        }
    if (this.portal) {
      this.portal.draw(ctx);
    }
    this.drawTowerPreview(ctx);
  }

  drawTowerPreview(ctx) {
    if (!this.gameEngine.selectedTower) return;

    const mouseX = this.gameEngine.mouse.x;
    const mouseY = this.gameEngine.mouse.y;

    if (mouseY > this.rows * CELL_SIZE) return;

    const col = Math.floor(mouseX / CELL_SIZE);
    const row = Math.floor(mouseY / CELL_SIZE);

    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;

    const cellType = this.cells[row][col];

    const towerX = col * CELL_SIZE + CELL_SIZE / 2;
    const towerY = row * CELL_SIZE + CELL_SIZE / 2;

    const isValidPlacement = cellType === "B" && 
      !this.placedTowers.some(t => insideBox({x: towerX, y: towerY}, 
        {x: t.x - CELL_SIZE / 2, y: t.y - CELL_SIZE / 2, width: 64, height: 64}));

    const towerData = ASSET_MANAGER.getAsset(`./data/${this.gameEngine.selectedTower}.json`);
    if (!towerData || !towerData.upgrades?.[0]) return;

    const upgradeData = towerData.upgrades[0];
    const animConfig = upgradeData.animations.idle;
    const attackData = upgradeData.attack;

    if (!animConfig) return;

    const previewAnim = new Animator(
      ASSET_MANAGER.getAsset("./assets/" + animConfig.spritesheet),
      animConfig.xStart, animConfig.yStart, animConfig.width, animConfig.height,
      animConfig.frameCount, animConfig.frameDuration, animConfig.framePadding,
      animConfig.reverse, animConfig.loop, animConfig.rotation, animConfig.loopStart, animConfig.loopEnd
    );

    ctx.save();
    
    ctx.strokeStyle = "rgba(235, 13, 13, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(towerX, towerY, attackData.range * CELL_SIZE, 0, Math.PI * 2);
    ctx.stroke();
    
    if (isValidPlacement) {
      ctx.globalAlpha = 0.6;
    } else {
      ctx.globalAlpha = 0.3;
    }

    previewAnim.drawFrame(
      this.gameEngine.clockTick,
      ctx,
      towerX - CELL_SIZE / 2,
      towerY - CELL_SIZE / 2,
      1
    );

    if (!isValidPlacement) {
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = "rgba(255, 100, 100, 1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(towerX, towerY, CELL_SIZE / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCell(ctx, row, col, design, isSprite) {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    
    if (isSprite) {
      ctx.drawImage(this.assetManager.getAsset(design), x, y);
    } else {
      ctx.fillStyle = design;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }
    
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
  }

  handleClick(pos) {
    const col = Math.floor(pos.x / CELL_SIZE);
    const row = Math.floor(pos.y / CELL_SIZE);
    
    if (
      row < 0 ||
      row >= this.rows ||
      col < 0 ||
      col >= this.cols
    ) return;
    
    const cellType = this.cells[row][col];
    
    if (insideBox(pos, this.popup)) {
      this.popup.handleClick(pos);
    } else if (this.placedTowers.filter((a) => insideBox(pos, {x: a.x - CELL_SIZE / 2, y: a.y - CELL_SIZE / 2, width: 64, height: 64})).length > 0) {
      const tower = this.placedTowers.filter((a) => insideBox(pos, {x: a.x - CELL_SIZE / 2, y: a.y - CELL_SIZE / 2, width: 64, height: 64}))[0]
      this.popup = new Popup(tower);
    } else {
      this.popup = null;
      if (!this.gameEngine.selectedTower) {
        return;
      }
      
      if (cellType === "B") {
        const towerX = col * CELL_SIZE + CELL_SIZE / 2;
        const towerY = row * CELL_SIZE + CELL_SIZE / 2;
        
        const towerData = ASSET_MANAGER.getAsset(`./data/${this.gameEngine.selectedTower}.json`);
        const cost = towerData.upgrades[0].cost;
        
        if (!this.gameEngine.spendMoney(cost)) {
          if (DEBUG.io) console.log("Not enough money to place tower. Cost: ", cost);
          return;
        }
        
        const tower = new Tower(towerData, towerX, towerY, this.gameEngine);
        
        this.placedTowers.push(tower);
        if (DEBUG.io) console.log("Tower placed. Cost: ", cost, "Money left: ", this.gameEngine.playerMoney);
        
        this.gameEngine.selectedTower = null;
      }
    }
    
    this.selectedCell = { row, col };
  }
  
  getStartCell() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c] === "F") {
          return { row: r, col: c };
        }
      }
    }
  }
  
  getGoalCell() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c] === "G") {
          return { row: r, col: c };
        }
      }
    }
  }

  getNextCell(row, col) {
    const dir = this.cells[row][col];
    if (dir === "F") {
      return { row, col: col + 1 };
    }

    switch (dir) {
      case "N": return { row: row - 1, col };
      case "S": return { row: row + 1, col };
      case "E": return { row, col: col + 1 };
      case "W": return { row, col: col - 1 };
      case "G": return null;
      default: return null;
    }
  }

  spawnPortal() {
    if (this.portal) return;
    const start = this.getStartCell();
    const x = start.col * CELL_SIZE + CELL_SIZE / 2;
    const y = start.row * CELL_SIZE + CELL_SIZE / 2;

    this.portal = new Portal(x, y);
  }

  removePortal() {
    if (!this.portal) return;

    this.portal.close();
    this.portal = null;
  }

  /**
   * Randomly generate and add a wave of enemies, based on the total money the player has collected
   */
  generateWave() {
    const totalValue = this.gameEngine.playerMoney + this.placedTowers.map((a) => a.getValue()).reduce((acc, val) => acc + val, 0);
    const enemies = ENEMIES.map((a) => {
      return {name: a, bounty: ASSET_MANAGER.getAsset("./data/" + a + ".json").bounty};
    });
    let wave = [];
    while (wave.map((a) => a.bounty).reduce((acc, val) => acc + val, 0) < totalValue * 0.15) {
      wave.push(enemies[Math.floor(Math.sqrt(Math.random()) * enemies.length)]);
    }

    if (DEBUG.wave) console.log("Value: ",totalValue, "\nEnemies:", enemies, "\nWave: ", wave, "\nWave value: ", wave.map((a) => a.bounty).reduce((acc, val) => acc + val, 0));
    
    // FIX 4: Math.max(..., 1) prevents division by zero
    return wave.map((a) => {
      return {enemy: a.name, delay: Math.pow(Math.random() * 2 / Math.max(Math.min(this.currentWave - 10, 5), 1) + 0.025, 3)};
    });
  }
}