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
Tree.setRelation = function setRelation(obj, parent, path) {
  path = path || '$';
  var i;
  var $ = obj.$ = obj.$ || {};
  if (typeof parent !== 'undefined') {
    obj.$.parent = parent;
  }

  var keys = Object.keys(obj);
  if (~keys.indexOf("$")) {
    keys.splice(keys.indexOf("$"), 1);
  }

  for (i = 0; i < keys.length; ++i) {
    obj[keys[i]].$ = obj[keys[i]].$ || {};

    if (0 === i) {
      obj[keys[i]].$.previousSibling = null;
    } else {
      obj[keys[i]].$.previousSibling = obj[keys[i - 1]];
    }

    if (keys.length === (i + 1)) {
      obj[keys[i]].$.nextSibling = null;
    } else {
      obj[keys[i]].$.nextSibling = obj[keys[i + 1]];
    }

    if (typeof obj[keys[i]] === 'object') {
      setRelation(obj[keys[i]], obj, path + '.' + [keys[i]]);
    }
  }

  if ($.hasOwnProperty('groups')) {
    var group, start, end, j, k;
    for (i in $.groups) {
      group = $.groups[i].$;
      start = group.start;
      end = group.end;
      for (j = 0; j < keys.length; ++j) {
        k = keys[j] | 0;
        if (k == keys[j] && k >= start && k <= end) {
          obj[k].$.group = group;
        }
      }
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
    }
    if (null === elem) {
      return null;
    }
  }
  if ('object' === typeof elem && null !== elem) {
    var keys = Object.keys(elem);
    if (~keys.indexOf('$')) {
      keys.splice(keys.indexOf('$'), 1, '$:{' + Object.keys(elem.$).join(',\n\t\t') + '}');
    }
    elem = '{' + keys.join(',\n\t') + '}';
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
