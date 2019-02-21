// jshint esversion : 6

/*\
 *  global declarations
\*/
const fs = require('fs');
const fsp = fs.promises;
const ngui = require('nw.gui');
const nwin = ngui.Window.get();
const _ = require('dg-underscore');

const setImmediate = global.setImmediate;

/*\
 *  appLevel
\*/
// get config options
var getConfig = (function IIFEgetConfig() {

  var config = null;

  return function getConfig() {
    var { promise, resolve, reject } = _.Promise.noCallBack();
    if (config !== null) {
      setImmediate(function() {
        resolve(config);
      });
    } else {
      fsp.readFile("config.json")
        .then(function(data) {
          config = JSON.parse(data);
          resolve(config);
        })
        .catch(function(err) {
          errorLog(err);
          errorLog('\tat: ' + Error().stack.split('/').pop());
          reject(err);
        });
    }
    return promise;
  };

}());

// debug tool
var errorLog = (function() {
  var console = document.getElementById('context-error');
  return function(data) {
    console.appendChild(document.createTextNode(data));
    console.appendChild(document.createTextNode('\n'));
  };
}());

/*\
 *  nw level
\*/
nwin.on('loaded', function() {
  nwin.show();
  nwin.maximize();
});

/*\
 *  angular filters declarations
\*/
angular.module('customfilter', [])
  .filter('getType', function() {
    return function(obj) {
      return typeof obj;
    };
  });

/*\
 *  angular modules
\*/
// Define the `set-context` module
var setContext = angular.module('set-context', ['customfilter']);

// Define the `contextController` controller on the `set-context` module
setContext.controller('contextController', contextController);

function contextController($scope) {

  // $scope properties
  $scope.path = [];
  $scope.context = context; // root of the tree
  $scope.currentElement = null; // Object current node in the tree
  $scope.currentElementProperties = null; // Array meta data properties
  $scope.currentElementChildren = null; // Array child nodes
  $scope.hash = null;

  // path and breadcrumb functions
  function restorePath() {
    var savedPath = localStorage.getItem("path");
    savedPath = savedPath ? JSON.parse(savedPath) : ["context"];
    for (var i = 0; i < savedPath.length; ++i) {
      $scope.setPath(i - 1, savedPath[i]);
    }
  }

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
    $scope.currentElementChildren = getChildrenList(elem);
    var pathItem = { id: key, keys: $scope.currentElementChildren };
    $scope.path.splice(index + 1, $scope.path.length, pathItem);
    savePath();
  };

  function getPath(index, key) {
    var path = $scope.path.slice(0, index + 1)
      .map(function(i) { return i.id; })
      .concat(key);
    return getChild($scope, path);
  }

  function getChild(root, path) {
    var child = root;
    var key;
    while ((key = path.shift())) {
      child = child[key];
    }
    return child;
  }

  function getFieldsList(elem) {
    const arrays = ['groups'];
    return elem.$ ? Object.keys(elem.$).filter(function(key) {
      return !~arrays.indexOf(key);
    }) : [];
  }

  function getChildrenList(elem) {
    var keys = Object.keys(elem);
    return keys.filter(function(k) {
      return k !== '$';
    });
  }

  function savePath() {
    var pathList = $scope.path.map(function(e) {
      return e.id;
    });
    localStorage.setItem('path', JSON.stringify(pathList));
  }

  //tab apps
  //tab functions
  $scope.setHash = function setHash(newValue) {
    if ($scope.hash == newValue) $scope.hash = null;
    else $scope.hash = newValue;
  };

  //add child or property
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

  $scope.addChild = function addChild(key, focus = true) {
    $scope.currentElement[key] = $scope.currentElement[key] || {};
    $scope.keyName = '';
    if (focus) {
      $scope.setPath($scope.path.length - 1, key);
    } else {
      $scope.currentElementChildren.push(key);
    }
  };

  $scope.addFullChild = function addFullChild(key, focus = true) {
    $scope.addChild(key, focus);
    $scope.addProperty('id', focus);
    $scope.addProperty('title', false);
  };

  //save or download
  $scope.saveContext = function saveContext() {
    var content = contextAsString();
    getConfig().then(function(config) {
      config.path["_get-context.js"].forEach(function(path) {
        fsp.writeFile(path, content);
      });
    });
  };

  $scope.downContext = function downContext() {
    downloadAsFile(contextAsString(), "_get-context.js", "application/javascript");
  };

  function contextAsString() {
    return '(function(global){global.context=' +
      JSON.stringify($scope.context) +
      ';})(this);\n';
  }

  function downloadAsFile(content, fileName, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var objectUrl = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }

  //main
  restorePath();
}
