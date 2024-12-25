class Enemy {
  constructor({ game, ctx, canvas, speed, radius }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.speed = speed;
    this.radius = radius;
    if (Math.random() > 0.5) {
      this.x = Math.random() * this.canvas.width;
      this.y =
        Math.random() > 0.5 ? -this.radius : this.canvas.height + this.radius;
    } else {
      this.x =
        Math.random() > 0.5 ? -this.radius : this.canvas.width + this.radius;
      this.y = Math.random() * this.canvas.height;
    }

    this.nextX = 0;
    this.nextY = 0;
    this.HP = 3;
  }
  update() {
    const distance =
      Math.hypot(this.game.player.y - this.y, this.game.player.x - this.x) /
      this.speed;
    if (this.speed < distance) {
      this.nextX = (this.game.player.x - this.x) / distance || 0;
      this.nextY = (this.game.player.y - this.y) / distance || 0;
    } else {
      this.nextX = 0;
      this.nextY = 0;
    }

    this.x += this.nextX;
    this.y += this.nextY;

    for (let i = 0; this.game.player.projectiles.length > i; i++) {
      const distanceToProjectile = Math.abs(
        Math.hypot(
          this.x - this.game.player.projectiles[i].x,
          this.y - this.game.player.projectiles[i].y
        )
      );
      if (
        distanceToProjectile <
        this.radius + this.game.player.projectiles[i].radius
      ) {
        this.HP -= 1;
      }
    }
    if (
      Math.abs(distance * this.speed) <
      this.radius + this.game.player.radius
    ) {
      this.HP = 0;
      this.game.player.HP -= 0.02;
      this.game.player.heart -= 5;
      this.game.player.properties.isDamaged = true;
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
