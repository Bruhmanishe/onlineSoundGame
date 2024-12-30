class Player {
  constructor({ ctx, canvas, speed, game }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.radius =
      this.canvas.width > this.canvas.height
        ? this.canvas.width * 0.015
        : this.canvas.height * 0.015;
    this.speed = speed;
    this.siundData = dataArray;
    this.projectiles = [];
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.HP = 10;
    this.heart = 0;
    this.healthTime = 4;
    this.timeCounter = 0;

    this.properties = {
      isDamaged: false,
      damageTime: 0.1,
    };

    this.score = 0;
  }

  updateProjectiles(bufferLength) {
    this.projectiles.push(
      new Projectile({
        canvas: this.canvas,
        ctx: this.ctx,
        x: this.x,
        y: this.y,
        radius: bufferLength / 2,
        velocity: bufferLength * 0.5,
        dirX: Math.random() * (1 - -1) + -1,
        dirY: Math.random() * (1 - -1) + -1,
        player: this,
      })
    );
  }

  update({ up, down, left, right }) {
    if (up === true) {
      this.y -= this.speed;
    }
    if (down === true) {
      this.y += this.speed;
    }
    if (left === true) {
      this.x -= this.speed;
    }
    if (right === true) {
      this.x += this.speed;
    }

    //Checking border collision
    this.x + this.radius > this.canvas.width
      ? (this.x = this.canvas.width - this.radius)
      : this.x - this.radius < 0
      ? (this.x = this.radius)
      : null;

    this.y + this.radius >= this.canvas.height
      ? (this.y = this.canvas.height - this.radius)
      : this.y - this.radius < 0
      ? (this.y = this.radius)
      : null;

    for (let i = 0; this.projectiles.length > i; i++) {
      this.projectiles[i].update();
      if (this.projectiles[i].isDestroy) {
        this.projectiles.splice(i, 1);
      }
    }

    //Heal
    if (
      this.game.framesCounter === this.game.secondToFrames &&
      this.healthTime > 0
    ) {
      this.timeCounter++;
      if (this.timeCounter === this.healthTime) {
        this.HP < 10 ? (this.HP += 0.02) : (this.HP = 10);
        this.heart > 0 ? this.heart-- : (this.heart = 0);
        this.heart === 255 ? (this.HP += 0.01) : null;
        this.timeCounter = 0;
      }
    }

    //Taking Damage
    if (this.game.framesCounter === 0 && this.properties.isDamaged) {
    }
  }

  draw() {
    this.projectiles.forEach((el) => el.draw());
    if (!this.properties.isDamaged) {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${255}, ${255 - this.heart}, ${
        255 - this.heart
      }, 1)`;
      this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      this.ctx.fill();
    } else {
      //Taking Damage

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${255}, ${255 - this.heart}, ${
        255 - this.heart
      }, 0.2)`;
      this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      this.ctx.fill();
      this.timeCounter++;
      if (
        this.game.secondToFrames * this.properties.damageTime <=
        this.timeCounter
      ) {
        this.properties.isDamaged = false;
        this.timeCounter = 0;
      }
    }
  }
}
