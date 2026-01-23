import { GameController } from "./controller/GameController.js";

const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);

	const gameController = new GameController(gameEngine, ASSET_MANAGER);
	gameEngine.addEntity(gameController);

	gameEngine.start();
});
