const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();
const MAPS = ["test_map.json"];
const MAP_DATA = [];

ASSET_MANAGER.queueDownload("./assets/path_north.png");
ASSET_MANAGER.queueDownload("./assets/path_south.png");
ASSET_MANAGER.queueDownload("./assets/path_east.png");
ASSET_MANAGER.queueDownload("./assets/path_west.png");

ASSET_MANAGER.downloadAll(async () => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	
	for (let i = 0; i < MAPS.length; i++) {
		let data = await (await fetch(`./data/${MAPS[i]}`)).text();
		MAP_DATA[i] = JSON.parse(data);
	}
	
	const testMap = new TowerDefenseMap(MAP_DATA[0], ASSET_MANAGER);
	gameEngine.addEntity(testMap);
	
	let towerTest = await(await fetch("./data/ArrowTower.json")).text();
	let tower = new Tower(JSON.parse(towerTest));

	gameEngine.draw();
	// gameEngine.start();
});