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
  xhr.onerror = xhr.onabort = function(error) {
    pnc.reject.call(this, error);
  };
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
    .catch(function(error) {
      pnc.reject.call(this, arguments);
    });
  return pnc.promise;
};

/*\
 * Class Tree
\*/

var Tree = {};
Tree.setRelation = function setRelation(obj, parent) {
  if (typeof parent !== 'undefined') {
    obj.$ = obj.$ || {};
    obj.$.parent = parent;
  }

  var keys = Object.keys(obj);
  if (~keys.indexOf("$")) {
    keys.splice(keys.indexOf("$"), 1);
  }

  for (var i = 0; i < keys.length; ++i) {
    obj[keys[i]].$ = obj[keys[i]].$ || {};

    if (0 === i) {
      obj[keys[i]].$.previousSibling = null;
    } else {
      obj[keys[i]].$.previousSibling = obj[keys[i - 1]];
    }

    if (keys.length === keys[i + 1]) {
      obj[keys[i]].$.nextSibling = null;
    } else {
      obj[keys[i]].$.nextSibling = obj[keys[i + 1]];
    }

    if (typeof obj[keys[i]] === 'object') {
      setRelation(obj[keys[i]], obj);
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
  Tree.setRelation(this);
};

Context.prototype.get = function get(path) {
  var parts = path.split('.');
  var elem = this.context;
  for (var i = 0; i < parts.length; ++i) {
    if (elem.hasOwnProperty(parts[i])) {
      elem = elem[parts[i]];
    } else if (elem.hasOwnProperty('$') && elem.$.hasOwnProperty(parts[i])) {
      elem = elem.$[parts[i]];
    } else {
    }
    if (null === elem) {
      return null;
    }
  }
  return elem;
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
