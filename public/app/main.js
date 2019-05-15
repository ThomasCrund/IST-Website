var app = angular.module('myApp', ["ngRoute"]);

app.controller('mainCnrl', function($scope) {
  $scope.input = "John";
});

app.controller('homeCnrl', function($scope) {
  document.getElementById("body").style.overflow = "hidden";
});

app.controller('aboutCnrl', function($scope) {
  document.getElementById("body").style.overflow = "auto";
});

app.controller('joinGameCnrl', function($scope) {
  document.getElementById("body").style.overflow = "hidden";
});