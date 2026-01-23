/**
 * Tower entity which attacks enemies
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
// if the only difference between towers is in their data (attack, name, sprite, etc.) then
// we can just have the single Tower class cause the behaviour doesn't change.
class Tower { 
  constructor(data) {
    this.name = data.name;
    this.sprite = data.sprite;
    this.upgrades = data.upgrades;
    this.currentLevel = 0;
    this.attack = null;
    
    this.upgrade("0");
  }
  
  upgrade(path) {
    let data = this.upgrades[path].attack;
    this.attack = new Attack(data.damage, data.range, data.rate);
  }
}