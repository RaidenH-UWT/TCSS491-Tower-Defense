class Popup {
    constructor(tower) {
        this.tower = tower;
        this.x;
        this.y;
        this.width;
        this.height;
    }
    
    update(clockTick) {
        
    }
    
    draw(ctx) {
        if (this.x == undefined) {
            // define all our dimensions by measuring text
            ctx.font = "18px Arial";
            this.width = Math.max(ctx.measureText(this.tower.name).width, 256);
            this.height = 256;
            this.x = this.tower.x + this.width > 1024 ? this.tower.x - this.width : this.tower.x;
            this.y = this.tower.y > 384 ? this.tower.y - this.height - 72 : this.tower.y + 72;
        }
        
        ctx.font = "18px Arial";
        
        ctx.fillStyle = "#000000AA";
        ctx.strokeStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fillText(this.tower.name, this.x + 8, this.y + 20);
    }
}