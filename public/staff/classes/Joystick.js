class Joystick {
  constructor({ ctx, canvas, controls, game }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.controls = controls;
    this.outerRadius =
      this.canvas.width > this.canvas.height
        ? this.canvas.width * 0.08
        : this.canvas.height * 0.08;
    this.innerRadius = this.outerRadius * 0.5;
    this.x = this.canvas.width - this.outerRadius * 1.2;
    this.y = this.canvas.height - this.outerRadius * 1.2;
    this.joystickX = this.canvas.width - this.outerRadius * 1.2;
    this.joystickY = this.canvas.height - this.outerRadius * 1.2;
    this.isInFoucus = false;
    this.isGameStarted = false;

    canvas.addEventListener("touchstart", (e) => {
      if (
        Math.abs(
          Math.hypot(
            e.touches[0].clientX - this.x,
            e.touches[0].clientY - this.y
          )
        ) < this.innerRadius
      ) {
        this.joystickX = e.touches[0].clientX;
        this.joystickY = e.touches[0].clientY;
        this.isInFoucus = true;
      }
    });
    canvas.addEventListener("touchmove", (e) => {
      if (
        this.isInFoucus &&
        e.touches[0].clientX > this.x - this.outerRadius &&
        e.touches[0].clientX < this.x + this.outerRadius
      ) {
        this.joystickX = e.touches[0].clientX;
      }

      if (
        this.isInFoucus &&
        e.touches[0].clientY > this.y - this.outerRadius &&
        e.touches[0].clientY < this.y + this.outerRadius
      ) {
        this.joystickY = e.touches[0].clientY;
      }
    });
    canvas.addEventListener("touchend", (e) => {
      this.joystickX = this.x;
      this.joystickY = this.y;
      this.isInFoucus = false;
    });
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "yellow";
    this.ctx.arc(this.x, this.y, this.outerRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.fillStyle = "yellow";
    this.ctx.arc(
      this.joystickX,
      this.joystickY,
      this.innerRadius,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  update() {
    //direction based movement
    // if (
    //   this.x < this.joystickX &&
    //   this.y + this.innerRadius / 3 > this.joystickY &&
    //   this.y - this.innerRadius / 3 < this.joystickY
    // ) {
    //   this.controls = { up: false, down: false, left: false, right: true };
    //   this.game.controls = this.controls;
    // } else if (
    //   this.x > this.joystickX &&
    //   this.y + this.innerRadius / 3 > this.joystickY &&
    //   this.y - this.innerRadius / 3 < this.joystickY
    // ) {
    //   this.controls = { up: false, down: false, left: true, right: false };
    //   this.game.controls = this.controls;
    // } else if (
    //   this.x > this.joystickX &&
    //   this.y + this.innerRadius / 3 > this.joystickY
    // ) {
    //   this.controls = { up: true, down: false, left: true, right: false };
    //   this.game.controls = this.controls;
    // } else if (
    //   this.x < this.joystickX &&
    //   this.y + this.innerRadius / 3 > this.joystickY
    // ) {
    //   this.controls = { up: true, down: false, left: false, right: true };
    //   this.game.controls = this.controls;
    // } else if (
    //   this.x > this.joystickX &&
    //   this.y - this.innerRadius / 3 < this.joystickY
    // ) {
    //   this.controls = { up: false, down: true, left: true, right: false };
    //   this.game.controls = this.controls;
    // } else if (
    //   this.x < this.joystickX &&
    //   this.y - this.innerRadius / 3 < this.joystickY
    // ) {
    //   this.controls = { up: false, down: true, left: false, right: true };
    //   this.game.controls = this.controls;
    // }

    // if (
    //   this.y < this.joystickY &&
    //   this.x + this.innerRadius / 3 > this.joystickX &&
    //   this.x - this.innerRadius / 3 < this.joystickX
    // ) {
    //   this.controls = { up: false, down: true, left: false, right: false };
    //   this.game.controls = this.controls;
    // } else if (
    //   this.y > this.joystickY &&
    //   this.x + this.innerRadius / 3 > this.joystickX &&
    //   this.x - this.innerRadius / 3 < this.joystickX
    // ) {
    //   this.controls = { up: true, down: false, left: false, right: false };
    //   this.game.controls = this.controls;
    // }

    // if (this.x == this.joystickX && this.y === this.joystickY) {
    //   this.controls = { up: false, down: false, left: false, right: false };
    //   this.game.controls = this.controls;
    // }

    const dx =
      (this.x - this.joystickX) /
      Math.hypot(this.x - this.joystickX, this.y - this.joystickY);
    const dy =
      (this.y - this.joystickY) /
      Math.hypot(this.x - this.joystickX, this.y - this.joystickY);
    if (this.game.player && dx && dy) {
      this.game.player.x += this.game.player.speed * -dx;
      this.game.player.y += this.game.player.speed * -dy;
    }
  }
}
