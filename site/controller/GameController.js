import { Map } from "../model/Map.js";

export class GameController {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.map = new Map();
  }

  update() {
    this.map.update();
  }

  draw(ctx) {
    this.map.draw(ctx);
  }
}