class mainMenu {

    constructor(game) {
        this.game = game;
        this.reset();
        this.menuState = "MAIN";

        this.bg = ASSET_MANAGER.getAsset("./assets/mainMenu.png");
        this.startImg = ASSET_MANAGER.getAsset("./assets/startButton.png");
        this.aboutImg = ASSET_MANAGER.getAsset("./assets/aboutButton.png");

        this.startBtn = null;
        this.aboutBtn = null;

        this.easyBtn = null;
        this.mediumBtn = null;
        this.hardBtn = null;
    }

    reset() {
        this.menuState = "MAIN";
    }
    
    update() {
        if (this.game.click) {
            this.handleClick(this.game.click);
            
            this.game.click = null;
        }
    }

    draw(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height * 3 / 4; 

        ctx.drawImage(this.bg, 0, 0, width, height);

        const btnWidth = 400;
        const btnHeight = 120;
        const centerX = width / 2;
        if (this.menuState === "MAIN") {

            this.startBtn = { x: centerX - btnWidth / 2, y: height * 0.6, width: btnWidth, height: btnHeight };
            this.aboutBtn = { x: centerX - btnWidth / 2, y: height * 0.8, width: btnWidth, height: btnHeight };

            ctx.drawImage(this.startImg, this.startBtn.x, this.startBtn.y, btnWidth, btnHeight);
            ctx.drawImage(this.aboutImg, this.aboutBtn.x, this.aboutBtn.y, btnWidth, btnHeight);
        } else if (this.menuState === "DIFFICULTY") {
            this.easyBtn = { x: centerX - btnWidth / 2, y: height * 0.3, width: btnWidth, height: btnHeight };
            this.mediumBtn = { x: centerX - btnWidth / 2, y: height * 0.45, width: btnWidth, height: btnHeight };
            this.hardBtn = { x: centerX - btnWidth / 2, y: height * 0.6, width: btnWidth, height: btnHeight };

            ctx.fillStyle = "#4f545c"; 
            ctx.fillRect(this.easyBtn.x, this.easyBtn.y, btnWidth, btnHeight);
            ctx.strokeStyle = "white";
            ctx.strokeRect(this.easyBtn.x, this.easyBtn.y, btnWidth, btnHeight);
            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillText("EASY", centerX, this.easyBtn.y + 60);

            ctx.fillStyle = "#23272a";
            ctx.fillRect(this.mediumBtn.x, this.mediumBtn.y, btnWidth, btnHeight);
            ctx.strokeStyle = "#72767d";
            ctx.strokeRect(this.mediumBtn.x, this.mediumBtn.y, btnWidth, btnHeight);
            ctx.fillStyle = "#72767d";
            ctx.fillText("MEDIUM", centerX, this.mediumBtn.y + 60);

            ctx.fillStyle = "#23272a";
            ctx.fillRect(this.hardBtn.x, this.hardBtn.y, btnWidth, btnHeight);
            ctx.strokeStyle = "#72767d";
            ctx.strokeRect(this.hardBtn.x, this.hardBtn.y, btnWidth, btnHeight);
            ctx.fillStyle = "#72767d";
            ctx.fillText("HARD", centerX, this.hardBtn.y + 60);
        }
    }

    handleClick(pos) {
        if (this.menuState === "MAIN") {
            if (this.isInside(pos, this.startBtn)) {
                this.menuState = "DIFFICULTY";
            }
            if (this.isInside(pos, this.aboutBtn)) {
                const screen = document.getElementById("aboutScreen");
                if (screen) screen.style.display = "block";
            }
        } else if (this.menuState === "DIFFICULTY") {
            if (this.isInside(pos, this.easyBtn)) {
                this.game.startGame();
            }
            // Medium and Hard remain untoggled
        }
    }

    isInside(pos, btn) {
        return (btn && pos.x > btn.x && pos.x < btn.x + btn.width && pos.y > btn.y && pos.y < btn.y + btn.height);
    }
}
