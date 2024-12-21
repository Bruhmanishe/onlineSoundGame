class Projectile {
  constructor({ canvas, ctx, radius, x, y, dirX, dirY, velocity, player }) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.ctx = ctx;
    this.radius = radius;
    this.dirX = dirX;
    this.dirY = dirY;
    this.velocity = velocity;
    this.isDestroy = false;
    this.heart = this.player.heart;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.strokeStyle = `rgba(255, ${255 - this.heart}, ${
      255 - this.heart
    }, 1)`;
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.stroke();
  }
  update() {
    this.x += (this.velocity * this.dirX) / 10;
    this.y += (this.velocity * this.dirY) / 10;
    if (
      this.x - this.radius > this.canvas.width ||
      this.x + this.radius < 0 ||
      this.y - this.radius > this.canvas.height ||
      this.y + this.radius < 0 ||
      this.radius >
        (this.canvas.width > this.canvas.height
          ? this.canvas.width * 0.001 * Math.pow(this.velocity, 2)
          : this.canvas.height * 0.001 * Math.pow(this.velocity, 2))
    ) {
      this.isDestroy = true;
    }

    this.radius += this.velocity;
  }
}
