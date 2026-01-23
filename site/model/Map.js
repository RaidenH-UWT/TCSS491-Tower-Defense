export class Map {
  constructor() {
    this.cellSize = 64;

    // Hardcoded map layout
    // E = empty, B = buildable, P = path, S = start, G = goal
    this.layout = [
      ["E","E","B","B","B","B","B","B","E","E"],
      ["E","B","B","B","B","B","B","B","B","E"],
      ["B","B","P","P","P","P","P","P","B","B"],
      ["S","P","P","B","B","B","B","P","P","G"],
      ["B","B","B","B","B","B","B","B","B","B"],
      ["E","B","B","B","B","B","B","B","B","E"],
      ["E","E","B","B","B","B","B","B","E","E"]
    ];

    this.rows = this.layout.length;
    this.cols = this.layout[0].length;
  }

  update() {
    // Nothing yet (future waves, path logic, etc.)
  }

  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.drawCell(ctx, r, c, this.layout[r][c]);
      }
    }
  }

  drawCell(ctx, row, col, type) {
    const x = col * this.cellSize;
    const y = row * this.cellSize;

    switch (type) {
      case "B": ctx.fillStyle = "green"; break;
      case "P": ctx.fillStyle = "#5f2b06"; break;
      case "S": ctx.fillStyle = "blue"; break;
      case "G": ctx.fillStyle = "red"; break;
      default:  ctx.fillStyle = "white";
    }

    ctx.fillRect(x, y, this.cellSize, this.cellSize);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, this.cellSize, this.cellSize);
  }
}
