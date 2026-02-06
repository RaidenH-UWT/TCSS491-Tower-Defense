const DEBUG = {error: true, warn: false, tools: false, load: false, tower: false, enemy: false, wave: false, io: false, other: false};

const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();
const MAPS = ["test_map.json"];

const DEBUG_ELEMENTS = document.getElementsByClassName("debug");

// queue up all the image assets
ASSET_MANAGER.queueDownload("./assets/path_north.png");
ASSET_MANAGER.queueDownload("./assets/path_south.png");
ASSET_MANAGER.queueDownload("./assets/path_east.png");
ASSET_MANAGER.queueDownload("./assets/path_west.png");
ASSET_MANAGER.queueDownload("./assets/arrow_tower.png");
ASSET_MANAGER.queueDownload("./assets/arrow.png");
ASSET_MANAGER.queueDownload("./assets/basic_enemy.png");
ASSET_MANAGER.queueDownload("./assets/mainMenu.png");
ASSET_MANAGER.queueDownload("./assets/startButton.png");
ASSET_MANAGER.queueDownload("./assets/aboutButton.png");

// queue up all the data assets
ASSET_MANAGER.queueDownload("./data/ArrowTower.json");
ASSET_MANAGER.queueDownload("./data/BasicEnemy.json");
ASSET_MANAGER.queueDownload("./data/test_map.json");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	gameEngine.menu = new mainMenu(gameEngine);
	
	const testMap = new TowerDefenseMap(ASSET_MANAGER.getAsset(`./data/${MAPS[0]}`), ASSET_MANAGER, gameEngine);
	const hud = new HUD(gameEngine);

	gameEngine.addEntity(testMap);
	gameEngine.addEntity(hud);
	canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

		if (gameEngine.state === "MENU") {
			gameEngine.menu.handleClick({ x, y });
			return;
		}
		
        testMap.handleClick({ x, y });
    });

	gameEngine.start();
	
	// debug tools
	const debugSpawnWave = document.getElementById("debugSpawnWave");
	debugSpawnWave.addEventListener("click", (event) => spawnWave());
	
	
	function spawnWave() {
		gameEngine.entities[0].waves.push(["BasicEnemy", "BasicEnemy", "BasicEnemy"]);
		gameEngine.entities[0].spawnTimer = 0;
		console.log("Spawning wave");
	}
});
