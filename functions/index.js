const functions = require('firebase-functions');
const admin = require('firebase-admin')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp();

function generateKey(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateGameKey(key, error) {
    var newKey = generateKey(6);
    //response.send('Games/' + key + '/')
    admin.database().ref().child('Games/' + newKey + '/').once('value', (snapshot) => {
        var event = snapshot.val();
        if (event === null) {
            key(newKey);
        } else {
            console.log('generating New Key')
            generateGameKey((key) => {
                key(key);
            }, (err) => {
                error(err);
            })
        }
    }).catch((err) => {
        error(err);
    });
}

exports.createGame = functions.https.onRequest((request, response) => {
    var name = request.query.name;
    var block = request.query.block;
    var board = request.query.board;
    if (name === undefined) {
        response.send("you need a name for the game");
    } else if (block === undefined) {
        response.send("you need a block size to create a game");
    } else if (board === undefined) {
        response.send("you need a board size to create a game");
    } else {
        generateGameKey((key) => {
            gameObject = {
                'Name': name,
                'BlockSize': block,
                'FieldSize': board,
                'Key': key,
                'PlayerSlots': 2
            }


            admin.database().ref().child('Games/' + key).set(gameObject, (err) => {
                if (err !== null) {
                    response.send("Set:Error:" + err);
                } else {
                    response.send(key);                    
                }
            })


            
        }, (err) => {
            response.send('T:Error:' + err);
        })
    }

});

exports.joinGame = functions.https.onRequest((request, response) => {
    var gameKey = request.query.key;
    var name = request.query.name;
    //var blue = request.query.key;
    if (gameKey === undefined) {
        response.send("you need a game key");
    } else if (name === undefined) {
        response.send("you need a player name");
    } else {
        admin.database().ref().child('Games/' + gameKey + '/').once('value', (snapshot) => {
            if (snapshot.val() === null) {
                response.send('Game does not exist')
            } else {
                var gameData = snapshot.val();
                var playerKey = generateKey(4);
                playerObject = {
                    'Key': playerKey,
                    'Name': name,
                }
                if (gameData.Players === undefined) {
                    playerObject.master = true;
                    admin.database().ref().child('Games/' + gameKey + '/Players/0').set(playerObject, (err) => {
                        if (err !== null) {
                            response.send("Set:Error:" + err);
                        } else {
                            response.send({ 'id': 0, 'key': playerKey});                    
                        }
                    })
                } else {
                    var numOfPlayers = gameData.Players.length;
                    //console.log(numOfPlayers);
                    admin.database().ref().child('Games/' + gameKey + '/Players/' + numOfPlayers).set(playerObject, (err) => {
                        if (err !== null) {
                            response.send("Set:Error:" + err);
                        } else {
                            response.send({ 'id': numOfPlayers, 'key': playerKey});                    
                        }
                    })
                }
            }
        }, (err) => {
            response.send('T:Error:' + err);
        })
    }
});

exports.getPlayerInformation = functions.https.onRequest((request, response) => {
    response.send("player stuff");
});

exports.playTurn = functions.https.onRequest((request, response) => {
    response.send("played");
});