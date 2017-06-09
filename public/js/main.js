/*
    Initialisation des variables
*/
var client,
    username,
    id,
    setUsername;
/*
    Configuration des variables
*/
client = io(); // Initialisation du socket (coter client)

/*
    Fonction anonyme pour obliger l'utilisateur à choisir un pseudo
*/
setUsername = function() {
    var user = prompt("Veuillez choisir un Pseudo");
    if(user.length > 0) {
        return user;
    } else {
        setUsername();
    }
}
username = setUsername();

// Packet reçu lors de la connexion au serveur
client.on("identification", function() {
    if (username.length > 0) {
        client.emit("identification#ok", username);
    }
});

// Packet reçu lorsque l'on envoie un message ou qu'un autre utilisateur envoie un message
client.on("rcvmsg", function(username, msg) {
    console.log("msg: "+username+": "+msg);
    $('#chat-container p').append(username+": "+msg+"<br/>"); // on ajoute le message dans le chat
});

// Packet reçu lorsque qu'un nouvelle utilisateur se connecte
client.on("newplayer", function(players){
    $('#chat-right ul').html(''); // on vide la liste des client actuelle

    /*
        On re-remplie la liste des utilisateur à jour
    */
    for (i=0;i<players.length;i++) {
        $('#chat-right ul').append('<li>'+players[i][1]+'</li>');
    }
});

/*
    Lorsque on envoie un message avec le formulaire
*/
$('#chat-sender-input').submit(function(event) {
    var msg = $('#chat-text-input').val();
    client.emit('newmsg', msg); // envoie coté serveur notre message
    $('#chat-text-input').val(''); // on vide le champ la ou le message est écrit histoire que le tout soit un minimum dynamique
    event.preventDefault(); // on annule l'envoie du formulaire pour ne pas actualiser la page et se reconnecter...
});