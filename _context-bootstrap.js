var global = this;

var log = (function IIFE() {
  var console = document.getElementById('context');

  return function(data) {
    console.appendChild(document.createTextNode(data));
  };
}());
//log('context-bootsrap starts\n');

function ThenableFront(parent) {
  this.parent = parent;
}

ThenableFront.prototype.then = function then(cb) {
  //log('new then <' + this.parent.id + '>\n');
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
  //log('new Thenable <' + this.id + '>\n');
}

Thenable.prototype.resolve = function(value) {
  //log('resolve thenable <' + this.id + '> length <' + this.thenCb.length + '>\n');
  var cbRetVal = this.thenCb.shift()
    .call(this, value);
  var cb = null;
  if (this.thenCb.length) {
    if (cbRetVal instanceof ThenableFront) {
      //log('is instanceof\n');
      while ((cb = this.thenCb.shift())) {
        cbRetVal.then(cb);
      }
    } else {
      //log('is not instanceof\n');
    }
  }
  this.solved = true;
  this.next = cbRetVal;
};

function appendScript(src) {
  var thenable = new Thenable(src);
  var script = document.createElement('script');
  script.onload = function() {
    //log('loaded <' + src + '>\n');
    thenable.resolve(this);
  };
  document.head.appendChild(script);
  script.src = src;
  return thenable.front;
}

function main() {
  //log('start work\n');
  var context = new Context(global.context);
  //log('context cree\n');
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
