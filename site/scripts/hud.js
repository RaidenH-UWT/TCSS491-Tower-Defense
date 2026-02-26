class HUD {
    constructor(game) {
        this.game = game;
        this.money = 0;
        this.lives = 0;
        this.towers = [
        {
            name: "ArrowTower",
            dataFile: "./data/ArrowTower.json"
        },
        {
            name: "BombTower",
            dataFile: "./data/BombTower.json"
        }
        ];
        this.towerButtons = [];
    }

    update() {
        // Sync with game state
        this.money = this.game.playerMoney;
        this.lives = this.game.baseHealth;
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(10, 10, 220, 100);
        ctx.strokeStyle = "white";
        ctx.strokeRect(10, 10, 220, 100);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(`Money: $${this.money}`, 20, 40);
        ctx.fillText(`Lives: ${this.lives}`, 20, 70);
        ctx.fillText(`Wave: ${this.game.map.currentWave} / ${this.game.map.isEndless ? "∞" : this.game.map.totalWaves}`, 20, 100);

        this.drawTowerPanel(ctx);

        ctx.restore();
    }

    drawTowerPanel(ctx) {
        const panelHeight = 256;

        const panelY = ctx.canvas.height - panelHeight;

        // Panel background
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, panelY, ctx.canvas.width, panelHeight);

        ctx.strokeStyle = "white";
        ctx.strokeRect(0, panelY, ctx.canvas.width, panelHeight);

        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        ctx.fillText("Towers", 20, panelY + 30);

        this.towerButtons = [];

        const buttonWidth = 180;
        const buttonHeight = 65;
        const spacing = 50;
        const startX = 40;

        // Center buttons vertically inside panel
        const y = panelY + (panelHeight - buttonHeight) / 2 + 10;

        for (let i = 0; i < this.towers.length; i++) {
            const tower = this.towers[i];

            const towerData = ASSET_MANAGER.getAsset(tower.dataFile);
            const cost = towerData.upgrades[0].cost;

            const x = startX + i * (buttonWidth + spacing);

            const btn = {
                x: x,
                y: y,
                width: buttonWidth,
                height: buttonHeight,
                tower: tower
            };

            this.towerButtons.push(btn);

            // Better selection color
            ctx.fillStyle =
                this.game.selectedTower === tower.name
                    ? "#666"
                    : "#444";

            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

            ctx.strokeStyle = "white";
            ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

            // Properly centered text
            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                `${tower.name} ($${cost})`,
                btn.x + buttonWidth / 2,
                btn.y + buttonHeight / 2
            );
        }

        // Reset alignment so it doesn't affect other drawings
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
    }

    handleClick(pos) {
        // check tower buttons
        for (let btn of this.towerButtons) {
            if (insideBox(pos, btn)) {
                this.game.selectedTower = btn.tower.name;
            }
        }
    }
}