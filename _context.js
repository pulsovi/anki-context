/*\
 * Class AJAX
\*/

var AJAX = {};

// Method
AJAX.get = function get(url) {
  var pnc = _.Promise.noCallBack();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function() {
    pnc.resolve.call(this, this.response);
  };
  xhr.onerror = xhr.onabort = pnc.reject;
  xhr.send(null);
  return pnc.promise;
};

AJAX.getJSON = function getJSON(url) {
  var pnc = _.Promise.noCallBack();
  this.get(url)
    .then(function(response) {
      var json = JSON.parse(response);
      pnc.resolve.call(this, json);
    })
    .catch(function() {
      pnc.reject.call(this, arguments);
    });
  return pnc.promise;
};

/*\
 * Class Tree
\*/

var Tree = {};
Tree.setParent = function setParent(obj, parent) {
  if (typeof parent !== 'undefined') {
    obj.$.parent = parent;
  }
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; ++i) {
    if (typeof obj[keys[i]] === 'object') {
      setParent(obj[keys[i]], obj);
    }
  }
};

/*\
 * Class Context
\*/

function Context(contextObj) {
  this.context = contextObj;
  this.init();
}

Context.prototype.init = function init() {
  Tree.setParent(this);
};

Context.prototype.get = function get(path) {
  var parts = path.split('.');
  var elem = this;
  for (var i = 0; i < parts.length; ++i) {
    elem = elem[parts[i]];
  }
};

/*\
 * Class Vue
\*/

function Vue(template) {
  this.template = template;
}

/*\
 * Class Console
\*/

function Console(element) {
  this.element = element;
}

Console.prototype.log = function(element) {
  if (!Node.prototype.isPrototypeOf(element)) {
    element = document.createTextNode(element);
  }
  this.element.appendChild(element);
};

/*\
 * main
\*/

log('_context.js starts\n');
/**
var console = new Console(document.getElementById('context'));
var context = new Context(AJAX.getJSON('_context.json'));
/**/
