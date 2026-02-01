/**
 * Tower entity which attacks enemies
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
class Tower { 
  constructor(data, x, y, gameEngine) {
      this.name = data.name;
      this.animations = {};
      this.x = x;
      this.y = y;
      this.upgrades = data.upgrades;
      this.currentLevel = 0;
      this.attack = null;
      this.gameEngine = gameEngine;
      this.attackTimer = 0;
      this.animState = "idle";
      this.currentTarget = null;
      this.upgrade(this.currentLevel);
      
      if (DEBUG.tower) console.log("Tower created at", this.x, this.y, "with attack:", this.attack);
  }

  upgrade(path) {
      this.animations = {}; // Clear old animations
      
      let data = this.upgrades[path];
      let key;
      for (key of Object.getOwnPropertyNames(data.animations)) {
          let conf = data.animations[key];
          let anim = new Animator(
              ASSET_MANAGER.getAsset("./assets/" + conf.spritesheet), 
              conf.xStart, conf.yStart, conf.width, conf.height,
              conf.frameCount, conf.frameDuration, conf.framePadding, 
              conf.reverse, conf.loop, conf.rotation, conf.loopStart, conf.loopEnd
          );
          this.animations[key] = anim;
      }
      
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
      
      this.attack = new Attack(
          data.attack.damage, data.attack.range, data.attack.rate, 
          data.attack.speed, anim, {x: this.x, y: this.y}
      );
  }

  update(clockTick) {
    // Update attack timer
    this.attackTimer += clockTick;
    
    // Find targets in range
    let targets = this.gameEngine.entities.filter(entity => entity instanceof Enemy);
    targets = targets.filter((enemy) => 
        getDistance({x: enemy.x, y: enemy.y}, {x: this.x, y: this.y}) <= (this.attack.range * CELL_SIZE)
    );
    
    if (targets.length > 0) {
        // Keep same target if still in range, otherwise pick new one
        if (!this.currentTarget || !targets.includes(this.currentTarget)) {
            this.currentTarget = targets[0];
        }
        
        // NO rotation calculation needed anymore
        
        // Attack if ready
        if (this.attackTimer >= this.attack.rate) {
            this.animState = "attack";
            this.gameEngine.addEntity(this.attack.attack(targets));
            this.attackTimer = 0;
        }
    } else {
        this.currentTarget = null;
    }
}

  
  draw(ctx) {
    // Draw sprite at tower position WITHOUT rotation
    this.animations[this.animState].drawFrame(
        this.gameEngine.clockTick, 
        ctx, 
        this.x - CELL_SIZE / 2,  // Center the sprite
        this.y - CELL_SIZE / 2, 
        1,                       // scale
        0                        // NO rotation - always 0
    );
    
    // Reset animState if attack anim is done
    if (this.animState === "attack" && this.animations[this.animState].isDone()) {
        this.animState = "idle";
        this.animations[this.animState].reset();
    }
    
    if (DEBUG.tower) {
        // Draw range circle
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.attack.range * CELL_SIZE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}
}