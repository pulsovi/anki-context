var global = this;

/*\
 * String
\*/
String.prototype.toCapitalCase = function() {
  return this[0].toUpperCase() + this.substring(1);
};

/*\
 * Log
\*/
function Log(id) {
  var console = document.getElementById(id);
  if (console === null) return function() {};

  console.setAttribute('dir', 'ltr');
  return function(data) {
    console.appendChild(document.createTextNode(data));
  };
}

/*\
 * Thenable
\*/
function Thenable(id) {
  this.id = id;
  this.thenCb = [];
  this.front = new ThenableFront(this);
}

function ThenableFront(parent) {
  this.parent = parent;
}

ThenableFront.prototype.then = function then(cb) {
  if ('function' !== typeof cb) {
    throw new TypeError(cb + 'is not a function');
  }
  if (this.parent.solved) {
    if (this.parent.next) {
      this.parent.next.then(cb);
    } else {
      setTimeout(function() {
        cb();
      }, null);
    }
  } else {
    this.parent.thenCb.push(cb);
  }
  return this;
};

Thenable.all = function all(thenableFrontArr, id) {
  var thenable = new Thenable();
  var resolved = -1;

  var next = function next() {
    ++resolved;
    if (resolved === thenableFrontArr.length) {
      thenable.resolve();
    }
  };

  for (var i = 0; i < thenableFrontArr.length; ++i) {
    thenableFrontArr[i].then(next);
  }
  setTimeout(next, null);
  return thenable.front;
};

Thenable.prototype.resolve = function(value) {
  var cb, cbRetVal;
  while ((cb = this.thenCb.shift())) {
    cbRetVal = cb.call(this, value);
    if (cbRetVal instanceof ThenableFront) {
      while ((cb = this.thenCb.shift())) {
        cbRetVal.then(cb);
      }
      this.next = cbRetVal;
    }
  }
  this.solved = true;
};


/*\
 * Project
\*/
function Project(src, type) {
  this.src = src;
  this.type = type || 'script';
  this.dependancy = [];
  this.loaded = false;
}

Project.tags = {
  "script": "src"
};

Project.prototype.require = function require(dependancy) {
  if (!(dependancy instanceof Project)) {
    throw new TypeError('dependancy doit etre un Project');
  }
  this.dependancy.push(dependancy);
  return this;
};

Project.prototype.load = function load() {
  var thenable = new Thenable();
  if (this.loaded) {
    thenable.resolve();
    return thenable.front;
  }

  var project = this;
  var allThenableFront = [];

  for (var i = 0; i < this.dependancy.length; ++i) {
    allThenableFront.push(this.dependancy[i].load());
  }

  Thenable.all(allThenableFront)
    .then(function() {
      return project['load' + project.type.toCapitalCase()]();
    })
    .then(function() {
      thenable.resolve();
    });

  this.loaded = true;

  return thenable.front;
};

Project.prototype.reload = function reload() {
  var thenable = new Thenable();
  var allThenableFront = [];
  var project = this;

  for (var i = 0; i < this.dependancy.length; ++i) {
    allThenableFront.push(this.dependancy[i].reload());
  }

  Thenable.all(allThenableFront)
    .then(function() {
      return project['reload' + project.type.toCapitalCase()]();
    })
    .then(function() {
      thenable.resolve();
    });

  return thenable.front;
};

Project.prototype.loadScript = function loadScript() {
  var thenable = new Thenable();
  var script = document.createElement('script');
  script.onload = function() {
    thenable.resolve(this);
  };
  document.head.appendChild(script);
  script.src = this.src;
  return thenable.front;
};

Project.prototype.reloadScript = function reloadScript() {
  console.error('la fonction reloadScript doit etre ecrite');
};

Project.prototype.watch = function watch() {
  console.error('la fonction watch doit etre ecrite');
};

setTimeout(function bootstrapIIFE() {
  global.log = Log('context-log');
  log("starts\n");
  new Project('_main-context.js')
    .require(new Project('_get-context.js'))
    .require(new Project('_context.js')
      .require(new Project('_Promise.js')
        .require(new Project('_promise_polyfill.js'))
      )
    )
    .load();
}, null);
