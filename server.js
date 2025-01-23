const express = require("express");
const app = express();
const fs = require("fs");

function jsonReader(filePath, cb) {
  fs.readFile(filePath, "utf-8", (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

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

let songsBackEnd = {};
jsonReader("./songs-data/songs-data.json", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    songsBackEnd = data;
  }
});
const songMinDur = 30;

io.on("connection", (socket) => {
  socket.on("addSongToBackEnd", (song) => {
    if (
      Object.keys(songsBackEnd).length > 0 &&
      Object.keys(songsBackEnd).length < 16
    ) {
      if (!songsBackEnd[song.name] && song.duration > songMinDur) {
        songsBackEnd[song.name] = {
          data: song.data.toString("base64"),
          duration: song.duration,
          name: song.name,
          bestScore: 0,
          tempSore: 0,
        };
        fs.writeFile(
          "./songs-data/songs-data.json",
          JSON.stringify(songsBackEnd, null, 2),
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
      console.log("samw song!");
    } else {
      songsBackEnd[song.name] = {
        data: song.data.toString("base64"),
        duration: song.duration,
        name: song.name,
        bestScore: 0,
        tempSore: 0,
      };
      fs.writeFile(
        "./songs-data/songs-data.json",
        JSON.stringify(songsBackEnd, null, 2),
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
  socket.on("getSongsData", () => {
    jsonReader("./songs-data/songs-data.json", (err, data) => {
      if (err) {
        console.log(err);
      } else {
        songsBackEnd = data;
      }
    });
    const songsData = Object.values(songsBackEnd);
    socket.emit("returnSongsData", songsData);
  });

  socket.on("sendSong", (songName) => {
    socket.emit("sendSong", Buffer.from(songsBackEnd[songName].data, "base64"));
  });

  socket.on("incrementScore", ({ songName, isGameEnd }) => {
    if (songsBackEnd[songName]) {
      songsBackEnd[songName].tempSore++;
      if (
        isGameEnd &&
        songsBackEnd[songName].bestScore < songsBackEnd[songName].tempSore &&
        songsBackEnd[songName].tempSore !== 0
      ) {
        songsBackEnd[songName].bestScore = songsBackEnd[songName].tempSore;
        songsBackEnd[songName].tempSore = 0;
        fs.writeFile(
          "./songs-data/songs-data.json",
          JSON.stringify(songsBackEnd, null, 2),
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  });
});

server.listen(port, () => {});
