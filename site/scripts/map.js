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
    this.placedTowers = [];
    this.selectedCell = null;
  }

  update() {
    // Nothing yet (future waves, path logic, etc.)
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

    // Only allow towers on buildable tiles
    if (cellType === "B") {
        this.placedTowers.push({ row, col });
    }

    this.selectedCell = { row, col };
  }

  draw(ctx) {
    // draw the map cells
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let design = this.cells[r][c];
        // if the cell type is one of "OBFG", just draw a color, otherwise use a sprite
        this.drawCell(ctx, r, c, CELL_DESIGN.get(design), !("OBFG".indexOf(design) > -1));
      }
    }

    // draw placed towers
    for (const tower of this.placedTowers) {
      ctx.fillStyle = "purple";
      ctx.fillRect(
        tower.col * CELL_SIZE + CELL_SIZE / 4,
        tower.row * CELL_SIZE + CELL_SIZE / 4,
        CELL_SIZE / 2,
        CELL_SIZE / 2
      );
    }

    // highlight selected cell
    if (this.selectedCell) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.selectedCell.col * CELL_SIZE,
        this.selectedCell.row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
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

getNextCell(row, col) {
    const dir = this.cells[row][col];

    if (dir === "F") {
        // look for adjacent path tile
        const dirs = [
            { r: -1, c: 0 }, // N
            { r: 1, c: 0 },  // S
            { r: 0, c: -1 }, // W
            { r: 0, c: 1 }   // E
        ];

        for (let d of dirs) {
            const nr = row + d.r;
            const nc = col + d.c;
            const cell = this.cells[nr]?.[nc];
            if ("NSEWG".includes(cell)) {
                return { row: nr, col: nc };
            }
        }
        return null;
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