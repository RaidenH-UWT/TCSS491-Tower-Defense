class HUD {
    constructor(game) {
        this.game = game;

        // Prototype values
        this.money = 500;
        this.lives = 20;
    }

    update() {
        // Later: sync with game state
    }

    draw(ctx) {
        ctx.save();

        // Background panel
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
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
