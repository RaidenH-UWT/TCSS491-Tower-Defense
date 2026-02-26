const DEBUG = {
	error: true,
	warn: false,
	tools: false,
	load: false,
	tower: false,
	enemy: false,
	wave: false,
	io: false,
    music: false,
	other: false
};

const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();
const music = new MusicManager();
const MAPS = ["test_map.json"];
const ENEMIES = ["BossEnemy", "FastEnemy", "BasicEnemy"];

const DEBUG_ELEMENTS = document.getElementsByClassName("debug");

// queue up all the image assets
ASSET_MANAGER.queueDownload("./assets/path_north.png");
ASSET_MANAGER.queueDownload("./assets/path_south.png");
ASSET_MANAGER.queueDownload("./assets/path_east.png");
ASSET_MANAGER.queueDownload("./assets/path_west.png");
ASSET_MANAGER.queueDownload("./assets/arrow_tower.png");
ASSET_MANAGER.queueDownload("./assets/arrow.png");
ASSET_MANAGER.queueDownload("./assets/bomb_tower.png");
ASSET_MANAGER.queueDownload("./assets/bomb.png");
ASSET_MANAGER.queueDownload("./assets/explosion.png");
ASSET_MANAGER.queueDownload("./assets/basic_enemy.png");
ASSET_MANAGER.queueDownload("./assets/fast_enemy.png");
ASSET_MANAGER.queueDownload("./assets/boss_enemy.png");
ASSET_MANAGER.queueDownload("./assets/mainMenu.png");
ASSET_MANAGER.queueDownload("./assets/startButton.png");
ASSET_MANAGER.queueDownload("./assets/aboutButton.png");
ASSET_MANAGER.queueDownload("./assets/map_bg.png");

// queue up all the data assets
ASSET_MANAGER.queueDownload("./data/ArrowTower.json");
ASSET_MANAGER.queueDownload("./data/BombTower.json");
ASSET_MANAGER.queueDownload("./data/BossEnemy.json");
ASSET_MANAGER.queueDownload("./data/FastEnemy.json");
ASSET_MANAGER.queueDownload("./data/BasicEnemy.json");
ASSET_MANAGER.queueDownload("./data/test_map.json");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");
	
	const testMap = new TowerDefenseMap(ASSET_MANAGER.getAsset(`./data/${MAPS[0]}`), ASSET_MANAGER, gameEngine);
	
	gameEngine.init(ctx, testMap);
	
	gameEngine.menu = new mainMenu(gameEngine);

	gameEngine.start();
	
	// debug tools
	const debugSpawnWave = document.getElementById("debugSpawnWave");
	debugSpawnWave.addEventListener("click", (event) => spawnWave());
	
	
	function spawnWave() {
        gameEngine.map.waves.push([
            { enemy: "BasicEnemy", delay: 1 },
            { enemy: "BasicEnemy", delay: 1 },
            { enemy: "FastEnemy", delay: 0.5 },
            { enemy: "FastEnemy", delay: 0.5 },
            { enemy: "FastEnemy", delay: 0.5 },
			{ enemy: "BossEnemy", delay: 2},
			{ enemy: "BossEnemy", delay: 2}
        ]);
        gameEngine.map.isSpawning = true;
        gameEngine.map.spawnTimer = 0;
        console.log("Spawning wave");
	}});

document.addEventListener('DOMContentLoaded', (event) => {
    
    const backBtn = document.getElementById("backBtn");
    
    const aboutScreen = document.getElementById("aboutScreen");

    if(backBtn && aboutScreen) {
        backBtn.onclick = function() {
            aboutScreen.style.display = "none";
        }
    }
});