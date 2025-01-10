const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const socket = io();
const resolutions = {
  hd: { width: 1280, height: 720 },
  fullHd: { width: 1920, height: 1080 },
};

let audioInput;
let audio;
let audioSource;
let analyser;
let dataArray;
let controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  isMouseDown: false,
  dx: 0,
  dy: 0,
  mouseX: 0,
  mouseY: 0,
};

let frontEndSongs = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = "black";
ctx.rect(0, 0, canvas.width, canvas.height);
ctx.fill();

window.onload = () => {
  audioInput = document.getElementById("songInput");
  let game = new Game({ canvas, ctx, controls, socket });
  console.log(game.enemies);
  function animate() {
    game.update({ dataArray, analyser });
    game.draw();

    if (audio) {
      if (
        (audio && game.player.HP <= 0) ||
        audio.duration === audio.currentTime ||
        game.isRestart
      ) {
        game.socket.emit("incrementScore", {
          songName: game.songName,
          isGameEnd: true,
        });
        audio.src = null;
        audio = null;
        audioSource = null;
        analyser = null;
        dataArray = null;
        game = null;
        audioInput.remove();
        audioInput = document.createElement("input");
        document.body.appendChild(audioInput);
        audioInput.style.display = "none";
        audioInput.setAttribute("id", "songInput");
        audioInput.setAttribute("type", "file");
        audioInput.setAttribute("accept", "audio/*");

        game = new Game({ canvas, ctx, controls, socket });
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("keydown", (e) => {
    if (e.code == "Space") {
      audio.play();
      const audioCtx = new AudioContext();

      audioSource = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 64;

      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    switch (e.keyCode) {
      case 87:
        controls.up = true;
        break;
      case 83:
        controls.down = true;
        break;
      case 68:
        controls.right = true;
        break;
      case 65:
        controls.left = true;
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    switch (e.keyCode) {
      case 87:
        controls.up = false;
        break;
      case 83:
        controls.down = false;
        break;
      case 68:
        controls.right = false;
        break;
      case 65:
        controls.left = false;
        break;
    }
  });
  window.addEventListener("resize", (e) => {
    if (audio) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      game.socket.emit("incrementScore", {
        songName: game.songName,
        isGameEnd: true,
      });
      audio.src = null;
      audio = null;
      audioSource = null;
      analyser = null;
      dataArray = null;
      game = null;
      audioInput.remove();
      audioInput = document.createElement("input");
      document.body.appendChild(audioInput);
      audioInput.style.display = "none";
      audioInput.setAttribute("id", "songInput");
      audioInput.setAttribute("type", "file");
      audioInput.setAttribute("accept", "audio/*");
    }
    game = new Game({ canvas, ctx, controls, socket });
  });

  animate();
};
