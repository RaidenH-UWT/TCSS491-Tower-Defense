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
        ctx.save();

        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.lineWidth = 1;

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
        
        // draw tower range
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.tower.x, this.tower.y, this.tower.attack.range * CELL_SIZE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#00000022";
        ctx.fill();
        
        // Tower name and level
        ctx.font = "18px Arial";
        ctx.fillStyle = "#000000AA";
        ctx.strokeStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fillText(this.tower.name, this.x + 8, this.y + 20);
        ctx.fillText("Level " + (this.tower.currentLevel + 1), this.x + 8, this.y + 40);
        
        // Targeting mode
        const tarOffset = 46;
        ctx.fillStyle = "#00afaf";
        ctx.fillRect(this.x + 8, this.y + tarOffset, 158, 24);
        ctx.fillStyle = "white";
        ctx.fillText("Targets: " + this.tower.attack.targetMode.toUpperCase(), this.x + 12, this.y + tarOffset + 18);
        
        // Upgrade button
        const upOffset = 76;
        if (this.tower.upgrades.length > this.tower.currentLevel + 1) {
            // there are still upgrades
            ctx.fillStyle = "#009a00";
            ctx.fillRect(this.x + 8, this.y + upOffset, 128, 32);
            ctx.fillStyle = "white";
            ctx.fillText(`$${this.tower.upgrades[this.tower.currentLevel + 1].cost} Upgrade:`, this.x + 12, this.y + upOffset + 20);
            ctx.fillStyle = "#000000AA";
            ctx.fillRect(this.x + 8, this.y + upOffset + 40, 240, 100);
            ctx.fillStyle = "white";
            
            let offset = 0;
            for (let line of wrapText(ctx, this.tower.upgrades[this.tower.currentLevel + 1].description, this.width - 16)) {
                ctx.fillText(line, this.x + 8, this.y + upOffset + 58 + offset);
                offset += 24;
            }
        } else {
            ctx.fillStyle = "#005500";
            ctx.fillRect(this.x + 8, this.y + upOffset, 132, 32);
            ctx.fillStyle = "white";
            ctx.fillText("Fully upgraded!", this.x + 12, this.y + upOffset + 20);
        }
        
        // Sell button
        ctx.fillStyle = "#BB0000";
        ctx.fillRect(this.x + 8, this.y + this.height - 32, 128, 24);
        ctx.strokeStyle = "#550000";
        ctx.strokeRect(this.x + 8, this.y + this.height - 32, 128, 24);
        ctx.fillStyle = "white";
        ctx.fillText("Sell: $" + Math.round(this.tower.upgrades.map((a, ind) => this.tower.currentLevel >= ind ? a.cost : 0).reduce((acc, val) => acc + val) * 0.75), this.x + 10, this.y + this.height - 12);

        ctx.restore();
    }
    
    handleClick(pos) {
        if (this.tower.upgrades.length > this.tower.currentLevel
            && pos.y >= this.y + 76 && pos.y <= this.y + 108) {
            if (gameEngine.spendMoney(this.tower.upgrades[this.tower.currentLevel + 1].cost)) {
                this.tower.upgrade(this.tower.currentLevel + 1);
            }
        } else if (insideBox(pos, {x: this.x + 8, y: this.y + this.height - 32, width: 80, height: 24})) {
            gameEngine.addMoney(Math.round(this.tower.upgrades.map((a, ind) => this.tower.currentLevel >= ind ? a.cost : 0).reduce((acc, val) => acc + val) * 0.75));
            this.tower.removeFromWorld = true;
            this.removeFromWorld = true;
        } else if (insideBox(pos, {x: this.x + 8, y: this.y + 48, width: 158, height: 24})) {
            const opts = ["close", "far", "first", "last", "weak", "strong"];
            this.tower.attack.targetMode = opts[(opts.indexOf(this.tower.attack.targetMode) + 1) % opts.length];
        }
    }
}