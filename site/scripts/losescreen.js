/**
 * Loss screen that displays when player health reaches 0
 */
class LoseScreen {
    constructor(gameEngine) {
      this.gameEngine = gameEngine;
  
      // Visibility & fade
      this.visible = false;
      this.alpha = 0;
      this.fadeSpeed = 2;
  
      // Animation
      this.shakeTime = 0;
      this.shakeIntensity = 8;
    }
  
    show() {
      this.visible = true;
      this.alpha = 0;
      this.shakeTime = 0;
    }
  
    hide() {
      this.visible = false;
      this.alpha = 0;
    }
  
    update(clockTick) {
      if (!this.visible) return;
  
      this.alpha = Math.min(1, this.alpha + this.fadeSpeed * clockTick);
      this.shakeTime += clockTick;
    }
  
    draw(ctx) {
      if (!this.visible) return;
  
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const cx = w / 2;
      const cy = h / 2;
  
      // Screen shake
      const shakeX =
        Math.sin(this.shakeTime * 40) * this.shakeIntensity * (1 - this.alpha);
      const shakeY =
        Math.cos(this.shakeTime * 35) * this.shakeIntensity * (1 - this.alpha);
  
      ctx.save();
      ctx.translate(shakeX, shakeY);
  
      // Dark red overlay
      ctx.fillStyle = `rgba(120, 0, 0, ${0.75 * this.alpha})`;
      ctx.fillRect(0, 0, w, h);
  
      ctx.restore();
  
      // === DEFEAT TEXT ===
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.font = "bold 80px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
  
      ctx.shadowColor = "black";
      ctx.shadowBlur = 20;
  
      ctx.strokeStyle = "black";
      ctx.lineWidth = 6;
      ctx.strokeText("GAME OVER", cx, cy - 40);
  
      ctx.fillStyle = "crimson";
      ctx.fillText("GAME OVER", cx, cy - 40);
  
      ctx.restore();
  
      // Subtitle
      if (this.alpha > 0.5) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = "32px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Your base has fallen", cx, cy + 30);
        ctx.restore();
      }
  
      // Instruction
      if (this.alpha > 0.8) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = "24px Arial";
        ctx.fillStyle = "lightgray";
        ctx.textAlign = "center";
        ctx.fillText("Press R to Restart", cx, cy + 90);
        ctx.restore();
      }
    }
  
    handleInput(key) {
      if (!this.visible) return false;
  
      if (key === "r" || key === "R") {
        this.restart();
        return true;
      }
      return false;
    }
  
    restart() {
      console.log("Restarting game...");
      this.hide();
  
      if (this.gameEngine.restart) {
        this.gameEngine.restart();
      } else {
        window.location.reload();
      }
    }
  }
  