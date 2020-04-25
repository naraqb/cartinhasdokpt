var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8081;
  }
server.listen(port, function () {
  console.log('Listening on ' +server.address().port);
  });
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

players = [];
letters = {};
k = 0;
letters_received = 0;

io.on('connection', function (socket) {
  console.log('someone connected: ', socket.id);
  players.push(socket.id);
  io.sockets.emit("new player", players.length);
  console.log("players connected: %s", players.length);

  socket.on("disconnect", function(data){		
		players.splice(players.indexOf(socket.id), 1); //accessing the array memers
    io.sockets.emit("player left", players.length); //checks if player left
    
    console.log('someone disconnected: ', socket.id);
    console.log("players connected: %s", players.length);
  });
  
	socket.on("write in letter", function(data){
    letters[data[0]].push(data[1]);
    letters[data[0]].push(data[2]);
    letters_received = letters_received + 1;
    console.log(letters);

    if(letters_received == p){
      for(var i = 0; i < p; i++) {
        msg = [players[(i+k)%p], letters[players[(i+k)%p]]];
        io.to(players[i]).emit('send letter', msg);
      }
      k = k + 1;
      letters_received = 0;
    }

    if(k == 5){
      console.log(letters);
    }
  });
  
  socket.on("send letters", function(data){
    for(var i = 0; i < p; i++) {
      msg = [players[(i+k)%p], letters[players[(i+k)%p]], k];
      io.to(players[i]).emit('send letter', msg);
    }
    k = k + 1;
  });

  socket.on("start game", function(data){
    p = players.length;
    players = [];
    letters = {};
    k = 0;
    letters_received = 0;
    for(var i = 0; i < p; i++) {
      letters[players[i]] = []
    }
    io.sockets.emit("start game");
  });
  
});
