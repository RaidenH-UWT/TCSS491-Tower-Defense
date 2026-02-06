class HUD {
    constructor(game) {
        this.game = game;
        this.money = 0;
        this.lives = 0;
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
    }
}