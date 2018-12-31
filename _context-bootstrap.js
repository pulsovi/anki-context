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
  this.parent.thenCb.push(cb);
  if (this.parent.solved) {
    this.parent.resolve();
  }
  return this;
};

Thenable.all = function all(thenableFrontArr, id) {
  var thenable = new Thenable();
  var resolved = -1;

  var next = function next() {
    ++resolved;
    thenableFrontArr.test = (thenableFrontArr.test | 0) + 1;
    if (resolved === thenableFrontArr.length) {
      thenable.resolve();
    }
  };

  for (var i = 0; i < thenableFrontArr.length; ++i) {
    thenableFrontArr[i].then(next);
  }
  next();
  return thenable.front;
};

Thenable.prototype.resolve = function(value) {
  var cbRetVal = this.thenCb.shift();
  if (cbRetVal) {
    cbRetVal.call(this, value);
  }
  var cb = null;
  if (this.thenCb.length) {
    if (cbRetVal instanceof ThenableFront) {
      while ((cb = this.thenCb.shift())) {
        cbRetVal.then(cb);
      }
    }
  }
  this.solved = true;
  this.next = cbRetVal;
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
  var thenable = new Thenable(this.src);
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

var log = Log('context-log');
new Project('_main-context.js')
  .require(new Project('_get-context.js'))
  .require(new Project('_context.js')
    .require(new Project('_Promise.js')
      .require(new Project('_promise_polyfill.js'))
    )
  )
  .load();
