const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();
const MAPS = ["test_map.json"];

// queue up all the image assets
ASSET_MANAGER.queueDownload("./assets/path_north.png");
ASSET_MANAGER.queueDownload("./assets/path_south.png");
ASSET_MANAGER.queueDownload("./assets/path_east.png");
ASSET_MANAGER.queueDownload("./assets/path_west.png");
ASSET_MANAGER.queueDownload("./assets/arrow_tower.png");

// queue up all the data assets
ASSET_MANAGER.queueDownload("./data/ArrowTower.json");
ASSET_MANAGER.queueDownload("./data/BasicEnemy.json");
ASSET_MANAGER.queueDownload("./data/test_map.json");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	
	const testMap = new TowerDefenseMap(ASSET_MANAGER.getAsset(`./data/${MAPS[0]}`), ASSET_MANAGER, gameEngine);
	const hud = new HUD(gameEngine);

	gameEngine.addEntity(testMap);
	gameEngine.addEntity(hud);
	canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        testMap.handleClick({ x, y });
    });

	gameEngine.start();
});
