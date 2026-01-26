const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();
const MAPS = ["test_map.json"];
const MAP_DATA = [];

ASSET_MANAGER.queueDownload("./assets/path_north.png");
ASSET_MANAGER.queueDownload("./assets/path_south.png");
ASSET_MANAGER.queueDownload("./assets/path_east.png");
ASSET_MANAGER.queueDownload("./assets/path_west.png");
ASSET_MANAGER.queueDownload("./assets/arrow_tower.png");

ASSET_MANAGER.downloadAll(async () => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	
	for (let i = 0; i < MAPS.length; i++) {
		let data = await (await fetch(`./data/${MAPS[i]}`)).text();
		MAP_DATA[i] = JSON.parse(data);
	}

	// load tower data first
	let towerTest = await (await fetch("./data/ArrowTower.json")).text();
	let towerData = JSON.parse(towerTest);
	
	// pass towerData into map
	const testMap = new TowerDefenseMap(MAP_DATA[0], ASSET_MANAGER, towerData);

	let enemyData = await (await fetch("./data/BasicEnemy.json")).text();
	const enemy = new Enemy(JSON.parse(enemyData), testMap);

	gameEngine.addEntity(testMap);
	gameEngine.addEntity(enemy);

	testMap.game = gameEngine;

	canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        testMap.handleClick({ x, y });
    });

	gameEngine.start();
});
