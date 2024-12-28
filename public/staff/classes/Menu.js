class Menu {
  constructor({ ctx, canvas, game }) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.burgerButton = new BurgerButton({
      ctx,
      canvas,
      game: this.game,
      menu: this,
    });
    this.songList = null;
    this.isLoading = false;
    this.restartBtn;

    canvas.addEventListener("click", (e) => {
      if (this.songList && !this.isLoading) {
        this.songList.songContainers.forEach((container) => {
          if (
            e.clientX > container.x &&
            e.clientX < container.x + container.width &&
            e.clientY > container.height &&
            e.clientY < container.y + container.height &&
            !container.game.isGameStarted &&
            container.menu.songList
          ) {
            console.log(container.menu.songList);
            container.game.socket.emit("sendSong", container.name);
            this.isLoading = true;
          }
        });
        this.songList.pageButtons.forEach((btn) => {
          canvas.addEventListener("click", (e) => {
            if (
              Math.abs(Math.hypot(e.clientX - btn.x, e.clientY - btn.y)) <
              btn.radius
            ) {
              btn.isClicked = true;
            }
          });
        });
      }

      if (this.restartBtn) {
        if (
          Math.abs(
            Math.hypot(
              e.clientX - this.restartBtn.x,
              e.clientY - this.restartBtn.y
            )
          ) <= this.restartBtn.radius
        ) {
          this.game.isRestart = true;
        }
      }

      if (
        e.clientX > this.burgerButton.x &&
        e.clientX < this.burgerButton.x + this.burgerButton.width &&
        e.clientY > this.burgerButton.height &&
        e.clientY < this.burgerButton.y + this.burgerButton.height
      ) {
        if (!this.game.isGameStarted) this.burgerButton.isClicked = true;
        else {
          if (!this.game.isPause && audio) {
            this.game.isPause = true;
            audio.pause();
          } else if (audio) {
            this.game.isPause = false;
            audio.play();
          }
        }
      }
    });
  }
  draw() {
    this.burgerButton.draw();
    this.songList ? this.songList.draw() : null;
    this.restartBtn ? this.restartBtn.draw() : null;
  }
  update() {
    if (!this.songList && this.burgerButton.isClicked) {
      this.songList = new SongList({
        ctx: this.ctx,
        canvas: this.canvas,
        game: this.game,
        menu: this,
      });
      this.burgerButton.isClicked = false;
      this.game.startButton = null;
    }
    if (this.songList && this.burgerButton.isClicked) {
      this.songList.songContainers.forEach((container) => {
        container.songList = null;
      });
      this.songList = null;
      this.burgerButton.isClicked = false;
      this.game.startButton = new StartButton({
        canvas: this.canvas,
        ctx: this.ctx,
        game: this.game,
        socket: this.game.socket,
      });
    }
    if (this.songList)
      this.songList.pageButtons.forEach((btn) => {
        if (btn.isClicked) {
          this.songList.songContainers.forEach((container, i) => {
            if (btn.number > 1) {
              if (this.songList.songs[(i + 5) * (btn.number - 1)]) {
                container.name =
                  this.songList.songs[(i + 5) * (btn.number - 1)].name;
              } else {
                container.name = "";
              }
            } else {
              container.name = this.songList.songs[i].name;
            }
          });
          btn.isClicked = false;
        }
      });
    if (this.songList) this.songList.update();

    this.game.isPause && !this.restartBtn
      ? (this.restartBtn = new RestartBtn({ ctx, canvas, menu: this }))
      : (this.restartBtn = null);
  }
}

class SongContainer {
  constructor({ ctx, canvas, game, menu, songList, name, duration }) {
    this.game = game;
    this.menu = menu;
    this.songList = songList;
    this.ctx = ctx;
    this.canvas = canvas;
    this.x = this.songList.x;
    this.y = this.songList.y;
    this.width = this.songList.width;
    this.height = this.songList.height * 0.2;
    this.name = name || "Song_01";
    this.duration = duration;

    this.game.socket.on("sendSong", (song) => {
      if (!this.game.isGameStarted) {
        const audioBlob = new Blob([song], { type: "audio/mp3" });
        audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        audio.load();
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

        this.menu.songList = null;
        this.isLoading = false;
      }
    });
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.roundRect(this.x - 1, this.y, this.width + 2, this.height, 5);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.font = this.canvas.width * 0.03 + "px Rubik Vinyl";
    this.ctx.fillText(
      this.name,
      this.x + this.height,
      this.y + this.height * 0.4
    );

    //Design
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(0,0,255, 0.2)";
    this.ctx.arc(
      this.x + this.height * 0.5,
      this.y + this.height * 0.5,
      this.height * 0.4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.rect(
      this.x + this.height,
      this.y + this.height * 0.6,
      this.width - this.height * 1.2,
      7
    );
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,255,255, 1)";
    this.ctx.lineTo(this.x + this.height * 0.75, this.y + this.height * 0.5);
    this.ctx.lineTo(this.x + this.height * 0.35, this.y + this.height * 0.75);
    this.ctx.lineTo(this.x + this.height * 0.35, this.y + this.height * 0.25);
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.font =
      (this.canvas.width > this.canvas.height
        ? this.canvas.width * 0.015
        : this.canvas.height * 0.015) + "px Arial";
    this.ctx.fillText(
      "0:00",
      this.x + this.height,
      this.y + this.height * 0.92
    );
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.font =
      (this.canvas.width > this.canvas.height
        ? this.canvas.width * 0.015
        : this.canvas.height * 0.015) + "px Arial";
    let timeDuration =
      (Math.floor(this.duration / 60) < 10
        ? "0" + Math.floor(this.duration / 60)
        : Math.floor(this.duration / 60)) +
      ":" +
      (Math.floor(this.duration) - Math.floor(this.duration / 60) * 60 < 10
        ? "0" +
          (Math.floor(this.duration) - Math.floor(this.duration / 60) * 60)
        : Math.floor(this.duration) - Math.floor(this.duration / 60) * 60);

    this.ctx.fillText(
      timeDuration,
      this.x + this.width * 0.9,
      this.y + this.height * 0.92
    );

    this.ctx.lineWidth = 1;
  }
}

class PageButton {
  constructor({ ctx, canvas, menu, songList, number }) {
    this.menu = menu;
    this.ctx = ctx;
    this.canvas = canvas;
    this.songList = songList;
    this.number = number;
    this.radius = 20;
    this.x = this.songList.x + this.radius * 3 * this.number;
    this.y = this.songList.height + this.songList.y * 1.1 + this.radius;
    this.isClicked = false;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,255,255, 0.1)";
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.font = "30px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.number, this.x, this.y);
  }
}

class SongList {
  constructor({ ctx, canvas, game, menu }) {
    this.game = game;
    this.menu = menu;
    this.ctx = ctx;
    this.canvas = canvas;
    this.x = this.canvas.width * 0.1;
    this.y =
      this.canvas.height > this.canvas.width
        ? this.canvas.height * 0.2
        : this.canvas.height * 0.1;
    this.width = this.canvas.width * 0.79;
    this.height =
      this.canvas.height > this.canvas.width
        ? this.canvas.width * 1.2
        : this.canvas.height * 0.8;
    this.loading = new Loading({ ctx, canvas, songList: this });
    this.songs;
    this.songContainers = [];
    this.pageButtons = [];

    this.game.socket.on("returnSongsData", (songsData) => {
      this.songs = songsData;
      this.songs.forEach((song, index) => {
        if (index < 5) {
          this.songContainers.push(
            new SongContainer({
              ctx,
              canvas,
              game,
              songList: this,
              menu: menu,
            })
          );
          this.songContainers[index].y +=
            this.songContainers[index].height * index;
          this.songContainers[index].name = song.name;
          this.songContainers[index].duration = song.duration;
        }
      });
      if (this.songs.length > 5) {
        let number = Math.ceil(this.songs.length / 5);
        for (let i = 0; number > i; i++) {
          this.pageButtons.push(
            new PageButton({ ctx, canvas, menu, number: i + 1, songList: this })
          );
        }
      }
      this.menu.isLoading = false;
    });
    this.game.socket.emit("getSongsData");
    this.menu.isLoading = true;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = "rgba(0,255,255, 0.4)";
    this.ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;

    this.songContainers.forEach((container) => container.draw());
    this.pageButtons.forEach((btn) => btn.draw());
    if (this.loading) this.loading.draw();
  }
  update() {
    if (this.loading) this.loading.update();
    this.menu.isLoading && !this.loading
      ? (this.loading = new Loading({ ctx, canvas, songList: this }))
      : !this.menu.isLoading
      ? (this.loading = null)
      : null;
  }
}

class BurgerButton {
  constructor({ ctx, canvas, game, menu }) {
    this.game = game;
    this.menu = menu;
    this.ctx = ctx;
    this.canvas = canvas;
    this.x = this.canvas.width * 0.9;
    this.y = this.canvas.height * 0.05;
    this.gap = 10;
    this.width = 40;
    this.partHeight = 5;
    this.height = this.partHeight * 3 + this.gap;
    this.isClicked = false;
  }
  draw() {
    this.ctx.beginPath();
    if (this.menu.songList || this.game.isGameStarted) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    } else this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    this.ctx.rect(this.x, this.y, this.width, this.partHeight);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y + this.gap, this.width, this.partHeight);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y + this.gap * 2, this.width, this.partHeight);
    this.ctx.fill();
  }
}

class Loading {
  constructor({ ctx, canvas, songList }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.songList = songList;
    this.x = this.songList.x + this.songList.width / 2;
    this.y = this.songList.y + this.songList.height / 2;
    this.radius = 50;
    this.circleRadius = 10;
    this.rotationAngle = 0;
  }
  update() {
    this.rotationAngle > Math.PI * 2
      ? (this.rotationAngle = 0)
      : (this.rotationAngle += 0.05);
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.rect(
      this.songList.x,
      this.songList.y,
      this.songList.width,
      this.songList.height
    );
    this.ctx.fill();

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(this.x, this.y);
    this.ctx.fillStyle = `rgba(0, 0, 255, 0.5)`;
    this.ctx.rotate(this.rotationAngle);
    this.ctx.arc(this.radius, this.radius, this.circleRadius, 0, Math.PI * 2);
    this.ctx.fill();
    for (let i = 0; 50 > i; i++) {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(0, 0, 255, ${this.rotationAngle * 0.1})`;
      this.ctx.rotate(-0.002 * i);
      this.ctx.arc(
        this.radius,
        this.radius,
        this.circleRadius - i * 0.2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
    this.ctx.restore();
  }
}

class RestartBtn {
  constructor({ ctx, canvas, menu }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.menu = menu;
    this.x = this.menu.burgerButton.x + this.menu.burgerButton.width / 2;
    this.y = this.menu.burgerButton.y + this.menu.burgerButton.height * 2.5;
    this.radius = this.menu.burgerButton.height;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.arc(this.x, this.y, this.radius, Math.PI * 1.1, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 1.1);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    this.ctx.lineTo(this.x - this.radius + 5, this.y - 9);
    this.ctx.lineTo(this.x - this.radius + 5 - 10, this.y - 9);
    this.ctx.lineTo(this.x - this.radius + 5, this.y + 10 - 9);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    this.ctx.lineTo(this.x + this.radius - 5, this.y - 3);
    this.ctx.lineTo(this.x + this.radius + 10 - 5, this.y + 10);
    this.ctx.lineTo(this.x + this.radius - 5, this.y + 10);
    this.ctx.fill();

    this.ctx.lineWidth = 1;
  }
}
