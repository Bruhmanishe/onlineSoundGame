class Enemy {
  constructor({ game, ctx, canvas, speed, radius }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.speed = speed;
    this.radius = radius;
    this.color = "rgba(255, 255, 255, 1)";
    this.isDamaged = false;
    this.dx = 0;
    this.dy = 0;

    if (Math.random() > 0.5) {
      this.x = Math.random() * this.canvas.width;
      this.y =
        Math.random() > 0.5 ? -this.radius : this.canvas.height + this.radius;
    } else {
      this.x =
        Math.random() > 0.5 ? -this.radius : this.canvas.width + this.radius;
      this.y = Math.random() * this.canvas.height;
    }

    this.HP = 3;
    this.initHP = this.HP;
  }
  update() {
    const distance =
      Math.hypot(this.game.player.y - this.y, this.game.player.x - this.x) /
      this.speed;
    if (this.HP <= 3) {
      if (this.speed < distance) {
        this.nextX = (this.game.player.x - this.x) / distance || 0;
        this.nextY = (this.game.player.y - this.y) / distance || 0;
      } else {
        this.nextX = 0;
        this.nextY = 0;
      }
      this.x += this.nextX;
      this.y += this.nextY;
    } else {
      const distance = Math.hypot(
        this.game.player.y - this.y,
        this.game.player.x - this.x
      );
      if (this.speed === this.initSpeed) {
        this.dx = (this.game.player.x - this.x) / distance || 0;
        this.dy = (this.game.player.y - this.y) / distance || 0;
      }

      this.x += this.speed * this.dx;
      this.y += this.speed * this.dy;

      this.speed -= this.acceleration;

      this.speed <= 0 ? (this.speed = this.initSpeed) : null;
      this.game.buffersAboveMin > 10
        ? (this.initSpeed = this.game.buffersAboveMin * 0.9)
        : (this.initSpeed = 10);

      if (this.game.buffersAboveMin > 16) {
        this.radius = this.game.buffersAboveMin * 4;
        console.log(this.game.buffersAboveMin);
      } else if (this.radius < 20) {
        this.radius = 30;
      }
      this.radius -= 0.4;
    }

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
        this.isDamaged = true;
      }
    }
    if (
      Math.abs(distance * this.speed) < this.radius + this.game.player.radius &&
      this.HP <= 3
    ) {
      this.HP = 0;
      this.game.player.HP -= 0.02;
      this.game.player.heart -= 5;
      this.game.player.properties.isDamaged = true;
    } else if (
      Math.abs(distance * this.speed) <
      this.radius + this.game.player.radius
    ) {
      this.game.player.HP -= 0.02;
      this.game.player.heart -= 1;
      this.game.player.properties.isDamaged = true;
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.isDamaged
      ? "rgba(255, 255, 255, 0.2)"
      : this.color;
    if (this.HP > 3) {
      this.ctx.fillStyle = `rgba(${
        255 * (this.HP / this.initHP) + 10
      }, 0, 0, 1)`;
    }
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

class EnemyBoss extends Enemy {
  constructor({ game, ctx, canvas, speed, radius }) {
    super(game, ctx, canvas, speed, radius);
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.speed = this.game.buffersAboveMin * 0.9;
    this.radius = radius;
    this.initSpeed = this.game.buffersAboveMin * 0.9;
    this.isDamaged = false;
    this.acceleration =
      this.game.buffersAboveMin > 10
        ? (0.1 * this.game.buffersAboveMin) / 5
        : 0.1;
    this.HP = 500;
    this.initHP = this.HP;

    if (Math.random() > 0.5) {
      this.x = Math.random() * this.canvas.width;
      this.y =
        Math.random() > 0.5 ? -this.radius : this.canvas.height + this.radius;
    } else {
      this.x =
        Math.random() > 0.5 ? -this.radius : this.canvas.width + this.radius;
      this.y = Math.random() * this.canvas.height;
    }
  }
}
