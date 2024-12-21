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

    canvas.addEventListener("click", (e) => {
      if (this.songList) {
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
    });
  }
  draw() {
    this.burgerButton.draw();
    this.songList ? this.songList.draw() : null;
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
  }
}

class SongContainer {
  constructor({ ctx, canvas, game, menu, songList, name }) {
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
      }
    });
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "grey";
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(this.name, this.x, this.y + this.height / 2);
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
    this.ctx = ctx;
    this.canvas = canvas;
    this.x = this.canvas.width * 0.1;
    this.y = this.canvas.height * 0.1;
    this.width = this.canvas.width * 0.79;
    this.height = this.canvas.height * 0.8;
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
        }
      });
      if (this.songs.length > 5) {
        let number = Math.ceil(this.songs.length / 5);
        for (let i = 0; number > i; i++) {
          this.pageButtons.push(
            new PageButton({ ctx, canvas, menu, number: i + 1, songList: this })
          );
        }
        console.log(this.pageButtons);
      }
    });
    this.game.socket.emit("getSongsData");
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fill();

    this.songContainers.forEach((container) => container.draw());
    this.pageButtons.forEach((btn) => btn.draw());
  }
  update() {}
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
    this.canvas.addEventListener("click", (e) => {
      if (
        e.clientX > this.x &&
        e.clientX < this.x + this.width &&
        e.clientY > this.height &&
        e.clientY < this.y + this.height &&
        !this.game.isGameStarted
      ) {
        this.isClicked = true;
      }
    });
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
