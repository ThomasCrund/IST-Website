const cors = require('cors')({origin: true});
const functions = require('firebase-functions');
const admin = require('firebase-admin');



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
    cors(request, response, () => {
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
                    'PlayerSlots': 2,
                    'GameStarted': false
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
});

exports.joinGame = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
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
                        'test': false,
                        'testReply': false
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
});

exports.getPlayerInformation = functions.https.onRequest((request, response) => {
    response.send("player stuff");
});

exports.playTurn = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        var row = request.query.row;
        var column = request.query.column;
        var gameKey = request.query.gameKey;
        var playerId = parseInt(request.query.playerId);
        if (row === undefined) {
            response.send("you need a row");
        } else if (column === undefined) {
            response.send("you need a column");
        } else if (gameKey === undefined) {
            response.send("you need a gameKey");
        } else if (playerId === undefined) {
            response.send("you need a playerId");
        } else {
            admin.database().ref().child('Games/' + gameKey + '/Board/' + row + '/' + column + '/placed').set(true).catch((err) => {
                console.log(err);
                response.send(err);
            })
            admin.database().ref().child('Games/' + gameKey + '/Board/' + row + '/' + column + '/player').set(playerId).catch((err) => {
                console.log(err);
                response.send(err);
            })
            admin.database().ref().child('Games/' + gameKey + '/playerNum').once('value', (snapshot) => {
                var nextId = playerId + 1;
                console.log(nextId);
                if (nextId >= snapshot.val()) {
                    nextId = 0; 
                    console.log("Called too high" + nextId);
                }
                admin.database().ref().child('Games/' + gameKey + '/currentTurn').set(nextId).catch((err) => {
                    console.log(err);
                    response.send(err);
                })
                response.send("completed");
            }, (err) => {
                console.log(err);
                response.send("T:Error:" +err);
            })
            

        }
    })
});

exports.startGame = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        var gameKey = request.query.key;
        //var blue = request.query.key;
        if (gameKey === undefined) {
            response.send("you need a game key");
        } else {
            admin.database().ref().child('Games/' + gameKey + '/Players').once('value', (snapshot) => {
                if (snapshot.val() === null) {
                    response.send("No Players");
                } else {
                    var Players = snapshot.val();
                    var NewPlayers = [];
                    Players.forEach((value, index, array) => {
                        admin.database().ref().child('Games/' + gameKey + '/Players/' + index + '/test').set(true).catch((err) => {
                            console.log(err);
                            response.send(err);
                        })
                        admin.database().ref().child('Games/' + gameKey + '/Players/' + index + '/testReply').on('value', (snapshot) => {
                            if (snapshot.val() === true) {
                                NewPlayers.push(value);
                            }
                        })
                    });
                    setTimeout(() => {
                        if (NewPlayers.length > 4) {
                            NewPlayers.splice(4, NewPlayers.length-4); 
                        }
                        admin.database().ref().child('Games/' + gameKey + '/Players').set(NewPlayers).catch((err) => {
                            console.log(err);
                            response.send(err);
                        })
                        var board = [];
                        for (let row = 0; row < 5; row++) {
                            var rowData = []
                            for (let column = 0; column < 8; column++) {
                                var cellData = {
                                    'id': column,
                                    'placed': false
                                }
                                rowData.push(cellData);
                            }
                            board.push(rowData);
                        }
                        admin.database().ref().child('Games/' + gameKey + '/Board').set(board).catch((err) => {
                            console.log(err);
                            response.send(err);
                        })
                        admin.database().ref().child('Games/' + gameKey + '/GameStarted').set(true).catch((err) => {
                            console.log(err);
                            response.send(err);
                        })
                        admin.database().ref().child('Games/' + gameKey + '/playerNum').set(NewPlayers.length).catch((err) => {
                            console.log(err);
                            response.send(err);
                        })
                        admin.database().ref().child('Games/' + gameKey + '/currentTurn').set(0).catch((err) => {
                            console.log(err);
                            response.send(err);
                        })
                        response.send("Game Started");
                    }, 1000)
                }
            }, (err) => {
                console.log(err);
                response.send(err);
            })    
        }
    });
});