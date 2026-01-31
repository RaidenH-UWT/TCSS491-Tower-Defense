/**
 * Tower entity which attacks enemies
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
class Tower { 
  constructor(data, x, y, gameEngine) {
    this.name = data.name;
    this.sprite = ASSET_MANAGER.getAsset("./assets/" + data.sprite);
    this.x = x;
    this.y = y;
    this.upgrades = data.upgrades;
    this.currentLevel = 0;
    this.attack = null;
    this.gameEngine = gameEngine;
    this.attackTimer = 0;
    this.upgrade("0");
    
    // Debug log
    if (DEBUG.tower) console.log("Tower created at", this.x, this.y, "with attack:", this.attack);
  }
  
  upgrade(path) {
    let data = this.upgrades[path].attack;
    this.attack = new Attack(data.damage, data.range, data.rate, data.speed, data.sprite, {x: this.x, y: this.y});
  }

  update(clockTick) {
    // Update attack timer
    this.attackTimer += clockTick;

    // Check if we can attack (based on attack rate)
    if (this.attackTimer >= this.attack.rate) {
      // Find target
      let targets = this.gameEngine.entities.filter(entity => entity instanceof Enemy);
      targets = targets.filter((enemy) => getDistance({x: enemy.x, y: enemy.y}, {x: this.x, y: this.y}) <= (this.attack.range * CELL_SIZE));
      
      if (targets.length > 0) {        
        // Attack the target
        this.gameEngine.addEntity(this.attack.attack(targets));
        // Reset timer
        this.attackTimer = 0;
      }
    }
  }

  draw(ctx) {
    ctx.drawImage(this.sprite, this.x - 32, this.y - 32, 64, 64);
    
    // Draw range circle for debugging - NOW ENABLED
    // ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    // ctx.lineWidth = 2;
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.attack.range * CELL_SIZE, 0, Math.PI * 2);
    // ctx.stroke();
    // ctx.lineWidth = 1;
  }
}