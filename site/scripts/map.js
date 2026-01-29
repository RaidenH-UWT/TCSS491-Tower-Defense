const CELL_SIZE = 64;
// delay between spawns, in seconds
const SPAWN_DELAY = 1;
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
    this.waves = json.waves;
    this.cells = json.cells;
    this.rows = this.cells.length;
    this.cols = this.cells[0].length;

    this.placedTowers = [];
    this.selectedCell = null;
    
    this.isSpawning = true;
    this.spawnTimer = 0;
    
    this.assetManager = assetManager;
    this.gameEngine = gameEngine;
  }

  update(clockTick) {
    // update all towers - FIXED: now passing clockTick!
    for (const tower of this.placedTowers) {
      tower.update(clockTick);
    }
    
    if (this.isSpawning && this.waves.length > 0) {
      this.spawnTimer += clockTick;
      if (this.spawnTimer >= SPAWN_DELAY) {
          if (PARAMS.debug) console.log("spawning enemy");
          this.gameEngine.addEntity(new Enemy(this.assetManager.getAsset(`./data/${this.waves[0].shift()}.json`), this));
          this.spawnTimer = 0;
          if (PARAMS.debug) console.log("wave left: " + this.waves[0].length);
          if (this.waves[0].length == 0) {
            if (PARAMS.debug) console.log("wave done");
            // we've finished a wave
            this.waves.shift();
            if (PARAMS.debug) console.log(this.waves);
            
            // TODO: For now, this just starts the next wave after 5 seconds.
            // for future, implement a "play" button and toggle this.isSpawning when necessary
            // this.isSpawning = false;
            this.spawnTimer -= 5;
          }
      }
    }
  }

  handleClick(pos) {
    // convert pixel coordinates to cell coordinates
    const col = Math.floor(pos.x / CELL_SIZE);
    const row = Math.floor(pos.y / CELL_SIZE);

    // error checking for out of bounds coordinates
    if (
      row < 0 ||
      row >= this.rows ||
      col < 0 ||
      col >= this.cols
    ) return;

    const cellType = this.cells[row][col];

    // Only allow towers on buildable tiles
    if (cellType === "B") {

      // center of the cell
      const towerX = col * CELL_SIZE + CELL_SIZE / 2;
      const towerY = row * CELL_SIZE + CELL_SIZE / 2;

      // create a real tower object
      const tower = new Tower(this.assetManager.getAsset("./data/ArrowTower.json"), towerX, towerY, this.gameEngine);

      this.placedTowers.push(tower);
    }

    this.selectedCell = { row, col };
  }

  draw(ctx) {
    // draw the map cells
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let design = this.cells[r][c];
        // draw the cell with the specified design either as a sprite or solid colour
        this.drawCell(ctx, r, c, CELL_DESIGN[design], "NSEW".indexOf(design) > -1);
      }
    }

    // draw placed towers
    for (const tower of this.placedTowers) {
      tower.draw(ctx);
    }

    // highlight selected cell
    if (this.selectedCell) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.selectedCell.col * CELL_SIZE,
        this.selectedCell.row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      // reset the lineWidth
      ctx.lineWidth = 1;
    }
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
    // Starting cell always moves right
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
}