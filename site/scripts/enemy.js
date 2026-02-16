/**
 * Enemy entity which moves towards and attacks the goal
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
class Enemy {
  constructor(data, map, gameEngine) {
    this.name = data.name;
    this.animations = {};
    this.maxHealth = data.health;
    this.health = data.health;
    this.speed = data.speed * 60;
    this.map = map;
    this.animState = "idle";
    this.removeFromWorld = false;
    this.clockTick = 0;
    this.gameEngine = gameEngine;

    this.atGoal = false;
    this.attackCooldown = 0;

    // Debug log
    if (DEBUG.enemy) console.log("Enemy created", this);

    // Spawn at start cell
    const start = map.getStartCell();
    this.row = start.row;
    this.col = start.col;
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
    this.y = this.row * CELL_SIZE + CELL_SIZE / 2;
    this.targetCell = map.getNextCell(this.row, this.col);
    
    let anim = new Animator(
      ASSET_MANAGER.getAsset("./assets/" + data.attack.animation.spritesheet), 
                            data.attack.animation.xStart, data.attack.animation.yStart,
                            data.attack.animation.width, data.attack.animation.height, 
                            data.attack.animation.frameCount, data.attack.animation.frameDuration, 
                            data.attack.animation.framePadding,
                            data.attack.animation.reverse, data.attack.animation.loop, 
                            data.attack.animation.rotation, data.attack.animation.loopStart, 
                            data.attack.animation.loopEnd
    );
    this.attack = new Attack(data.attack, anim, {x: this.x, y: this.y});
    this.bounty = data.bounty;
    
    for (let key of Object.getOwnPropertyNames(data.animations)) {
      let conf = data.animations[key];
      let anim = new Animator(ASSET_MANAGER.getAsset("./assets/" + conf.spritesheet), conf.xStart, conf.yStart, conf.width, conf.height,
                              conf.frameCount, conf.frameDuration, conf.framePadding, conf.reverse, conf.loop, conf.rotation, conf.loopStart, conf.loopEnd);
      this.animations[key] = anim;
    }
    
    // Notify win screen that enemy was spawned
    if (this.gameEngine && this.gameEngine.winScreen) {
      this.gameEngine.winScreen.enemySpawned();
    }
  }

  takeDamage(damage) {
    if (this.removeFromWorld) return;
    
    if (DEBUG.enemy) console.log("takeDamage called! Damage:", damage, "Current health:", this.health);
    
    this.health -= damage;
    
    if (DEBUG.enemy) console.log("After damage, health:", this.health);
    
    // Remove enemy if health drops to 0 or below
    if (this.health <= 0 && !this.removeFromWorld) {
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

    if (this.atGoal) {
      this.attackCooldown += clockTick;

      if (this.attackCooldown >= this.attack.rate) {
        this.attackCooldown = 0;
        
        this.attack.origin = {x: this.x, y: this.y};
        const coords = cellToCoords(this.map.getGoalCell());
        this.gameEngine.addEntity(this.attack.attack([{x: coords.x, y: coords.y, takeDamage: (damage) => this.gameEngine.takeDamage(damage)}]));

        if (DEBUG.enemy) {
          console.log(
            "Enemy attacking base.",
            "Damage:", this.attack.damage,
            "Base HP:", this.gameEngine.baseHealth
          );
        }
      }
      return;
    }
    
    // TODO: set this.atGoal = true when within range (this.attack.range) of the base, not when on top of it
    if (getDistance(this, cellToCoords(this.map.getGoalCell())) < this.attack.range * CELL_SIZE) {
        if (DEBUG.enemy) console.log("Enemy reached goal");
        this.atGoal = true;
        this.attackCooldown = 0;
        this.animState = "attack";
        return;
    }

    const targetX = this.targetCell.col * CELL_SIZE + CELL_SIZE / 2;
    const targetY = this.targetCell.row * CELL_SIZE + CELL_SIZE / 2;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2) {
        // Snap to grid
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
    this.animations[this.animState].drawFrame(this.clockTick, ctx, this.x - CELL_SIZE / 2, this.y - CELL_SIZE / 2, 1);
    
    // reset animState if attack anim is done
    if (this.animState == "attack" && this.animations[this.animState].isDone()) {
      this.animState = "idle";
    }
    
    const healthPercentage = this.health / this.maxHealth;

    // only draw it if it's actually changed
    if (healthPercentage != 1) {
      // Draw health bar background (gray)
      const healthBarWidth = 40;
      const healthBarHeight = 6;
      const healthBarX = this.x - healthBarWidth / 2;
      const healthBarY = this.y - healthBarWidth / 2 - 10;
      
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