/**
 * Enemy entity which moves towards and attacks the goal
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
class Enemy {
  constructor(data, map) {
    this.name = data.name;
    this.animations = {};
    this.maxHealth = data.health;
    this.health = data.health;
    this.speed = data.speed * 60;
    this.map = map;
    this.size = 40;
    this.removeFromWorld = false;
    this.clockTick = 0;

    // Debug log
    if (DEBUG.enemy) console.log("Enemy created with health:", this.health);

    // Spawn at start cell
    const start = map.getStartCell();
    this.row = start.row;
    this.col = start.col;
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
    this.y = this.row * CELL_SIZE + CELL_SIZE / 2;
    this.targetCell = map.getNextCell(this.row, this.col);
    
    this.attack = new Attack(data.attack.damage, data.attack.range, data.attack.rate, data.attack.sprite, {x: this.x, y: this.y});
    
    for (let key of Object.getOwnPropertyNames(data.animations)) {
      let conf = data.animations[key];
      let anim = new Animator(ASSET_MANAGER.getAsset("./assets/" + conf.spritesheet), conf.xStart, conf.yStart, conf.width, conf.height,
                              conf.frameCount, conf.frameDuration, conf.framePadding, conf.reverse, conf.loop, conf.rotation, conf.loopStart, conf.loopEnd);
      this.animations[key] = anim;
    }
  }

  takeDamage(damage) {
    if (DEBUG.enemy) console.log("takeDamage called! Damage:", damage, "Current health:", this.health);
    
    this.health -= damage;
    
    if (DEBUG.enemy) console.log("After damage, health:", this.health);
    
    // Remove enemy if health drops to 0 or below
    if (this.health <= 0) {
      this.health = 0;
      this.removeFromWorld = true;
      if (DEBUG.enemy) console.log("Enemy died!");
    }
  }
  
  distanceToGoal() {
    let goal = this.map.getGoalCell();
    goal = {x: goal.col * CELL_SIZE, y: goal.row * CELL_SIZE};
    
    return getDistance(goal, {x: this.x, y: this.y});
  }
  
  update(clockTick) {
    this.clockTick = clockTick;
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

  draw(ctx) {
    // Draw enemy body
    ctx.fillStyle = "black";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    
    // TODO: UNCOMMENT ONCE WE HAVE A SPRITE/SPRITESHEET
//     this.animations[this.animState].drawFrame(this.clockTick, ctx, this.x - CELL_SIZE / 2, this.y - CELL_SIZE / 2, 1);
//     
//     // reset animState if attack anim is done
//     if (this.animState == "attack" && this.animations[this.animState].isDone()) {
//       this.animState = "idle";
//     }
    
    const healthPercentage = this.health / this.maxHealth;

    // only draw it if it's actually changed
    if (healthPercentage != 1) {
      // Draw health bar background (gray)
      const healthBarWidth = this.size;
      const healthBarHeight = 6;
      const healthBarX = this.x - this.size / 2;
      const healthBarY = this.y - this.size / 2 - 10;
      
      ctx.fillStyle = "gray";
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
      
      // Draw health bar foreground (green to red gradient based on health)
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
}