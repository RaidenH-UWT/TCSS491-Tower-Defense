const CELL_SIZE = 64;
const CELL_DESIGN = new Map();


CELL_DESIGN.set("O", "white");
CELL_DESIGN.set("B", "green");
CELL_DESIGN.set("F", "blue");
CELL_DESIGN.set("G", "red");

CELL_DESIGN.set("N", "./assets/path_north.png");
CELL_DESIGN.set("S", "./assets/path_south.png");
CELL_DESIGN.set("E", "./assets/path_east.png");
CELL_DESIGN.set("W", "./assets/path_west.png");

class TowerDefenseMap {
  constructor(json, assetManager) {
    this.name = json.name;
    this.waves = json.waves;
    this.cells = json.cells;
    this.rows = this.cells.length;
    this.cols = this.cells[0].length;
    this.assetManager = assetManager;
  }

  update() {
    // Nothing yet (future waves, path logic, etc.)
  }

  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let design = this.cells[r][c];
        // if the cell type is one of "OBFG", just draw a color, otherwise use a sprite
        this.drawCell(ctx, r, c, CELL_DESIGN.get(design), !("OBFG".indexOf(design) > -1));
      }
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
}