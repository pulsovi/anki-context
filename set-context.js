// Define the `set-context` module
var setContext = angular.module('set-context', []);

// Define the `breadcrumbController` controller on the `set-context` module
setContext.controller('breadcrumbController', function breadcrumbController($scope) {
  $scope.path = [{ id: 'context' }];
  $scope.context = context;
  $scope.setPath = function(index, key) {
    // valeurs par defaut
    index = index || 0;
    if (!key) {
      key = $scope.path[index].id;
      --index;
    }
    // recuperer objet selectionne
    var elem = $scope;
    for (var i = 0; i <= index; ++i) {
      elem = elem[$scope.path[i].id];
    }
    elem = elem[key];
    // preparer le splice
    var keys = Object.keys(elem)
      .filter(function(k) {
        return 'object' === typeof elem[k];
      });
    elem = { id: key, keys: keys };
    $scope.path.splice(index + 1, $scope.path.length, elem);
  };
  $scope.setPath();
  /*
  le path contient des object de ce format
  {
    id: cle d'acces a l'objet depuis son parent
    keys: liste des cles enfants
  }
  */
});
