/**
 * Enemy entity which moves towards and attacks the goal
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
// if the only difference between enemies is in their data (attack, name, sprite, etc.) then
// we can just have the single Enemy class cause the behaviour doesn't change.
class Enemy {
  constructor(data) {
    this.name = data.name;
    this.sprite = data.sprite;
    this.health = data.health;
    this.speed = data.speed;
    this.attack = new Attack(data.attack.damage, data.attack.range, data.attack.rate);
  }
  
  move(currentCell) {
    // maybe move this behaviour to map? all the necessary info is in there...
    // coordinate pair
    return {x: 0, y: 0};
  }
}