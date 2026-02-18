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
            this.height = Math.max(Object.keys(this.tower.upgrades).length * 64 + 64, 256);
            this.x = this.tower.x + this.width > 1024 ? this.tower.x - this.width : this.tower.x;
            this.y = this.tower.y > 384 ? this.tower.y - this.height - 72 : this.tower.y + 72;
            
            let currY = 0;
            for (let key of Object.keys(this.tower.upgrades)) {
                let height = wrapText(ctx, "$" + this.tower.upgrades[key].cost + " " + this.tower.upgrades[key].description, this.width - 16).length * 24;
                this.upgradeBounds[key] = {start: this.y + 44 + currY, end: height + this.y + currY + 48};
                currY += height + 8;
            }
            console.log(this.upgradeBounds);
        }
        
        ctx.font = "18px Arial";
        
        ctx.fillStyle = "#000000AA";
        ctx.strokeStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fillText(this.tower.name, this.x + 8, this.y + 20);
        
        // TODO: consider adding some visual tell for what the current upgrade is, and what we've upgraded past.
        // may want to make tower upgrades fully linear? so we can stop showing the old stuff. or just pop old upgrades off the list.
        let currY = 0;
        for (let key of Object.keys(this.tower.upgrades)) {
            const temp = currY;
            const lines = wrapText(ctx, "$" + this.tower.upgrades[key].cost + " " + this.tower.upgrades[key].description, this.width - 16);
            ctx.fillStyle = "#9f0942";
            ctx.fillRect(this.x + 4, this.y + 44 + currY, this.width - 12, lines.length * 24 + 4);
            ctx.fillStyle = "white";
            for (let line of lines) {
                ctx.fillText(line, this.x + 8, this.y + 64 + currY);
                currY += 24;
            }
            currY += 8;
        }
        
        ctx.fillStyle = "#BB0000";
        ctx.fillRect(this.x + 8, this.y + this.height - 32, 128, 24);
        ctx.strokeStyle = "#550000";
        ctx.strokeRect(this.x + 8, this.y + this.height - 32, 128, 24);
        ctx.fillStyle = "white";
        ctx.fillText("Sell: $" + Math.round(this.tower.upgrades[this.tower.currentLevel].cost * 0.75), this.x + 10, this.y + this.height - 12);
    }
    
    handleClick(pos) {
        for (let key of Object.keys(this.upgradeBounds)) {
            if (pos.y >= this.upgradeBounds[key].start && pos.y <= this.upgradeBounds[key].end && this.tower.currentLevel != key) {
                this.tower.upgrade(key);
            }
        }
        if (insideBox(pos, {x: this.x + 8, y: this.y + this.height - 32, width: 80, height: 24})) {
            gameEngine.addMoney(Math.round(this.tower.upgrades[this.tower.currentLevel].cost * 0.75));
            this.tower.removeFromWorld = true;
            this.removeFromWorld = true;
        }
    }
}