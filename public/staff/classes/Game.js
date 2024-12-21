class Game {
  constructor({ canvas, ctx, controls, socket }) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.controls = controls;
    this.socket = socket;
    this.joystick = new Joystick({ canvas, ctx, controls, game: this });
    this.player = new Player({ ctx, canvas, speed: 5, game: this });
    this.startButton = new StartButton({ canvas, ctx, game: this, socket });
    this.menu = new Menu({ canvas, ctx, game: this });
    this.enemies = [];
    this.particles = [];
    this.buffersAboveMin = 1;
    this.framesCounter = 0;
    this.secondToFrames = 60;
    this.isMobile = navigator.maxTouchPoints > 0;
    this.isGameStarted = false;

    window.addEventListener("resize", (e) => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.player.radius =
        this.canvas.width > this.canvas.height
          ? this.canvas.width * 0.015
          : this.canvas.height * 0.015;
    });

    this.canvas.addEventListener("click", (e) => {
      if (this.startButton) {
        if (
          e.clientX > this.startButton.x &&
          e.clientX < this.startButton.x + this.startButton.width &&
          e.clientY > this.startButton.y &&
          e.clientY < this.startButton.y + this.startButton.height
        ) {
          audioInput.click();
          this.startButton.opacity = 1;
        }
      }
    });
  }

  update({ dataArray, analyser }) {
    this.player.update(this.controls);
    this.enemies = this.enemies.filter((enemy) => {
      enemy.update();
      if (enemy.HP === 0) {
        const drX =
          (this.player.x - enemy.x) /
          Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
        const drY =
          (this.player.y - enemy.y) /
          Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
        for (let i = 0; Math.random() * (10 - 1) + 1 > i; i++) {
          this.particles.push(
            new Particle({
              game: this,
              ctx: this.ctx,
              canvas: this.canvas,
              drX: drX,
              drY: drY,
              x: enemy.x,
              y: enemy.y,
            })
          );
        }
      }
      if (enemy.HP > 0) {
        return enemy;
      } else {
        this.player.heart >= 255
          ? (this.player.heart = 255)
          : this.player.heart++;
      }
    });
    this.particles = this.particles.filter((particle) => {
      particle.update();
      if (!particle.isDestroy) {
        return particle;
      }
    });

    this.isMobile ? this.joystick.update() : null;
    this.startButton ? this.startButton.update({ analyser }) : null;

    if (dataArray) {
      analyser.getByteFrequencyData(dataArray);
      const bufferWidth = 10;
      let x = 0;
      for (let i = 0; dataArray.length / 2 > i; i++) {
        if (dataArray[i] > 150) {
          this.buffersAboveMin++;
        }
        ctx.beginPath();
        if (this.player.HP * 1.6 > i) {
          ctx.fillStyle = "red";
        } else {
          ctx.fillStyle = "white";
        }
        ctx.rect(x, canvas.height, bufferWidth, -dataArray[i] / 5);
        ctx.fill();
        x += bufferWidth + 1;
      }
      if (this.buffersAboveMin > 15) {
        this.player.updateProjectiles(this.buffersAboveMin);
        this.#createEnemies();
      }
      this.buffersAboveMin = 1;
    }

    //frames counter
    this.framesCounter > this.secondToFrames
      ? (this.framesCounter = 0)
      : this.framesCounter++;

    //update menu
    this.menu.update();
  }

  draw() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.rect(0, 0, canvas.width, canvas.height);
    this.ctx.fill();
    this.player.draw();
    this.enemies.forEach((enemy) => enemy.draw());
    this.particles.forEach((particle) => particle.draw());
    this.isMobile ? this.joystick.draw() : null;
    this.startButton ? this.startButton.draw() : null;
    this.menu.draw();
  }

  #createEnemies() {
    this.enemies.push(
      new Enemy({
        game: this,
        ctx: this.ctx,
        canvas: this.canvas,
        speed: 4,
        radius: 5,
      })
    );
  }
}
