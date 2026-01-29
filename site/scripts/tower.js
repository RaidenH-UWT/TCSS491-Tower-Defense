/**
 * Tower entity which attacks enemies
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
// if the only difference between towers is in their data (attack, name, sprite, etc.) then
// we can just have the single Tower class cause the behaviour doesn't change.
class Tower { 
  constructor(data, x, y, gameEngine) {
    this.name = data.name;
    this.sprite = ASSET_MANAGER.getAsset("./assets/arrow_tower.png");
    this.x = x;
    this.y = y;
    this.upgrades = data.upgrades;
    this.currentLevel = 0;
    this.attack = null;
    this.gameEngine = gameEngine;
    this.attackTimer = 0;
    this.upgrade("0");
    
    // Debug log
    console.log("Tower created at", this.x, this.y, "with attack:", this.attack);
  }

  update(clockTick) {
    // Update attack timer
    this.attackTimer += clockTick;

    // Check if we can attack (based on attack rate)
    if (this.attackTimer >= this.attack.rate) {
      // Find target
      const target = this.findTarget();
      
      if (target) {
        // Debug log
        console.log("Tower attacking enemy! Damage:", this.attack.damage, "Enemy health:", target.health);
        
        // Attack the target
        this.attack.attack(target);
        
        // Debug log
        console.log("After attack, enemy health:", target.health);
        
        // Reset timer
        this.attackTimer = 0;
      }
    }
  }

  findTarget() {
    // Get all enemies from the game engine
    const enemies = this.gameEngine.entities.filter(entity => entity instanceof Enemy);
    
    // Debug log
    if (enemies.length > 0) {
      console.log("Found", enemies.length, "enemies in game");
    }
    
    // Find enemies in range
    const enemiesInRange = enemies.filter(enemy => {
      const distance = this.getDistance(enemy);
      return distance <= this.attack.range * CELL_SIZE;
    });

    // Debug log
    if (enemiesInRange.length > 0) {
      console.log("Found", enemiesInRange.length, "enemies in range. Range:", this.attack.range * CELL_SIZE);
    }

    // Return the first enemy in range (you could change this to target strongest, weakest, etc.)
    return enemiesInRange.length > 0 ? enemiesInRange[0] : null;
  }

  getDistance(enemy) {
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy);
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

  upgrade(path) {
    let data = this.upgrades[path].attack;
    this.attack = new Attack(data.damage, data.range, data.rate);
  }
}