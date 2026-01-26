/**
 * Tower entity which attacks enemies
 * @param data json data (may want to pull out the properties)
 * @author Raiden H
 */
// if the only difference between towers is in their data (attack, name, sprite, etc.) then
// we can just have the single Tower class cause the behaviour doesn't change.
class Tower { 
  constructor(data, x, y) {
    this.name = data.name;
    this.sprite = ASSET_MANAGER.getAsset("./assets/arrow_tower.png");

    this.x = x;
    this.y = y;

    this.upgrades = data.upgrades;
    this.currentLevel = 0;
    this.attack = null;

    this.upgrade("0");
  }

  update() {
    // can be empty
  }

  draw(ctx) {
    ctx.drawImage(this.sprite, this.x - 32, this.y - 32, 64, 64);



  }
  
  upgrade(path) {
    let data = this.upgrades[path].attack;
    this.attack = new Attack(data.damage, data.range, data.rate);
  }
}