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
        ctx.fillRect(10, 10, 220, 70);
        ctx.strokeStyle = "white";
        ctx.strokeRect(10, 10, 220, 70);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Money: $${this.money}`, 20, 40);
        ctx.fillText(`Lives: ${this.lives}`, 20, 70);
        ctx.restore();

        this.drawTowerPanel(ctx);
    }

    drawTowerPanel(ctx) {
        const panelWidth = 200;
        const panelX = ctx.canvas.width - panelWidth - 20;
        const panelY = 20;

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(panelX, panelY, panelWidth, 200);

        ctx.strokeStyle = "white";
        ctx.strokeRect(panelX, panelY, panelWidth, 200);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Towers", panelX + 60, panelY + 30);

        this.towerButtons = [];

        let offsetY = 60;

        for (let tower of this.towers) {

            const towerData = ASSET_MANAGER.getAsset(tower.dataFile);
            const cost = towerData.upgrades[0].cost;

            const btn = {
                x: panelX + 20,
                y: panelY + offsetY,
                width: 160,
                height: 50,
                tower: tower
            };

            this.towerButtons.push(btn);

            // Highlight selected tower
            if (this.game.selectedTower === tower.name) {
                ctx.fillStyle = "#555";
            } else {
                ctx.fillStyle = "#333";
            }

            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

            ctx.fillStyle = "white";
            ctx.fillText(`${tower.name} ($${cost})`, btn.x + 10, btn.y + 30);

            offsetY += 70;
        }
    }

    handleClick(pos) {
        for (let btn of this.towerButtons) {
            if (
                pos.x > btn.x &&
                pos.x < btn.x + btn.width &&
                pos.y > btn.y &&
                pos.y < btn.y + btn.height
            ) {
                this.game.selectedTower = btn.tower.name;
                return true; // VERY IMPORTANT
            }
        }
    return false;
    }
}