class mainMenu {

    constructor(game) {
        this.game = game;

        this.bg = ASSET_MANAGER.getAsset("./assets/mainMenu.png");
        this.startImg = ASSET_MANAGER.getAsset("./assets/startButton.png");
        this.aboutImg = ASSET_MANAGER.getAsset("./assets/aboutButton.png");

        this.startBtn = null;
        this.aboutBtn = null;
    }

    draw(ctx) {

        const width = ctx.canvas.width;
        const height = ctx.canvas.height*3/4;

        // Draw background
        ctx.drawImage(this.bg, 0, 0, width, height);

        const btnWidth = 400;
        const btnHeight = 120;

        const centerX = width / 2;

        this.startBtn = {
            x: centerX - btnWidth / 2,
            y: height * 0.6,
            width: btnWidth,
            height: btnHeight
        };

        this.aboutBtn = {
            x: centerX - btnWidth / 2,
            y: height * 0.8,
            width: btnWidth,
            height: btnHeight
        };

        ctx.drawImage(this.startImg, this.startBtn.x, this.startBtn.y, btnWidth, btnHeight);
        ctx.drawImage(this.aboutImg, this.aboutBtn.x, this.aboutBtn.y, btnWidth, btnHeight);
    }

    handleClick(pos) {

        if (this.isInside(pos, this.startBtn)) {
            this.game.startGame();
        }

        if (this.isInside(pos, this.aboutBtn)) {
            this.game.quitGame();
        }
    }

    isInside(pos, btn) {
        return (
            btn &&
            pos.x > btn.x &&
            pos.x < btn.x + btn.width &&
            pos.y > btn.y &&
            pos.y < btn.y + btn.height
        );
    }
}
