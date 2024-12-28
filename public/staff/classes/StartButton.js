class StartButton {
  constructor({ ctx, canvas, game, socket }) {
    this.game = game;
    this.canvas = canvas;
    this.ctx = ctx;
    this.socket = socket;
    this.width =
      this.canvas.width > this.canvas.height
        ? this.canvas.width / 5
        : this.canvas.height / 5;
    this.height =
      this.canvas.width > this.canvas.height
        ? this.canvas.height / 2.5
        : this.canvas.width / 2.5;
    this.x = this.canvas.width / 2 - this.width / 2;
    this.y = this.canvas.height / 2 - this.height / 2;
    this.opacity = 0.2;

    audioInput.onchange = () => {
      this.opacity = 0.2;
      const files = document.getElementById("songInput").files;
      audio = new Audio();
      audio.src = URL.createObjectURL(files[0]);
      audio.crossOrigin = "anonymous";
      audio.play();
      const audioCtx = new AudioContext();

      audioSource = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 64;

      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      this.game.isGameStarted = true;
      this.game.startButton = null;

      setTimeout(() => {
        socket.emit("addSongToBackEnd", {
          data: files[0],
          name: files[0].name.split(".").shift(),
          duration: audio.duration,
        });
      }, 3000);
    };
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 0, 0," + this.opacity + ")";
    this.ctx.lineTo(this.x, this.y);
    this.ctx.lineTo(this.x + this.width, this.y + this.height * 0.5);
    this.ctx.lineTo(this.x, this.y + this.height);
    this.ctx.lineTo(this.x, this.y);
    // this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fill();
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 4);
    this.ctx.rotate(Math.PI / 6.9);

    this.ctx.fillStyle = "rgba(255, 255, 255," + this.opacity + ")";
    this.ctx.textAlign = "center";
    this.ctx.font = this.width / 10 + "px serif";
    this.ctx.fillText("CHOOSE YOUR SONG", 0, 0);
    this.ctx.restore();
  }

  update({ analyser }) {
    this.opacity > 0.2 ? (this.opacity -= 0.01) : (this.opacity = 0.2);
  }
}
