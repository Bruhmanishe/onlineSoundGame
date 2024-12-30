const express = require("express");
const app = express();

//socket,io setup
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  pingInterval: 2000,
  pingTimeout: 5000,
  maxHttpBufferSize: 1e8,
});
const port = 3000;
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const songsBackEnd = [];
const songMinDur = 30;

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("addSongToBackEnd", (song) => {
    let songsWithSameNames = [...songsBackEnd].filter((backSong) => {
      if (song.name === backSong.name) return song;
    });
    let songsWithSameData = [...songsBackEnd].filter((backSong) => {
      if (song.data == backSong.data) return song;
    });
    if (songsWithSameNames.length === 0 && song.duration >= songMinDur) {
      if (songsWithSameData.length === 0) {
        songsBackEnd.push({
          data: song.data,
          duration: song.duration,
          name: song.name,
          bestScore: 0,
          tempSore: 0,
        });
      }
    }
  });
  socket.on("getSongsData", () => {
    const songsData = [...songsBackEnd].map((song) => {
      song = {
        name: song.name,
        duration: song.duration,
        bestScore: song.bestScore,
      };
      return song;
    });
    socket.emit("returnSongsData", songsData);
  });

  socket.on("sendSong", (songName) => {
    songsBackEnd.forEach((song) => {
      song.name === songName ? socket.emit("sendSong", song.data) : null;
    });
  });

  socket.on("incrementScore", ({ songName, isGameEnd }) => {
    songsBackEnd.forEach((backSong) => {
      backSong.name === songName ? backSong.tempSore++ : null;
      backSong.tempSore > backSong.bestScore && isGameEnd
        ? (backSong.bestScore = backSong.tempSore)
        : null;
      isGameEnd ? (backSong.tempSore = 0) : null;
    });
  });
});

server.listen(port, () => {});
