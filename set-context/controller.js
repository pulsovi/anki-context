// jshint esversion : 6

const fs = require('fs');
const fsp = fs.promises;
const ngui = require('nw.gui');
const nwin = ngui.Window.get();
const _ = require('dg-underscore');

window.setImmediate = global.setImmediate;

(function MaximizeIIFE() {
  nwin.on('loaded', function() {
    nwin.show();
    nwin.maximize();
  });
}());

angular.module('customfilter', []).filter('getType', function() {
  return function(obj) {
    return typeof obj;
  };
});

// Define the `set-context` module
var setContext = angular.module('set-context', ['customfilter']);

// Define the `contextController` controller on the `set-context` module
setContext.controller('contextController', function contextController($scope) {
  var getConfig = (function IIFEgetConfig(){
    var config = null;
    return function getConfig() {
      var pnc = _.Promise.noCallBack();
      if (config !== null) {
        setImmediate(function(){
          pnc.resolve(config);
        });
      } else {
        fsp.readFile("config.json")
        .then(function(data){
          config = JSON.parse(data);
          pnc.resolve(config);
        })
        .catch(function(err){
          pnc.reject(err);
        });
      }
      return pnc.promise;
    };
  }());

  window.mainScope = $scope;

  $scope.path = [];
  $scope.context = context;

  $scope.setPath = function(index, key) {
    // valeurs par defaut
    index = index || 0;
    if (!key) {
      key = $scope.path[index].id;
      --index;
    }
    // main
    var elem = $scope.currentElement = getPath(index, key);
    $scope.currentElementProperties = getFieldsList(elem);
    var pathItem = { id: key, keys: getChildrenList(elem) };
    $scope.path.splice(index + 1, $scope.path.length, pathItem);
    savePath();
  };

  $scope.addChild = function addChild(key, focus = true) {
    $scope.currentElement[key] = $scope.currentElement[key] || {};
    $scope.keyName = '';
    if (focus) {
      $scope.setPath($scope.path.length - 1, key);
    } else {
      $scope.path[$scope.path.length - 1].keys.push(key);
    }
  };

  $scope.addProperty = function addProperty(key, focus = true) {
    $scope.currentElement.$ = $scope.currentElement.$ || {};
    $scope.currentElement.$[key] = $scope.currentElement.$[key] || "";
    $scope.keyName = '';
    if (!~$scope.currentElementProperties.indexOf(key))
      $scope.currentElementProperties.push(key);
    if (focus) setImmediate(function() {
      document.getElementById('prop-' + key).focus();
    });
  };

  $scope.addFullChild = function addFullChild(key, focus = true) {
    $scope.addChild(key, focus);
    $scope.addProperty('id', focus);
    $scope.addProperty('title', false);
  };

  $scope.getTheFile = function getTheFile() {
    var content =
      '(function(global){global.context=' +
      JSON.stringify($scope.context) +
      ';})(this);\n';
    getConfig().then(function(config){
      config.path["_get-context.js"].forEach(function(path){
        fs.writeFile(path, content);
      });
    });
  };

  function getChild(root, path) {
    var child = root;
    var key;
    while ((key = path.shift())) {
      child = child[key];
    }
    return child;
  }

  function getPath(index, key) {
    var path = $scope.path.slice(0, index + 1)
      .map(function(i) { return i.id; })
      .concat(key);
    return getChild($scope, path);
  }

  function getChildrenList(elem) {
    var keys = Object.keys(elem);
    return keys.filter(function(k) {
      return k !== '$';
    });
  }

  function getFieldsList(elem) {
    return elem.$ ? Object.keys(elem.$) : [];
  }

  function savePath() {
    var pathList = $scope.path.map(function(e) {
      return e.id;
    });
    localStorage.setItem('path', JSON.stringify(pathList));
  }

  function restorePath() {
    var savedPath = localStorage.getItem("path");
    savedPath = savedPath ? JSON.parse(savedPath) : ["context"];
    for (var i = 0; i < savedPath.length; ++i) {
      $scope.setPath(i - 1, savedPath[i]);
    }
  }

  restorePath();
});
