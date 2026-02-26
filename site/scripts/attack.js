/**
 * Attack class, which is used in any entity that attacks other entities.
 * @param data data from JSON
 * @param animation Animator object
 * @param origin where this attack was created
 * @author Raiden H
 */
class Attack {
  constructor(data, animation, origin, deathAnimation) {
    this.damage = data.damage;
    this.range = data.range;
    this.area = data.area;
    this.triggerRange = data.triggerRange;
    this.rate = 1 / data.rate;
    this.speed = data.speed;
    this.homing = data.homing;
    this.team = data.team;
    this.animation = animation;
    this.deathAnimation = deathAnimation;
    this.origin = origin;
    this.targetMode = "close";
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
    let target = targets.length > 1 ? this.targetingModes[this.targetMode](targets)[0] : targets[0];
    return new AttackEntity(this, target, this.animation);
  }
}

class AttackEntity {
  constructor(attack, target, animation) {
    this.attack = attack;
    this.target = target;
    this.animation = animation;
    this.origin = attack.origin;
    this.x = this.origin.x;
    this.y = this.origin.y;
    this.velocity = {
      x: (this.target.x - this.x) / getDistance(this, this.target) * (this.attack.speed * CELL_SIZE),
      y: (this.target.y - this.y) / getDistance(this, this.target) * (this.attack.speed * CELL_SIZE)
    };
    this.homing = attack.homing;
    this.removeFromWorld = false;
    this.clockTick = 0;
  }
  
  explode() {
    const targets = this.attack.team == "attack" ? [this.target] : gameEngine.getEnemiesInRadius(this.x, this.y, this.attack.area * CELL_SIZE + 16);
    if (targets.length > 0 && this.attack.area == 0) {
      targets[0].takeDamage(this.attack.damage);
    } else if (targets.length > 0) {
      for (let target of targets.filter((a) => getDistance(this, a) <= this.attack.area * CELL_SIZE)) {
        target.takeDamage(this.attack.damage);
      }
    }
    if (this.attack.deathAnimation != undefined) {
      gameEngine.addEntity(new Effect(this.x, this.y, this.attack.deathAnimation));
    }
    this.removeFromWorld = true;
  }
  // TODO: the projectiles look like they're targeting the bottom-right corner of enemies
  // this makes it difficult to tune the explosion call radius in a way that looks good
  // at every angle. see if you can target the center of enemies instead
  // this may also be because we're targeting based on the projectile x/y, which is the top-left
  // corner. so when that corner reaches the center of enemies that's when it triggers.
  update(clockTick) {
    this.clockTick = clockTick;
    this.x += this.velocity.x * clockTick;
    this.y += this.velocity.y * clockTick;
    
    // track the target if a homing projectile
    if (this.homing) {
      this.velocity = {
        x: (this.target.x - this.x) / getDistance(this, this.target) * (this.attack.speed * CELL_SIZE),
        y: (this.target.y - this.y) / getDistance(this, this.target) * (this.attack.speed * CELL_SIZE)
      };
    }
    
    if (this.attack.team == "defend") {
      if (gameEngine.getEnemiesInRadius(this.x, this.y, this.attack.triggerRange * CELL_SIZE).length > 0) {
        this.explode();
      }
    } else if (this.attack.team == "attack") {
      if (getDistance(this, this.target) < this.attack.triggerRange * CELL_SIZE) {
        this.explode();
      }
    }
    
    // remove projectiles that fly past their targets
    if (getDistance(this, this.origin) > this.attack.range * CELL_SIZE * 1.5) {
      this.explode();
    }
    
    if (this.target == null || this.target == undefined || this.target.removeFromWorld) {
      this.explode();
    }
  }
  
  draw(context) {
    let angle = Math.atan2(this.velocity.y, this.velocity.x);
    
    this.animation.drawFrame(this.clockTick, context, this.x, this.y, 1, angle);
  }
}

class Effect {
  constructor(x, y, animation) {
    this.animation = animation;
    this.x = x - this.animation.width / 2;
    this.y = y - this.animation.height / 2;
    this.clockTick = 0;
  }
  
  update(clockTick) {
    this.clockTick = clockTick;
  }
  
  draw(ctx) {
    this.animation.drawFrame(this.clockTick, ctx, this.x, this.y, 1);
    if (this.animation.isDone()) {
      this.animation.reset();
      this.removeFromWorld = true;
    }
  }
}