class Enemy {
  constructor({ game, ctx, canvas, speed, radius }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.type = "base";
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
    if (this.type === "base") {
      if (this.speed < distance) {
        this.nextX = (this.game.player.x - this.x) / distance || 0;
        this.nextY = (this.game.player.y - this.y) / distance || 0;
      } else {
        this.nextX = 0;
        this.nextY = 0;
      }
      this.x += this.nextX;
      this.y += this.nextY;

      if (
        Math.abs(distance * this.speed) <
          this.radius + this.game.player.radius &&
        this.type === "base"
      ) {
        this.HP = 0;

        this.game.player.HP -= 0.002;
        this.game.player.heart -= 5;
        this.game.player.properties.isDamaged = true;
      }
    }
    if (this.type === "boss") {
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
      } else if (this.radius < 20) {
        this.radius = 30;
      }
      this.radius -= 0.4;

      if (
        Math.abs(distance) < this.radius + this.game.player.radius &&
        this.type === "boss"
      ) {
        this.game.player.HP -= 0.02;
        this.game.player.heart -= 1;
        this.game.player.properties.isDamaged = true;
      }
    }
    if (this.type === "laser") {
      this.timeCount >= this.game.secondToFrames * this.laserCD
        ? ((this.timeCount = 0),
          (this.laser = new Laser({
            game: this.game,
            ctx: this.ctx,
            canvas: this.canvas,
            parent: this,
          })))
        : this.timeCount++;

      this.timeCount >= (this.game.secondToFrames * this.laserCD) / 3 &&
      this.laser
        ? (this.laser = null)
        : null;

      const distance = Math.hypot(
        this.x - this.game.player.x,
        this.y - this.game.player.y
      );
      const dx = (this.x - this.game.player.x) / distance;
      const dy = (this.y - this.game.player.y) / distance;
      //making particles
      if (this.timeCount % 10 === 0 && this.timeCount > 60) {
        for (let i = 0; Math.abs(Math.random() * (5 - 2) + 2) > i; i++) {
          this.game.particles.push(
            new LaserParticle({
              game: this.game,
              x:
                this.eyeX +
                this.radius *
                  (Math.random() * 1.5) *
                  (-dx + -dx * (Math.random() * (1 - -1) + -1)),
              y:
                this.eyeY +
                this.radius *
                  (Math.random() * 1.5) *
                  (-dy + -dx * (Math.random() * (1 - -1) + -1)),
              parent: this,
              speed: (this.timeCount / 70) * this.speed,
            })
          );
        }
      }

      if (Math.abs(distance) < this.canvas.width * 0.15 && !this.laser) {
        this.x += this.speed * dx;
        this.y += this.speed * dy;
      } else if (Math.abs(distance) > this.canvas.width * 0.25 && !this.laser) {
        this.x += this.speed * -dx;
        this.y += this.speed * -dy;
      }

      if (!this.laser) {
        dx > this.eyedx ? (this.eyedx += 0.02) : (this.eyedx -= 0.02);
        dy > this.eyedy ? (this.eyedy += 0.02) : (this.eyedy -= 0.02);

        this.eyeX = this.x + this.radius * 0.5 * -this.eyedx;
        this.eyeY = this.y + this.radius * 0.5 * -this.eyedy;
      }

      if (this.laser) {
        this.laser.update();
        this.laser.hitBoxs.forEach((hitBox) => {
          if (
            Math.abs(
              Math.hypot(
                hitBox.x - this.game.player.x,
                hitBox.y - this.game.player.y
              )
            ) <
            hitBox.radius + this.game.player.radius
          ) {
            this.game.player.HP -= 0.2;
            this.game.player.properties.isDamaged = true;
          }
        });
      }
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
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.isDamaged
      ? "rgba(255, 255, 255, 0.2)"
      : this.color;
    if (this.type === "boss") {
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
    this.type = "boss";
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

class EnemyLaser extends Enemy {
  constructor({ game, ctx, canvas, speed, radius }) {
    super(game, ctx, canvas, speed, radius);
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.type = "laser";
    this.isDamaged = false;
    this.radius = 30;
    this.speed = (speed * this.game.buffersAboveMin) / 10;
    this.HP = 300;
    this.initHP = this.HP;
    this.timeCount = 0;
    this.laserCD =
      this.game.buffersAboveMin > 5 ? 5 / (this.game.buffersAboveMin * 0.1) : 5;

    if (Math.random() > 0.5) {
      this.x = Math.random() * this.canvas.width;
      this.y =
        Math.random() > 0.5 ? -this.radius : this.canvas.height + this.radius;
    } else {
      this.x =
        Math.random() > 0.5 ? -this.radius : this.canvas.width + this.radius;
      this.y = Math.random() * this.canvas.height;
    }
    this.eyeX = this.x;
    this.eyeY = this.y;
    this.eyeRadius = this.radius * 0.7;
    this.eyedx =
      (this.eyeX - this.game.player.x) /
      Math.hypot(
        this.eyeX - this.game.player.x,
        this.eyeY - this.game.player.y
      );
    this.eyedy =
      (this.eyeY - this.game.player.y) /
      Math.hypot(
        this.eyeX - this.game.player.x,
        this.eyeY - this.game.player.y
      );
  }

  draw() {
    this.laser && this.laser.draw();

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.arc(this.eyeX, this.eyeY, this.eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    this.ctx.stroke();

    this.ctx.beginPath();

    this.ctx.fillStyle = `rgba(250, 0, 0, ${
      1 - (this.timeCount / this.laserCD) * 0.02
    })`;
    this.ctx.arc(
      this.eyeX +
        this.eyeRadius *
          0.39 *
          ((this.game.player.x - this.eyeX) /
            Math.hypot(
              this.game.player.x - this.eyeX,
              this.game.player.y - this.eyeY
            )),
      this.eyeY +
        this.eyeRadius *
          0.39 *
          ((this.game.player.y - this.eyeY) /
            Math.hypot(
              this.game.player.x - this.eyeX,
              this.game.player.y - this.eyeY
            )),
      this.radius * 0.4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.beginPath();

    this.ctx.fillStyle = this.isDamaged
      ? "rgba(255, 255, 255, 0.2)"
      : `rgba(${100 * (this.HP / this.initHP) + 10}, ${
          100 * (this.HP / this.initHP) + 10
        }, ${100 * (this.HP / this.initHP) + 10}, 1)`;
    if (this.type == "laser")
      this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    this.ctx.stroke();
  }
}

class Laser {
  constructor({ game, ctx, canvas, parent }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.parent = parent;
    this.x = parent.eyeX;
    this.y = parent.eyeY;
    this.isTageted = false;
    this.lineX = this.x;
    this.lineY = this.y;

    this.hitBoxs = [
      { x: this.x, y: this.y, radius: 10, isHit: false, speed: 40 },
      { x: this.x, y: this.y, radius: 10, isHit: false, speed: 30 },
      { x: this.x, y: this.y, radius: 10, isHit: false, speed: 20 },
    ];

    // this.distance = Math.hypot(
    //   this.x - this.game.player.x,
    //   this.y - this.game.player.y
    // );
    // this.dx = (this.x - this.game.player.x) / this.distance;
    // this.dy = (this.y - this.game.player.y) / this.distance;

    this.width = this.parent.eyeRadius / 2;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = this.hitBoxs[0].radius * 2;
    this.ctx.lineTo(this.x, this.y);
    this.ctx.lineTo(
      (this.lineX += 30 * -this.parent.eyedx),
      (this.lineY += 30 * -this.parent.eyedy)
    );
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    this.ctx.lineWidth = this.hitBoxs[0].radius * 2.5;
    this.ctx.lineTo(this.x, this.y);
    this.ctx.lineTo(
      (this.lineX += 30 * -this.parent.eyedx),
      (this.lineY += 30 * -this.parent.eyedy)
    );
    this.ctx.stroke();
    this.ctx.lineWidth = 1;

    this.hitBoxs.forEach((hitBox) => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
      this.ctx.arc(hitBox.x, hitBox.y, hitBox.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  update() {
    this.hitBoxs.forEach((hitBox) => {
      hitBox.radius = this.game.buffersAboveMin;
      this.x = this.parent.eyeX;
      this.y = this.parent.eyeY;

      if (
        hitBox.x > this.canvas.width ||
        hitBox.x < 0 ||
        hitBox.y > this.canvas.height ||
        hitBox.y < 0
      ) {
        hitBox.x = this.x;
        hitBox.y = this.y;
      } else {
        hitBox.x += hitBox.speed * -this.parent.eyedx;
        hitBox.y += hitBox.speed * -this.parent.eyedy;
      }
    });
  }
}
