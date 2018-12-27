var global = this;

var log = (function IIFE() {
  var console = document.getElementById('context-log');
  if (console === null) return function(){};

  console.setAttribute('dir', 'ltr');
  return function(data) {
    console.appendChild(document.createTextNode(data));
  };
}());

function ThenableFront(parent) {
  this.parent = parent;
}

ThenableFront.prototype.then = function then(cb) {
  if (this.parent.solved) {
    this.parent.next.then(cb);
  } else {
    this.parent.thenCb.push(cb);
  }
  return this;
};

function Thenable(src) {
  this.id = src;
  this.thenCb = [];
  this.front = new ThenableFront(this);
}

Thenable.prototype.resolve = function(value) {
  var cbRetVal = this.thenCb.shift()
    .call(this, value);
  var cb = null;
  if (this.thenCb.length) {
    if (cbRetVal instanceof ThenableFront) {
      while ((cb = this.thenCb.shift())) {
        cbRetVal.then(cb);
      }
    } else {
    }
  }
  this.solved = true;
  this.next = cbRetVal;
};

function appendScript(src) {
  var thenable = new Thenable(src);
  var script = document.createElement('script');
  script.onload = function() {
    thenable.resolve(this);
  };
  document.head.appendChild(script);
  script.src = src;
  return thenable.front;
}

function main() {
  if('undefined' === typeof global.context){
    log("Le context n'a pas pu être chargé.\nMerci de vérifier la syntaxe du fichier <_get-context.js>\n");
  }
  var context = new Context(global.context);
  var collection = document.querySelectorAll('[context-data]');
  var cible, contextContent;
  for (var i = 0; i < collection.length; ++i){
    cible = collection[i].getAttribute('context-data');
    objCible = context.get(cible);
    collection[i].innerText = objCible;
  }
}

appendScript('_promise_polyfill.js')
  .then(function() {
    return appendScript('_Promise.js');
  })
  .then(function() {
    return appendScript('_context.js');
  })
  .then(function() {
    return appendScript('_get-context.js');
  })
  .then(main);
