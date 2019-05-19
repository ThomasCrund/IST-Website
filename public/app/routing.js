app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "./pages/home.html",
        controller : 'homeCnrl'
    })
    .when("/about", {
        templateUrl : "./pages/about.html",
        controller : 'aboutCnrl'
    })
    .when("/game", {
        templateUrl : "./pages/joinGame.html",
        controller : 'joinGameCnrl'
    })
    .when("/game/:gameKey", {
        templateUrl : "./pages/game.html",
        controller : 'gameController'
    })
});