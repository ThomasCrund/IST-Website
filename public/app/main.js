
var app = angular.module('myApp', ["ngRoute", "firebase"]);
app.config(function() {
  var config = {
    apiKey: "AIzaSyB9y7NQAy0ajewlsY80jUgZwp-Ru4IoSc0",
    authDomain: "connex-a8ef2.firebaseapp.com",
    databaseURL: "https://connex-a8ef2.firebaseio.com",
    projectId: "connex-a8ef2",
    storageBucket: "connex-a8ef2.appspot.com",
    messagingSenderId: "99302109128",
    appId: "1:99302109128:web:c566164887e081ae"
  };
  firebase.initializeApp(config);
});

app.controller('mainCnrl', function($scope) {
  $scope.input = "John";
});

app.controller('homeCnrl', function($scope) {
  document.getElementById("body").style.overflow = "hidden";
});

app.controller('aboutCnrl', function($scope) {
  document.getElementById("body").style.overflow = "auto";
});

app.controller('joinGameCnrl', function($scope, $http) {
  document.getElementById("body").style.overflow = "hidden";

  $scope.joinGame = () => {
    if ($scope.joinGameKey !== undefined) {
      location.replace("#!game/" + $scope.joinGameKey);
    }
  }

  $scope.createGame = () => {
    $http.get("https://us-central1-connex-a8ef2.cloudfunctions.net/createGame?name=hi&block=4&board=8")
    .then((response) => {
      location.replace("#!game/" + response.data);
    })
  }
});

app.controller('gameController', ["$scope", "$firebaseArray","$routeParams","$http", function($scope, $firebaseArray, $routeParams, $http) {
  var gameKey = $routeParams.gameKey;
  $scope.gameKey = gameKey;
  document.getElementById("body").style.overflow = "hidden";
  var Board;
  var Id;
  var CurrentTurn = 0;
  var GameStarted = false;
  $scope.GameStarted = GameStarted;
  var Spectator = false;
  $scope.copied = false;
  console.log($scope.board);
  $http.get("https://us-central1-connex-a8ef2.cloudfunctions.net/joinGame?key="+gameKey+"&name=Thomas")
  .then(function(response) {
    if(response.data === "Game does not exist") {
      location.replace("#!game");
    } else {
      var ref = firebase.database().ref().child("Games/" + gameKey + "/Board");
      Board = $firebaseArray(ref);
      $scope.board = Board;
      $scope.playerKey = response.data;
      var players;
      //$scope.board = board;
      console.log(response.data);
      console.log(response.data.id);
      firebase.database().ref().child("Games/" + gameKey + "/Players/" + response.data.id + "/test").on('value', (snapshot) => {
        console.log("on called");
        console.log(snapshot.val());
        if (snapshot.val() == true) {
          console.log("Player Checked");
          firebase.database().ref().child("Games/" + gameKey + "/Players/" + response.data.id + "/testReply").set(true, (err) => {
            if (err !== null) {
              console.error(err);
            }
          });
          
        }
      });
      firebase.database().ref().child("Games/" + gameKey + "/GameStarted").on('value', (snapshot) => {
        console.log("on called for started");
        console.log(snapshot.val());
        if (snapshot.val() == true) {
          GameStarted = true;
          $scope.GameStarted = true;
          console.log('Game Started');
          console.log(response.data.key);
          firebase.database().ref().child("Games/" + gameKey + "/Players").once('value', (snapshot) => {
            players = snapshot.val();
            var exist = false;
            for (let i = 0; i < players.length; i++) {
              if (players[i].Key === response.data.key) {
                Id = i;
                exist = true;
                console.log("Id: " + Id);
                console.log('exists');
              }      
            }
            if (exist === false) {
              Spectator = true;
              alert("There is too many players you are a spectator");
            }  
            console.log(snapshot.val());
          });
        }
      });
      firebase.database().ref().child("Games/" + gameKey + "/currentTurn").on('value', (snapshot) => {
        if (snapshot.val() !== null) {
          CurrentTurn = snapshot.val();
        }
      });
    }
  }, (err) => {
    alert("Error: " + err.data);
    location.replace("#!game");
  });
  $scope.getPlayerColour = (playerId) => {
    var fill = "#fff"
    if (playerId === 0) {
      fill = "#F2AF29"
    } else if ((playerId === 1)) {
      fill = "#8E2B33"
    } else if ((playerId === 2)) {
      fill = "#000080"
    } else if ((playerId === 3)) {
      fill = "#1d5712"
    }
    return {
      "fill" : fill
    }
  }
  $scope.placeable = (board, row, tile) => {
    if (row.$id == (board.length)-1) {
      return true;
    }
    var selectedRow = Number(row.$id);
    var selectedCollum = tile.id;
    if (board[selectedRow+1][selectedCollum].placed === true) {
      return true
    }
    return false
  }
  $scope.playTurn = (row, tile) => {
    var selectedRow = Number(row.$id);
    var selectedCollum = tile.id;
    if (Id === CurrentTurn) {
      $http.get("https://us-central1-connex-a8ef2.cloudfunctions.net/playTurn?gameKey="+gameKey + "&row=" + selectedRow + "&column=" + selectedCollum + "&playerId=" + Id)
      .then((response) => {
        console.log(response);
      })
    } 
  }
  $scope.getTurnStatus = () => {
    if (GameStarted === false) {
      return "Starting Soon";
    }
    if (Spectator === true) {
      return "Spectator";
    }
    if (Id === CurrentTurn) {
      return "Play Turn";
    } 
    return "Please Wait";
  }
  $scope.copyGameKeyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = "https://connex-a8ef2.firebaseapp.com/#!/game/" + gameKey;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    $scope.copied = true;
  }
  $scope.removeToolTip = () => {
    $scope.copied = false;
  }
  $scope.startGame = () => {
    $http.get("https://us-central1-connex-a8ef2.cloudfunctions.net/startGame?key=" + gameKey)
    .then((response) => {
      console.log(response);
    })
  }
}]);