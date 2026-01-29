/**
 * Attack class, which is used in any entity that attacks other entities.
 * @param damage damage per attack
 * @param range cell distance this attack can target
 * @param rate how frequently this attack triggers (in seconds)
 * @author Raiden H
 */
class Attack {
  constructor(damage, range, rate, speed, sprite, origin) {
    this.damage = damage;
    this.range = range;
    this.rate = rate;
    this.speed = speed;
    this.sprite = ASSET_MANAGER.getAsset("./assets/" + sprite);
    this.origin = origin;
    this.targetMode = "weak";
    this.targetingModes = {
      close: (arr) => arr.sort((a, b) => getDistance({x: a.x, y: a.y}, origin) - getDistance({x: b.x, y: b.y}, origin)),
      far: (arr) => arr.sort((a, b) => getDistance({x: b.x, y: b.y}, origin) - getDistance({x: a.x, y: a.y}, origin)),
      first: (arr) => arr.sort((a, b) => a.distanceToGoal() - b.distanceToGoal()),
      last: (arr) => arr.sort((a, b) => b.distanceToGoal() - a.distanceToGoal()),
      weak: (arr) => arr.sort((a, b) => a.health - b.health),
      strong: (arr) => arr.sort((a, b) => b.health - a.health)
    };
  }

  // Attack a target entity
  attack(targets) {
    let target = this.targetingModes[this.targetMode](targets)[0];
    return new AttackEntity(this, target);
  }
  
  /* TODO:
   *  - Spawn instance of this attack as an entity in the GameEngine, which is drawn with the given sprite
   *  - On update move this attack towards it's target
   *  - When this attack reaches its target, run the damage according to the parameters and remove the attack
   */
}

class AttackEntity {
  constructor(attack, target) {
    this.attack = attack;
    this.target = target;
    this.coords = {x: attack.origin.x, y: attack.origin.y};
    this.velocity = {x: (this.target.x - this.coords.x) / getDistance(this.coords, this.target) * (this.attack.speed * CELL_SIZE), y: (this.target.y - this.coords.y) / getDistance(this.coords, this.target) * (this.attack.speed * CELL_SIZE)};
    this.removeFromWorld = false;
  }
  
  explode() {
    this.target.takeDamage(this.attack.damage);
    this.removeFromWorld = true;
  }
  // TODO: the projectiles look like they're targeting the bottom-right corner of enemies
  // this makes it difficult to tune the explosion call radius in a way that looks good
  // at every angle. see if you can target the center of enemies instead
  update(clockTick) {
    this.coords.x += this.velocity.x * clockTick;
    this.coords.y += this.velocity.y * clockTick;
    
    this.velocity = {x: (this.target.x - this.coords.x) / getDistance(this.coords, this.target) * (this.attack.speed * CELL_SIZE), y: (this.target.y - this.coords.y) / getDistance(this.coords, this.target) * (this.attack.speed * CELL_SIZE)};
    
    if (getDistance(this.coords, this.target) <= 16) {
      this.explode();
    }
  }
  
  draw(context) {
    let angle = Math.atan2(this.velocity.y, this.velocity.x);
    
    // rotate the projectile (video #26)
    let newCanvas = document.createElement("canvas");
    newCanvas.width = 32;
    newCanvas.height = 32;
    
    let newContext = newCanvas.getContext("2d");
    
    newContext.save();
    
    newContext.translate(16, 16);
    newContext.rotate(angle);
    newContext.translate(-16, -16);
    newContext.drawImage(this.attack.sprite, 0, 0);
    
    newContext.restore();
    
    context.drawImage(newCanvas, this.coords.x, this.coords.y);
  }
}