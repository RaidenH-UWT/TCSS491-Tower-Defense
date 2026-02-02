class Portal {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.maxRadius = 28;
    this.radius = 0;

    this.state = "OPENING"; // OPENING, ACTIVE, CLOSING
    this.timer = 0;

    this.removeFromWorld = false;
  }

  close() {
    if (this.state !== "CLOSING") {
      this.state = "CLOSING";
      this.timer = 0;
    }
  }

  update(clockTick) {
    this.timer += clockTick;

    if (this.state === "OPENING") {
      this.radius += clockTick * 60; // growth speed
      if (this.radius >= this.maxRadius) {
        this.radius = this.maxRadius;
        this.state = "ACTIVE";
        this.timer = 0;
      }
    }

    else if (this.state === "ACTIVE") {
      // idle pulse handled in draw
    }

    else if (this.state === "CLOSING") {
      this.radius -= clockTick * 120;

      // blink effect
      this.visible = Math.floor(this.timer * 10) % 2 === 0;

      if (this.radius <= 0) {
        this.removeFromWorld = true;
      }
    }
  }

  draw(ctx) {
    if (this.state === "CLOSING" && !this.visible) return;

    const pulse =
      this.state === "ACTIVE"
        ? Math.sin(this.timer * 4) * 2
        : 0;

    ctx.save();

    // outer ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 6 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(170, 90, 255, 0.7)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // inner core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120, 40, 200, 0.85)";
    ctx.fill();

    ctx.restore();
  }
}
