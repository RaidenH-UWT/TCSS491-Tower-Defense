/**
 * Attack class, which is used in any entity that attacks other entities.
 * @param damage damage per attack
 * @param range cell distance this attack can target
 * @param rate how frequently this attack triggers (in seconds)
 * @author Raiden H
 */
class Attack {
  constructor(damage, range, rate) {
    this.damage = damage;
    this.range = range;
    this.rate = rate;
    // could add targetingMode here
  }

  // Attack a target entity
  attack(target) {
    if (target && target.takeDamage) {
      target.takeDamage(this.damage);
    }
  }
}