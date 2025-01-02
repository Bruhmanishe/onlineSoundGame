class Particle {
  constructor({ game, drX, drY, x, y }) {
    this.game = game;
    this.canvas = this.game.canvas;
    this.ctx = this.game.ctx;
    this.x = x;
    this.y = y;
    this.direction = {
      x: drX + drX * (Math.random() * 0.3),
      y: drY + drY * (Math.random() * 0.3),
    };
    this.speed = 2.5;
    this.deAcceleration = 0.001;
    this.radius =
      this.canvas.width > this.canvas.height
        ? this.canvas.height / 300
        : this.canvas.width / 300;
    this.existingTime = this.game.secondToFrames / 2;
    this.timeCounter = 0;
    this.isDestroy = false;
    this.opacity = 0.7;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity})`;
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  update() {
    this.timeCounter++;
    this.timeCounter >= this.existingTime ? (this.isDestroy = true) : null;
    this.x += -this.direction.x * this.speed;
    this.y += -this.direction.y * this.speed;

    this.speed -= this.deAcceleration;
    this.opacity -= 0.02;
  }
}

class LaserParticle {
  constructor({ game, x, y, parent, speed }) {
    this.game = game;
    this.parent = parent;
    this.canvas = this.game.canvas;
    this.ctx = this.game.ctx;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius =
      this.canvas.width > this.canvas.height
        ? this.canvas.height / 300
        : this.canvas.width / 300;
    this.isDestroy = false;
    this.opacity = 0.7;
    this.distance;
    this.drX;
    this.drY;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  update() {
    this.parent.laser || Math.abs(this.distance) < this.parent.eyeRadius * 2
      ? (this.isDestroy = true)
      : null;

    this.distance = Math.hypot(this.parent.x - this.x, this.parent.y - this.y);
    this.drX = (this.parent.x - this.x) / this.distance;
    this.drY = (this.parent.y - this.y) / this.distance;
    this.x += this.speed * this.drX;
    this.y += this.speed * this.drY;

    this.radius = Math.abs(this.distance) / 10;
  }
}
