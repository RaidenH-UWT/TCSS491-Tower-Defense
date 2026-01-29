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
    this.maxHealth = data.health;
    this.health = data.health;
    this.speed = data.speed * 60;
    this.attack = new Attack(data.attack.damage, data.attack.range, data.attack.rate);
    this.map = map;
    this.size = 40;
    this.removeFromWorld = false;

    // Debug log
    console.log("Enemy created with health:", this.health);

    // Spawn at start cell
    const start = map.getStartCell();
    this.row = start.row;
    this.col = start.col;
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
    this.y = this.row * CELL_SIZE + CELL_SIZE / 2;
    this.targetCell = map.getNextCell(this.row, this.col);
  }

  update(clockTick) {
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

    const step = this.speed * clockTick;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  takeDamage(damage) {
    console.log("takeDamage called! Damage:", damage, "Current health:", this.health);
    
    this.health -= damage;
    
    console.log("After damage, health:", this.health);
    
    // Remove enemy if health drops to 0 or below
    if (this.health <= 0) {
      this.health = 0;
      this.removeFromWorld = true;
      console.log("Enemy died!");
    }
  }

  draw(ctx) {
    // Draw enemy body
    ctx.fillStyle = "black";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );

    // Draw health bar background (gray)
    const healthBarWidth = this.size;
    const healthBarHeight = 6;
    const healthBarX = this.x - this.size / 2;
    const healthBarY = this.y - this.size / 2 - 10;

    ctx.fillStyle = "gray";
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Draw health bar foreground (green to red gradient based on health)
    const healthPercentage = this.health / this.maxHealth;
    const currentHealthWidth = healthBarWidth * healthPercentage;

    // Color changes from green -> yellow -> red as health decreases
    if (healthPercentage > 0.5) {
      ctx.fillStyle = "green";
    } else if (healthPercentage > 0.25) {
      ctx.fillStyle = "yellow";
    } else {
      ctx.fillStyle = "red";
    }

    ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);

    // Optional: Draw health bar border
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  }
}