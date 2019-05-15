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
    });
});