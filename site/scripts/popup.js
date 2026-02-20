class Popup {
    constructor(tower) {
        this.tower = tower;
        this.x;
        this.y;
        this.width;
        this.height;
        this.upgradeBounds = {};
    }
    
    update(clockTick) {
        
    }
    
    draw(ctx) {
        if (this.x == undefined) {
            // define all our dimensions by measuring text
            ctx.font = "18px Arial";
            this.width = Math.max(ctx.measureText(this.tower.name).width, 256);
            // WARNING: this can't handle super long upgrade descriptions, if this becomes a problem change to a Math.max(256, desc length)
            this.height = 256;
            this.x = this.tower.x + this.width > 1024 ? this.tower.x - this.width : this.tower.x;
            this.y = this.tower.y > 384 ? this.tower.y - this.height - 72 : this.tower.y + 72;
            
            let currY = 0;
            for (let key of Object.keys(this.tower.upgrades)) {
                let height = wrapText(ctx, "$" + this.tower.upgrades[key].cost + " " + this.tower.upgrades[key].description, this.width - 16).length * 24;
                this.upgradeBounds[key] = {start: this.y + 44 + currY, end: height + this.y + currY + 48};
                currY += height + 8;
            }
        }
        
        // Tower name and level
        ctx.font = "18px Arial";
        ctx.fillStyle = "#000000AA";
        ctx.strokeStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fillText(this.tower.name, this.x + 8, this.y + 20);
        ctx.fillText("Level " + (this.tower.currentLevel + 1), this.x + 8, this.y + 40);
        
        // TODO: consider adding some visual tell for what the current upgrade is, and what we've upgraded past.
        // may want to make tower upgrades fully linear? so we can stop showing the old stuff. or just pop old upgrades off the list.
        // Upgrade button
        if (this.tower.upgrades.length > this.tower.currentLevel + 1) {
            // there are still upgrades
            ctx.fillStyle = "#009a00";
            ctx.fillRect(this.x + 8, this.y + 48, 128, 32);
            ctx.fillStyle = "white";
            ctx.fillText(`$${this.tower.upgrades[this.tower.currentLevel + 1].cost} Upgrade:`, this.x + 12, this.y + 68);
            ctx.fillStyle = "#000000AA";
            ctx.fillRect(this.x + 8, this.y + 88, 240, 128);
            ctx.fillStyle = "white";
            
            let offset = 0;
            for (let line of wrapText(ctx, this.tower.upgrades[this.tower.currentLevel + 1].description, this.width - 16)) {
                ctx.fillText(line, this.x + 8, this.y + 106 + offset);
                offset += 24;
            }
        } else {
            ctx.fillStyle = "#005500";
            ctx.fillRect(this.x + 8, this.y + 48, 132, 32);
            ctx.fillStyle = "white";
            ctx.fillText("Fully upgraded!", this.x + 12, this.y + 68);
        }
        
        // Sell button
        ctx.fillStyle = "#BB0000";
        ctx.fillRect(this.x + 8, this.y + this.height - 32, 128, 24);
        ctx.strokeStyle = "#550000";
        ctx.strokeRect(this.x + 8, this.y + this.height - 32, 128, 24);
        ctx.fillStyle = "white";
        ctx.fillText("Sell: $" + Math.round(this.tower.upgrades[this.tower.currentLevel].cost * 0.75), this.x + 10, this.y + this.height - 12);
    }
    
    handleClick(pos) {
        if (this.tower.upgrades.length > this.tower.currentLevel
            && pos.y >= this.y + 48 && pos.y <= this.y + 80) {
            if (gameEngine.spendMoney(this.tower.upgrades[this.tower.currentLevel + 1].cost)) {
                this.tower.upgrade(this.tower.currentLevel + 1);
            }
        }
        if (insideBox(pos, {x: this.x + 8, y: this.y + this.height - 32, width: 80, height: 24})) {
            gameEngine.addMoney(Math.round(this.tower.upgrades[this.tower.currentLevel].cost * 0.75));
            this.tower.removeFromWorld = true;
            this.removeFromWorld = true;
        }
    }
}