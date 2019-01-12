// Define the `set-context` module
var setContext = angular.module('set-context', []);

// Define the `breadcrumbController` controller on the `set-context` module
setContext.controller('breadcrumbController', function breadcrumbController($scope) {
  $scope.path = [];
  $scope.data = context;
  /*
  le path contient des object de ce format
  {
    id: cle d'acces a l'objet depuis son parent
    keys: liste des cles enfants
  }
  */
});
