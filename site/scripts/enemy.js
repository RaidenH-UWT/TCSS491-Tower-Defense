/**
 * Enemy entity which moves towards and attacks the goal
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
// if the only difference between enemies is in their data (attack, name, sprite, etc.) then
// we can just have the single Enemy class cause the behaviour doesn't change.
class Enemy {
  constructor(data, map) {
    this.name = data.name;
    this.sprite = data.sprite;
    this.health = data.health;
    this.speed = data.speed * 60;
    this.attack = new Attack(data.attack.damage, data.attack.range, data.attack.rate);

    this.map = map;
    this.size = 40;
    this.removeFromWorld = false;

    // Spawn at start cell
    const start = map.getStartCell();
    this.row = start.row;
    this.col = start.col;

    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
    this.y = this.row * CELL_SIZE + CELL_SIZE / 2;

    this.targetCell = map.getNextCell(this.row, this.col);
  }
  
  update() {
    if (!this.targetCell) {
      // reached goal
      this.removeFromWorld = true;
      return;
    }

    const targetX = this.targetCell.col * CELL_SIZE + CELL_SIZE / 2;
    const targetY = this.targetCell.row * CELL_SIZE + CELL_SIZE / 2;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2) {
      // snap to grid
      this.row = this.targetCell.row;
      this.col = this.targetCell.col;
      this.x = targetX;
      this.y = targetY;

      this.targetCell = this.map.getNextCell(this.row, this.col);
      return;
    }

    const step = this.speed * this.map.gameEngine.clockTick;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  draw(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
    );

    // Optional: health bar (looks good for demo)
    ctx.fillStyle = "red";
    ctx.fillRect(
        this.x - this.size / 2,
        this.y - this.size / 2 - 8,
        this.size,
        5
    );
}

}