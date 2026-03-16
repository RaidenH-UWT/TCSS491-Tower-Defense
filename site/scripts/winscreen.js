/**
 * Win screen that displays when all enemies are defeated
 * Only shows when enemies are actually killed, not when they escape to the goal
 */
class WinScreen {
    constructor(gameEngine) {
      this.gameEngine = gameEngine;
  
      // Visibility & fade
      this.visible = false;
      this.alpha = 0;
      this.fadeSpeed = 2;
  
      // Animation
      this.scale = 0.6;
      this.bounceTime = 0;
  
      // Enemy tracking
      this.totalEnemiesSpawned = 0;
      this.enemiesKilled = 0;
    }
  
    /**
     * Call this when an enemy is spawned
     */
    enemySpawned() {
      this.totalEnemiesSpawned++;
  
      if (DEBUG.enemy) {
        console.log("Enemy spawned. Total spawned:", this.totalEnemiesSpawned);
      }
    }
  
    /**
     * Call this when an enemy is killed
     */
    enemyKilled() {
      this.enemiesKilled++;
  
      if (DEBUG.enemy) {
        console.log(
          "Enemy killed!",
          this.enemiesKilled,
          "of",
          this.totalEnemiesSpawned
        );
      }
    }
  
    /**
     * Check if all enemies are defeated
     */
    checkWinCondition() {
      if (this.visible) return;
  
      // check if there are any waves/enemies left
      if (this.gameEngine.enemyCount == 0 && this.gameEngine.map.waves.length == 0) {
        this.show();
      }
    }
  
    show() {
      this.visible = true;
      this.alpha = 0;
      this.scale = 0.6;
      this.bounceTime = 0;
  
      if (DEBUG.enemy) {
        console.log("🎉 VICTORY! All enemies defeated!");
      }
    }
  
    hide() {
      this.visible = false;
      this.alpha = 0;
      this.scale = 0.6;
      this.bounceTime = 0;
  
      this.totalEnemiesSpawned = 0;
      this.enemiesKilled = 0;
    }
  
    update(clockTick) {
      if (!this.visible) return;
  
      // Fade in
      this.alpha = Math.min(1, this.alpha + this.fadeSpeed * clockTick);
  
      // Smooth zoom-in
      this.scale += (1 - this.scale) * 0.12;
  
      // Bounce timer
      this.bounceTime += clockTick;
    }
  
    draw(ctx) {
      if (!this.visible) return;
  
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
  
      // Dark overlay
      ctx.fillStyle = `rgba(0, 0, 0, ${0.75 * this.alpha})`;
      ctx.fillRect(0, 0, width, height);
  
      // === VICTORY TEXT (Animated) ===
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(centerX, centerY - 60);
  
      const bounce =
        Math.sin(this.bounceTime * 6) * 6 * (1 - this.alpha);
  
      ctx.scale(this.scale, this.scale);
      ctx.translate(0, bounce);
  
      ctx.font = "bold 80px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
  
      ctx.shadowColor = "gold";
      ctx.shadowBlur = 20;
  
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 6;
      ctx.strokeText("VICTORY!", 0, 0);
  
      ctx.fillStyle = "gold";
      ctx.fillText("VICTORY!", 0, 0);
  
      ctx.restore();
  
      // === SUBTITLE (Delayed) ===
      if (this.alpha > 0.5) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = "36px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("All enemies defeated!", centerX, centerY + 20);
        ctx.restore();
      }
  
      // === INSTRUCTION ===
      if (this.alpha > 0.8) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = "24px Arial";
        ctx.fillStyle = "lightgray";
        ctx.textAlign = "center";
        ctx.fillText("Press R to Restart or E to enter Endless Mode", centerX, centerY + 80);
        ctx.restore();
      }
    }
  
    handleInput(key) {
      if (!this.visible) return false;
  
      if (key === "r" || key === "R") {
        this.restart();
        return true;
      } else if (key === "e" || key === "E") {
        this.gameEngine.map.isEndless = true;
        this.gameEngine.map.wavesCompleted = 0;  // ← add this
    this.gameEngine.map.totalWaves = 0;  
        this.gameEngine.map.isSpawning = true; 
        this.gameEngine.gameOver = false;
        this.hide();
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
  