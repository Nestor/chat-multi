/*

  Information: Socket server chat
  Autres: Serveur socket pour le multiclient
  commande: node serveur.js
*/
var express = require('express'); // import du package express
var app = express(); // Initialisation du package express
var http = require('http').Server(app); // import du serveur http
var io = require('socket.io')(http); // importe de socket.io

/*
  La ou on stock les utilisateur connecter
  (important) pour pouvoir les liste dans une liste après ..
*/
var players = [];

// Envoie du fichier index.html pour les utilisateur qui se connecte sur 127.0.0.1:3000
app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
});


/*
  connection: Event que l'on reçois quand un nouvelle utilisateur se connecte
  stocker les autre event dedans afin de s'assurer qu'on les reçois que lorsque le serveur est connecter
*/
io.on('connection', function(socket){
  console.log('Un joueur vient de se connecter');
  socket.emit("identification"); // Pour envoyer un packet (socket) au client
  
  socket.on('identification#ok', function(username) { // packet reçu du client lorsque le joueur se connecte (liée au packet "identification")
    /*
      userTable = formatage des données pour la table players[]
    */
    var userTable = [socket.id, username, 0]; // 0 = grade user
    players.push(userTable); // on insert l'utilisateur dans la table players[]
    socket.broadcast.emit("newplayer", players); // on prévient tout les client que un nouveau client se connecte
    socket.emit("newplayer", players); // on s'auto-prévient qu'on vient de se connecter pour être dans la liste coter client
  });
  /*
    Packet reçu lorsqu'un utilisateur envoie un message
  */
  socket.on('newmsg', function(msg) {
    var username = getUsernameById(socket.id); // on récupérer sont pseudo grâce à sont socket.id
    socket.broadcast.emit("rcvmsg", username, msg); // on envoie le message envoyer à tout les autre client
    socket.emit("rcvmsg", username, msg); // mais à nous aussi
    console.log('msg: '+username+": "+msg);
  });

  socket.on('disconnect', function(){ // évent reçu quand un utilisateur se déconnecte
    console.log('Un joueur vient de déconnecter');
    players.splice(getPositionByName(getUsernameById(socket.id)), 1); // on supprimer l'utilisateur de la table players[]
  });
});

/*
  On met le serveur en écoute sur le port 3000
  est on partage les dossier qui sont contenu dans public pour le client
  styles css, scripts javascript et les images.
*/
http.listen(3000, function(){
  console.log('Serveur en écoute sur le port *3000');
  app.use('/public', express.static('public'));
});

/*
  Fonction pour récupérer le nom du joueur dans le tableau players[] grace à sont socket.id
*/
function getUsernameById(id) {
  for(i=0;i<players.length;i++) {
    if (players[i][0] == id) {
      return players[i][1];
    }
  }
}

/*
  Fonction pour récupérer la position du joueur dans le tableau players[] grace à sont username
*/
function getPositionByName(username) {
  for(i=0;i<players.length;i++) {
    if (username == players[i][1]) {
      return [i];
    }
  }
}